"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API_BASE_URL from "../config/api";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, roles: roles.length ? roles : undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al crear la cuenta");
      }

      console.log("Registro exitoso", data);
      alert("¡Cuenta creada exitosamente! Por favor inicia sesión.");
      
      router.push("/login");

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-card">
        <h1 className="auth-title">Crear Cuenta</h1>
        <p className="auth-subtitle">Regístrate para comenzar</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre de Usuario</label>
            <input
              type="text"
              className="form-input"
              placeholder="tu_usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

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

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="role-admin"
              onChange={(e) => {
                if (e.target.checked) setRoles(["admin", "moderator", "user"]);
                else setRoles([]);
              }}
            />
            <label htmlFor="role-admin" className="form-label" style={{ margin: 0 }}>
              Registrar como Administrador (para probar CRUD)
            </label>
          </div>

          <button type="submit" className="btn-primary">
            Registrarse
          </button>
        </form>

        <Link href="/login" className="auth-link">
          ¿Ya tienes una cuenta? Inicia sesión
        </Link>
      </div>
    </div>
  );
}
