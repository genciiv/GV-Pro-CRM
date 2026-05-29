import { useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { getApplications, getGyms, getPlatformStats, approveGym, rejectApp, suspendGym, activateGym, fmtDate, fmtNum } from '../../lib/db'
import { Modal, Loading, Empty, StatCard } from '../../components/UI'
import toast from 'react-hot-toast'

function AppRow({ app, onDone }) {
  const [showApprove, setShowApprove] = useState(false)
  const [password,    setPassword]    = useState('')
  const [loading,     setLoading]     = useState(false)

  const sBadge = { new:<span className="bdg bdg-bl">🆕 E Re</span>, contacted:<span className="bdg bdg-am">📞 Kontaktuar</span>, approved:<span className="bdg bdg-gr">✅ Aprovuar</span>, rejected:<span className="bdg bdg-rd">❌ Refuzuar</span> }

  const doApprove = async () => {
    if (!password.trim()) { toast.error('Vendos fjalëkalimin për klientin'); return }
    setLoading(true)
    try {
      await approveGym(app.id, { name:app.name, email:app.email, phone:app.phone, address:app.address, city:app.city, ownerName:app.owner_name })
      toast.success(`✅ ${app.name} u aprovua!\n\nTani shko te Supabase → Authentication → Add User\nEmail: ${app.email}\nPassword: ${password}`)
      setShowApprove(false); onDone()
    } catch(e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const doReject = async () => {
    await rejectApp(app.id); toast.success('Aplikimi u refuzua'); onDone()
  }

  return (
    <>
      <tr>
        <td><div><div className="mn">{app.name}</div><div className="ms">{app.city}</div></div></td>
        <td><div><div style={{fontWeight:500}}>{app.owner_name}</div><div className="ms">{app.email}</div><div className="ms">{app.phone}</div></div></td>
        <td>{sBadge[app.status]||<span className="bdg bdg-gy">—</span>}</td>
        <td style={{fontSize:12,color:'var(--g500)'}}>{fmtDate(app.created_at)}</td>
        <td>
          {(app.status==='new'||app.status==='contacted') ? (
            <div style={{display:'flex',gap:6}}>
              <button className="btn btn-success btn-xs" onClick={()=>setShowApprove(true)}>✅ Aprovo</button>
              <button className="btn btn-danger btn-xs"  onClick={doReject}>❌ Refuzo</button>
            </div>
          ) : <span style={{fontSize:12,color:'var(--g400)'}}>—</span>}
        </td>
      </tr>

      {showApprove && (
        <Modal title={`✅ Aprovo — ${app.name}`} onClose={()=>setShowApprove(false)} footer={
          <><button className="btn btn-s" onClick={()=>setShowApprove(false)}>Anulo</button>
          <button className="btn btn-p" onClick={doApprove} disabled={loading}>{loading?'Duke aprovuar...':'✅ Aprovo'}</button></>
        }>
          <div className="alert al-bl" style={{marginBottom:16}}>
            Pas aprovimit, shko te <strong>Supabase → Authentication → Add User</strong> dhe krijo userin me emailin dhe fjalëkalimin e mëposhtëm.
          </div>
          <div style={{background:'var(--g50)',borderRadius:10,padding:14,marginBottom:16,fontSize:13,lineHeight:1.8}}>
            <div>🏋️ <strong>Palestra:</strong> {app.name}</div>
            <div>👤 <strong>Pronari:</strong> {app.owner_name}</div>
            <div>📧 <strong>Email:</strong> {app.email}</div>
            <div>📞 <strong>Telefon:</strong> {app.phone}</div>
            {app.message && <div style={{marginTop:8,color:'var(--g500)'}}>💬 {app.message}</div>}
          </div>
          <div className="fgp">
            <label>🔑 Fjalëkalimi për klientin *</label>
            <input type="text" value={password} onChange={e=>setPassword(e.target.value)} placeholder="p.sh. Palestra2026!"/>
            <span style={{fontSize:11,color:'var(--g500)'}}>Do ia telefonosh klientit pas aprovimit</span>
          </div>
        </Modal>
      )}
    </>
  )
}

export default function AdminPanel({ logout }) {
  const [tab, setTab] = useState('applications')
  const { data: stats,   reload: rs } = useAsync(getPlatformStats)
  const { data: apps,    loading: al, reload: ra } = useAsync(getApplications)
  const { data: gyms,    loading: gl, reload: rg } = useAsync(getGyms)
  const newApps = (apps||[]).filter(a=>a.status==='new').length
  const reloadAll = () => { rs(); ra(); rg() }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sb-logo">
          <div className="sb-icon">⚡</div>
          <div><div className="sb-name">FitPro Admin</div><div className="sb-sub">Platform Panel</div></div>
        </div>
        <nav className="nav">
          <div className="nav-sec">
            <div className="nav-lbl">Menaxhim</div>
            {[
              {id:'applications', label:'Aplikimet',    icon:'📋', badge:newApps},
              {id:'gyms',         label:'Palestrat',    icon:'🏋️'},
              {id:'stats',        label:'Statistikat',  icon:'📊'},
              {id:'guide',        label:'Si Aprovoj',   icon:'📖'},
            ].map(item=>(
              <div key={item.id} className={`nav-item ${tab===item.id?'active':''}`} onClick={()=>setTab(item.id)}>
                <span className="nav-ico">{item.icon}</span>{item.label}
                {item.badge>0&&<span className="nav-bdg">{item.badge}</span>}
              </div>
            ))}
          </div>
        </nav>
        <div className="sb-bot">
          <div className="user-card" onClick={logout}>
            <div className="user-av">🛡️</div>
            <div><div className="user-nm">Platform Admin</div><div className="user-rl">Dil →</div></div>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="tbl"><div className="tb-title">
            {tab==='applications'?'📋 Aplikimet':tab==='gyms'?'🏋️ Palestrat':tab==='stats'?'📊 Statistikat':'📖 Si Aprovoj'}
          </div></div>
          <div className="tbr"><span className="bdg bdg-pu">⚡ Admin Panel</span></div>
        </div>

        <div className="content">

          {/* STATS */}
          {tab==='stats'&&(
            <div className="page-in">
              <div className="ph"><div><div className="pt">Statistikat</div><div className="ps">Pasqyra e platformës</div></div></div>
              <div className="sg">
                <StatCard icon="🏋️" label="Palestra Aktive"  value={stats?.approved??0} change="aprovuar" up/>
                <StatCard icon="🏠" label="Total Palestra"    value={stats?.total??0}/>
                <StatCard icon="👥" label="Total Anëtarë"     value={stats?.members??0} change="të gjitha" up/>
                <StatCard icon="📋" label="Aplikime të Reja"  value={stats?.newApps??0}/>
              </div>
            </div>
          )}

          {/* APPLICATIONS */}
          {tab==='applications'&&(
            <div className="page-in">
              <div className="ph">
                <div><div className="pt">Aplikimet</div><div className="ps">{(apps||[]).length} total • {newApps} të reja</div></div>
                <button className="btn btn-s btn-sm" onClick={ra}>↻ Rifresko</button>
              </div>
              {newApps>0&&<div className="alert al-am">⚠️ Ke {newApps} aplikim të ri që pret!</div>}
              {al?<Loading/>:(
                <div className="card">
                  <div className="tw"><table>
                    <thead><tr><th>Palestra</th><th>Pronari</th><th>Statusi</th><th>Data</th><th>Veprime</th></tr></thead>
                    <tbody>
                      {(apps||[]).length===0?<tr><td colSpan={5}><Empty icon="📋" title="Asnjë aplikim ende"/></td></tr>:
                      (apps||[]).map(app=><AppRow key={app.id} app={app} onDone={reloadAll}/>)}
                    </tbody>
                  </table></div>
                </div>
              )}
            </div>
          )}

          {/* GYMS */}
          {tab==='gyms'&&(
            <div className="page-in">
              <div className="ph">
                <div><div className="pt">Palestrat</div><div className="ps">{(gyms||[]).length} total</div></div>
                <button className="btn btn-s btn-sm" onClick={rg}>↻ Rifresko</button>
              </div>
              {gl?<Loading/>:(
                <div className="card">
                  <div className="tw"><table>
                    <thead><tr><th>Palestra</th><th>Email</th><th>Qyteti</th><th>Statusi</th><th>Krijuar</th><th>Veprime</th></tr></thead>
                    <tbody>
                      {(gyms||[]).length===0?<tr><td colSpan={6}><Empty icon="🏋️" title="Asnjë palestre ende"/></td></tr>:
                      (gyms||[]).map(gym=>(
                        <tr key={gym.id}>
                          <td><div className="mn">{gym.name}</div></td>
                          <td style={{color:'var(--g500)',fontSize:12}}>{gym.email}</td>
                          <td style={{color:'var(--g500)'}}>{gym.city}</td>
                          <td>
                            {gym.status==='approved'?<span className="bdg bdg-gr">● Aktiv</span>:
                            gym.status==='suspended'?<span className="bdg bdg-rd">⏸ Suspenduar</span>:
                            <span className="bdg bdg-am">⏳ Pending</span>}
                          </td>
                          <td style={{fontSize:12,color:'var(--g500)'}}>{fmtDate(gym.created_at)}</td>
                          <td>
                            {gym.status==='approved'
                              ?<button className="btn btn-danger btn-xs" onClick={async()=>{await suspendGym(gym.id);toast.success('U suspendua');rg()}}>⏸ Suspendo</button>
                              :gym.status==='suspended'
                              ?<button className="btn btn-success btn-xs" onClick={async()=>{await activateGym(gym.id);toast.success('U aktivizua');rg()}}>▶ Aktivizo</button>
                              :null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                </div>
              )}
            </div>
          )}

          {/* GUIDE */}
          {tab==='guide'&&(
            <div className="page-in">
              <div className="ph"><div><div className="pt">Si Aprovoj një Klient</div></div></div>
              {[
                {n:'1',t:'Klienti aplikon',d:'Kliku "Apliko Tani" në faqen kryesore → plotëson formularin → shfaqet te "Aplikimet" me status "E Re".',c:'var(--acl)',b:'var(--acm)'},
                {n:'2',t:'Ti kontakton klientin',d:'Telefono, konfirmo detajet dhe merr pagesën fizikisht. Pastaj kthehu te paneli.',c:'var(--aml)',b:'#fde68a'},
                {n:'3',t:'Kliko "Aprovo" në panel',d:'Vendos fjalëkalimin që do t\'ia japësh klientit. Sistemi krijon llogarinë e palestrës automatikisht.',c:'var(--grl)',b:'#bbf7d0'},
                {n:'4',t:'Krijo user në Supabase',d:'Supabase Dashboard → Authentication → Add User → vendos emailin dhe fjalëkalimin e klientit → Create User.',c:'var(--pul)',b:'#ddd6fe'},
                {n:'5',t:'Njofto klientin',d:'Telefono: "Hyr te [URL-ja jote] me email [emaili] dhe fjalëkalimi [fjalëkalimi]". Ai hyn dhe sheh dashboardin bosh.',c:'var(--g100)',b:'var(--g200)'},
              ].map(({n,t,d,c,b})=>(
                <div key={n} style={{background:c,border:`1px solid ${b}`,borderRadius:12,padding:'18px 20px',marginBottom:10,display:'flex',gap:16,alignItems:'flex-start'}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:'var(--g900)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:16,flexShrink:0}}>{n}</div>
                  <div><div style={{fontWeight:600,fontSize:15,marginBottom:4}}>{t}</div><div style={{fontSize:13,color:'var(--g600)',lineHeight:1.6}}>{d}</div></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
