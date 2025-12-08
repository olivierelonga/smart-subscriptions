<?php

namespace App\Services;

class PayFastService
{
    private $merchantId;
    private $merchantKey;
    private $passphrase;
    private $testMode;

    public function __construct()
    {
        $this->merchantId = config('payfast.merchant_id');
        $this->merchantKey = config('payfast.merchant_key');
        $this->passphrase = config('payfast.passphrase');
        $this->testMode = config('payfast.testmode');
    }

    /**
     * Get PayFast payment URL
     */
    public function getPaymentUrl()
    {
        return $this->testMode 
            ? 'https://sandbox.payfast.co.za/eng/process'
            : 'https://www.payfast.co.za/eng/process';
    }

    /**
     * Create one-time payment
     */
    public function createPayment($data)
    {
        $paymentData = [
            // Merchant details
            'merchant_id' => $this->merchantId,
            'merchant_key' => $this->merchantKey,
            'return_url' => $data['return_url'],
            'cancel_url' => $data['cancel_url'],
            'notify_url' => $data['notify_url'],
            
            // Buyer details
            'name_first' => $data['name_first'],
            'name_last' => $data['name_last'],
            'email_address' => $data['email'],
            
            // Transaction details
            'amount' => number_format($data['amount'], 2, '.', ''),
            'item_name' => $data['item_name'],
            'item_description' => $data['item_description'] ?? '',
            
            // Custom fields
            'custom_str1' => $data['user_id'] ?? '',
            'custom_str2' => $data['plan'] ?? '',
            'custom_str3' => $data['reference'] ?? '',
        ];

        // Generate signature
        $paymentData['signature'] = $this->generateSignature($paymentData);

        return [
            'url' => $this->getPaymentUrl(),
            'data' => $paymentData,
        ];
    }

    /**
     * Create recurring subscription
     */
    public function createSubscription($data)
    {
        $paymentData = [
            // Merchant details
            'merchant_id' => $this->merchantId,
            'merchant_key' => $this->merchantKey,
            'return_url' => $data['return_url'],
            'cancel_url' => $data['cancel_url'],
            'notify_url' => $data['notify_url'],
            
            // Buyer details
            'name_first' => $data['name_first'],
            'name_last' => $data['name_last'],
            'email_address' => $data['email'],
            
            // Transaction details
            'amount' => number_format($data['amount'], 2, '.', ''),
            'item_name' => $data['item_name'],
            'item_description' => $data['item_description'] ?? '',
            
            // Subscription details
            'subscription_type' => 1, // 1 = Subscription
            'billing_date' => now()->format('Y-m-d'),
            'recurring_amount' => number_format($data['amount'], 2, '.', ''),
            'frequency' => $data['frequency'] ?? 3, // 3 = Monthly
            'cycles' => $data['cycles'] ?? 0, // 0 = Run indefinitely
            
            // Custom fields
            'custom_str1' => $data['user_id'] ?? '',
            'custom_str2' => $data['plan'] ?? '',
        ];

        // Generate signature
        $paymentData['signature'] = $this->generateSignature($paymentData);

        return [
            'url' => $this->getPaymentUrl(),
            'data' => $paymentData,
        ];
    }

    /**
     * Generate PayFast signature
     */
    public function generateSignature($data, $passPhrase = null)
    {
        if ($passPhrase === null) {
            $passPhrase = $this->passphrase;
        }

        // Create parameter string
        $pfOutput = '';
        foreach ($data as $key => $val) {
            if ($key !== 'signature') {
                $pfOutput .= $key . '=' . urlencode(trim($val)) . '&';
            }
        }

        // Remove last ampersand
        $getString = substr($pfOutput, 0, -1);
        
        if (!empty($passPhrase)) {
            $getString .= '&passphrase=' . urlencode(trim($passPhrase));
        }

        return md5($getString);
    }

    /**
     * Validate signature from PayFast
     */
    public function validateSignature($data, $signature)
    {
        $tempData = $data;
        unset($tempData['signature']);
        
        $generatedSignature = $this->generateSignature($tempData);
        
        return $generatedSignature === $signature;
    }

    /**
     * Verify payment from valid PayFast servers
     */
    public function verifyPaymentData($pfData)
    {
        // Variable initialization
        $validHosts = [
            'www.payfast.co.za',
            'sandbox.payfast.co.za',
            'w1w.payfast.co.za',
            'w2w.payfast.co.za',
        ];

        $validIps = [];

        foreach ($validHosts as $pfHostname) {
            $ips = gethostbynamel($pfHostname);
            if ($ips !== false) {
                $validIps = array_merge($validIps, $ips);
            }
        }

        // Remove duplicates
        $validIps = array_unique($validIps);

        // Get the IP address from which the request originated
        $referrer = $_SERVER['REMOTE_ADDR'] ?? '';

        // Check if the request is from a valid PayFast server
        if (!in_array($referrer, $validIps)) {
            return false;
        }

        return true;
    }

    /**
     * Get subscription frequencies
     */
    public static function getFrequencies()
    {
        return [
            3 => 'Monthly',
            4 => 'Quarterly',
            5 => 'Biannually',
            6 => 'Annual',
        ];
    }
}