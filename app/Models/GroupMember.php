<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroupMember extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = [
        'sharing_group_id',
        'user_id',
        'share_amount',
        'role',
        'payment_status',
        'next_payment_date',
    ];

    protected $casts = [
        'share_amount' => 'decimal:2',
        'next_payment_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sharingGroup()
    {
        return $this->belongsTo(SharingGroup::class);
    }
}
