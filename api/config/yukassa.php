<?php
// ═══ config/yukassa.php ═══

return [
    'shop_id' => env('YUKASSA_SHOP_ID') ? (int) env('YUKASSA_SHOP_ID') : null,
    'secret_key' => env('YUKASSA_SECRET_KEY') ?: null,
];
