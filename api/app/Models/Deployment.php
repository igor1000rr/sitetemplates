<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class Deployment extends Model
{
    protected $fillable = [
        'user_id', 'template_id', 'method', 'status', 'host', 'port',
        'username', 'password_encrypted', 'remote_path', 'log', 'error',
        'started_at', 'completed_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected $hidden = ['password_encrypted'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function template()
    {
        return $this->belongsTo(Template::class);
    }

    public function setPasswordAttribute(string $value): void
    {
        $this->attributes['password_encrypted'] = Crypt::encryptString($value);
    }

    public function getDecryptedPasswordAttribute(): string
    {
        return Crypt::decryptString($this->password_encrypted);
    }

    public function appendLog(string $line): void
    {
        $this->update(['log' => ($this->log ?? '') . "[" . now()->format('H:i:s') . "] {$line}\n"]);
    }

    public function markDeploying(): void
    {
        $this->update(['status' => 'deploying', 'started_at' => now()]);
    }

    public function markCompleted(): void
    {
        $this->update(['status' => 'completed', 'completed_at' => now()]);
    }

    public function markFailed(string $error): void
    {
        $this->update(['status' => 'failed', 'error' => $error, 'completed_at' => now()]);
    }
}
