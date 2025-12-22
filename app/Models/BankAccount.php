<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'stitch_account_id',
        'account_name',
        'account_number',
        'bank_id',
        'current_balance',
        'is_active',
        'last_synced_at',
    ];

    protected $casts = [
        'current_balance' => 'decimal:2',
        'is_active' => 'boolean',
        'last_synced_at' => 'datetime',
    ];

    /**
     * Get the user that owns the bank account
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all transactions for this bank account
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Scope to get only active accounts
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get masked account number for display
     */
    public function getMaskedAccountNumberAttribute()
    {
        if (!$this->account_number) {
            return 'N/A';
        }

        $length = strlen($this->account_number);
        if ($length <= 4) {
            return $this->account_number;
        }

        return str_repeat('•', $length - 4) . substr($this->account_number, -4);
    }

    /**
     * Get bank name from bank_id
     */
    public function getBankNameAttribute()
    {
        $banks = [
            'absa' => 'Absa',
            'capitec' => 'Capitec',
            'fnb' => 'FNB',
            'nedbank' => 'Nedbank',
            'standard_bank' => 'Standard Bank',
            'investec' => 'Investec',
            'tyme_bank' => 'TymeBank',
            'discovery_bank' => 'Discovery Bank',
        ];

        return $banks[$this->bank_id] ?? ucfirst(str_replace('_', ' ', $this->bank_id));
    }

    /**
     * Check if account needs syncing (older than 1 hour)
     */
    public function needsSync()
    {
        if (!$this->last_synced_at) {
            return true;
        }

        return $this->last_synced_at->addHour()->isPast();
    }

    /**
     * Format balance for display
     */
    public function getFormattedBalanceAttribute()
    {
        if ($this->current_balance === null) {
            return 'N/A';
        }

        return 'R' . number_format($this->current_balance, 2);
    }
}