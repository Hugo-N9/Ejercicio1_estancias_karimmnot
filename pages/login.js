import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 const router = useRouter();
  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Login exitoso");
      localStorage.setItem("token", data.token);
       router.push("/registro");
    } else {
      alert("Error: " + data.error);
    }
  };


return (
<div className="login-container">
<form onSubmit={handleLogin} className="login-form">
<h2>Iniciar sesión</h2>
<input
placeholder="Correo"
value={email}
onChange={(e) => setEmail(e.target.value)}
type="email"
required
/>
<input
type="password"
placeholder="Contraseña"
value={password}
onChange={(e) => setPassword(e.target.value)}
required
/>
<button type="submit">Iniciar sesión</button>
</form>
</div>
);
}