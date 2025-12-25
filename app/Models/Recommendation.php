<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recommendation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'description',
        'potential_savings',
        'affected_subscriptions',
        'status',
        'priority',
    ];

    protected $casts = [
        'potential_savings' => 'decimal:2',
        'affected_subscriptions' => 'array',
    ];

    protected $appends = ['affected_subscriptions_list'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Get affected subscription objects as an attribute
    public function getAffectedSubscriptionsListAttribute()
    {
        if (empty($this->affected_subscriptions)) {
            return collect([]);
        }

        return Subscription::whereIn('id', $this->affected_subscriptions)->get();
    }
}