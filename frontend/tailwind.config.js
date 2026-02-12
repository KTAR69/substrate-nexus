/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/*.html"],
    theme: {
        extend: {
            colors: {
                background: '#0a0a0c',
                surface: 'rgba(20, 20, 25, 0.9)',
                mint: {
                    400: '#00ff9d',
                    500: '#00cc7d',
                    glow: 'rgba(0, 255, 157, 0.5)'
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                'neon': '0 0 10px rgba(0, 255, 157, 0.3), 0 0 20px rgba(0, 255, 157, 0.1)',
            }
        },
    },
    plugins: [],
}
