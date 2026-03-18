<?php
// app/Models/TemplateImage.php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class TemplateImage extends Model
{
    public $timestamps = false;
    protected $fillable = ['template_id', 'path', 'alt', 'sort_order', 'is_main'];
    protected $casts = ['is_main' => 'boolean'];

    public function template() { return $this->belongsTo(Template::class); }
}
