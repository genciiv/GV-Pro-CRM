import { useState } from "react";
import { useAuth } from "../../lib/auth";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      // Auth listener do të ndryshojë profilin dhe Router do të ridrejtojë
      // Presim pak për të lejuar auth state të përditësohet
      setTimeout(() => {
        window.location.href = "/";
      }, 800);
    } catch (err) {
      setError(
        err.message === "Invalid login credentials"
          ? "Email ose fjalëkalim i gabuar"
          : err.message,
      );
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#fafafa" }}>
      {/* Left */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ marginBottom: 40 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "#18181b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                }}
              >
                💪
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    letterSpacing: "-.3px",
                  }}
                >
                  GV CRM
                </div>
                <div style={{ fontSize: 11, color: "#a1a1aa" }}>
                  Platformë për Palestra
                </div>
              </div>
            </div>
            <div
              style={{
                fontFamily: "Instrument Serif,serif",
                fontSize: 28,
                marginBottom: 6,
              }}
            >
              Mirë se erdhe
            </div>
            <div style={{ fontSize: 13, color: "#71717a" }}>
              Hyr me llogarinë tënde për të vazhduar
            </div>
          </div>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 20,
                fontSize: 13,
                color: "#991b1b",
                display: "flex",
                gap: 8,
              }}
            >
              ❌ {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label
                  style={{ fontSize: 12, fontWeight: 500, color: "#52525b" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@palestra.al"
                  style={{
                    background: "#fff",
                    border: "1px solid #e4e4e7",
                    borderRadius: 8,
                    padding: "9px 12px",
                    fontSize: 13,
                    outline: "none",
                    fontFamily: "inherit",
                    width: "100%",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#a1a1aa")}
                  onBlur={(e) => (e.target.style.borderColor = "#e4e4e7")}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label
                  style={{ fontSize: 12, fontWeight: 500, color: "#52525b" }}
                >
                  Fjalëkalimi
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    background: "#fff",
                    border: "1px solid #e4e4e7",
                    borderRadius: 8,
                    padding: "9px 12px",
                    fontSize: 13,
                    outline: "none",
                    fontFamily: "inherit",
                    width: "100%",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#a1a1aa")}
                  onBlur={(e) => (e.target.style.borderColor = "#e4e4e7")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#52525b" : "#18181b",
                color: "#fff",
                border: "none",
                padding: "12px 0",
                borderRadius: 9,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "wait" : "pointer",
                fontFamily: "inherit",
                transition: "background .2s",
              }}
            >
              {loading ? "⏳ Duke hyrë..." : "Hyr në sistem →"}
            </button>
          </form>

          <div
            style={{
              marginTop: 24,
              textAlign: "center",
              fontSize: 12,
              color: "#a1a1aa",
            }}
          >
            Nuk ke llogari?{" "}
            <a
              href="/apply"
              style={{
                color: "#18181b",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Apliko tani
            </a>
          </div>
        </div>
      </div>

      {/* Right */}
      <div
        style={{
          flex: 1,
          background: "#18181b",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 60,
          color: "#fff",
        }}
        className="login-panel"
      >
        <div style={{ maxWidth: 360 }}>
          <div
            style={{
              fontFamily: "Instrument Serif,serif",
              fontSize: 34,
              marginBottom: 14,
              lineHeight: 1.2,
            }}
          >
            Menaxho palestrën me profesionalizëm
          </div>
          <div
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,.5)",
              lineHeight: 1.8,
              marginBottom: 40,
            }}
          >
            QR check-in, pagesa, fatura dhe raporte — gjithçka në një vend.
          </div>
          {[
            ["📊", "Dashboard live me statistika reale"],
            ["📷", "QR Check-in me kamerë"],
            ["💰", "Pagesa cash dhe fatura automatike"],
            ["📈", "Raporte dhe analiza të detajuara"],
            ["👥", "Menaxhim i plotë anëtarësh"],
          ].map(([ico, txt]) => (
            <div
              key={txt}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "rgba(255,255,255,.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {ico}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>
                {txt}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@media(max-width:768px){.login-panel{display:none}}`}</style>
    </div>
  );
}
