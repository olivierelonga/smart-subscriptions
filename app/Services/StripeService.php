<?php

namespace App\Services;

use Stripe\StripeClient;
use Stripe\Exception\ApiErrorException;

class StripeService
{
    private $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    // Create subscription for platform (user pays us)
    public function createSubscription($userId, $email, $priceId, $paymentMethodId)
    {
        try {
            // Create or get customer
            $customer = $this->stripe->customers->create([
                'email' => $email,
                'payment_method' => $paymentMethodId,
                'invoice_settings' => [
                    'default_payment_method' => $paymentMethodId,
                ],
                'metadata' => ['user_id' => $userId],
            ]);

            // Create subscription
            $subscription = $this->stripe->subscriptions->create([
                'customer' => $customer->id,
                'items' => [['price' => $priceId]],
                'expand' => ['latest_invoice.payment_intent'],
            ]);

            return [
                'subscription_id' => $subscription->id,
                'customer_id' => $customer->id,
                'status' => $subscription->status,
                'client_secret' => $subscription->latest_invoice->payment_intent->client_secret,
            ];
        } catch (ApiErrorException $e) {
            throw new \Exception('Failed to create subscription: ' . $e->getMessage());
        }
    }

    // Cancel subscription
    public function cancelSubscription($subscriptionId)
    {
        try {
            return $this->stripe->subscriptions->cancel($subscriptionId);
        } catch (ApiErrorException $e) {
            throw new \Exception('Failed to cancel subscription: ' . $e->getMessage());
        }
    }

    // Create payment intent for one-time payment
    public function createPaymentIntent($amount, $currency = 'usd')
    {
        try {
            return $this->stripe->paymentIntents->create([
                'amount' => $amount * 100, // Convert to cents
                'currency' => $currency,
            ]);
        } catch (ApiErrorException $e) {
            throw new \Exception('Failed to create payment intent: ' . $e->getMessage());
        }
    }
}