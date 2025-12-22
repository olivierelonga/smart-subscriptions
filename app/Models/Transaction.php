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
        'bank_account_id',
        'plaid_transaction_id',
        'stitch_transaction_id',
        'amount',
        'date',
        'merchant_name',
        'category',
        'is_recurring',
        'is_subscription',
        'linked_subscription_id',
        'running_balance',
    ];

    /**
     * The attributes that should be cast to native types.
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'date' => 'date',
        'is_recurring' => 'boolean',
        'is_subscription' => 'boolean',
        'running_balance' => 'decimal:2',
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

    public function bankAccount()
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function linkedSubscription()
    {
        return $this->belongsTo(Subscription::class, 'linked_subscription_id');
    }

    /**
     * Scope to get only recurring transactions
     */
    public function scopeRecurring($query)
    {
        return $query->where('is_recurring', true);
    }

    /**
     * Scope to get only subscription transactions
     */
    public function scopeSubscriptions($query)
    {
        return $query->where('is_subscription', true);
    }

    /**
     * Check if this transaction is from Stitch
     */
    public function isFromStitch()
    {
        return !empty($this->stitch_transaction_id);
    }

    /**
     * Check if this transaction is from Plaid
     */
    public function isFromPlaid()
    {
        return !empty($this->plaid_transaction_id);
    }

    /**
     * Get the source of this transaction
     */
    public function getSourceAttribute()
    {
        if ($this->isFromStitch()) {
            return 'Stitch (South African Bank)';
        } elseif ($this->isFromPlaid()) {
            return 'Plaid (International Bank)';
        }
        return 'Manual Entry';
    }
}