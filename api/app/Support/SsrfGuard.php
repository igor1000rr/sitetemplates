<?php

namespace App\Support;

/**
 * Защита от SSRF для исходящих подключений (FTP/SFTP-деплой).
 *
 * Важно: резолвинг должен выполняться непосредственно перед подключением,
 * а подключаться нужно к РАЗРЕШЁННОМУ IP, а не к hostname — иначе возможен
 * DNS-rebinding/TOCTOU (валидируем один IP, подключаемся к другому).
 */
class SsrfGuard
{
    /**
     * Резолвим хост в список IP. Для IP-литерала возвращаем его самого.
     *
     * @return string[]
     */
    public static function resolve(string $host): array
    {
        $host = trim($host, " \t\n\r\0\x0B[]"); // на случай [IPv6]

        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return [$host];
        }

        $ips = [];
        $v4 = @gethostbynamel($host);
        if (is_array($v4)) {
            $ips = array_merge($ips, $v4);
        }
        foreach (@dns_get_record($host, DNS_AAAA) ?: [] as $rec) {
            if (!empty($rec['ipv6'])) {
                $ips[] = $rec['ipv6'];
            }
        }

        return array_values(array_unique($ips));
    }

    /**
     * Заблокирован ли конкретный IP (приватный/loopback/link-local/зарезервированный).
     */
    public static function isIpBlocked(string $ip): bool
    {
        // NO_PRIV_RANGE + NO_RES_RANGE отсекают 10/8, 172.16/12, 192.168/16,
        // 127/8, 169.254/16 (вкл. 169.254.169.254), ::1, fc00::/7 и т.п.
        if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return true;
        }

        // IPv4-mapped IPv6 (::ffff:a.b.c.d) — проверяем встроенный IPv4
        if (stripos($ip, '::ffff:') === 0) {
            $mapped = substr($ip, 7);
            if (filter_var($mapped, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
                return self::isIpBlocked($mapped);
            }
        }

        return false;
    }

    /**
     * Заблокирован ли хост: не резолвится ИЛИ хотя бы один IP запрещён.
     */
    public static function isHostBlocked(string $host): bool
    {
        $ips = self::resolve($host);
        if (empty($ips)) {
            return true;
        }

        foreach ($ips as $ip) {
            if (self::isIpBlocked($ip)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Вернуть РАЗРЕШЁННЫЙ IP для подключения (первый публичный).
     * Если хост не резолвится или любой из его IP запрещён — вернуть null
     * (консервативно: не подключаемся, если есть хоть один опасный ответ).
     */
    public static function safeIp(string $host): ?string
    {
        $ips = self::resolve($host);
        if (empty($ips)) {
            return null;
        }

        foreach ($ips as $ip) {
            if (self::isIpBlocked($ip)) {
                return null;
            }
        }

        return $ips[0];
    }
}
