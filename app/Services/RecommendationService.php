<?php

namespace App\Services;

use App\Models\Recommendation;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RecommendationService
{
    // Generate all recommendations for a user
    public function generateRecommendations(User $user)
    {
        // Clear old recommendations
        $user->recommendations()->where('status', 'active')->delete();

        $this->detectRedundantServices($user);
        $this->suggestFamilyPlanUpgrades($user);
        $this->identifyUnusedSubscriptions($user);
        $this->suggestCostSharing($user);
    }

    // Detect redundant services (e.g., multiple streaming services)
    private function detectRedundantServices(User $user)
    {
        $subscriptions = $user->subscriptions()
            ->where('status', 'active')
            ->get();

        // Group by category
        $byCategory = $subscriptions->groupBy('category');

        foreach ($byCategory as $category => $subs) {
            if ($subs->count() > 1 && $category !== 'Other') {
                $totalCost = $subs->sum(function($sub) {
                    return match($sub->billing_cycle) {
                        'monthly' => $sub->amount,
                        'yearly' => $sub->amount / 12,
                        'weekly' => $sub->amount * 4,
                        default => $sub->amount,
                    };
                });

                // Calculate potential savings (assume keeping cheapest)
                $cheapest = $subs->sortBy('amount')->first();
                $potentialSavings = $totalCost - $cheapest->amount;

                if ($potentialSavings > 5) { // Only recommend if savings > $5
                    Recommendation::create([
                        'user_id' => $user->id,
                        'type' => 'redundant',
                        'title' => "Multiple {$category} subscriptions detected",
                        'description' => "You have {$subs->count()} {$category} subscriptions costing {$totalCost}/month. Consider keeping only your favorite to save money.",
                        'potential_savings' => $potentialSavings * 12, // Yearly savings
                        'affected_subscriptions' => $subs->pluck('id'),
                        'priority' => $this->calculatePriority($potentialSavings * 12),
                        'status' => 'active',
                    ]);
                }
            }
        }
    }

    // Suggest family plan upgrades
    private function suggestFamilyPlanUpgrades(User $user)
    {
        $familyPlanOptions = [
            'Netflix' => ['individual' => 9.99, 'family' => 19.99, 'max_members' => 4],
            'Spotify' => ['individual' => 10.99, 'family' => 16.99, 'max_members' => 6],
            'YouTube Premium' => ['individual' => 11.99, 'family' => 22.99, 'max_members' => 5],
            'Apple Music' => ['individual' => 10.99, 'family' => 16.99, 'max_members' => 6],
        ];

        $subscriptions = $user->subscriptions()
            ->where('status', 'active')
            ->where('is_shared', false)
            ->get();

        foreach ($subscriptions as $sub) {
            foreach ($familyPlanOptions as $service => $plans) {
                if (str_contains(strtolower($sub->name), strtolower($service))) {
                    // Check if close to individual plan price
                    if (abs($sub->amount - $plans['individual']) < 2) {
                        $costPerMember = $plans['family'] / $plans['max_members'];
                        $potentialSavings = ($sub->amount - $costPerMember) * 12;

                        if ($potentialSavings > 20) {
                            Recommendation::create([
                                'user_id' => $user->id,
                                'type' => 'upgrade',
                                'title' => "Upgrade to {$service} Family Plan",
                                'description' => "Share a family plan with {$plans['max_members']} people and pay only {$costPerMember}/month instead of {$sub->amount}/month.",
                                'potential_savings' => $potentialSavings,
                                'affected_subscriptions' => [$sub->id],
                                'priority' => $this->calculatePriority($potentialSavings),
                                'status' => 'active',
                            ]);
                        }
                    }
                }
            }
        }
    }

    // Identify potentially unused subscriptions
    private function identifyUnusedSubscriptions(User $user)
    {
        // This would need usage data - for now we'll use a simple heuristic
        $subscriptions = $user->subscriptions()
            ->where('status', 'active')
            ->where('created_at', '<', now()->subMonths(3))
            ->get();

        foreach ($subscriptions as $sub) {
            // If subscription is older than 3 months and expensive
            $yearlyAmount = match($sub->billing_cycle) {
                'monthly' => $sub->amount * 12,
                'yearly' => $sub->amount,
                'weekly' => $sub->amount * 52,
                default => $sub->amount * 12,
            };

            if ($yearlyAmount > 50) {
                Recommendation::create([
                    'user_id' => $user->id,
                    'type' => 'cancel',
                    'title' => "Review {$sub->name} subscription",
                    'description' => "You've been subscribed for over 3 months. Make sure you're still using this service to avoid wasting {$yearlyAmount}/year.",
                    'potential_savings' => $yearlyAmount,
                    'affected_subscriptions' => [$sub->id],
                    'priority' => $this->calculatePriority($yearlyAmount),
                    'status' => 'active',
                ]);
            }
        }
    }

    // Suggest cost sharing opportunities
    private function suggestCostSharing(User $user)
    {
        $unsharedSubscriptions = $user->subscriptions()
            ->where('status', 'active')
            ->where('is_shared', false)
            ->get();

        foreach ($unsharedSubscriptions as $sub) {
            $yearlyAmount = match($sub->billing_cycle) {
                'monthly' => $sub->amount * 12,
                'yearly' => $sub->amount,
                default => $sub->amount * 12,
            };

            // Suggest sharing if subscription is > $10/month
            if ($yearlyAmount > 120) {
                $estimatedSavings = $yearlyAmount * 0.5; // Assume 50% savings

                Recommendation::create([
                    'user_id' => $user->id,
                    'type' => 'share',
                    'title' => "Share {$sub->name} to save money",
                    'description' => "Create a cost-sharing group and split this subscription with friends or family. You could save up to R{$estimatedSavings}/year.",
                    'potential_savings' => $estimatedSavings,
                    'affected_subscriptions' => [$sub->id],
                    'priority' => $this->calculatePriority($estimatedSavings),
                    'status' => 'active',
                ]);
            }
        }
    }

    // Calculate priority (0-10, higher = more important)
    private function calculatePriority($potentialSavings)
    {
        if ($potentialSavings >= 500) return 10;
        if ($potentialSavings >= 300) return 8;
        if ($potentialSavings >= 150) return 6;
        if ($potentialSavings >= 50) return 4;
        return 2;
    }
}