<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id', 'action', 'entity', 'entity_id', 'meta', 'ip_address',
    ];

    protected function casts(): array
    {
        return ['meta' => 'array'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Records an administrative action against an entity. */
    public static function record(
        ?int $userId,
        string $action,
        string $entity,
        ?int $entityId = null,
        array $meta = [],
        ?string $ip = null,
    ): self {
        return static::create([
            'user_id' => $userId,
            'action' => $action,
            'entity' => $entity,
            'entity_id' => $entityId,
            'meta' => $meta ?: null,
            'ip_address' => $ip,
        ]);
    }
}
