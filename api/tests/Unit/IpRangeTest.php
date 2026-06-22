<?php

namespace Tests\Unit;

use App\Support\IpRange;
use PHPUnit\Framework\TestCase;

class IpRangeTest extends TestCase
{
    public function test_matches_single_ipv4(): void
    {
        $this->assertTrue(IpRange::contains('77.75.156.11', '77.75.156.11'));
        $this->assertFalse(IpRange::contains('77.75.156.12', '77.75.156.11'));
    }

    public function test_matches_ipv4_cidr(): void
    {
        // /27 = адреса .0–.31
        $this->assertTrue(IpRange::contains('185.71.76.5', '185.71.76.0/27'));
        $this->assertFalse(IpRange::contains('185.71.76.50', '185.71.76.0/27'));
    }

    public function test_rejects_ip_outside_cidr(): void
    {
        $this->assertFalse(IpRange::contains('8.8.8.8', '185.71.76.0/27'));
    }

    public function test_does_not_mix_ipv4_and_ipv6(): void
    {
        $this->assertFalse(IpRange::contains('8.8.8.8', '2a02:5180::/32'));
        $this->assertFalse(IpRange::contains('2a02:5180::1', '185.71.76.0/27'));
    }

    public function test_matches_ipv6_cidr(): void
    {
        $this->assertTrue(IpRange::contains('2a02:5180::1', '2a02:5180::/32'));
        $this->assertFalse(IpRange::contains('2a03:5180::1', '2a02:5180::/32'));
    }
}
