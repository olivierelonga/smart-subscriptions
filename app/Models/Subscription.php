<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'amount',
        'currency',
        'billing_cycle',
        'next_billing_date',
        'category',
        'merchant_name',
        'description',
        'status',
        'detection_method',
        'plaid_transaction_id',
        'is_shared',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'next_billing_date' => 'date',
        'is_shared' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sharingGroups()
    {
        return $this->hasMany(SharingGroup::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'linked_subscription_id');
    }

    // Calculate yearly cost
    public function yearlyAmount()
    {
        return match($this->billing_cycle) {
            'daily' => $this->amount * 365,
            'weekly' => $this->amount * 52,
            'monthly' => $this->amount * 12,
            'yearly' => $this->amount,
            default => 0,
        };
    }
}