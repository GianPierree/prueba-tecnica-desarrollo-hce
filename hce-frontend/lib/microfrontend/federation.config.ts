/**
 * MICROFRONTEND ARCHITECTURE — HCE System
 * Stack: Next.js 14.2 (Pages Router) + React 18 + HeroUI v2 + @module-federation/nextjs-mf@8.1.10
 *
 * IMPORTANTE: El plugin @module-federation/nextjs-mf SOLO soporta Pages Router.
 * App Router no es compatible. Por eso este proyecto usa pages/.
 *
 * Requiere: NEXT_PRIVATE_LOCAL_WEBPACK=true en .env.local
 */
export const federationConfig = {
  remote: {
    name: "hce_frontend",
    filename: "static/chunks/remoteEntry.js",
    exposes: {
      "./PurchasesPage":  "./pages/dashboard/purchases.tsx",
      "./SalesPage":      "./pages/dashboard/sales.tsx",
      "./KardexPage":     "./pages/dashboard/kardex.tsx",
      "./ProductsPage":   "./pages/dashboard/products.tsx",
      "./ProductModal":   "./components/purchases/ProductModal.tsx",
      "./MovementsModal": "./components/kardex/MovementsModal.tsx",
    },
  },
  shared: {
    react:       { singleton: true, requiredVersion: "^18.0.0" },
    "react-dom": { singleton: true, requiredVersion: "^18.0.0" },
    axios:       { singleton: true },
    "@heroui/react": { singleton: true },
  },
};
