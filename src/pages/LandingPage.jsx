import { useState, useEffect, useRef } from "react";

const FEATURES = [
  {
    icon: "📊",
    title: "Dashboard Live",
    desc: "Statistika në kohë reale — anëtarë aktivë, të ardhura, check-ins dhe borxhe. Gjithçka me një shikim.",
  },
  {
    icon: "📷",
    title: "QR Check-in",
    desc: "Çdo anëtar ka QR kod personal. Skanon me telefon ose tablet dhe hyrja regjistrohet automatikisht.",
  },
  {
    icon: "👥",
    title: "Menaxhim Anëtarësh",
    desc: "Profil i plotë — kontakt, historik pagesash, check-ins. Shto, edito, freeze abonim me 1 klik.",
  },
  {
    icon: "🎫",
    title: "8 Plane Abonoimi",
    desc: "Ditor, Javor, Mujor, 3M, 6M, Vjetor, Student, Couple. Freeze dhe rinovim automatik.",
  },
  {
    icon: "🧾",
    title: "Fatura Automatike",
    desc: "Numër fature unik për çdo pagesë. Gjenerohet automatikisht — pa punë shtesë.",
  },
  {
    icon: "🔔",
    title: "Kujtime Automatike",
    desc: "Email automatik para skadimit të abonoimit. Klientët nuk harrojnë, ti nuk humbet të ardhura.",
  },
];

const STEPS = [
  {
    n: "1",
    t: "Apliko Online",
    d: "Plotëso formularin me emrin e palestrës dhe kontaktin. Pa pagesë paraprake.",
  },
  {
    n: "2",
    t: "Na Kontaktojmë",
    d: "Brenda 24 orësh telefonojmë, konfirmojmë dhe merrni pagesën.",
  },
  {
    n: "3",
    t: "Merr Aksesin",
    d: "Pas pagesës merr email me kredencialet. Hyn dhe fillon menjëherë.",
  },
  {
    n: "4",
    t: "Nis Biznesin",
    d: "Dashboard bosh gati — shto anëtarët e parë dhe fillo të kursesh kohë.",
  },
];

const TESTIMONIALS = [
  {
    text: "Më parë mbaja gjithçka në letër. Tani recepsioni skanon QR dhe unë shoh statistikat nga telefoni kudo.",
    name: "Artan Brahimi",
    gym: "FitZone Gym, Tiranë",
    c: "#18181b",
    i: "AB",
  },
  {
    text: "Sistemi i kujtimeve na shpëtoi shumë të ardhura. Klientët marrin email para skadimit dhe vijnë vetë.",
    name: "Elona Koshi",
    gym: "PowerFit, Durrës",
    c: "#2563eb",
    i: "EK",
  },
  {
    text: "Faturat gjenerohen automatikisht pas çdo pagese. Klientëve u duket shumë profesionale.",
    name: "Genti Nushi",
    gym: "Iron Club, Shkodër",
    c: "#16a34a",
    i: "GN",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "4,900",
    period: "L / muaj",
    desc: "Për palestra të vogla deri 100 anëtarë",
    features: [
      "Deri 100 anëtarë",
      "Dashboard live",
      "QR Check-in",
      "3 plane abonoimi",
      "Fatura automatike",
      "1 staf account",
      "Support email",
    ],
    cta: "Apliko Tani",
    featured: false,
    limit: "100 anëtarë",
  },
  {
    name: "Pro",
    price: "7,900",
    period: "L / muaj",
    desc: "Për palestra me rritje të shpejtë",
    features: [
      "Deri 500 anëtarë",
      "Gjithçka nga Starter",
      "Të 8 planet e abonoimit",
      "Export CSV & PDF",
      "Email automatik",
      "3 staf accounts",
      "Raporte të detajuara",
      "Support prioritar",
    ],
    cta: "Apliko Pro →",
    featured: true,
    limit: "500 anëtarë",
  },
  {
    name: "Business",
    price: "14,900",
    period: "L / muaj",
    desc: "Për zinxhirë palestrash dhe degë të shumta",
    features: [
      "Anëtarë të pakufizuar",
      "Gjithçka nga Pro",
      "Shumë degë / palestra",
      "Staf të pakufizuar",
      "API access",
      "WhatsApp reminders",
      "Onboarding personal",
      "Support 24/7",
    ],
    cta: "Na Kontaktoni",
    featured: false,
    limit: "Pa limit",
  },
];

const FAQS = [
  {
    q: "Si e filloj? A ka kontratë?",
    a: "Asnjë kontratë. Aplikon online, kontaktojmë, pagesa cash, fillon menjëherë. Anulo kurdo.",
  },
  {
    q: "Çfarë ndodh nëse kaloj limitin e anëtarëve?",
    a: "Do të njoftoheni automatikisht kur të afroheni limitit. Mund të upgradoni planin kurdo pa humbur asnjë të dhënë.",
  },
  {
    q: "A mund ta përdorin recepsionistët?",
    a: "Po. Ka role — Admin sheh gjithçka, Recepsioni menaxhon check-in dhe pagesa.",
  },
  {
    q: "Si funksionon QR Check-in?",
    a: "Çdo anëtar merr QR unik. Recepsioni skanon me tablet ose telefon — hyrja regjistrohet automatikisht.",
  },
  {
    q: "A janë të sigurta të dhënat?",
    a: "Po. Çdo palestre ka të dhëna plotësisht të izoluara. Askush tjetër nuk mund t'i aksesojë.",
  },
  {
    q: "30 ditë provë falas — çfarë do të thotë?",
    a: "Nëse nuk jeni të kënaqur brenda 30 ditëve, kthejmë pagesën plotësisht pa pyetje.",
  },
];

export default function LandingPage({ onApply, onLogin }) {
  const [faqOpen, setFaqOpen] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [count, setCount] = useState({ gyms: 0, members: 0, pct: 0 });
  const started = useRef(false);

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 20);
      if (menuOpen) setMenuOpen(false);
    };
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, [menuOpen]);

  useEffect(() => {
    const el = document.getElementById("hero-stats");
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          animate("gyms", 50, 1400);
          animate("members", 12000, 1800);
          animate("pct", 98, 1200);
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const animate = (k, target, ms) => {
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / ms, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setCount((c) => ({ ...c, [k]: Math.floor(e * target) }));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const S = {
    serif: { fontFamily: "'Instrument Serif',Georgia,serif" },
    h2: {
      fontSize: "clamp(30px,4vw,48px)",
      fontWeight: 900,
      lineHeight: 1.1,
      letterSpacing: "-.02em",
      marginBottom: 14,
    },
  };

  return (
    <div
      style={{
        fontFamily: "'Geist',-apple-system,sans-serif",
        color: "#18181b",
        lineHeight: 1.6,
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#d4d4d8;border-radius:3px}
        @keyframes float{0%,100%{transform:perspective(1000px) rotateY(-5deg) rotateX(2deg) translateY(0)}50%{transform:perspective(1000px) rotateY(-5deg) rotateX(2deg) translateY(-10px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .feat-card{transition:all .2s}.feat-card:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,.08)}
        .plan-card{transition:all .2s}.plan-card:hover{transform:translateY(-4px)}
        .btn-main{background:#18181b;color:#fff;border:none;padding:14px 30px;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s;box-shadow:0 4px 20px rgba(0,0,0,.15)}
        .btn-main:hover{background:#333;transform:translateY(-2px)}
        .btn-out{background:transparent;color:#18181b;border:1.5px solid rgba(0,0,0,.18);padding:14px 30px;border-radius:10px;font-size:15px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .2s}
        .btn-out:hover{border-color:#18181b}
        .btn-gold{background:#c8a96e;color:#fff;border:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s}
        .btn-gold:hover{background:#a8894e;transform:translateY(-2px)}
        .btn-ghost{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.25);padding:14px 36px;border-radius:10px;font-size:15px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .2s}
        .btn-ghost:hover{border-color:rgba(255,255,255,.6)}
        .nav-link{background:none;border:none;cursor:pointer;font-size:14px;color:#52525b;font-weight:500;font-family:inherit;transition:color .15s;padding:0}
        .nav-link:hover{color:#18181b}
        .faq-ans{overflow:hidden;transition:max-height .35s ease,opacity .3s ease}
        .hamburger{display:none;background:none;border:none;cursor:pointer;padding:6px;border-radius:6px;flex-direction:column;gap:5px;align-items:center;justify-content:center}
        .hamburger span{display:block;width:22px;height:2px;background:#18181b;border-radius:2px;transition:all .3s}
        .hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
        .hamburger.open span:nth-child(2){opacity:0;transform:scaleX(0)}
        .hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
        .mobile-menu{display:none;position:fixed;top:62px;left:0;right:0;background:#fff;border-bottom:1px solid #e4e4e7;padding:16px 24px 20px;flex-direction:column;gap:4px;z-index:99;box-shadow:0 8px 24px rgba(0,0,0,.08);animation:slideDown .2s ease}
        .mobile-menu.open{display:flex}
        .mobile-menu .nav-link{font-size:15px;padding:10px 8px;border-radius:8px;text-align:left;color:#18181b}
        .mobile-menu .nav-link:hover{background:#fafafa}
        @media(max-width:768px){
          .hamburger{display:flex!important}
          .desktop-nav{display:none!important}
          .hero-visual{display:none!important}
          .features-grid{grid-template-columns:1fr!important}
          .steps-grid{grid-template-columns:1fr 1fr!important}
          .plans-grid{grid-template-columns:1fr!important;max-width:420px;margin-left:auto;margin-right:auto}
          .testi-grid{grid-template-columns:1fr!important}
          .hero-content{max-width:100%!important}
          .hero-title{font-size:38px!important}
          .section-pad{padding:60px 24px!important}
          .footer-inner{flex-direction:column!important;text-align:center!important}
          .cta-btns{flex-direction:column!important;align-items:center!important}
        }
        @media(max-width:480px){
          .steps-grid{grid-template-columns:1fr!important}
          .hero-stats{gap:24px!important}
        }
      `}</style>

      {/* ── NAV ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 40px",
          height: 62,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            scrolled || menuOpen ? "rgba(255,255,255,.95)" : "transparent",
          backdropFilter: scrolled || menuOpen ? "blur(16px)" : "none",
          borderBottom:
            scrolled || menuOpen ? "1px solid rgba(0,0,0,.07)" : "none",
          transition: "all .3s",
        }}
      >
        {/* Logo — klikueshme, con te kryefaqja */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "#18181b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
            }}
          >
            💪
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, color: "#18181b" }}>
            GV-CRM
          </span>
        </button>

        {/* Desktop nav */}
        <div
          className="desktop-nav"
          style={{ display: "flex", alignItems: "center", gap: 32 }}
        >
          {[
            ["Funksionet", "features"],
            ["Si Funksionon", "how"],
            ["Çmimet", "pricing"],
            ["FAQ", "faq"],
          ].map(([l, id]) => (
            <button key={id} className="nav-link" onClick={() => scrollTo(id)}>
              {l}
            </button>
          ))}
          <button className="nav-link" onClick={onLogin}>
            Hyr
          </button>
          <button
            className="btn-main"
            style={{ padding: "9px 22px", fontSize: 13 }}
            onClick={onApply}
          >
            Apliko Tani →
          </button>
        </div>

        {/* Hamburger mobile */}
        <button
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen((m) => !m)}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        {[
          ["Funksionet", "features"],
          ["Si Funksionon", "how"],
          ["Çmimet", "pricing"],
          ["FAQ", "faq"],
        ].map(([l, id]) => (
          <button key={id} className="nav-link" onClick={() => scrollTo(id)}>
            {l}
          </button>
        ))}
        <button
          className="nav-link"
          onClick={() => {
            setMenuOpen(false);
            onLogin();
          }}
        >
          Hyr →
        </button>
        <button
          className="btn-main"
          style={{
            marginTop: 8,
            width: "100%",
            justifyContent: "center",
            padding: "12px",
          }}
          onClick={() => {
            setMenuOpen(false);
            onApply();
          }}
        >
          Apliko Tani →
        </button>
      </div>

      {/* ── HERO ── */}
      <section
        className="section-pad"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "100px 60px 80px",
          background:
            "linear-gradient(135deg,#f5f0e8 0%,#fafafa 50%,#f0f0f5 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(0,0,0,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.04) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 60% at 80% 40%,rgba(200,169,110,.1) 0%,transparent 70%)",
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 60,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            className="hero-content"
            style={{
              flex: 1,
              maxWidth: 600,
              animation: "fadeUp .7s ease both",
            }}
          >
            <h1
              className="hero-title"
              style={{
                ...S.serif,
                fontSize: "clamp(42px,5.5vw,74px)",
                lineHeight: 1.05,
                fontWeight: 900,
                letterSpacing: "-.03em",
                marginBottom: 24,
              }}
            >
              Menaxho palestrën
              <br />
              <em style={{ fontStyle: "italic", color: "#a8894e" }}>
                me elegancë
              </em>{" "}
              dhe
              <br />
              <span style={{ color: "#2d5a3d" }}>efikasitet</span>
            </h1>
            <p
              style={{
                fontSize: 17,
                color: "#71717a",
                lineHeight: 1.75,
                maxWidth: 500,
                marginBottom: 36,
              }}
            >
              Nga check-in me QR deri te fatura automatike — FitPro i mban të
              gjitha nën kontroll.
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 52,
              }}
            >
              <button className="btn-main" onClick={onApply}>
                Fillo Sot →
              </button>
              <button className="btn-out" onClick={() => scrollTo("features")}>
                Shiko Demo
              </button>
            </div>
            <div
              id="hero-stats"
              className="hero-stats"
              style={{
                display: "flex",
                gap: 44,
                paddingTop: 32,
                borderTop: "1px solid rgba(0,0,0,.1)",
                flexWrap: "wrap",
              }}
            >
              {[
                [count.gyms + "+", "Palestra aktive"],
                [
                  count.members.toLocaleString("sq-AL") + "+",
                  "Anëtarë të menaxhuar",
                ],
                [count.pct + "%", "Klientë të kënaqur"],
              ].map(([n, l]) => (
                <div key={l}>
                  <div
                    style={{
                      ...S.serif,
                      fontSize: 36,
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    {n}
                  </div>
                  <div style={{ fontSize: 13, color: "#71717a", marginTop: 4 }}>
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard preview */}
          <div
            className="hero-visual"
            style={{ flex: 1, display: "flex", justifyContent: "center" }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 460,
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 32px 80px rgba(0,0,0,.12)",
                overflow: "hidden",
                animation: "float 6s ease-in-out infinite",
              }}
            >
              <div
                style={{
                  background: "#fafafa",
                  padding: "10px 14px",
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", gap: 5 }}>
                  {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                    <div
                      key={c}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: c,
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "#999", fontWeight: 500 }}>
                  FitPro CRM — Dashboard
                </div>
                <div style={{ width: 56 }} />
              </div>
              <div style={{ display: "flex" }}>
                <div
                  style={{
                    width: 130,
                    background: "#fafafa",
                    borderRight: "1px solid #f0f0f0",
                    padding: "10px 8px",
                  }}
                >
                  {[
                    ["◻️", "Dashboard", true],
                    ["📷", "Check-in", false],
                    ["👥", "Anëtarët", false],
                    ["🎫", "Abonimet", false],
                    ["💰", "Pagesat", false],
                  ].map(([ico, lbl, a]) => (
                    <div
                      key={lbl}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "5px 8px",
                        borderRadius: 6,
                        background: a ? "#f0f0f0" : "none",
                        marginBottom: 2,
                        fontSize: 10,
                        color: a ? "#333" : "#999",
                        fontWeight: a ? 600 : 400,
                      }}
                    >
                      <span style={{ fontSize: 11 }}>{ico}</span>
                      {lbl}
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, padding: 12 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 6,
                      marginBottom: 10,
                    }}
                  >
                    {[
                      ["247", "👥", "Anëtarë", "#16a34a"],
                      ["485K", "💰", "Të Ardhura", "#18181b"],
                      ["34", "🚪", "Check-ins", "#2563eb"],
                      ["23", "⏰", "Skadojnë", "#dc2626"],
                    ].map(([v, ico, l, c]) => (
                      <div
                        key={l}
                        style={{
                          background: "#fafafa",
                          border: "1px solid #f0f0f0",
                          borderRadius: 7,
                          padding: 8,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 7,
                            color: "#999",
                            marginBottom: 2,
                          }}
                        >
                          {l}
                        </div>
                        <div
                          style={{
                            fontFamily: "serif",
                            fontSize: 16,
                            fontWeight: 700,
                            color: c,
                          }}
                        >
                          {v}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      background: "#fafafa",
                      border: "1px solid #f0f0f0",
                      borderRadius: 7,
                      padding: 8,
                    }}
                  >
                    <div
                      style={{ fontSize: 9, fontWeight: 600, marginBottom: 6 }}
                    >
                      Anëtarët Aktivë
                    </div>
                    {[
                      ["MH", "Mira H.", "#18181b", "Aktiv", "#16a34a"],
                      ["AK", "Ardit K.", "#2563eb", "Skadon", "#d97706"],
                      ["EH", "Erjon H.", "#16a34a", "Aktiv", "#16a34a"],
                    ].map(([ini, nm, c, st, sc]) => (
                      <div
                        key={nm}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "3px 0",
                          borderBottom: "1px solid #f5f5f5",
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: c,
                            color: "#fff",
                            fontSize: 6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {ini}
                        </div>
                        <div style={{ fontSize: 9, flex: 1, fontWeight: 500 }}>
                          {nm}
                        </div>
                        <div
                          style={{
                            fontSize: 7,
                            padding: "1px 5px",
                            borderRadius: 10,
                            background:
                              sc === "#16a34a" ? "#f0fdf4" : "#fffbeb",
                            color: sc,
                          }}
                        >
                          {st}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        id="features"
        className="section-pad"
        style={{ padding: "100px 60px", background: "#fff" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 60 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "#a8894e",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 1.5,
                  background: "#c8a96e",
                  display: "inline-block",
                }}
              />
              Funksionet
            </div>
            <h2 style={{ ...S.serif, ...S.h2 }}>
              Gjithçka që nevojit palestra jote
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "#71717a",
                maxWidth: 500,
                lineHeight: 1.7,
              }}
            >
              Nga recepsioni te pronari — secili sheh çfarë i duhet, kur i
              duhet.
            </p>
          </div>
          <div
            className="features-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 1,
              background: "rgba(0,0,0,.07)",
              border: "1px solid rgba(0,0,0,.07)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="feat-card"
                style={{ background: "#fff", padding: "36px 32px" }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "#18181b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    marginBottom: 20,
                  }}
                >
                  {f.icon}
                </div>
                <div
                  style={{
                    ...S.serif,
                    fontSize: 20,
                    fontWeight: 700,
                    marginBottom: 10,
                  }}
                >
                  {f.title}
                </div>
                <div
                  style={{ fontSize: 14, color: "#71717a", lineHeight: 1.7 }}
                >
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW ── */}
      <section
        id="how"
        className="section-pad"
        style={{ padding: "100px 60px", background: "#f5f0e8" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "#a8894e",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 1.5,
                  background: "#c8a96e",
                  display: "inline-block",
                }}
              />
              Si Funksionon
            </div>
            <h2 style={{ ...S.serif, ...S.h2 }}>Gati në 4 hapa të thjeshtë</h2>
          </div>
          <div
            className="steps-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 32,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 28,
                left: "12.5%",
                right: "12.5%",
                height: 1,
                background:
                  "linear-gradient(90deg,transparent,rgba(0,0,0,.15),transparent)",
                zIndex: 0,
                display: "none",
              }}
              className="steps-line"
            />
            {STEPS.map((s, i) => (
              <div
                key={i}
                style={{ textAlign: "center", position: "relative", zIndex: 1 }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "#fff",
                    border: "1.5px solid rgba(0,0,0,.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    ...S.serif,
                    fontSize: 22,
                    fontWeight: 900,
                    margin: "0 auto 20px",
                    boxShadow: "0 4px 12px rgba(0,0,0,.06)",
                  }}
                >
                  {s.n}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
                  {s.t}
                </div>
                <div
                  style={{ fontSize: 13, color: "#71717a", lineHeight: 1.6 }}
                >
                  {s.d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        className="section-pad"
        style={{ padding: "100px 60px", background: "#fff" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "#a8894e",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 1.5,
                  background: "#c8a96e",
                  display: "inline-block",
                }}
              />
              Klientët Tanë
            </div>
            <h2 style={{ ...S.serif, ...S.h2 }}>Çfarë thonë pronarët</h2>
          </div>
          <div
            className="testi-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 24,
            }}
          >
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                style={{
                  background: "#fafafa",
                  borderRadius: 14,
                  padding: 28,
                  border: "1px solid #f0f0f0",
                  boxShadow: "0 2px 12px rgba(0,0,0,.04)",
                }}
              >
                <div
                  style={{
                    color: "#c8a96e",
                    fontSize: 15,
                    letterSpacing: 3,
                    marginBottom: 16,
                  }}
                >
                  ★★★★★
                </div>
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: "#18181b",
                    marginBottom: 20,
                    fontStyle: "italic",
                  }}
                >
                  "{t.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: t.c,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {t.i}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#71717a" }}>
                      {t.gym}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section
        id="pricing"
        className="section-pad"
        style={{ padding: "100px 60px", background: "#f5f0e8" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "#a8894e",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 1.5,
                  background: "#c8a96e",
                  display: "inline-block",
                }}
              />
              Çmimet
            </div>
            <h2 style={{ ...S.serif, ...S.h2 }}>Transparent. Pa surpriza.</h2>
            <p style={{ fontSize: 16, color: "#71717a" }}>
              Zgjidh planin që i përshtatet madhësisë së palestrës tënde.
            </p>
          </div>

          <div
            className="plans-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 24,
            }}
          >
            {PLANS.map((p, i) => (
              <div
                key={i}
                className="plan-card"
                style={{
                  position: "relative",
                  borderRadius: 16,
                  padding: 36,
                  border: `1.5px solid ${p.featured ? "#18181b" : "rgba(0,0,0,.1)"}`,
                  background: p.featured ? "#18181b" : "#fff",
                  color: p.featured ? "#fff" : "#18181b",
                  boxShadow: p.featured
                    ? "0 20px 60px rgba(0,0,0,.15)"
                    : "none",
                }}
              >
                {p.featured && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#c8a96e",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 14px",
                      borderRadius: 20,
                      textTransform: "uppercase",
                      letterSpacing: ".05em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Më Popullar
                  </div>
                )}

                {/* Limit badge */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: p.featured ? "rgba(255,255,255,.1)" : "#f0f0f0",
                    borderRadius: 20,
                    padding: "4px 12px",
                    fontSize: 11,
                    fontWeight: 600,
                    marginBottom: 16,
                    color: p.featured ? "rgba(255,255,255,.7)" : "#52525b",
                  }}
                >
                  👥 {p.limit}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    color: p.featured ? "rgba(255,255,255,.5)" : "#71717a",
                    marginBottom: 8,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    ...S.serif,
                    fontSize: 46,
                    fontWeight: 900,
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {p.price}
                  <span style={{ fontSize: 18 }}> L</span>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: p.featured ? "rgba(255,255,255,.5)" : "#71717a",
                    marginBottom: 6,
                  }}
                >
                  {p.period}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: p.featured ? "rgba(255,255,255,.6)" : "#52525b",
                    marginBottom: 24,
                    fontStyle: "italic",
                  }}
                >
                  {p.desc}
                </div>

                <ul style={{ listStyle: "none", marginBottom: 32 }}>
                  {p.features.map((f, j) => (
                    <li
                      key={j}
                      style={{
                        fontSize: 14,
                        padding: "8px 0",
                        borderBottom: `1px solid ${p.featured ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.06)"}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          color: p.featured ? "#c8a96e" : "#16a34a",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={
                    p.name === "Business"
                      ? () => (window.location.href = "tel:+35569000000")
                      : onApply
                  }
                  style={{
                    display: "block",
                    width: "100%",
                    padding: 13,
                    borderRadius: 9,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all .2s",
                    border: p.featured ? "none" : `1.5px solid rgba(0,0,0,.2)`,
                    background: p.featured ? "#fff" : "transparent",
                    color: p.featured ? "#18181b" : "#18181b",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = p.featured
                      ? "#f5f5f5"
                      : "rgba(0,0,0,.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = p.featured
                      ? "#fff"
                      : "transparent";
                  }}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: 40,
              fontSize: 13,
              color: "#71717a",
            }}
          >
            💵 Pagesa vetëm cash &nbsp;•&nbsp; ✅ 30 ditë provë falas
            &nbsp;•&nbsp; 🔒 Anulo kurdo &nbsp;•&nbsp; 📈 Upgrade kurdo
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        id="faq"
        className="section-pad"
        style={{ padding: "100px 60px", background: "#fff" }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "#a8894e",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 1.5,
                  background: "#c8a96e",
                  display: "inline-block",
                }}
              />
              Pyetje të Shpeshta
            </div>
            <h2 style={{ ...S.serif, ...S.h2 }}>Keni pyetje?</h2>
          </div>
          {FAQS.map((f, i) => (
            <div key={i} style={{ borderBottom: "1px solid #e4e4e7" }}>
              <button
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "20px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 600 }}>{f.q}</span>
                <span
                  style={{
                    fontSize: 22,
                    color: "#71717a",
                    transition: "transform .3s",
                    transform: faqOpen === i ? "rotate(45deg)" : "none",
                    flexShrink: 0,
                    marginLeft: 16,
                  }}
                >
                  +
                </span>
              </button>
              <div
                className="faq-ans"
                style={{
                  maxHeight: faqOpen === i ? 200 : 0,
                  opacity: faqOpen === i ? 1 : 0,
                }}
              >
                <p
                  style={{
                    fontSize: 15,
                    color: "#52525b",
                    lineHeight: 1.7,
                    paddingBottom: 20,
                  }}
                >
                  {f.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="section-pad"
        style={{
          padding: "100px 60px",
          background: "#18181b",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "#c8a96e",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 24,
                height: 1.5,
                background: "#c8a96e",
                display: "inline-block",
              }}
            />
            Fillo Tani
          </div>
          <h2
            style={{
              ...S.serif,
              fontSize: "clamp(30px,5vw,52px)",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-.02em",
              marginBottom: 16,
              color: "#fff",
            }}
          >
            Gati për të modernizuar palestrën tënde?
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,.5)",
              marginBottom: 40,
              lineHeight: 1.7,
            }}
          >
            5 minuta aplikim. Pa kartë krediti. 30 ditë provë falas.
          </p>
          <div
            className="cta-btns"
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button className="btn-gold" onClick={onApply}>
              Apliko Falas Sot →
            </button>
            <button className="btn-ghost" onClick={onLogin}>
              Hyr në Sistem
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: "#0c0c0c",
          color: "rgba(255,255,255,.4)",
          padding: "40px 60px",
        }}
      >
        <div
          className="footer-inner"
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          {/* Logo footer — klikueshme */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: "#18181b",
                border: "1px solid rgba(255,255,255,.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
              }}
            >
              💪
            </div>
            <span
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 17,
                color: "#fff",
              }}
            >
              FitPro CRM
            </span>
          </button>
          <div style={{ fontSize: 12 }}>
            © 2026 FitPro CRM — Bërë me ❤️ për Shqipërinë 🇦🇱
          </div>
          <div
            style={{ display: "flex", gap: 24, fontSize: 13, flexWrap: "wrap" }}
          >
            {[
              ["Funksionet", "features"],
              ["Çmimet", "pricing"],
              ["FAQ", "faq"],
            ].map(([l, id]) => (
              <button
                key={l}
                onClick={() => scrollTo(id)}
                style={{
                  color: "rgba(255,255,255,.4)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  transition: "color .15s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) =>
                  (e.target.style.color = "rgba(255,255,255,.4)")
                }
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
