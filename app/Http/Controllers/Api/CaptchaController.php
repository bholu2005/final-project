<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class CaptchaController extends Controller
{
    public function generate()
    {
        // 1. Random 5 Character String
        $string = Str::upper(Str::random(5));
        
        // 2. Check if GD extension is loaded, otherwise dynamically degrade gracefully to SVG
        if (!extension_loaded('gd') || !function_exists('imagecreatetruecolor')) {
            // Generate beautiful inline SVG Captcha (Requires ZERO php.ini configurations or extensions)
            $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="45" viewBox="0 0 120 45" style="background-color: #e8d5c6; font-family: monospace; border-radius: 8px;">';

            // Add noise lines
            for ($i = 0; $i < 8; $i++) {
                $x1 = rand(0, 120);
                $y1 = rand(0, 45);
                $x2 = rand(0, 120);
                $y2 = rand(0, 45);
                $svg .= "<line x1=\"$x1\" y1=\"$y1\" x2=\"$x2\" y2=\"$y2\" stroke=\"#404040\" stroke-width=\"1\" opacity=\"0.4\" />";
            }

            // Add noise dots
            for ($i = 0; $i < 30; $i++) {
                $cx = rand(0, 120);
                $cy = rand(0, 45);
                $r = rand(1, 2);
                $svg .= "<circle cx=\"$cx\" cy=\"$cy\" r=\"$r\" fill=\"#505050\" opacity=\"0.3\" />";
            }

            // Render text characters with randomized rotations & alignments
            for ($i = 0; $i < strlen($string); $i++) {
                $char = $string[$i];
                $x = 18 + ($i * 18);
                $y = 28 + rand(-3, 3);
                $rot = rand(-15, 15);
                $svg .= "<text x=\"$x\" y=\"$y\" font-size=\"20\" font-weight=\"bold\" fill=\"#111111\" transform=\"rotate($rot, $x, $y)\">$char</text>";
            }

            $svg .= '</svg>';
            $imageData = base64_encode($svg);
            $imageSrc = 'data:image/svg+xml;base64,' . $imageData;
        } else {
            // Standard GD fallback
            $im = imagecreatetruecolor(120, 45);
            $bg = imagecolorallocate($im, 232, 213, 198); // Skin Color (Theme match)
            $text_color = imagecolorallocate($im, 0, 0, 0); // Black Text
            $line_color = imagecolorallocate($im, 64, 64, 64); // Noise Lines

            imagefill($im, 0, 0, $bg);

            for($i=0; $i<6; $i++) {
                imageline($im, rand(0,120), rand(0,45), rand(0,120), rand(0,45), $line_color);
            }

            imagestring($im, 5, 35, 14, $string, $text_color);

            ob_start();
            imagepng($im);
            $rawImage = ob_get_clean();
            imagedestroy($im);

            $imageSrc = 'data:image/png;base64,' . base64_encode($rawImage);
        }

        // 3. Return response with password-encrypted verification key
        return response()->json([
            'image' => $imageSrc,
            'key' => bcrypt($string) // encrypted for safety checks
        ]);
    }
}
