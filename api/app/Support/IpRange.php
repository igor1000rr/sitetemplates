<?php

namespace App\Support;

class IpRange
{
    /**
     * Проверяет, входит ли IP в диапазон CIDR (или равен одиночному адресу).
     * Поддерживает IPv4 и IPv6.
     */
    public static function contains(string $ip, string $range): bool
    {
        if (!str_contains($range, '/')) {
            return $ip === $range;
        }

        [$subnet, $bits] = explode('/', $range);

        // Не сравниваем IPv6-диапазон с IPv4-адресом и наоборот
        if (str_contains($subnet, ':') !== str_contains($ip, ':')) {
            return false;
        }

        if (str_contains($ip, ':')) {
            // IPv6
            $ipBin = inet_pton($ip);
            $subnetBin = inet_pton($subnet);
            if ($ipBin === false || $subnetBin === false) {
                return false;
            }

            $mask = str_repeat('f', (int) ($bits / 4));
            $mask .= match ($bits % 4) {
                1 => '8', 2 => 'c', 3 => 'e', default => '',
            };
            $mask = str_pad($mask, 32, '0');
            $maskBin = pack('H*', $mask);

            return ($ipBin & $maskBin) === ($subnetBin & $maskBin);
        }

        // IPv4
        $ipLong = ip2long($ip);
        $subnetLong = ip2long($subnet);
        if ($ipLong === false || $subnetLong === false) {
            return false;
        }
        $mask = -1 << (32 - (int) $bits);

        return ($ipLong & $mask) === ($subnetLong & $mask);
    }
}
