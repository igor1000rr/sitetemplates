<?php
// app/Models/Download.php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Download extends Model
{
    public $timestamps = false;
    protected $fillable = ['order_id', 'user_id', 'template_id', 'ip'];

    public function order() { return $this->belongsTo(Order::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function template() { return $this->belongsTo(Template::class); }
}
