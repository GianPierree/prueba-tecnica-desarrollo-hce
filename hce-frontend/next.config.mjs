import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { NextFederationPlugin } = require('@module-federation/nextjs-mf');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config, options) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'hce_frontend',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './PurchasesPage':  './pages/dashboard/purchases.tsx',
          './SalesPage':      './pages/dashboard/sales.tsx',
          './KardexPage':     './pages/dashboard/kardex.tsx',
          './ProductsPage':   './pages/dashboard/products.tsx',
          './ProductModal':   './components/purchases/ProductModal.tsx',
          './MovementsModal': './components/kardex/MovementsModal.tsx',
        },
        shared: {
          react:       { singleton: true, requiredVersion: '^18.0.0' },
          'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
          axios:       { singleton: true },
        },
        extraOptions: {
          exposePages: true,
          enableImageLoaderFix: true,
          enableUrlLoaderFix: true,
        },
      })
    );
    return config;
  },
};

export default nextConfig;
