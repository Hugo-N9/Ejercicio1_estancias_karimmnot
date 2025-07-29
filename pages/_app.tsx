import "@/styles/globals.css";
import "@/styles/registro.css"; // ⬅ importa aquí
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
return <Component {...pageProps} />;
}