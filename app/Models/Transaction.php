<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'transactions';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'plaid_account_id',
        'plaid_transaction_id',
        'amount',
        'date',
        'merchant_name',
        'category',
        'is_recurring',
        'is_subscription',
        'linked_subscription_id',
    ];

    /**
     * The attributes that should be cast to native types.
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'date' => 'date',
        'is_recurring' => 'boolean',
        'is_subscription' => 'boolean',
    ];

    /**
     * Relationships
     */

    // Transaction belongs to a user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Transaction belongs to a Plaid account
    public function plaidAccount()
    {
        return $this->belongsTo(PlaidAccount::class);
    }

    // Transaction may belong to a linked subscription
    public function linkedSubscription()
    {
        return $this->belongsTo(Subscription::class, 'linked_subscription_id');
    }
}
