"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API_BASE_URL from "../../config/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Esta URL apuntará a nuestro servidor backend Node.js en el puerto 4001
      const res = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      // Guardamos el token en localStorage para mantener al usuario autenticado
      localStorage.setItem("token", data.token);

      console.log("Login exitoso", data);
      alert("¡Inicio de sesión exitoso!");
      
      // Aquí redirigiríamos al panel principal en el futuro
      router.push("/dashboard");

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-card">
        <h1 className="auth-title">Iniciar Sesión</h1>
        <p className="auth-subtitle">Ingresa tus credenciales para continuar</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-input"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Entrar
          </button>
        </form>

        <Link href="/register" className="auth-link">
          ¿No tienes una cuenta? Regístrate aquí
        </Link>
      </div>
    </div>
  );
}
