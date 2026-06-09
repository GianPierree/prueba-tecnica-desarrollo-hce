/* eslint-disable @typescript-eslint/no-unused-vars */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { NextFederationPlugin } = require('@module-federation/nextjs-mf');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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
          './SaleModal':      './components/sales/SaleModal.tsx',
          './PurchaseModal':  './components/purchases/PurchaseModal.tsx',
          './MovementsModal': './components/kardex/MovementsModal.tsx',
        },
        shared: {
          react: { singleton: true, requiredVersion: '^18.0.0', eager: true },
          'react-dom': { singleton: true, requiredVersion: '^18.0.0', eager: true },
          'react/jsx-runtime': { singleton: true, eager: true },
          'react/jsx-dev-runtime': { singleton: true, eager: true },
          axios: { singleton: true },
          '@heroui/react': { singleton: true },
          'framer-motion': { singleton: true },
          zustand: { singleton: true },
        },
        extraOptions: {
          exposePages: false,
          enableImageLoaderFix: true,
          enableUrlLoaderFix: true,
          skipSharingNextInternals: true,
        },
      })
    );
    return config;
  },
};

export default nextConfig;