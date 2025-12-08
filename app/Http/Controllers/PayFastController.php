<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\PayFastService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PayFastController extends Controller
{
    private $payfastService;

    public function __construct(PayFastService $payfastService)
    {
        $this->payfastService = $payfastService;
    }

    /**
     * Show subscription plans
     */
    public function showPlans()
    {
        $plans = [
            'pro' => [
                'name' => 'SubTrack Pro',
                'price' => 89.99,
                'features' => [
                    'Unlimited subscriptions',
                    'Bank integration',
                    'AI recommendations',
                    'Cost-sharing groups',
                ],
            ],
            'family' => [
                'name' => 'SubTrack Family',
                'price' => 179.99,
                'features' => [
                    'Everything in Pro',
                    'Up to 5 family members',
                    'Shared dashboard',
                    'Priority support',
                ],
            ],
        ];

        return response()->json(['plans' => $plans]);
    }

    /**
     * Initiate subscription payment
     */
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'plan' => 'required|in:pro,family',
        ]);

        $user = Auth::user();
        $plans = [
            'pro' => ['name' => 'SubTrack Pro', 'amount' => 89.99],
            'family' => ['name' => 'SubTrack Family', 'amount' => 179.99],
        ];

        $selectedPlan = $plans[$validated['plan']];

        // Split user's name
        $nameParts = explode(' ', $user->name);
        $firstName = $nameParts[0] ?? 'User';
        $lastName = $nameParts[1] ?? '';

        $payment = $this->payfastService->createSubscription([
            'name_first' => $firstName,
            'name_last' => $lastName,
            'email' => $user->email,
            'amount' => $selectedPlan['amount'],
            'item_name' => $selectedPlan['name'] . ' Monthly Subscription',
            'item_description' => 'Monthly subscription to ' . $selectedPlan['name'],
            'user_id' => $user->id,
            'plan' => $validated['plan'],
            'frequency' => 3, // Monthly
            'cycles' => 0, // Unlimited
            'return_url' => url('/payment/success'),
            'cancel_url' => url('/payment/cancel'),
            'notify_url' => url('/api/payment/notify'),
        ]);

        return response()->json($payment);
    }

    /**
     * Payment success page
     */
    public function success(Request $request)
    {
        return view('payment.success'); // Or return JSON for API
    }

    /**
     * Payment cancel page
     */
    public function cancel(Request $request)
    {
        return view('payment.cancel'); // Or return JSON for API
    }

    /**
     * PayFast IPN (Instant Payment Notification)
     */
    public function notify(Request $request)
    {
        $pfData = $request->all();
        
        Log::info('PayFast IPN received:', $pfData);

        // 1. Verify signature
        if (!$this->payfastService->validateSignature($pfData, $pfData['signature'] ?? '')) {
            Log::error('PayFast signature validation failed');
            return response('Invalid signature', 400);
        }

        // 2. Verify that this is from PayFast servers
        if (!$this->payfastService->verifyPaymentData($pfData)) {
            Log::error('PayFast server verification failed');
            return response('Invalid source', 400);
        }

        // 3. Process the payment
        if ($pfData['payment_status'] === 'COMPLETE') {
            $userId = $pfData['custom_str1'];
            $plan = $pfData['custom_str2'];

            $user = User::find($userId);
            if ($user) {
                $user->update([
                    'subscription_plan' => $plan,
                    'subscription_status' => 'active',
                    'payfast_token' => $pfData['token'] ?? null,
                    'subscription_ends_at' => now()->addMonth(),
                ]);

                Log::info("Subscription activated for user {$userId}, plan: {$plan}");
            }
        }

        return response('OK', 200);
    }

    /**
     * Cancel subscription
     */
    public function cancelSubscription(Request $request)
    {
        $user = Auth::user();
        
        $user->update([
            'subscription_status' => 'cancelled',
            'subscription_ends_at' => now(),
        ]);

        return response()->json([
            'message' => 'Subscription cancelled successfully',
        ]);
    }
}