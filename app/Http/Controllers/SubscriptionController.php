<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    // Get all subscriptions for logged-in user
    public function index()
    {
        $subscriptions = Auth::user()->subscriptions()
            ->with('sharingGroups')
            ->orderBy('next_billing_date')
            ->get();

        $totalMonthly = $subscriptions->sum(function($sub) {
            return match($sub->billing_cycle) {
                'daily' => $sub->amount * 30,
                'weekly' => $sub->amount * 4,
                'monthly' => $sub->amount,
                'yearly' => $sub->amount / 12,
                default => 0,
            };
        });

        return response()->json([
            'subscriptions' => $subscriptions,
            'total_monthly' => round($totalMonthly, 2),
            'total_yearly' => round($totalMonthly * 12, 2),
            'count' => $subscriptions->count(),
        ]);
    }

    // Create new subscription manually
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'billing_cycle' => 'required|in:daily,weekly,monthly,yearly',
            'next_billing_date' => 'required|date',
            'category' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $subscription = Auth::user()->subscriptions()->create([
            ...$validated,
            'status' => 'active',
            'detection_method' => 'manual',
        ]);

        return response()->json([
            'message' => 'Subscription added successfully',
            'subscription' => $subscription,
        ], 201);
    }

    // Update subscription
    public function update(Request $request, Subscription $subscription)
    {
        // Check ownership
        if ($subscription->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'amount' => 'sometimes|numeric|min:0',
            'billing_cycle' => 'sometimes|in:daily,weekly,monthly,yearly',
            'next_billing_date' => 'sometimes|date',
            'status' => 'sometimes|in:active,cancelled,paused',
            'category' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $subscription->update($validated);

        return response()->json([
            'message' => 'Subscription updated successfully',
            'subscription' => $subscription,
        ]);
    }

    // Delete subscription
    public function destroy(Subscription $subscription)
    {
        if ($subscription->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $subscription->delete();

        return response()->json([
            'message' => 'Subscription deleted successfully',
        ]);
    }

    // Get subscription statistics
    public function statistics()
    {
        $user = Auth::user();
        $subscriptions = $user->subscriptions;

        $categoryBreakdown = $subscriptions->groupBy('category')->map(function($items) {
            return [
                'count' => $items->count(),
                'total' => $items->sum('amount'),
            ];
        });

        $statusBreakdown = $subscriptions->groupBy('status')->map->count();

        return response()->json([
            'by_category' => $categoryBreakdown,
            'by_status' => $statusBreakdown,
            'average_subscription' => round($subscriptions->avg('amount'), 2),
        ]);
    }
}