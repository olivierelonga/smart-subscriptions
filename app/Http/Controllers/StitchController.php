<?php

namespace App\Http\Controllers;

use App\Models\BankAccount;
use App\Models\Transaction;
use App\Services\StitchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class StitchController extends Controller
{
    private $stitchService;

    public function __construct(StitchService $stitchService)
    {
        $this->stitchService = $stitchService;
    }

    // Step 1: Create authorization URL
    public function createAuthorizationUrl()
    {
        try {
            $redirectUri = url('/stitch/callback');
            $authUrl = $this->stitchService->createAuthorizationUrl(Auth::id(), $redirectUri);
            
            return response()->json([
                'authorization_url' => $authUrl,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create Stitch authorization URL: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to create authorization URL',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Step 2: Handle callback after user authorizes
    public function handleCallback(Request $request)
    {
        try {
            $code = $request->query('code');
            $state = $request->query('state');

            if (!$code) {
                return redirect('/bank-accounts')->with('error', 'Authorization failed');
            }

            // Exchange code for bank account info
            $bankAccounts = $this->stitchService->exchangeAuthorizationCode($code);

            foreach ($bankAccounts as $account) {
                BankAccount::create([
                    'user_id' => Auth::id(),
                    'stitch_account_id' => $account['id'],
                    'account_name' => $account['name'],
                    'account_number' => $account['accountNumber'],
                    'bank_id' => $account['bankId'],
                    'current_balance' => $account['currentBalance'],
                    'is_active' => true,
                ]);
            }

            // Sync transactions
            $this->syncTransactions();

            return redirect('/bank-accounts')->with('success', 'Bank account connected successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to handle Stitch callback: ' . $e->getMessage());
            return redirect('/bank-accounts')->with('error', 'Failed to connect bank account');
        }
    }

    // Sync transactions
    public function syncTransactions()
    {
        $bankAccounts = Auth::user()->bankAccounts()
            ->where('is_active', true)
            ->get();

        if ($bankAccounts->isEmpty()) {
            return response()->json([
                'message' => 'No connected bank accounts',
            ], 400);
        }

        $syncedCount = 0;
        foreach ($bankAccounts as $account) {
            $count = $this->syncTransactionsForAccount($account);
            $syncedCount += $count;
        }

        return response()->json([
            'message' => "Synced {$syncedCount} transactions",
            'count' => $syncedCount,
        ]);
    }

    // Helper: Sync transactions for specific account
    private function syncTransactionsForAccount(BankAccount $account)
    {
        $endDate = Carbon::now()->format('Y-m-d');
        $startDate = $account->last_synced_at 
            ? Carbon::parse($account->last_synced_at)->format('Y-m-d')
            : Carbon::now()->subDays(90)->format('Y-m-d');

        try {
            $transactions = $this->stitchService->getTransactions(
                $account->stitch_account_id,
                $startDate,
                $endDate
            );

            $syncedCount = 0;
            foreach ($transactions as $edge) {
                $transaction = $edge['node'];
                
                // Skip if already exists
                if (Transaction::where('stitch_transaction_id', $transaction['id'])->exists()) {
                    continue;
                }

                Transaction::create([
                    'user_id' => $account->user_id,
                    'bank_account_id' => $account->id,
                    'stitch_transaction_id' => $transaction['id'],
                    'amount' => abs($transaction['amount']),
                    'date' => $transaction['date'],
                    'merchant_name' => $transaction['description'],
                    'running_balance' => $transaction['runningBalance'],
                ]);

                $syncedCount++;
            }

            $account->update(['last_synced_at' => Carbon::now()]);

            return $syncedCount;
        } catch (\Exception $e) {
            Log::error('Failed to sync transactions for account ' . $account->id . ': ' . $e->getMessage());
            return 0;
        }
    }

    // Get connected accounts
    public function getAccounts()
    {
        $accounts = Auth::user()->bankAccounts()
            ->where('is_active', true)
            ->get();

        return response()->json([
            'accounts' => $accounts,
        ]);
    }

    // Add this method to the existing StitchController
    public function deleteAccount(BankAccount $account)
    {
        if ($account->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $account->update(['is_active' => false]);

        return response()->json([
            'message' => 'Bank account disconnected successfully',
        ]);
    }

}