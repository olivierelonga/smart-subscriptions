<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Get subscriptions
        $subscriptions = $user->subscriptions()
            ->where('status', 'active')
            ->get();

        // Calculate totals
        $monthlyTotal = $subscriptions->sum(function($sub) {
            return match($sub->billing_cycle) {
                'daily' => $sub->amount * 30,
                'weekly' => $sub->amount * 4,
                'monthly' => $sub->amount,
                'yearly' => $sub->amount / 12,
                default => 0,
            };
        });

        // Upcoming bills (next 30 days)
        $upcomingBills = $subscriptions
            ->where('next_billing_date', '<=', Carbon::now()->addDays(30))
            ->sortBy('next_billing_date')
            ->values();

        // Category breakdown
        $byCategory = $subscriptions->groupBy('category')->map(function($items, $category) {
            return [
                'category' => $category ?: 'Uncategorized',
                'count' => $items->count(),
                'amount' => $items->sum(function($sub) {
                    return match($sub->billing_cycle) {
                        'daily' => $sub->amount * 30,
                        'weekly' => $sub->amount * 4,
                        'monthly' => $sub->amount,
                        'yearly' => $sub->amount / 12,
                        default => 0,
                    };
                }),
            ];
        })->values();

        // Sharing groups summary
        $ownedGroups = $user->ownedGroups()->count();
        $memberGroups = $user->groupMemberships()->count();
        
        // Calculate savings from sharing
        $savingsFromSharing = $user->groupMemberships()
            ->with('sharingGroup')
            ->get()
            ->sum(function($membership) {
                $group = $membership->sharingGroup;
                return $group->total_cost - $membership->share_amount;
            });

        return response()->json([
            'summary' => [
                'total_monthly' => round($monthlyTotal, 2),
                'total_yearly' => round($monthlyTotal * 12, 2),
                'active_subscriptions' => $subscriptions->count(),
                'savings_from_sharing' => round($savingsFromSharing, 2),
            ],
            'upcoming_bills' => $upcomingBills->take(5),
            'by_category' => $byCategory,
            'sharing' => [
                'groups_owned' => $ownedGroups,
                'groups_joined' => $memberGroups,
            ],
        ]);
    }
}