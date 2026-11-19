<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CaptchaController extends Controller
{
    public function generate(Request $request)
    {
        $code = Str::upper(Str::random(5));
        $key = 'captcha_'.Str::lower(Str::random(32));
        Cache::put($key, hash('sha256', strtolower($code)), 300);

        $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="45" viewBox="0 0 120 45">'
            .'<rect width="120" height="45" rx="8" fill="#e8d5c6"/>';
        for ($i = 0; $i < 8; $i++) {
            $svg .= '<line x1="'.rand(0,120).'" y1="'.rand(0,45).'" x2="'.rand(0,120).'" y2="'.rand(0,45).'" stroke="#404040" stroke-width="1" opacity=".35"/>';
        }
        for ($i = 0; $i < strlen($code); $i++) {
            $x = 18 + ($i * 18);
            $y = rand(27, 32);
            $rotation = rand(-15, 15);
            $svg .= '<text x="'.$x.'" y="'.$y.'" font-family="monospace" font-size="20" font-weight="bold" fill="#111111" transform="rotate('.$rotation.' '.$x.' '.$y.')">'.$code[$i].'</text>';
        }
        $svg .= '</svg>';

        return response()->json([
            'image' => 'data:image/svg+xml;base64,'.base64_encode($svg),
            'key' => $key,
        ]);
    }

    public function verify(string $key, string $answer): bool
    {
        $expected = Cache::get($key);
        if (! $expected) return false;
        Cache::forget($key);
        return hash_equals($expected, hash('sha256', strtolower(trim($answer))));
    }
}
