<?php

namespace App\Http\Controllers;

use App\Models\PlaidAccount;
use App\Models\Transaction;
use App\Services\PlaidService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PlaidController extends Controller
{
    private $plaidService;

    public function __construct(PlaidService $plaidService)
    {
        $this->plaidService = $plaidService;
    }

    // Step 1: Create link token for Plaid Link UI
    public function createLinkToken()
    {
        try {
            $linkToken = $this->plaidService->createLinkToken(Auth::id());
            
            return response()->json([
                'link_token' => $linkToken,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create Plaid link token: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to create link token',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Step 2: Exchange public token and save account
    public function exchangePublicToken(Request $request)
    {
        $validated = $request->validate([
            'public_token' => 'required|string',
            'metadata' => 'required|array',
        ]);

        try {
            $tokens = $this->plaidService->exchangePublicToken($validated['public_token']);
            
            // Save Plaid account
            $plaidAccount = PlaidAccount::create([
                'user_id' => Auth::id(),
                'plaid_access_token' => $tokens['access_token'],
                'plaid_item_id' => $tokens['item_id'],
                'institution_name' => $validated['metadata']['institution']['name'] ?? null,
                'institution_id' => $validated['metadata']['institution']['institution_id'] ?? null,
                'account_ids' => json_encode($validated['metadata']['accounts'] ?? []),
                'is_active' => true,
            ]);

            // Sync transactions immediately
            $this->syncTransactionsForAccount($plaidAccount);

            return response()->json([
                'message' => 'Bank account connected successfully',
                'account' => $plaidAccount,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to exchange Plaid token: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to connect bank account',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Sync transactions from Plaid
    public function syncTransactions()
    {
        $plaidAccounts = Auth::user()->plaidAccounts()
            ->where('is_active', true)
            ->get();

        if ($plaidAccounts->isEmpty()) {
            return response()->json([
                'message' => 'No connected bank accounts',
            ], 400);
        }

        $syncedCount = 0;
        foreach ($plaidAccounts as $account) {
            $count = $this->syncTransactionsForAccount($account);
            $syncedCount += $count;
        }

        return response()->json([
            'message' => "Synced {$syncedCount} transactions",
            'count' => $syncedCount,
        ]);
    }

    // Helper: Sync transactions for specific account
    private function syncTransactionsForAccount(PlaidAccount $account)
    {
        $endDate = Carbon::now()->format('Y-m-d');
        $startDate = $account->last_synced_at 
            ? Carbon::parse($account->last_synced_at)->format('Y-m-d')
            : Carbon::now()->subDays(90)->format('Y-m-d');

        try {
            $transactions = $this->plaidService->getTransactions(
                $account->plaid_access_token,
                $startDate,
                $endDate
            );

            $syncedCount = 0;
            foreach ($transactions as $transaction) {
                // Skip if already exists
                if (Transaction::where('plaid_transaction_id', $transaction['transaction_id'])->exists()) {
                    continue;
                }

                Transaction::create([
                    'user_id' => $account->user_id,
                    'plaid_account_id' => $account->id,
                    'plaid_transaction_id' => $transaction['transaction_id'],
                    'amount' => abs($transaction['amount']),
                    'date' => $transaction['date'],
                    'merchant_name' => $transaction['merchant_name'] ?? $transaction['name'],
                    'category' => $transaction['category'][0] ?? null,
                ]);

                $syncedCount++;
            }

            // Update last synced timestamp
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
        $accounts = Auth::user()->plaidAccounts()
            ->where('is_active', true)
            ->get();

        return response()->json([
            'accounts' => $accounts,
        ]);
    }
}