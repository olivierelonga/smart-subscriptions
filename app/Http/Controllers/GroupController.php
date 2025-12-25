<?php

namespace App\Http\Controllers;

use App\Models\SharingGroup;
use App\Models\GroupMember;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class GroupController extends Controller
{
    // Get all groups user is part of
    public function index()
    {
        $ownedGroups = Auth::user()->ownedGroups()
            ->with(['subscription', 'members.user'])
            ->get();

        $memberGroups = Auth::user()->groupMemberships()
            ->where('role', '!=', 'owner')
            ->with(['sharingGroup.subscription', 'sharingGroup.owner', 'sharingGroup.members'])
            ->get()
            ->pluck('sharingGroup');

        return response()->json([
            'owned_groups' => $ownedGroups,
            'member_groups' => $memberGroups,
        ]);
    }

    // Create new sharing group
    public function store(Request $request)
    {
        if (Auth::user()->subscription_status !== 'active') {
            return response()->json([
                'message' => 'Upgrade to create sharing groups',
                'requires_subscription' => true
            ], 403);
        }

        $validated = $request->validate([
            'subscription_id' => 'required|exists:subscriptions,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'max_members' => 'required|integer|min:2|max:20',
        ]);

        // Verify subscription ownership
        $subscription = Subscription::findOrFail($validated['subscription_id']);
        if ($subscription->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        DB::beginTransaction();
        try {
            // Create group
            $group = SharingGroup::create([
                ...$validated,
                'owner_id' => Auth::id(),
                'total_cost' => $subscription->amount,
                'status' => 'active',
            ]);

            // Add owner as first member
            GroupMember::create([
                'sharing_group_id' => $group->id,
                'user_id' => Auth::id(),
                'share_amount' => $subscription->amount, // Full amount until others join
                'role' => 'owner',
                'payment_status' => 'paid',
                'next_payment_date' => $subscription->next_billing_date,
            ]);

            // Mark subscription as shared
            $subscription->update(['is_shared' => true]);

            DB::commit();

            return response()->json([
                'message' => 'Sharing group created successfully',
                'group' => $group->load(['subscription', 'members']),
                'invite_code' => $group->invite_code,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Failed to create group: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error($e->getTraceAsString());
            return response()->json(['message' => 'Failed to create group'], 500);
        }
    }

    // Join group with invite code
    public function join(Request $request)
    {
        $validated = $request->validate([
            'invite_code' => 'required|string|exists:sharing_groups,invite_code',
        ]);

        $group = SharingGroup::where('invite_code', $validated['invite_code'])->first();

        // Check if group is full
        if ($group->members()->count() >= $group->max_members) {
            return response()->json(['message' => 'Group is full'], 400);
        }

        // Check if already a member
        if ($group->members()->where('user_id', Auth::id())->exists()) {
            return response()->json(['message' => 'Already a member'], 400);
        }

        DB::beginTransaction();
        try {
            // Calculate share amount
            $memberCount = $group->members()->count() + 1;
            $shareAmount = $group->total_cost / $memberCount;

            // Add new member
            GroupMember::create([
                'sharing_group_id' => $group->id,
                'user_id' => Auth::id(),
                'share_amount' => $shareAmount,
                'role' => 'member',
                'payment_status' => 'pending',
                'next_payment_date' => $group->subscription->next_billing_date,
            ]);

            // Update all members' share amounts
            $group->members()->update([
                'share_amount' => $shareAmount,
            ]);

            // Update group status if full
            if ($memberCount >= $group->max_members) {
                $group->update(['status' => 'full']);
            }

            DB::commit();

            return response()->json([
                'message' => 'Joined group successfully',
                'group' => $group->load(['subscription', 'members.user']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Failed to join group: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error($e->getTraceAsString());
            return response()->json(['message' => 'Failed to join group'], 500);
        }
    }

    // Leave group
    public function leave(SharingGroup $group)
    {
        $member = $group->members()->where('user_id', Auth::id())->first();

        if (!$member) {
            return response()->json(['message' => 'Not a member of this group'], 400);
        }

        if ($member->role === 'owner') {
            return response()->json(['message' => 'Owner cannot leave. Delete the group instead.'], 400);
        }

        DB::beginTransaction();
        try {
            $member->delete();

            // Recalculate share amounts
            $remainingMembers = $group->members()->count();
            if ($remainingMembers > 0) {
                $newShareAmount = $group->total_cost / $remainingMembers;
                $group->members()->update(['share_amount' => $newShareAmount]);
                $group->update(['status' => 'active']);
            }

            DB::commit();

            return response()->json(['message' => 'Left group successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Failed to leave group: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error($e->getTraceAsString());
            return response()->json(['message' => 'Failed to leave group'], 500);
        }
    }

    // Delete group (owner only)
    public function destroy(SharingGroup $group)
    {
        if ($group->owner_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        DB::beginTransaction();
        try {
            // Mark subscription as not shared
            $group->subscription->update(['is_shared' => false]);
            
            $group->delete(); // Members cascade delete

            DB::commit();

            return response()->json(['message' => 'Group deleted successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Failed to delete group: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error($e->getTraceAsString());
            return response()->json(['message' => 'Failed to delete group'], 500);
        }
    }
}