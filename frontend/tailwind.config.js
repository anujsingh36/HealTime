/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: { 50:'#f6f8f9',100:'#e9eef1',200:'#cfdade',900:'#0c1f24',950:'#06141a' },
        brand: { 50:'#ecfaf6',100:'#cff3e8',200:'#9fe6d2',400:'#3dcaa6',500:'#14b894',600:'#0a9579',700:'#0b7560',800:'#0c5a4b' },
        coral: { 400:'#ff8b6a',500:'#ff6b47',600:'#e8512f' }
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"','ui-sans-serif','system-ui'],
        sans: ['Inter','ui-sans-serif','system-ui']
      },
      boxShadow: {
        soft: '0 1px 2px rgba(12,31,36,.04), 0 8px 24px -8px rgba(12,31,36,.08)',
        ring: '0 0 0 6px rgba(20,184,148,.12)'
      },
      borderRadius: { xl2: '1.25rem' }
    }
  },
  plugins: []
};
