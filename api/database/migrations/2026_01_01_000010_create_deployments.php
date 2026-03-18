<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deployments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('template_id')->constrained()->cascadeOnDelete();
            $table->enum('method', ['ftp', 'sftp', 'api'])->default('ftp');
            $table->enum('status', ['pending', 'deploying', 'completed', 'failed'])->default('pending');
            $table->string('host');
            $table->integer('port')->default(21);
            $table->string('username');
            $table->string('password_encrypted'); // зашифровано
            $table->string('remote_path')->default('/public_html');
            $table->text('log')->nullable();
            $table->text('error')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deployments');
    }
};
