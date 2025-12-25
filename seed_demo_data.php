
// PIPING THIS SCRIPT TO TINKER
// cmd: Get-Content seed_demo_data.php | php artisan tinker

echo "--- Seeding Demo Data for Pro AI Features ---\n";

// 1. Get the primary user (usually the first one, or you can specify email)
$user = \App\Models\User::first();

if (!$user) {
    echo "No user found! Creating one...\n";
    $user = \App\Models\User::create([
        'name' => 'Demo User',
        'email' => 'demo@subtrack.com',
        'password' => bcrypt('password'),
    ]);
}

echo "Targeting User: {$user->email} (ID: {$user->id})\n";

// 2. Ensure User is PRO (Subscription Status = Active)
$user->update(['subscription_status' => 'active']);
echo "User upgraded to PRO.\n";

// 3. Clear existing data to avoid clutter
$user->subscriptions()->delete();
$user->recommendations()->delete();
echo "Cleared old subscriptions and recommendations.\n";

// 4. Seed Data for Triggers

// Trigger A: Spending Anomaly (Needs > 600 total)
\App\Models\Subscription::create([
    'user_id' => $user->id,
    'name' => 'Luxury Gym Membership',
    'amount' => 450.00,
    'billing_cycle' => 'monthly',
    'next_billing_date' => now()->addDays(15),
    'status' => 'active',
    'category' => 'Health'
]);
\App\Models\Subscription::create([
    'user_id' => $user->id,
    'name' => 'Professional Software Suite',
    'amount' => 250.00,
    'billing_cycle' => 'monthly',
    'next_billing_date' => now()->addDays(5),
    'status' => 'active',
    'category' => 'Software'
]);
echo " [x] Added High Spending Subscriptions (Total: 700)\n";

// Trigger B: Trial Tracker
\App\Models\Subscription::create([
    'user_id' => $user->id,
    'name' => 'YouTube Premium Free Trial',
    'amount' => 11.99,
    'billing_cycle' => 'monthly',
    'next_billing_date' => now()->addDays(3), // Ends soon
    'status' => 'active',
    'category' => 'Entertainment'
]);
echo " [x] Added Trial Subscription\n";

// Trigger C: Bundle Optimization (Disney+ & Hulu separate)
\App\Models\Subscription::create([
    'user_id' => $user->id,
    'name' => 'Disney+',
    'amount' => 7.99,
    'billing_cycle' => 'monthly',
    'next_billing_date' => now()->addDays(10),
    'status' => 'active',
    'category' => 'Entertainment'
]);
\App\Models\Subscription::create([
    'user_id' => $user->id,
    'name' => 'Hulu',
    'amount' => 7.99,
    'billing_cycle' => 'monthly',
    'next_billing_date' => now()->addDays(10),
    'status' => 'active',
    'category' => 'Entertainment'
]);
echo " [x] Added Unbundled Disney+ and Hulu\n";

// 5. Generate Recommendations
echo "Running Recommendation Engine...\n";
$service = app(\App\Services\RecommendationService::class);
$service->generateRecommendations($user);

// 6. Report
$count = $user->recommendations()->count();
echo "--- DONE ---\n";
echo "Generated $count recommendations.\n";
echo "Refresh your browser to see them!\n";
