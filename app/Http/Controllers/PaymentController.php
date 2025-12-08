<?php

namespace App\Http\Controllers;

use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    private $stripeService;

    public function __construct(StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    // Get available subscription plans
    public function plans()
    {
        $plans = [
            [
                'id' => 'free',
                'name' => 'Free',
                'price' => 0,
                'features' => [
                    'Basic subscription tracking',
                    'Manual entry only',
                    'Up to 5 subscriptions',
                ],
            ],
            [
                'id' => 'pro',
                'name' => 'Pro',
                'price' => 4.99,
                'stripe_price_id' => 'price_xxx', // Replace with actual Stripe price ID
                'features' => [
                    'Unlimited subscriptions',
                    'Bank account integration',
                    'AI recommendations',
                    'Unlimited sharing groups',
                    'Priority support',
                ],
            ],
            [
                'id' => 'family',
                'name' => 'Family',
                'price' => 9.99,
                'stripe_price_id' => 'price_yyy', // Replace with actual Stripe price ID
                'features' => [
                    'Everything in Pro',
                    'Up to 5 family members',
                    'Shared dashboard',
                    'Family activity tracking',
                ],
            ],
        ];

        return response()->json(['plans' => $plans]);
    }

    // Subscribe to a plan
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'price_id' => 'required|string',
            'payment_method_id' => 'required|string',
        ]);

        try {
            $user = Auth::user();
            
            $subscription = $this->stripeService->createSubscription(
                $user->id,
                $user->email,
                $validated['price_id'],
                $validated['payment_method_id']
            );

            // Save subscription details to user
            $user->update([
                'stripe_customer_id' => $subscription['customer_id'],
                'stripe_subscription_id' => $subscription['subscription_id'],
                'subscription_status' => $subscription['status'],
            ]);

            return response()->json([
                'message' => 'Subscription created successfully',
                'subscription' => $subscription,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create subscription',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Cancel subscription
    public function cancelSubscription()
    {
        try {
            $user = Auth::user();
            
            if (!$user->stripe_subscription_id) {
                return response()->json(['message' => 'No active subscription'], 400);
            }

            $this->stripeService->cancelSubscription($user->stripe_subscription_id);

            $user->update([
                'stripe_subscription_id' => null,
                'subscription_status' => 'canceled',
            ]);

            return response()->json([
                'message' => 'Subscription canceled successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to cancel subscription',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}