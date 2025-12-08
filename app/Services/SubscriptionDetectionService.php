<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SubscriptionDetectionService
{
    // Known subscription merchants
    private $knownSubscriptions = [
        'netflix' => 'Entertainment',
        'spotify' => 'Music',
        'amazon prime' => 'Shopping',
        'apple music' => 'Music',
        'youtube premium' => 'Entertainment',
        'disney' => 'Entertainment',
        'hbo' => 'Entertainment',
        'hulu' => 'Entertainment',
        'adobe' => 'Productivity',
        'microsoft' => 'Productivity',
        'dropbox' => 'Cloud Storage',
        'google drive' => 'Cloud Storage',
        'github' => 'Development',
    ];

    public function detectSubscriptions($userId)
    {
        // Group transactions by merchant
        $groupedTransactions = Transaction::where('user_id', $userId)
            ->where('date', '>=', Carbon::now()->subDays(180))
            ->get()
            ->groupBy(function($transaction) {
                return strtolower(trim($transaction->merchant_name));
            });

        foreach ($groupedTransactions as $merchant => $transactions) {
            if ($transactions->count() < 2) {
                continue; // Need at least 2 transactions to detect pattern
            }

            // Check if transactions are recurring
            if ($this->isRecurring($transactions)) {
                $this->createOrUpdateSubscription($userId, $merchant, $transactions);
            }
        }
    }

    private function isRecurring($transactions)
    {
        $transactions = $transactions->sortBy('date');
        $dates = $transactions->pluck('date')->toArray();
        
        if (count($dates) < 2) {
            return false;
        }

        // Calculate intervals between transactions
        $intervals = [];
        for ($i = 1; $i < count($dates); $i++) {
            $interval = Carbon::parse($dates[$i])->diffInDays(Carbon::parse($dates[$i-1]));
            $intervals[] = $interval;
        }

        // Check if intervals are consistent (±5 days tolerance)
        $avgInterval = array_sum($intervals) / count($intervals);
        
        foreach ($intervals as $interval) {
            if (abs($interval - $avgInterval) > 5) {
                return false; // Too much variation
            }
        }

        // Recurring if average interval is ~30 days (monthly) or ~365 days (yearly)
        return ($avgInterval >= 25 && $avgInterval <= 35) || 
               ($avgInterval >= 360 && $avgInterval <= 370) ||
               ($avgInterval >= 6 && $avgInterval <= 8); // weekly
    }

    private function createOrUpdateSubscription($userId, $merchant, $transactions)
    {
        $latestTransaction = $transactions->sortByDesc('date')->first();
        $avgAmount = $transactions->avg('amount');
        
        // Determine billing cycle
        $billingCycle = $this->determineBillingCycle($transactions);
        
        // Calculate next billing date
        $lastDate = Carbon::parse($latestTransaction->date);
        $nextBillingDate = match($billingCycle) {
            'monthly' => $lastDate->addMonth(),
            'yearly' => $lastDate->addYear(),
            'weekly' => $lastDate->addWeek(),
            default => $lastDate->addMonth(),
        };

        // Find category
        $category = $this->findCategory($merchant);

        // Check if subscription already exists
        $existing = Subscription::where('user_id', $userId)
            ->where('merchant_name', $merchant)
            ->where('status', 'active')
            ->first();

        if ($existing) {
            // Update existing
            $existing->update([
                'amount' => round($avgAmount, 2),
                'next_billing_date' => $nextBillingDate,
            ]);
        } else {
            // Create new subscription
            Subscription::create([
                'user_id' => $userId,
                'name' => ucwords($merchant),
                'merchant_name' => $merchant,
                'amount' => round($avgAmount, 2),
                'billing_cycle' => $billingCycle,
                'next_billing_date' => $nextBillingDate,
                'category' => $category,
                'status' => 'active',
                'detection_method' => 'plaid',
                'plaid_transaction_id' => $latestTransaction->plaid_transaction_id,
            ]);
        }

        // Mark transactions as subscription
        Transaction::whereIn('id', $transactions->pluck('id'))
            ->update(['is_subscription' => true]);
    }

    private function determineBillingCycle($transactions)
    {
        $transactions = $transactions->sortBy('date');
        $dates = $transactions->pluck('date')->toArray();
        
        if (count($dates) < 2) {
            return 'monthly';
        }

        $interval = Carbon::parse($dates[1])->diffInDays(Carbon::parse($dates[0]));
        
        if ($interval >= 25 && $interval <= 35) {
            return 'monthly';
        } elseif ($interval >= 6 && $interval <= 8) {
            return 'weekly';
        } elseif ($interval >= 360 && $interval <= 370) {
            return 'yearly';
        }
        
        return 'monthly'; // default
    }

    private function findCategory($merchant)
    {
        foreach ($this->knownSubscriptions as $keyword => $category) {
            if (str_contains(strtolower($merchant), $keyword)) {
                return $category;
            }
        }
        return 'Other';
    }
}