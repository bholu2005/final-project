/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
    content: [
        './resources/**/*.blade.php',
        './resources/**/*.js',
        './resources/**/*.jsx',
    ],
    theme: {
        extend: {
            colors: {
                skin: '#E8D5C6',       // Background (Beige)
                black: '#000000',      // Primary Dark
                white: '#FFFFFF',      // Pure White
            },
            fontFamily: {
                heading: ['"Harrington"', '"Black Chancery"', ...defaultTheme.fontFamily.serif],
                body: ['"Merlin"', 'sans-serif'],
            },
        },
    },
    plugins: [],
};