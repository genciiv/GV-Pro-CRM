import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { StatCard, Loading, Empty } from "../../components/UI";
import { fmtDate, fmtNum } from "../../lib/db";
import toast from "react-hot-toast";

const BIZ = {
  gym: "🏋️ Palestre",
  barbershop: "💈 Barbershop",
  salon: "💅 Sallon Bukurie",
  spa: "💆 Spa & Masazh",
  yoga: "🧘 Yoga",
  pilates: "🤸 Pilates",
  martial_arts: "🥊 Arte Marciale",
  dance: "💃 Vallëzim",
  fitness: "⚡ Fitness",
  wellness: "🌿 Wellness",
};

function GymAppRow({ app, onDone }) {
  const [show, setBizOpen] = useState(false);
  const [pass, setPass] = useState("");
  const [bt, setBt] = useState(app.business_type || "barbershop");
  const [load, setLoad] = useState(false);
  const [err, setErr] = useState("");

  const approve = async () => {
    if (!pass.trim()) {
      setErr("Vendos fjalëkalimin");
      return;
    }
    setLoad(true);
    setErr("");
    try {
      const { data: gym, error: gErr } = await supabase
        .from("gyms")
        .insert({
          name: app.name,
          email: app.email,
          phone: app.phone,
          address: app.address || null,
          city: app.city || null,
          status: "approved",
          business_type: bt,
          approved_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (gErr) throw new Error(gErr.message);
      await supabase
        .rpc("create_default_plans", { p_gym_id: gym.id })
        .catch(() => {});
      const { data: ar } = await supabase.functions
        .invoke("create-gym-user", {
          body: {
            email: app.email,
            password: pass,
            gym_id: gym.id,
            owner_name: app.owner_name || app.name,
            role: "owner",
          },
        })
        .catch(() => ({ data: null }));
      if (!ar?.success) {
        await supabase
          .from("gym_users")
          .insert({
            gym_id: gym.id,
            name: app.owner_name || app.name,
            email: app.email,
            role: "owner",
          });
        toast.success(`✅ ${app.name} u aprovua!`);
        alert(
          `⚠️ Krijo userin manualisht:\nSupabase → Authentication → Add User\nEmail: ${app.email}\nPassword: ${pass}`,
        );
      } else {
        toast.success(`✅ ${app.name} u aprovua automatikisht!`);
      }
      await supabase
        .from("applications")
        .update({ status: "approved", gym_id: gym.id })
        .eq("id", app.id);
      setBizOpen(false);
      onDone();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoad(false);
    }
  };

  const reject = async () => {
    await supabase
      .from("applications")
      .update({ status: "rejected" })
      .eq("id", app.id);
    toast.success("U refuzua");
    onDone();
  };

  const bdg = {
    new: "🆕 E Re",
    pending: "⏳ Pritje",
    contacted: "📞 Kontaktuar",
    approved: "✅ Aprovuar",
    rejected: "❌ Refuzuar",
  };

  return (
    <>
      <tr>
        <td>
          <div className="mn">{app.name}</div>
          <div className="ms">{app.city}</div>
        </td>
        <td>
          <span style={{ fontSize: 13 }}>
            {BIZ[app.business_type] || app.business_type || "—"}
          </span>
        </td>
        <td>
          <div style={{ fontWeight: 500 }}>{app.owner_name}</div>
          <div className="ms">{app.email}</div>
          <div className="ms">{app.phone}</div>
        </td>
        <td>
          <span style={{ fontSize: 12 }}>{bdg[app.status] || app.status}</span>
        </td>
        <td style={{ fontSize: 12, color: "var(--tx4)" }}>
          {fmtDate(app.created_at)}
        </td>
        <td>
          {(app.status === "new" || app.status === "pending") && (
            <div style={{ display: "flex", gap: 6 }}>
              <button
                className="btn btn-am btn-sm"
                onClick={() => setBizOpen((s) => !s)}
              >
                Aprovo
              </button>
              <button className="btn btn-rd btn-sm" onClick={reject}>
                Refuzo
              </button>
            </div>
          )}
          {app.status === "approved" && (
            <span className="bdg bdg-gr">✅ Kryer</span>
          )}
          {app.status === "rejected" && (
            <span className="bdg bdg-rd">❌ Refuzuar</span>
          )}
        </td>
      </tr>
      {show && (
        <tr>
          <td colSpan={6} style={{ padding: 0 }}>
            <div
              style={{
                background: "var(--amm)",
                padding: 16,
                borderBottom: "1px solid var(--bdr)",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 10 }}>
                Aprovo: {app.name}
              </div>
              {err && (
                <div className="alert al-rd" style={{ marginBottom: 10 }}>
                  {err}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems: "flex-end",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 5,
                    }}
                  >
                    Lloji Biznesi
                  </label>
                  <select
                    value={bt}
                    onChange={(e) => setBt(e.target.value)}
                    style={{
                      border: "1.5px solid var(--bdr)",
                      borderRadius: 8,
                      padding: "8px 12px",
                      fontFamily: "inherit",
                      fontSize: 13,
                      background: "#fff",
                    }}
                  >
                    {Object.entries(BIZ).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 5,
                    }}
                  >
                    Fjalëkalimi për {app.email}
                  </label>
                  <input
                    type="text"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder="Fjalëkalim i ri..."
                    style={{
                      border: "1.5px solid var(--bdr)",
                      borderRadius: 8,
                      padding: "9px 12px",
                      fontFamily: "inherit",
                      fontSize: 13,
                      background: "#fff",
                      width: "100%",
                    }}
                  />
                </div>
                <button
                  className="btn btn-am"
                  onClick={approve}
                  disabled={load}
                >
                  {load ? "Duke aprovuar..." : "✓ Aprovo & Krijo"}
                </button>
                <button
                  className="btn btn-s"
                  onClick={() => {
                    setBizOpen(false);
                    setErr("");
                  }}
                >
                  Anulo
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminPanel({ logout }) {
  const [tab, setTab] = useState("overview");
  const [sb, setSb] = useState(false);
  const [overview, setOv] = useState(null);
  const [apps, setApps] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [ol, setOl] = useState(true);
  const [al, setAl] = useState(true);
  const [gl, setGl] = useState(true);

  const loadOv = async () => {
    setOl(true);
    const [{ data: gs }, { data: ms }, { data: ad }] = await Promise.all([
      supabase.from("gyms").select("id,status"),
      supabase.from("members").select("id"),
      supabase.from("applications").select("id,status"),
    ]);
    const { data: pay } = await supabase
      .from("payments")
      .select("amount")
      .eq("status", "paid");
    setOv({
      active: (gs || []).filter((g) => g.status === "approved").length,
      members: (ms || []).length,
      new_apps: (ad || []).filter(
        (a) => a.status === "new" || a.status === "pending",
      ).length,
      revenue: (pay || []).reduce((s, p) => s + (p.amount || 0), 0),
    });
    setOl(false);
  };
  const loadApps = async () => {
    setAl(true);
    const { data } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    setApps(data || []);
    setAl(false);
  };
  const loadGyms = async () => {
    setGl(true);
    const { data } = await supabase
      .from("gyms")
      .select("*")
      .order("created_at", { ascending: false });
    setGyms(data || []);
    setGl(false);
  };
  const reload = () => {
    loadOv();
    loadApps();
    loadGyms();
  };

  useEffect(() => {
    loadOv();
    loadApps();
    loadGyms();
  }, []);

  const newApps = apps.filter(
    (a) => a.status === "new" || a.status === "pending",
  ).length;
  const nav = (id) => {
    setTab(id);
    setSb(false);
  };

  const NAV = [
    {
      s: "Platforma",
      items: [
        { id: "overview", l: "Overview", i: "📊" },
        { id: "revenue", l: "Të Ardhurat", i: "💰" },
      ],
    },
    {
      s: "Bizneset",
      items: [
        { id: "apps", l: "Aplikimet", i: "📋", badge: newApps },
        { id: "gyms", l: "Të gjitha Bizneset", i: "🏢" },
      ],
    },
    { s: "Sistem", items: [{ id: "guide", l: "Udhëzues", i: "📖" }] },
  ];

  return (
    <div className="app">
      <div
        className={`sbo ${sb ? "open" : ""}`}
        style={{
          display: sb ? "block" : "none",
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.2)",
          zIndex: 99,
        }}
        onClick={function () {
          setSb(false);
        }}
      ></div>
      <aside className={`sidebar ${sb ? "open" : ""}`}>
        <div className="sb-logo">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "var(--pu)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 16,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            V
          </div>
          <div>
            <div className="sb-name">Vaqo Admin</div>
            <div className="sb-type">Platform Panel</div>
          </div>
        </div>
        <nav className="nav">
          {NAV.map((sec) => (
            <div key={sec.s} className="nav-sec">
              <div className="nav-lbl">{sec.s}</div>
              {sec.items.map((it) => (
                <div
                  key={it.id}
                  className={`nav-item ${tab === it.id ? "active" : ""}`}
                  onClick={() => nav(it.id)}
                >
                  <span className="nav-ic">{it.i}</span>
                  {it.l}
                  {it.badge > 0 && (
                    <span
                      style={{
                        marginLeft: "auto",
                        background: "var(--pu)",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "1px 7px",
                        borderRadius: 20,
                      }}
                    >
                      {it.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>
        <div className="sb-bot">
          <div className="user-row" onClick={logout}>
            <div className="user-av">A</div>
            <div>
              <div className="user-nm">Platform Admin</div>
              <div className="user-rl">Dil →</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="hmbg" onClick={() => setSb((s) => !s)}>
              ☰
            </button>
            <div className="tb-title">
              {{
                overview: "Overview",
                revenue: "Të Ardhurat",
                apps: "Aplikimet",
                gyms: "Bizneset",
                guide: "Udhëzues",
              }[tab] || "Admin"}
            </div>
          </div>
          <button className="btn btn-s btn-sm" onClick={reload}>
            ↻
          </button>
        </div>

        <div className="content">
          {tab === "overview" && (
            <div className="page-in">
              <div className="ph">
                <div>
                  <div className="pt">Platform Overview</div>
                  <div className="ps">Statistikat e gjithë ekosistemit</div>
                </div>
              </div>
              {ol ? (
                <Loading />
              ) : (
                <>
                  <div className="sg">
                    <StatCard
                      icon="🏢"
                      label="Biznese Aktive"
                      value={overview?.active ?? 0}
                      change="aprovuar"
                      up
                    />
                    <StatCard
                      icon="👥"
                      label="Total Anëtarë"
                      value={overview?.members ?? 0}
                      change="të gjitha"
                      up
                    />
                    <StatCard
                      icon="💰"
                      label="Revenue/Muaj"
                      value={fmtNum(overview?.revenue ?? 0) + " L"}
                      change="ky muaj"
                      up
                    />
                    <StatCard
                      icon="📋"
                      label="Aplikime të Reja"
                      value={overview?.new_apps ?? 0}
                    />
                  </div>
                  <div className="g2">
                    <div className="card">
                      <div className="card-hd">
                        <div className="card-t">
                          💰 Të Ardhurat e Platformës
                        </div>
                      </div>
                      <div className="card-b">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "10px 0",
                            fontSize: 14,
                          }}
                        >
                          <span style={{ color: "var(--tx3)" }}>
                            🏢 Abonime Biznese
                          </span>
                          <strong style={{ color: "var(--gr)" }}>
                            {fmtNum(overview?.revenue ?? 0)} L
                          </strong>
                        </div>
                      </div>
                    </div>
                    <div className="card">
                      <div className="card-hd">
                        <div className="card-t">📋 Aplikime të Reja</div>
                      </div>
                      <div className="card-b">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: 14,
                            background: "var(--pul)",
                            borderRadius: 10,
                            border: "1px solid var(--pum)",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600 }}>🏢 Biznese</div>
                            <div style={{ fontSize: 12, color: "var(--pu)" }}>
                              {newApps} aplikime të reja
                            </div>
                          </div>
                          <button
                            className="btn btn-p btn-sm"
                            onClick={() => nav("apps")}
                          >
                            Shiko →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "apps" && (
            <div className="page-in">
              <div className="ph">
                <div>
                  <div className="pt">Aplikimet Biznese</div>
                  <div className="ps">{newApps} të reja</div>
                </div>
              </div>
              {newApps > 0 && (
                <div className="alert al-am">
                  ⚠️ Ke {newApps} aplikim të ri që pret aprovim!
                </div>
              )}
              {al ? (
                <Loading />
              ) : (
                <div className="card">
                  <div className="tw">
                    <table>
                      <thead>
                        <tr>
                          <th>Biznesi</th>
                          <th>Lloji</th>
                          <th>Pronari</th>
                          <th>Statusi</th>
                          <th>Data</th>
                          <th>Veprime</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apps.length === 0 ? (
                          <tr>
                            <td colSpan={6}>
                              <Empty icon="📋" title="Asnjë aplikim" />
                            </td>
                          </tr>
                        ) : (
                          apps.map((a) => (
                            <GymAppRow key={a.id} app={a} onDone={reload} />
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "gyms" && (
            <div className="page-in">
              <div className="ph">
                <div>
                  <div className="pt">Të gjitha Bizneset</div>
                  <div className="ps">{gyms.length} total</div>
                </div>
              </div>
              {gl ? (
                <Loading />
              ) : (
                <div className="card">
                  <div className="tw">
                    <table>
                      <thead>
                        <tr>
                          <th>Biznesi</th>
                          <th>Lloji</th>
                          <th>Email</th>
                          <th>Qyteti</th>
                          <th>Statusi</th>
                          <th>Krijuar</th>
                          <th>Veprime</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gyms.length === 0 ? (
                          <tr>
                            <td colSpan={7}>
                              <Empty icon="🏢" title="Asnjë biznes" />
                            </td>
                          </tr>
                        ) : (
                          gyms.map((g) => (
                            <tr key={g.id}>
                              <td>
                                <div className="mn">{g.name}</div>
                                <div className="ms">{g.phone || ""}</div>
                              </td>
                              <td>
                                <span style={{ fontSize: 13, fontWeight: 500 }}>
                                  {BIZ[g.business_type] ||
                                    g.business_type ||
                                    "—"}
                                </span>
                              </td>
                              <td style={{ fontSize: 12, color: "var(--tx3)" }}>
                                {g.email}
                              </td>
                              <td>{g.city || "—"}</td>
                              <td>
                                {g.status === "approved" && (
                                  <span className="bdg bdg-gr">✅ Aktive</span>
                                )}
                                {g.status === "suspended" && (
                                  <span className="bdg bdg-rd">
                                    ⏸ Suspenduar
                                  </span>
                                )}
                                {(g.status === "pending" || !g.status) && (
                                  <span className="bdg bdg-am">⏳ Pritje</span>
                                )}
                              </td>
                              <td style={{ fontSize: 12, color: "var(--tx4)" }}>
                                {fmtDate(g.created_at)}
                              </td>
                              <td style={{ display: "flex", gap: 6 }}>
                                {g.status === "approved" && (
                                  <button
                                    className="btn btn-rd btn-xs"
                                    onClick={async () => {
                                      await supabase
                                        .from("gyms")
                                        .update({ status: "suspended" })
                                        .eq("id", g.id);
                                      toast.success("U suspendua");
                                      loadGyms();
                                    }}
                                  >
                                    ⏸
                                  </button>
                                )}
                                {g.status === "suspended" && (
                                  <button
                                    className="btn btn-ok btn-xs"
                                    onClick={async () => {
                                      await supabase
                                        .from("gyms")
                                        .update({ status: "approved" })
                                        .eq("id", g.id);
                                      toast.success("U aktivizua");
                                      loadGyms();
                                    }}
                                  >
                                    ▶ Aktivo
                                  </button>
                                )}
                                {(g.status === "pending" || !g.status) && (
                                  <button
                                    className="btn btn-am btn-xs"
                                    onClick={async () => {
                                      await supabase
                                        .from("gyms")
                                        .update({ status: "approved" })
                                        .eq("id", g.id);
                                      toast.success("U aprovua");
                                      loadGyms();
                                    }}
                                  >
                                    ✓ Aprovo
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "revenue" && (
            <div className="page-in">
              <div className="ph">
                <div>
                  <div className="pt">Të Ardhurat</div>
                </div>
              </div>
              <div className="sg">
                <StatCard
                  icon="💰"
                  label="Revenue Ky Muaj"
                  value={fmtNum(overview?.revenue ?? 0) + " L"}
                  change="ky muaj"
                  up
                />
                <StatCard
                  icon="🏢"
                  label="Biznese Aktive"
                  value={overview?.active ?? 0}
                  change="aprovuar"
                  up
                />
                <StatCard icon="📋" label="Aplikime të Reja" value={newApps} />
              </div>
              <div className="alert al-am">
                💡 Revenue llogaritet nga pagesat e abonimeve. Lidh Stripe për
                pagesa online.
              </div>
            </div>
          )}

          {tab === "guide" && (
            <div className="page-in">
              <div className="ph">
                <div>
                  <div className="pt">Udhëzues Admini</div>
                </div>
              </div>
              <div className="g2">
                <div className="card">
                  <div className="card-hd">
                    <div className="card-t">✅ Si Aprovoj Biznes</div>
                  </div>
                  <div className="card-b">
                    {[
                      ["1", "Biznesi aplikon nga /apply"],
                      ["2", 'Shfaqet te "Aplikimet" me badge'],
                      ["3", "Kontrollo emrin, emailin, llojin"],
                      ["4", "Kliko Aprovo → zgjidh llojin"],
                      ["5", "Vendos fjalëkalimin për pronarin"],
                      ["6", 'Kliko "Aprovo & Krijo"'],
                      ["7", "Pronari hyn me email + fjalëkalim"],
                    ].map(([n, t]) => (
                      <div
                        key={n}
                        style={{ display: "flex", gap: 12, marginBottom: 10 }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: "var(--pu)",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {n}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "var(--tx2)",
                            paddingTop: 3,
                          }}
                        >
                          {t}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <div className="card-hd">
                    <div className="card-t">
                      ⚠️ User manual (nëse auto dështon)
                    </div>
                  </div>
                  <div className="card-b">
                    {[
                      ["1", "Supabase → Authentication → Add User"],
                      ["2", "Vendos emailin + fjalëkalimin"],
                      ["3", "Table Editor → gym_users"],
                      ["4", "Shto auth_id nga useri i ri"],
                    ].map(([n, t]) => (
                      <div
                        key={n}
                        style={{ display: "flex", gap: 12, marginBottom: 10 }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: "var(--tx)",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {n}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "var(--tx2)",
                            paddingTop: 3,
                          }}
                        >
                          {t}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
