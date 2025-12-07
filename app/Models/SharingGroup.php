<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SharingGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'subscription_id',
        'owner_id',
        'name',
        'description',
        'total_cost',
        'max_members',
        'status',
        'invite_code',
    ];

    protected $casts = [
        'total_cost' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($group) {
            if (empty($group->invite_code)) {
                $group->invite_code = Str::random(8);
            }
        });
    }

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members()
    {
        return $this->hasMany(GroupMember::class);
    }

    public function payments()
    {
        return $this->hasMany(GroupPayment::class);
    }

    // Calculate cost per member
    public function costPerMember()
    {
        $memberCount = $this->members()->count();
        return $memberCount > 0 ? $this->total_cost / $memberCount : $this->total_cost;
    }
}