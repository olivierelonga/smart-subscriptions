<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Cache;

class StitchService
{
    private $client;
    private $clientId;
    private $clientSecret;
    private $baseUrl;

    public function __construct()
    {
        $this->client = new Client();
        $this->clientId = config('services.stitch.client_id');
        $this->clientSecret = config('services.stitch.client_secret');
        
        $env = config('services.stitch.env', 'sandbox');
        $this->baseUrl = $env === 'production' 
            ? 'https://api.stitch.money'
            : 'https://api.sandbox.stitch.money';
    }

    // Get OAuth token
    private function getAccessToken()
    {
        $cacheKey = 'stitch_access_token';
        
        return Cache::remember($cacheKey, 3600, function () {
            try {
                $response = $this->client->post($this->baseUrl . '/graphql', [
                    'json' => [
                        'query' => 'mutation CreateClientToken($input: CreateClientTokenInput!) {
                            clientTokenCreate(input: $input) {
                                clientToken {
                                    accessToken
                                    expiresIn
                                }
                            }
                        }',
                        'variables' => [
                            'input' => [
                                'clientId' => $this->clientId,
                                'clientSecret' => $this->clientSecret,
                                'grantType' => 'client_credentials',
                            ]
                        ]
                    ],
                    'headers' => [
                        'Content-Type' => 'application/json',
                    ],
                ]);

                $data = json_decode($response->getBody(), true);
                return $data['data']['clientTokenCreate']['clientToken']['accessToken'];
            } catch (GuzzleException $e) {
                throw new \Exception('Failed to get Stitch access token: ' . $e->getMessage());
            }
        });
    }

    // Create authorization URL for user to link bank account
    public function createAuthorizationUrl($userId, $redirectUri)
    {
        try {
            $token = $this->getAccessToken();

            $response = $this->client->post($this->baseUrl . '/graphql', [
                'json' => [
                    'query' => 'mutation CreateUserAuthorizationRequest($input: CreateUserAuthorizationRequestInput!) {
                        userAuthorizationRequestCreate(input: $input) {
                            authorizationRequestUrl
                        }
                    }',
                    'variables' => [
                        'input' => [
                            'beneficiaryReference' => 'user_' . $userId,
                            'payer' => [
                                'name' => 'User',
                                'reference' => 'user_' . $userId,
                            ],
                            'permissions' => [
                                'balances' => 'read',
                                'transactions' => 'read',
                            ],
                            'redirectUri' => $redirectUri,
                        ]
                    ]
                ],
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $token,
                ],
            ]);

            $data = json_decode($response->getBody(), true);
            return $data['data']['userAuthorizationRequestCreate']['authorizationRequestUrl'];
        } catch (GuzzleException $e) {
            throw new \Exception('Failed to create Stitch authorization URL: ' . $e->getMessage());
        }
    }

    // Exchange authorization code for bank account ID
    public function exchangeAuthorizationCode($code)
    {
        try {
            $token = $this->getAccessToken();

            $response = $this->client->post($this->baseUrl . '/graphql', [
                'json' => [
                    'query' => 'query GetBankAccount {
                        user {
                            bankAccounts {
                                id
                                name
                                accountNumber
                                accountType
                                bankId
                                currentBalance
                            }
                        }
                    }',
                ],
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $token,
                ],
            ]);

            $data = json_decode($response->getBody(), true);
            return $data['data']['user']['bankAccounts'];
        } catch (GuzzleException $e) {
            throw new \Exception('Failed to exchange authorization code: ' . $e->getMessage());
        }
    }

    // Get transactions for a bank account
    public function getTransactions($bankAccountId, $startDate, $endDate)
    {
        try {
            $token = $this->getAccessToken();

            $response = $this->client->post($this->baseUrl . '/graphql', [
                'json' => [
                    'query' => 'query GetTransactions($bankAccountId: ID!, $from: Date!, $to: Date!) {
                        node(id: $bankAccountId) {
                            ... on BankAccount {
                                transactions(from: $from, to: $to) {
                                    edges {
                                        node {
                                            id
                                            amount
                                            date
                                            description
                                            runningBalance
                                        }
                                    }
                                }
                            }
                        }
                    }',
                    'variables' => [
                        'bankAccountId' => $bankAccountId,
                        'from' => $startDate,
                        'to' => $endDate,
                    ]
                ],
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $token,
                ],
            ]);

            $data = json_decode($response->getBody(), true);
            return $data['data']['node']['transactions']['edges'];
        } catch (GuzzleException $e) {
            throw new \Exception('Failed to get transactions: ' . $e->getMessage());
        }
    }
}