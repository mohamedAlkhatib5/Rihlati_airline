<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Offer extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'title_en', 'title_ar', 'description_en', 'description_ar',
        'destination_id', 'discount_type', 'discount_value',
        'valid_from', 'valid_to', 'max_uses', 'used_count', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'valid_from' => 'date',
            'valid_to' => 'date',
            'is_active' => 'boolean',
            'discount_value' => 'integer',
        ];
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }

    public function scopeRedeemable(Builder $query): Builder
    {
        return $query
            ->where('is_active', true)
            ->whereDate('valid_from', '<=', now())
            ->whereDate('valid_to', '>=', now())
            ->where(function (Builder $inner) {
                $inner->whereNull('max_uses')
                    ->orWhereColumn('used_count', '<', 'max_uses');
            });
    }

    /** Discount in whole currency units for a given subtotal. */
    public function discountFor(int $subtotal): int
    {
        return $this->discount_type === 'percent'
            ? (int) round($subtotal * $this->discount_value / 100)
            : min($this->discount_value, $subtotal);
    }
}
