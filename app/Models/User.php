<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function plaidAccounts()
    {
        return $this->hasMany(PlaidAccount::class);
    }

    public function ownedGroups()
    {
        return $this->hasMany(SharingGroup::class, 'owner_id');
    }

    public function groupMemberships()
    {
        return $this->hasMany(GroupMember::class);
    }

    public function recommendations()
    {
        return $this->hasMany(Recommendation::class);
    }

    public function bankAccounts()
    {
        return $this->hasMany(BankAccount::class);
    }
}