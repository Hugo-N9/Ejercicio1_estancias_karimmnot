import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login"); // redirige a /login
  }, []);

  return null; // No muestra nada en esta página
}