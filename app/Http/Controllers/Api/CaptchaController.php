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
        
        // 2. Create Image Container (120x40 px)
        $im = imagecreatetruecolor(120, 45);
        
        // 3. Colors Define karo
        $bg = imagecolorallocate($im, 232, 213, 198); // Skin Color (Theme match)
        $text_color = imagecolorallocate($im, 0, 0, 0); // Black Text
        $line_color = imagecolorallocate($im, 64, 64, 64); // Noise Lines
        
        // 4. Fill Background
        imagefill($im, 0, 0, $bg);
        
        // 5. Add Noise (Lines taaki bot read na kar sake)
        for($i=0; $i<6; $i++) {
            imageline($im, rand(0,120), rand(0,45), rand(0,120), rand(0,45), $line_color);
        }

        // 6. Write String on Image
        // (Built-in font use kar rahe hain taaki koi external file na chahiye ho)
        imagestring($im, 5, 35, 14, $string, $text_color);
        
        // 7. Convert Image to Base64 (Text Format)
        ob_start();
        imagepng($im);
        $imageData = ob_get_clean();
        imagedestroy($im);

        // 8. Return Data
        return response()->json([
            'image' => 'data:image/png;base64,' . base64_encode($imageData),
            'key' => bcrypt($string) // Password ki tarah encrypt karke bhej rahe hain verify karne ke liye
        ]);
    }
}