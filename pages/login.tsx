import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (user === "admin" && pass === "COT3007_2206") {
      sessionStorage.setItem("cot_auth", "true");
      router.push("/");
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#0f1117"
    }}>
      <div style={{
        background: "#1a1d27", padding: "2.5rem", borderRadius: "12px",
        width: "100%", maxWidth: "380px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
      }}>
        <h1 style={{ color: "#fff", fontSize: "1.5rem", marginBottom: "0.25rem", fontWeight: 700 }}>
          COT Dashboard
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "2rem", fontSize: "0.9rem" }}>
          Acceso restringido
        </p>
        <label style={{ color: "#9ca3af", fontSize: "0.8rem", display: "block", marginBottom: "0.4rem" }}>
          Usuario
        </label>
        <input
          type="text"
          value={user}
          onChange={e => setUser(e.target.value)}
          style={{
            width: "100%", padding: "0.6rem 0.8rem", borderRadius: "6px",
            background: "#0f1117", border: "1px solid #2d3148", color: "#fff",
            marginBottom: "1rem", fontSize: "0.95rem", boxSizing: "border-box"
          }}
        />
        <label style={{ color: "#9ca3af", fontSize: "0.8rem", display: "block", marginBottom: "0.4rem" }}>
          Contraseña
        </label>
        <input
          type="password"
          value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          style={{
            width: "100%", padding: "0.6rem 0.8rem", borderRadius: "6px",
            background: "#0f1117", border: "1px solid #2d3148", color: "#fff",
            marginBottom: "1.5rem", fontSize: "0.95rem", boxSizing: "border-box"
          }}
        />
        {error && (
          <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>
        )}
        <button
          onClick={handleLogin}
          style={{
            width: "100%", padding: "0.75rem", borderRadius: "6px",
            background: "#3b82f6", color: "#fff", fontWeight: 600,
            fontSize: "1rem", border: "none", cursor: "pointer"
          }}
        >
          Entrar
        </button>
      </div>
    </div>
  );
}