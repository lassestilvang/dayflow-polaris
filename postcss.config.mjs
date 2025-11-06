/**
 * PostCSS configuration for Dayflow Polaris.
 * Used by Next.js (via Bun) to process Tailwind and autoprefixer.
 * @type {import('postcss-load-config').Config}
 */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

export default config;