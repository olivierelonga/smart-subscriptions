<?php

namespace App\Http\Controllers;

use App\Models\Recommendation;
use App\Services\RecommendationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RecommendationController extends Controller
{
    private $recommendationService;

    public function __construct(RecommendationService $recommendationService)
    {
        $this->recommendationService = $recommendationService;
    }

    // Get all active recommendations
    public function index()
    {
        $recommendations = Auth::user()->recommendations()
            ->where('status', 'active')
            ->orderByDesc('priority')
            ->get();

        $totalPotentialSavings = $recommendations->sum('potential_savings');

        return response()->json([
            'recommendations' => $recommendations,
            'total_potential_savings' => round($totalPotentialSavings, 2),
            'count' => $recommendations->count(),
        ]);
    }

    // Generate new recommendations
    public function generate()
    {
        if (Auth::user()->subscription_status !== 'active') {
            return response()->json([
                'message' => 'Upgrade to Pro to use AI recommendations',
                'requires_subscription' => true
            ], 403);
        }

        try {
            $this->recommendationService->generateRecommendations(Auth::user());
            
            $recommendations = Auth::user()->recommendations()
                ->where('status', 'active')
                ->orderByDesc('priority')
                ->get();

            return response()->json([
                'message' => 'Recommendations generated successfully',
                'recommendations' => $recommendations,
                'count' => $recommendations->count(),
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Recommendation generation failed: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error($e->getTraceAsString());
            
            return response()->json([
                'message' => 'Failed to generate recommendations',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Dismiss a recommendation
    public function dismiss(Recommendation $recommendation)
    {
        if ($recommendation->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $recommendation->update(['status' => 'dismissed']);

        return response()->json([
            'message' => 'Recommendation dismissed',
        ]);
    }

    // Mark recommendation as completed
    public function complete(Recommendation $recommendation)
    {
        if ($recommendation->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $recommendation->update(['status' => 'completed']);

        return response()->json([
            'message' => 'Recommendation marked as completed',
        ]);
    }
}