<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class PlaidService
{
    private $client;
    private $clientId;
    private $secret;
    private $baseUrl;

    public function __construct()
    {
        $this->client = new Client();
        $this->clientId = config('services.plaid.client_id');
        $this->secret = config('services.plaid.secret');
        
        // Use sandbox environment
        $env = config('services.plaid.env', 'sandbox');
        $this->baseUrl = $env === 'production' 
            ? 'https://production.plaid.com'
            : 'https://sandbox.plaid.com';
    }

    // Create Link Token
    public function createLinkToken($userId)
    {
        try {
            $response = $this->client->post($this->baseUrl . '/link/token/create', [
                'json' => [
                    'client_id' => $this->clientId,
                    'secret' => $this->secret,
                    'user' => [
                        'client_user_id' => (string)$userId,
                    ],
                    'client_name' => 'SubTrack',
                    'products' => ['transactions'],
                    'country_codes' => ['US'],
                    'language' => 'en',
                ],
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
            ]);

            $data = json_decode($response->getBody(), true);
            return $data['link_token'];
        } catch (GuzzleException $e) {
            throw new \Exception('Failed to create Plaid link token: ' . $e->getMessage());
        }
    }

    // Exchange Public Token for Access Token
    public function exchangePublicToken($publicToken)
    {
        try {
            $response = $this->client->post($this->baseUrl . '/item/public_token/exchange', [
                'json' => [
                    'client_id' => $this->clientId,
                    'secret' => $this->secret,
                    'public_token' => $publicToken,
                ],
            ]);

            $data = json_decode($response->getBody(), true);
            return [
                'access_token' => $data['access_token'],
                'item_id' => $data['item_id'],
            ];
        } catch (GuzzleException $e) {
            throw new \Exception('Failed to exchange token: ' . $e->getMessage());
        }
    }

    // Get Transactions
    public function getTransactions($accessToken, $startDate, $endDate)
    {
        try {
            $response = $this->client->post($this->baseUrl . '/transactions/get', [
                'json' => [
                    'client_id' => $this->clientId,
                    'secret' => $this->secret,
                    'access_token' => $accessToken,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ]);

            $data = json_decode($response->getBody(), true);
            return $data['transactions'];
        } catch (GuzzleException $e) {
            throw new \Exception('Failed to get transactions: ' . $e->getMessage());
        }
    }
}