import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import "../styles/globals.css";

const HeroUIProvider = dynamic(
  () => import("@heroui/react").then((mod) => mod.HeroUIProvider),
  { ssr: false, loading: () => null }
);

const ToastProvider = dynamic(
  () => import("@heroui/react").then((mod) => mod.ToastProvider),
  { ssr: false, loading: () => null }
);

function App({ Component, pageProps }: AppProps) {
  return (
    <HeroUIProvider>
      <ToastProvider />
      <Component {...pageProps} />
    </HeroUIProvider>
  );
}

export default dynamic(() => Promise.resolve(App), { ssr: false });