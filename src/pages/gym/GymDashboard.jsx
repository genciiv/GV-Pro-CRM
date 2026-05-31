import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../lib/auth'
import { useAsync } from '../../hooks/useAsync'
import {
  getGymStats, getRevenueChart, getExpiringMembers, getUnpaidMembers,
  getTodayCheckins, getMembers, getMemberships, getPayments, getPaymentStats,
  getPlans, getGym, updateGym, updatePlanPrice,
  addMember, renewMembership, freezeMembership, unfreezeMembership,
  markPaymentPaid, addPayment, processQRCheckin, manualCheckin,
  memberStatus, fmtNum, fmtDate, fmtTime, AVC, addDays, today
} from '../../lib/db'
import { StatCard, BarChart, Avatar, StatusBadge, Modal, Loading, Empty } from '../../components/UI'
import QRCodeSVG, { printQR } from '../../components/QRCode'
import { printInvoice } from '../../components/Invoice'
import toast from 'react-hot-toast'
import { smsPaymentConfirm, smsMembershipExpiring } from '../../lib/sms'
import AnalyticsDashboard from './AnalyticsDashboard'
import AffiliateDashboard  from './AffiliateDashboard'
import OnboardingFlow from '../../components/OnboardingFlow'
import PushNotifButton from '../../components/PushNotifButton'

const MONTHS = ['Jan','Feb','Mar','Pri','Maj','Qer','Kor','Gus','Set','Tet','Nën','Dhj']

// ─── DASHBOARD ───────────────────────────────────────────
function Dashboard({ gymId, setPage }) {
  const { data: stats,    loading, reload: rs } = useAsync(() => getGymStats(gymId), [gymId])
  const { data: revenue,  reload: rr } = useAsync(() => getRevenueChart(gymId), [gymId])
  const { data: expiring, reload: re } = useAsync(() => getExpiringMembers(gymId), [gymId])
  const { data: unpaid,   reload: ru } = useAsync(() => getUnpaidMembers(gymId), [gymId])
  const { data: ciToday,  reload: rc } = useAsync(() => getTodayCheckins(gymId), [gymId])
  const s = stats || {}
  const revArr = MONTHS.map((_,i) => (revenue||[])[i] ?? 0)

  if (loading) return <Loading/>
  return (
    <div className="page-in">
      <div className="ph">
        <div>
          <div className="pt">Mirë se erdhe 👋</div>
          <div className="ps">{new Date().toLocaleDateString('sq-AL',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
        </div>
        <button className="btn btn-s btn-sm" onClick={()=>{rs();rr();re();ru();rc()}}>↻ Rifresko</button>
      </div>

      {(s.expiring??0)>0 && <div className="alert al-am" style={{cursor:'pointer'}} onClick={()=>setPage('memberships')}>⚠️ <strong>{s.expiring} abonim</strong> skadojnë brenda 7 ditëve — Klikoni për të parë</div>}
      {(s.debtors??0)>0 && <div className="alert al-rd" style={{cursor:'pointer'}} onClick={()=>setPage('payments')}>🔴 <strong>{s.debtors} klientë</strong> kanë borxh — Klikoni për të menaxhuar</div>}
      {(s.active??0)===0 && <div className="alert al-bl">ℹ️ Dashboardi është gati! Filloni duke shtuar anëtarët e parë nga "Anëtarët".</div>}

      <div className="sg">
        <StatCard icon="👥" label="Anëtarë Aktivë"    value={s.active??0}                   change="abonim aktiv" up/>
        <StatCard icon="💰" label="Të Ardhura Mujore" value={fmtNum(s.paidMonth??0)+' L'}   change="këtë muaj" up/>
        <StatCard icon="🚪" label="Check-ins Sot"     value={s.checkins??0}                 change="hyrje sot" up/>
        <StatCard icon="⏰" label="Skadojnë (7 ditë)" value={s.expiring??0}                 change="kontakto ata"/>
        <StatCard icon="💸" label="Borxhe"             value={fmtNum(s.debt??0)+' L'}       change={`${s.debtors??0} klientë`}/>
        <StatCard icon="💳" label="Pagesa Sot"         value={fmtNum(s.paidToday??0)+' L'}  change="sot" up/>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-hd"><div className="card-t">📈 Të Ardhurat {new Date().getFullYear()}</div></div>
          <div className="card-b"><BarChart data={revArr}/></div>
        </div>
        <div className="card">
          <div className="card-hd"><div className="card-t">⏰ Abonimet që Skadojnë</div><span className="bdg bdg-am">{(expiring||[]).length}</span></div>
          {(expiring||[]).length===0 ? <Empty icon="✅" title="Asnjë abonim skadon shpejt"/> : (
            <div className="tw"><table>
              <thead><tr><th>Anëtari</th><th>Plan</th><th>Skadon</th><th></th></tr></thead>
              <tbody>{(expiring||[]).slice(0,6).map(m=>(
                <tr key={m.id}>
                  <td><div className="mc"><Avatar color={m.avatar_color} name={m.full_name} size="sm"/><div className="mn">{m.full_name}</div></div></td>
                  <td><span className="bdg bdg-gy">{m.plan_name||'—'}</span></td>
                  <td><span className="bdg bdg-am">{m.days_remaining===0?'Sot':m.days_remaining+' ditë'}</span></td>
                  <td><button className="btn btn-g btn-xs" onClick={()=>setPage('payments')}>📩</button></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-hd"><div className="card-t">🚪 Check-ins Sot</div><span className="bdg bdg-gr">{(ciToday||[]).length}</span></div>
          {(ciToday||[]).length===0 ? <Empty icon="🚪" title="Asnjë hyrje sot ende"/> : (
            <div>{(ciToday||[]).map((c,i)=>(
              <div key={c.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:i<ciToday.length-1?'1px solid var(--g100)':'none'}}>
                <div className="mc"><Avatar color={c.avatar_color} name={c.member_name} size="sm"/><div><div className="mn">{c.member_name}</div><div className="ms">{c.plan_name||'—'}</div></div></div>
                <span style={{fontSize:11,color:'var(--g400)'}}>{fmtTime(c.checked_in_at)}</span>
              </div>
            ))}</div>
          )}
        </div>
        <div className="card">
          <div className="card-hd"><div className="card-t">💸 Klientë me Borxh</div><span className="bdg bdg-rd">{(unpaid||[]).length}</span></div>
          {(unpaid||[]).length===0 ? <Empty icon="💚" title="Asnjë borxh"/> : (
            <div className="tw"><table>
              <thead><tr><th>Anëtari</th><th>Borxhi</th><th></th></tr></thead>
              <tbody>{(unpaid||[]).map(m=>(
                <tr key={m.id}>
                  <td><div className="mc"><Avatar color={m.avatar_color} name={m.full_name} size="sm"/><div className="mn">{m.full_name}</div></div></td>
                  <td style={{color:'var(--rd)',fontWeight:700}}>{fmtNum(m.total_debt)} L</td>
                  <td><button className="btn btn-success btn-xs" onClick={()=>setPage('payments')}>Paguaj</button></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── QR CHECK-IN ─────────────────────────────────────────
function CheckIn({ gymId }) {
  const { data: history, reload } = useAsync(() => getTodayCheckins(gymId), [gymId])
  const [result,  setResult]  = useState(null)
  const [search,  setSearch]  = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [idx, setIdx] = useState(0)
  const [tab, setTab] = useState('scanner') // scanner | manual | history

  const showResult = (r) => {
    setResult(r)
    r.success ? toast.success(r.already_checked ? `${r.member_name} — tashmë i regjistruar` : `✅ ${r.member_name} — Hyrja u regjistrua!`)
              : toast.error(`❌ ${r.message}`)
    setTimeout(() => setResult(null), 5000)
  }

  const simulate = async () => {
    setLoading(true)
    try {
      const members = await getMembers(gymId)
      if (!members.length) { toast.error('Asnjë anëtar — shto anëtarë fillimisht'); return }
      const m = members[idx % members.length]; setIdx(i=>i+1)
      showResult(await processQRCheckin(gymId, m.qr_code))
      reload()
    } catch(e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const doSearch = async (v) => {
    setSearch(v)
    if (!v.trim()) { setSearchResults([]); return }
    const all = await getMembers(gymId, v)
    setSearchResults(all.slice(0,5))
  }

  const doManual = async (memberId) => {
    setLoading(true)
    try {
      await manualCheckin(gymId, memberId)
      toast.success('✅ Hyrja u regjistrua!')
      setSearch(''); setSearchResults([]); reload()
    } catch(e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="page-in">
      <div className="ph"><div><div className="pt">QR Check-in</div><div className="ps">Regjistro hyrjen e anëtarëve</div></div></div>

      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {[['scanner','📷 Scanner'],['manual','⌨️ Manual'],['history','📋 Historia']].map(([k,l])=>(
          <button key={k} className={`chip ${tab===k?'active':''}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>

      {tab==='scanner' && (
        <div className="g2">
          <div>
            <div className="card" style={{marginBottom:16}}>
              <div className="card-hd"><div className="card-t">📷 Scanner QR</div></div>
              <div className="card-b">
                <div style={{border:'2px dashed var(--g200)',borderRadius:16,padding:32,textAlign:'center',cursor:loading?'wait':'pointer',transition:'all .2s',marginBottom:14}}
                  onClick={simulate}
                  onMouseEnter={e=>{if(!loading)e.currentTarget.style.borderColor='var(--g900)'}}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='var(--g200)'}>
                  <div style={{width:160,height:160,margin:'0 auto 20px',position:'relative',borderRadius:12,background:'var(--g100)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                    <span style={{fontSize:72,opacity:.12}}>▦</span>
                    {['tl','tr','bl','br'].map(p=>(
                      <div key={p} style={{position:'absolute',width:22,height:22,
                        [p.includes('t')?'top':'bottom']:8,[p.includes('l')?'left':'right']:8,
                        borderColor:'var(--g900)',borderStyle:'solid',
                        borderWidth:p==='tl'?'2px 0 0 2px':p==='tr'?'2px 2px 0 0':p==='bl'?'0 0 2px 2px':'0 2px 2px 0',
                        borderRadius:p==='tl'?'2px 0 0 0':p==='tr'?'0 2px 0 0':p==='bl'?'0 0 0 2px':'0 0 2px 0'}}/>
                    ))}
                    {loading && <div style={{position:'absolute',inset:0,background:'rgba(255,255,255,.8)',display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spn"/></div>}
                  </div>
                  <div style={{fontWeight:600,fontSize:15,marginBottom:6}}>{loading?'Duke procesuar...':'Kliko për Simulim Scan'}</div>
                  <div style={{fontSize:12,color:'var(--g400)'}}>Në pajisje reale: kamera aktivizohet automatikisht</div>
                </div>

                {result && (
                  result.success ? (
                    <div style={{background:'var(--grl)',border:'1px solid #bbf7d0',borderRadius:12,padding:18,display:'flex',alignItems:'center',gap:16}}>
                      <div style={{width:50,height:50,borderRadius:'50%',background:'var(--gr)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:24,flexShrink:0}}>✓</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:17,color:'var(--gr)'}}>{result.already_checked?'Tashmë i Regjistruar':'Hyrja u Regjistrua!'}</div>
                        <div style={{fontWeight:600,fontSize:15,marginTop:2}}>{result.member_name}</div>
                        <div style={{fontSize:12,color:'var(--g500)',marginTop:2}}>{result.plan_name} {result.days_remaining!=null?`• ${result.days_remaining} ditë mbeten`:''}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="alert al-rd">❌ <strong>{result.member_name||'I panjohur'}</strong> — {result.message}</div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-hd"><div className="card-t">Check-ins Sot</div><span className="bdg bdg-gr">{(history||[]).length}</span></div>
            <div style={{maxHeight:480,overflowY:'auto'}}>
              {(history||[]).length===0 ? <Empty icon="🚪" title="Asnjë hyrje sot"/> :
              (history||[]).map(c=>(
                <div key={c.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:'1px solid var(--g100)'}}>
                  <div className="mc"><Avatar color={c.avatar_color} name={c.member_name} size="sm"/><div><div className="mn">{c.member_name}</div><div className="ms">{c.plan_name||'—'} • {c.method==='qr'?'📷':'⌨️'}</div></div></div>
                  <span style={{fontSize:11,color:'var(--g400)'}}>{fmtTime(c.checked_in_at)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==='manual' && (
        <div className="g2">
          <div className="card">
            <div className="card-hd"><div className="card-t">⌨️ Kërko Anëtarin</div></div>
            <div className="card-b">
              <div className="srw"><span className="sri">🔍</span><input autoFocus placeholder="Kërko me emër ose telefon..." value={search} onChange={e=>doSearch(e.target.value)}/></div>
              {searchResults.length===0 && search && <div style={{textAlign:'center',padding:'20px 0',color:'var(--g400)',fontSize:13}}>Asnjë anëtar nuk u gjet</div>}
              {searchResults.map(m=>(
                <div key={m.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid var(--g100)'}}>
                  <div className="mc">
                    <Avatar color={m.avatar_color} name={m.full_name}/>
                    <div>
                      <div className="mn">{m.full_name}</div>
                      <div className="ms">{m.plan_name||'Pa abonim'} • {m.phone||'—'}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <StatusBadge status={memberStatus(m)}/>
                    <button className="btn btn-p btn-sm" onClick={()=>doManual(m.id)} disabled={loading}>Regjistro Hyrjen</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-hd"><div className="card-t">Check-ins Sot</div><span className="bdg bdg-gr">{(history||[]).length}</span></div>
            <div style={{maxHeight:480,overflowY:'auto'}}>
              {(history||[]).length===0 ? <Empty icon="🚪" title="Asnjë hyrje sot"/> :
              (history||[]).map(c=>(
                <div key={c.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:'1px solid var(--g100)'}}>
                  <div className="mc"><Avatar color={c.avatar_color} name={c.member_name} size="sm"/><div><div className="mn">{c.member_name}</div><div className="ms">{c.plan_name||'—'}</div></div></div>
                  <span style={{fontSize:11,color:'var(--g400)'}}>{fmtTime(c.checked_in_at)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==='history' && (
        <div className="card">
          <div className="card-hd"><div className="card-t">Historiku i Hyrjeve — Sot</div><span className="bdg bdg-gr">{(history||[]).length}</span></div>
          <div className="tw"><table>
            <thead><tr><th>Anëtari</th><th>Plani</th><th>Metoda</th><th>Ora</th></tr></thead>
            <tbody>
              {(history||[]).length===0?<tr><td colSpan={4}><Empty icon="🚪" title="Asnjë hyrje sot"/></td></tr>:
              (history||[]).map(c=>(
                <tr key={c.id}>
                  <td><div className="mc"><Avatar color={c.avatar_color} name={c.member_name} size="sm"/><div className="mn">{c.member_name}</div></div></td>
                  <td><span className="bdg bdg-gy">{c.plan_name||'—'}</span></td>
                  <td><span className="bdg bdg-bl">{c.method==='qr'?'📷 QR':'⌨️ Manual'}</span></td>
                  <td style={{fontSize:12,color:'var(--g500)'}}>{fmtTime(c.checked_in_at)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  )
}

// ─── MEMBERS ─────────────────────────────────────────────
function Members({ gymId, gymName }) {
  const [filter,   setFilter]   = useState('all')
  const [search,   setSearch]   = useState('')
  const [showAdd,  setShowAdd]  = useState(false)
  const [profile,  setProfile]  = useState(null)
  const [renew,    setRenew]    = useState(null)
  const [selPlan,  setSelPlan]  = useState('')
  const { data: members, loading, reload } = useAsync(() => getMembers(gymId, search), [gymId, search])
  const { data: plans }  = useAsync(() => getPlans(gymId), [gymId])

  const filtered = (members||[]).filter(m => {
    if (filter==='all') return true
    const s = memberStatus(m)
    if (filter==='active')   return s==='active'||s==='expiring'
    if (filter==='expiring') return s==='expiring'
    if (filter==='expired')  return s==='expired'
    if (filter==='frozen')   return s==='frozen'
    return true
  })

  const doDelete = async (m) => {
    if (!confirm(`Fshi ${m.full_name}?`)) return
    // Soft delete
    const { supabase } = await import('../../lib/supabase')
    await supabase.from('members').update({ is_active:false }).eq('id', m.id)
    toast.success('Anëtari u fshi'); reload()
  }

  if (profile) return (
    <MemberProfile memberId={profile} gymId={gymId} plans={plans||[]} onBack={()=>{setProfile(null);reload()}}/>
  )

  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">Anëtarët</div><div className="ps">{filtered.length} të shfaqur • {(members||[]).length} total</div></div>
        <div className="pa">
          <button className="btn btn-s" onClick={reload}>↻</button>
          <button className="btn btn-p" onClick={()=>setShowAdd(true)}>+ Anëtar i Ri</button>
        </div>
      </div>

      <div className="srw"><span className="sri">🔍</span><input placeholder="Kërko me emër, telefon ose email..." value={search} onChange={e=>setSearch(e.target.value)}/></div>

      <div className="chips">
        {[['all','Të Gjithë'],['active','Aktivë'],['expiring','Skadojnë'],['expired','Skaduar'],['frozen','❄️ Frozen']].map(([k,l])=>(
          <button key={k} className={`chip ${filter===k?'active':''}`} onClick={()=>setFilter(k)}>{l}</button>
        ))}
      </div>

      {loading ? <Loading/> : (
        <div className="card">
          <div className="tw"><table>
            <thead><tr><th>Anëtari</th><th>Telefon</th><th>Plani</th><th>Statusi</th><th>Skadon</th><th>Check-ins</th><th>QR</th><th>Veprime</th></tr></thead>
            <tbody>
              {filtered.length===0 ? <tr><td colSpan={8}><Empty icon="👥" title="Asnjë anëtar" sub="Kliko '+ Anëtar i Ri' për të filluar"/></td></tr> :
              filtered.map(m=>(
                <tr key={m.id} style={{cursor:'pointer'}} onClick={()=>setProfile(m.id)}>
                  <td><div className="mc"><Avatar color={m.avatar_color} name={m.full_name}/><div><div className="mn">{m.full_name}</div><div className="ms">{m.email||'—'}</div></div></div></td>
                  <td style={{color:'var(--g500)'}}>{m.phone||'—'}</td>
                  <td><span className="bdg bdg-gy">{m.plan_name||'Pa abonim'}</span></td>
                  <td><StatusBadge status={memberStatus(m)}/></td>
                  <td style={{fontSize:12,color:m.days_remaining<=3?'var(--rd)':'var(--g500)'}}>{m.end_date?fmtDate(m.end_date):'—'}</td>
                  <td style={{fontWeight:600,textAlign:'center'}}>{m.checkins_this_month??0}</td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div style={{cursor:'pointer'}} title="Printo QR" onClick={()=>printQR(m.full_name, m.qr_code)}>
                      <QRCodeSVG value={m.qr_code} size={36}/>
                    </div>
                  </td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div style={{display:'flex',gap:4}}>
                      <button className="btn btn-p btn-xs" onClick={()=>{setRenew(m);setSelPlan(plans?.[0]?.id||'')}}>💳</button>
                      <button className="btn btn-danger btn-xs" onClick={()=>doDelete(m)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {showAdd && <AddMemberModal gymId={gymId} plans={plans||[]} gymName={gymName} onClose={()=>setShowAdd(false)} onSave={reload}/>}

      {renew && (
        <Modal title="💳 Rinovim Abonoimi" onClose={()=>setRenew(null)} footer={
          <><button className="btn btn-s" onClick={()=>setRenew(null)}>Anulo</button>
          <button className="btn btn-p" onClick={async()=>{
            if(!selPlan){toast.error('Zgjidh planin');return}
            try{await renewMembership(gymId,renew.id,selPlan);toast.success('✅ U rinovua!');setRenew(null);reload()}
            catch(e){toast.error(e.message)}
          }}>✅ Rinovo</button></>
        }>
          <div style={{background:'var(--g50)',borderRadius:10,padding:14,marginBottom:16}}>
            <div style={{fontWeight:600}}>{renew.full_name}</div>
            <div style={{fontSize:12,color:'var(--g500)',marginTop:4}}>Plani aktual: {renew.plan_name||'Pa abonim'} • Skadon: {renew.end_date?fmtDate(renew.end_date):'—'}</div>
          </div>
          <div className="fgp">
            <label>Plani i Ri</label>
            <select value={selPlan} onChange={e=>setSelPlan(e.target.value)}>
              <option value="">— Zgjidh planin —</option>
              {(plans||[]).map(p=><option key={p.id} value={p.id}>{p.emoji} {p.name} — {fmtNum(p.price)} ALL ({p.duration_days} ditë)</option>)}
            </select>
          </div>
          {selPlan && (() => {
            const p = (plans||[]).find(x=>x.id===selPlan)
            return p ? <div className="alert al-gr" style={{marginTop:12}}>✅ {p.name} — skadon {fmtDate(addDays(today(), p.duration_days))} — {fmtNum(p.price)} ALL</div> : null
          })()}
        </Modal>
      )}
    </div>
  )
}

function AddMemberModal({ gymId, plans, gymName, onClose, onSave }) {
  const [saving,    setSaving]    = useState(false)
  const [err,       setErr]       = useState('')
  const [magicLink, setMagicLink] = useState(true)
  const [limitInfo, setLimitInfo] = useState(null)

  // Kontrollo limitin kur hapet modal
  useState(() => {
    import('../../lib/db').then(({ canAddMember }) => {
      canAddMember(gymId).then(info => setLimitInfo(info))
    })
  }, [])

  const PLAN_LABELS = { starter:'Starter (max 100)', pro:'Pro (max 500)', business:'Business (pa limit)' }

  return (
    <Modal title="👤 Anëtar i Ri" onClose={onClose} footer={
      <><button className="btn btn-s" onClick={onClose}>Anulo</button>
      <button className="btn btn-p" form="addForm" type="submit" disabled={saving||limitInfo?.allowed===false}>
        {saving ? '⏳ Duke shtuar...' : '✅ Shto Anëtarin'}
      </button></>
    }>
      {/* Limit info */}
      {limitInfo && (
        <div className={`alert ${limitInfo.allowed ? 'al-bl' : 'al-rd'}`} style={{marginBottom:12}}>
          {limitInfo.allowed
            ? `📊 ${limitInfo.count} / ${limitInfo.limit === Infinity ? '∞' : limitInfo.limit} anëtarë — Paketa ${PLAN_LABELS[limitInfo.plan]||limitInfo.plan}`
            : `❌ Ke arritur limitin! ${limitInfo.count}/${limitInfo.limit} anëtarë. Upgrade planin.`}
        </div>
      )}
      {err && <div className="alert al-rd" style={{marginBottom:12}}>❌ {err}</div>}
      <form id="addForm" onSubmit={async e=>{
        e.preventDefault(); setSaving(true); setErr('')
        const fd = new FormData(e.target)
        try {
          await addMember(gymId, {
            firstName: fd.get('fn'), lastName: fd.get('ln'),
            phone: fd.get('ph'), email: fd.get('em'),
            birthday: fd.get('bd')||null, gender: fd.get('gn'),
            notes: fd.get('no'), planId: fd.get('pl'), method:'cash',
            sendMagicLink: magicLink,
          }, gymName)
          const email = fd.get('em')
          if (magicLink && email) {
            toast.success(`✅ Anëtari u shtua!\n📧 Magic Link u dërgua te ${email}`)
          } else {
            toast.success('✅ Anëtari u shtua!')
          }
          onSave(); onClose()
        } catch(e) { setErr(e.message) }
        finally { setSaving(false) }
      }}>
        <div className="fg c2">
          <div className="fgp"><label>Emri *</label><input name="fn" required placeholder="Emri..."/></div>
          <div className="fgp"><label>Mbiemri *</label><input name="ln" required placeholder="Mbiemri..."/></div>
        </div>
        <div className="fg c2">
          <div className="fgp"><label>Telefon</label><input name="ph" placeholder="+355 69..."/></div>
          <div className="fgp"><label>Email</label><input name="em" type="email" placeholder="email@..."/></div>
        </div>
        <div className="fg c2">
          <div className="fgp"><label>Datëlindja</label><input name="bd" type="date"/></div>
          <div className="fgp"><label>Gjinia</label><select name="gn"><option value="M">Mashkull</option><option value="F">Femër</option></select></div>
        </div>
        <div className="fg">
          <div className="fgp"><label>Plani i Abonoimit</label>
            <select name="pl">
              <option value="">— Pa abonim —</option>
              {plans.map(p=><option key={p.id} value={p.id}>{p.emoji} {p.name} — {fmtNum(p.price)} ALL ({p.duration_days} ditë)</option>)}
            </select>
          </div>
        </div>
        <div className="fg" style={{marginBottom:0}}>
          <div className="fgp"><label>Shënime</label><textarea name="no" placeholder="Opsionale..."/></div>
        </div>

        {/* Magic Link */}
        <div style={{marginTop:16,background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:10,padding:14}}>
          <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
            <input type="checkbox" id="ml" checked={magicLink} onChange={e=>setMagicLink(e.target.checked)}
              style={{width:16,height:16,marginTop:2,flexShrink:0,cursor:'pointer'}}/>
            <div>
              <label htmlFor="ml" style={{fontSize:13,fontWeight:600,color:'#15803d',cursor:'pointer',display:'block',marginBottom:3}}>
                📧 Dërgo Magic Link automatikisht
              </label>
              <div style={{fontSize:12,color:'#16a34a',lineHeight:1.6}}>
                Anëtari merr email me linkun e regjistrimit. <strong>Kërkon email.</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Register link to copy */}
        <div style={{marginTop:10,background:'#eff6ff',border:'1px solid #dbeafe',borderRadius:10,padding:14}}>
          <div style={{fontSize:12,fontWeight:600,color:'#1e40af',marginBottom:8}}>📋 Ose kopjo dhe dërgo manualisht:</div>
          <div style={{background:'#fff',border:'1px solid #bfdbfe',borderRadius:8,padding:'8px 12px',fontSize:12,fontFamily:'monospace',color:'#1e40af',display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}>
            <span style={{wordBreak:'break-all'}}>{window.location.origin}/register</span>
            <button type="button" className="btn btn-g btn-xs" style={{flexShrink:0}} onClick={()=>{
              navigator.clipboard.writeText(window.location.origin+'/register')
              toast.success('✅ Linku u kopjua!')
            }}>📋 Kopjo</button>
          </div>
          <div style={{fontSize:11,color:'#3b82f6',marginTop:6,lineHeight:1.6}}>
            I jep anëtarit këtë link + emailin e tij. Hyn vetë, vendos fjalëkalimin, pa ndihmën tënde.
          </div>
        </div>
      </form>
    </Modal>
  )
}

function MemberProfile({ memberId, gymId, plans, onBack }) {
  const { data: m, loading, reload } = useAsync(async () => {
    const { supabase } = await import('../../lib/supabase')
    const { data } = await supabase.from('members_with_status').select('*').eq('id', memberId).eq('gym_id', gymId).single()
    return data
  }, [memberId])
  const { data: mss, reload: reloadMss } = useAsync(() => getMemberships(gymId, memberId), [memberId])
  const { data: payments } = useAsync(async () => {
    const { supabase } = await import('../../lib/supabase')
    const { data } = await supabase.from('payments').select('*, membership:memberships(plan:plans(name))').eq('member_id', memberId).eq('gym_id', gymId).order('created_at', { ascending:false })
    return data ?? []
  }, [memberId])
  const { data: checkins } = useAsync(async () => {
    const { supabase } = await import('../../lib/supabase')
    const { data } = await supabase.from('check_ins').select('*').eq('member_id', memberId).eq('gym_id', gymId).order('checked_in_at', { ascending:false }).limit(20)
    return data ?? []
  }, [memberId])
  const [tab, setTab] = useState('overview')
  const [showRenew, setShowRenew] = useState(false)
  const [selPlan,   setSelPlan]   = useState('')
  const [editing,   setEditing]   = useState(false)
  const [editForm,  setEditForm]  = useState(null)

  if (loading||!m) return <Loading/>

  const doFreeze = async (msId, frozen) => {
    frozen ? await unfreezeMembership(msId) : await freezeMembership(msId)
    toast.success(frozen?'🔥 Abonimi u shkrij!':'❄️ Abonimi u fryza!')
    reload(); reloadMss()
  }

  const doRenew = async () => {
    if (!selPlan) return
    await renewMembership(gymId, m.id, selPlan)
    toast.success('✅ Abonimi u rinovua!')
      // SMS konfirmim pagese
      try {
        const {data:mem} = await supabase.from('members').select('phone,first_name,last_name').eq('id',memberId).single()
        const {data:gym} = await supabase.from('gyms').select('name,phone').eq('id',gymId).single()
        if (mem?.phone) await smsPaymentConfirm({ member:mem, amount:form.amount||0, plan:{name:selPlan?.name}, gym, channel:'sms' })
      } catch(e){}; setShowRenew(false); reload(); reloadMss()
  }

  const doEdit = async () => {
    const { supabase } = await import('../../lib/supabase')
    await supabase.from('members').update({ first_name:editForm.fn, last_name:editForm.ln, phone:editForm.ph, email:editForm.em, birthday:editForm.bd||null, notes:editForm.no }).eq('id', m.id)
    toast.success('✅ U ruajt!'); setEditing(false); reload()
  }

  const activeMembership = (mss||[]).find(ms=>ms.status==='active')
  const frozenMembership = (mss||[]).find(ms=>ms.status==='frozen')

  return (
    <div className="page-in">
      <div style={{marginBottom:16}}><button className="btn btn-g btn-sm" onClick={onBack}>← Kthehu te lista</button></div>
      <div className="card" style={{marginBottom:16}}>
        <div style={{padding:20,borderBottom:'1px solid var(--g100)',display:'flex',gap:16,alignItems:'flex-start',flexWrap:'wrap'}}>
          <Avatar color={m.avatar_color} name={m.full_name} size="lg"/>
          <div style={{flex:1,minWidth:200}}>
            <div style={{fontFamily:'var(--fs)',fontSize:22,marginBottom:8}}>{m.full_name}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
              <StatusBadge status={memberStatus(m)}/>
              {m.plan_name&&<span className="bdg bdg-gy">{m.plan_emoji} {m.plan_name}</span>}
              {m.phone&&<span style={{fontSize:12,color:'var(--g500)'}}>📞 {m.phone}</span>}
              {m.email&&<span style={{fontSize:12,color:'var(--g500)'}}>📧 {m.email}</span>}
              {m.birthday&&<span style={{fontSize:12,color:'var(--g500)'}}>🎂 {fmtDate(m.birthday)}</span>}
              {m.gender&&<span style={{fontSize:12,color:'var(--g500)'}}>{m.gender==='M'?'♂ Mashkull':'♀ Femër'}</span>}
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="btn btn-p btn-sm" onClick={()=>setShowRenew(true)}>💳 Rinovim</button>
              {activeMembership&&<button className="btn btn-s btn-sm" onClick={()=>doFreeze(activeMembership.id,false)}>❄️ Freeze</button>}
              {frozenMembership&&<button className="btn btn-s btn-sm" onClick={()=>doFreeze(frozenMembership.id,true)}>🔥 Shkrij</button>}
              <button className="btn btn-s btn-sm" onClick={()=>{setEditing(true);setEditForm({fn:m.first_name,ln:m.last_name,ph:m.phone||'',em:m.email||'',bd:m.birthday||'',no:m.notes||''})}}>✏️ Edito</button>
              {m.email&&<button className="btn btn-success btn-sm" onClick={async()=>{
                try{const{sendMagicLink}=await import('../../lib/db');await sendMagicLink(m.email,'Palestra');toast.success('📧 Magic Link u dërgua!')}
                catch(e){toast.error(e.message)}
              }}>📧 Magic Link</button>}
              <button className="btn btn-s btn-sm" onClick={()=>{
                const link = window.location.origin+'/register'
                navigator.clipboard.writeText(link)
                toast.success('✅ Linku u kopjua! Dërgo: ' + link)
              }}>📋 Kopjo Linkun</button>
            </div>
          </div>
          {/* QR Code */}
          <div style={{textAlign:'center',cursor:'pointer'}} onClick={()=>printQR(m.full_name, m.qr_code)} title="Kliko për të printuar">
            <QRCodeSVG value={m.qr_code} size={90}/>
            <div style={{fontSize:10,color:'var(--g400)',marginTop:6}}>Kliko → Printo</div>
          </div>
        </div>

        <div style={{padding:'0 20px 20px'}}>
          <div style={{display:'flex',borderBottom:'1px solid var(--g200)',marginTop:16,marginBottom:16}}>
            {[['overview','📊 Pasqyra'],['memberships','🎫 Abonimet'],['payments','💰 Pagesat'],['checkins','🚪 Check-ins']].map(([k,l])=>(
              <div key={k} style={{padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:500,color:tab===k?'var(--g900)':'var(--g500)',borderBottom:tab===k?'2px solid var(--g900)':'2px solid transparent',transition:'all .12s',whiteSpace:'nowrap'}} onClick={()=>setTab(k)}>{l}</div>
            ))}
          </div>

          {tab==='overview' && (
            <div>
              <div className="g3" style={{marginBottom:16}}>
                {[
                  [m.checkins_this_month??0,'Muaj','Check-ins / Muaj'],
                  [m.days_remaining!=null&&m.days_remaining>=0?m.days_remaining+' ditë':'Skaduar','','Ditë të Mbetura'],
                  [fmtNum(m.total_debt??0)+' L','','Borxhi Total'],
                ].map(([v,,l],i)=>(
                  <div key={i} style={{background:'var(--g50)',border:'1px solid var(--g200)',borderRadius:10,padding:16,textAlign:'center'}}>
                    <div style={{fontFamily:'var(--fs)',fontSize:24,marginBottom:4}}>{v}</div>
                    <div style={{fontSize:11,color:'var(--g500)'}}>{l}</div>
                  </div>
                ))}
              </div>
              {m.notes&&<div style={{background:'var(--g50)',borderRadius:8,padding:12,fontSize:13,color:'var(--g600)'}}>📝 {m.notes}</div>}
            </div>
          )}

          {tab==='memberships' && (
            <div>
              {(!mss||mss.length===0)?<Empty icon="🎫" title="Asnjë abonim"/>:(
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {mss.map(ms=>(
                    <div key={ms.id} style={{background:'var(--g50)',border:'1px solid var(--g200)',borderRadius:10,padding:14,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:14}}>{ms.plan?.emoji} {ms.plan?.name} — {fmtNum(ms.price_paid)} L</div>
                        <div style={{fontSize:12,color:'var(--g500)',marginTop:4}}>{ms.start_date} → {ms.end_date}</div>
                      </div>
                      <div style={{display:'flex',gap:8,alignItems:'center'}}>
                        <span className={`bdg bdg-${ms.status==='active'?'gr':ms.status==='frozen'?'gy':'rd'}`}>{ms.status}</span>
                        {ms.status==='active'&&<button className="btn btn-g btn-xs" onClick={()=>doFreeze(ms.id,false)}>❄️</button>}
                        {ms.status==='frozen'&&<button className="btn btn-g btn-xs" onClick={()=>doFreeze(ms.id,true)}>🔥</button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab==='payments' && (
            (!payments||payments.length===0)?<Empty icon="💰" title="Asnjë pagesë"/>:(
              <div className="tw"><table>
                <thead><tr><th>#Fatura</th><th>Plani</th><th>Shuma</th><th>Metoda</th><th>Data</th><th>Statusi</th></tr></thead>
                <tbody>{payments.map(p=>(
                  <tr key={p.id}>
                    <td style={{fontFamily:'monospace',fontSize:11,color:'var(--g400)'}}>{p.invoice_number}</td>
                    <td><span className="bdg bdg-gy">{p.membership?.plan?.name||'—'}</span></td>
                    <td style={{fontWeight:600}}>{fmtNum(p.amount)} L</td>
                    <td style={{color:'var(--g500)'}}>💵 {p.method}</td>
                    <td style={{fontSize:12,color:'var(--g500)'}}>{fmtDate(p.created_at)}</td>
                    <td>{p.status==='paid'?<span className="bdg bdg-gr">Paguar</span>:<span className="bdg bdg-am">Borxh</span>}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            )
          )}

          {tab==='checkins' && (
            (!checkins||checkins.length===0)?<Empty icon="🚪" title="Asnjë hyrje"/>:(
              <div className="tw"><table>
                <thead><tr><th>Data</th><th>Ora</th><th>Metoda</th></tr></thead>
                <tbody>{checkins.map(c=>(
                  <tr key={c.id}>
                    <td>{fmtDate(c.checked_in_at)}</td>
                    <td style={{color:'var(--g500)'}}>{fmtTime(c.checked_in_at)}</td>
                    <td><span className="bdg bdg-bl">{c.method==='qr'?'📷 QR':'⌨️ Manual'}</span></td>
                  </tr>
                ))}</tbody>
              </table></div>
            )
          )}
        </div>
      </div>

      {showRenew && (
        <Modal title="💳 Rinovim Abonoimi" onClose={()=>setShowRenew(false)} footer={
          <><button className="btn btn-s" onClick={()=>setShowRenew(false)}>Anulo</button>
          <button className="btn btn-p" onClick={doRenew} disabled={!selPlan}>✅ Rinovo</button></>
        }>
          <div className="fgp" style={{marginBottom:14}}>
            <label>Plani i Ri</label>
            <select value={selPlan} onChange={e=>setSelPlan(e.target.value)}>
              <option value="">— Zgjidh planin —</option>
              {plans.map(p=><option key={p.id} value={p.id}>{p.emoji} {p.name} — {fmtNum(p.price)} ALL</option>)}
            </select>
          </div>
        </Modal>
      )}

      {editing && editForm && (
        <Modal title="✏️ Edito Anëtarin" onClose={()=>setEditing(false)} footer={
          <><button className="btn btn-s" onClick={()=>setEditing(false)}>Anulo</button>
          <button className="btn btn-p" onClick={doEdit}>💾 Ruaj</button></>
        }>
          <div className="fg c2">
            <div className="fgp"><label>Emri</label><input value={editForm.fn} onChange={e=>setEditForm(f=>({...f,fn:e.target.value}))}/></div>
            <div className="fgp"><label>Mbiemri</label><input value={editForm.ln} onChange={e=>setEditForm(f=>({...f,ln:e.target.value}))}/></div>
          </div>
          <div className="fg c2">
            <div className="fgp"><label>Telefon</label><input value={editForm.ph} onChange={e=>setEditForm(f=>({...f,ph:e.target.value}))}/></div>
            <div className="fgp"><label>Email</label><input value={editForm.em} onChange={e=>setEditForm(f=>({...f,em:e.target.value}))}/></div>
          </div>
          <div className="fg c2">
            <div className="fgp"><label>Datëlindja</label><input type="date" value={editForm.bd} onChange={e=>setEditForm(f=>({...f,bd:e.target.value}))}/></div>
          </div>
          <div className="fg" style={{marginBottom:0}}>
            <div className="fgp"><label>Shënime</label><textarea value={editForm.no} onChange={e=>setEditForm(f=>({...f,no:e.target.value}))}/></div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── MEMBERSHIPS ─────────────────────────────────────────
function Memberships({ gymId }) {
  const [filter, setFilter] = useState('active')
  const [renew,  setRenew]  = useState(null)
  const [selPlan,setSelPlan]= useState('')
  const { data: mss,   loading, reload } = useAsync(() => getMemberships(gymId), [gymId])
  const { data: plans } = useAsync(() => getPlans(gymId), [gymId])
  const filtered = (mss||[]).filter(ms => ms.status === filter)

  return (
    <div className="page-in">
      <div className="ph"><div><div className="pt">Abonimet</div><div className="ps">Menaxho planet dhe abonimet</div></div></div>

      <div className="card" style={{marginBottom:16}}>
        <div className="card-hd"><div className="card-t">🎫 Planet e Disponueshme</div></div>
        <div className="card-b">
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:10}}>
            {(plans||[]).map(p=>(
              <div key={p.id} style={{background:'var(--g50)',border:'1.5px solid var(--g200)',borderRadius:12,padding:14,textAlign:'center',transition:'all .15s',cursor:'default'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--g900)';e.currentTarget.style.boxShadow='var(--shm)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--g200)';e.currentTarget.style.boxShadow='none'}}>
                <div style={{fontSize:24,marginBottom:8}}>{p.emoji}</div>
                <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>{p.name}</div>
                <div style={{fontFamily:'var(--fs)',fontSize:20,marginBottom:2}}>{fmtNum(p.price)}</div>
                <div style={{fontSize:10,color:'var(--g400)'}}>ALL / {p.duration_days} ditë</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-hd">
          <div className="card-t">Lista e Abonimeve</div>
          <div style={{display:'flex',gap:6}}>
            {[['active','✅ Aktive'],['expired','❌ Skaduar'],['frozen','❄️ Frozen']].map(([k,l])=>(
              <button key={k} className={`chip ${filter===k?'active':''}`} onClick={()=>setFilter(k)}>{l}</button>
            ))}
          </div>
        </div>
        {loading?<Loading/>:(
          <div className="tw"><table>
            <thead><tr><th>Anëtari</th><th>Plani</th><th>Filloi</th><th>Skadon</th><th>Çmimi</th><th>Statusi</th><th>Veprime</th></tr></thead>
            <tbody>
              {filtered.length===0?<tr><td colSpan={7}><Empty icon="🎫" title={`Asnjë abonim ${filter}`}/></td></tr>:
              filtered.map(ms=>{
                const name=`${ms.member?.first_name||''} ${ms.member?.last_name||''}`
                return(
                  <tr key={ms.id}>
                    <td><div className="mc"><Avatar color={ms.member?.avatar_color||0} name={name} size="sm"/><div className="mn">{name}</div></div></td>
                    <td><span className="bdg bdg-gy">{ms.plan?.emoji} {ms.plan?.name}</span></td>
                    <td style={{fontSize:12,color:'var(--g500)'}}>{ms.start_date}</td>
                    <td style={{fontSize:12,color:ms.status==='active'&&(new Date(ms.end_date)-new Date())/(86400000)<7?'var(--rd)':'var(--g500)'}}>{ms.end_date}</td>
                    <td style={{fontWeight:600}}>{fmtNum(ms.price_paid)} L</td>
                    <td><span className={`bdg bdg-${ms.status==='active'?'gr':ms.status==='frozen'?'gy':'rd'}`}>{ms.status}</span></td>
                    <td><div style={{display:'flex',gap:6}}>
                      <button className="btn btn-p btn-xs" onClick={()=>{setRenew(ms);setSelPlan(ms.plan_id||'')}}>💳</button>
                      {ms.status==='active'&&<button className="btn btn-g btn-xs" onClick={async()=>{await freezeMembership(ms.id);toast.success('❄️ U fryza!');reload()}}>❄️</button>}
                      {ms.status==='frozen'&&<button className="btn btn-g btn-xs" onClick={async()=>{await unfreezeMembership(ms.id);toast.success('🔥 U shkrij!');reload()}}>🔥</button>}
                    </div></td>
                  </tr>
                )
              })}
            </tbody>
          </table></div>
        )}
      </div>

      {renew&&(
        <Modal title="💳 Rinovim" onClose={()=>setRenew(null)} footer={
          <><button className="btn btn-s" onClick={()=>setRenew(null)}>Anulo</button>
          <button className="btn btn-p" onClick={async()=>{
            if(!selPlan)return
            await renewMembership(gymId,renew.member_id,selPlan)
            toast.success('✅ U rinovua!'); setRenew(null); reload()
          }}>✅ Rinovo</button></>
        }>
          <p style={{fontSize:13,marginBottom:14,color:'var(--g600)'}}>Anëtari: <strong>{renew.member?.first_name} {renew.member?.last_name}</strong></p>
          <div className="fgp"><label>Plani i Ri</label>
            <select value={selPlan} onChange={e=>setSelPlan(e.target.value)}>
              <option value="">— Zgjidh —</option>
              {(plans||[]).map(p=><option key={p.id} value={p.id}>{p.emoji} {p.name} — {fmtNum(p.price)} ALL ({p.duration_days}d)</option>)}
            </select>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── PAYMENTS ────────────────────────────────────────────
function Payments({ gymId }) {
  const { data: pays,  loading, reload } = useAsync(() => getPayments(gymId), [gymId])
  const { data: stats, reload: rs }      = useAsync(() => getPaymentStats(gymId), [gymId])
  const { data: members } = useAsync(() => getMembers(gymId), [gymId])
  const [showAdd, setShowAdd] = useState(false)
  const [filter,  setFilter]  = useState('all')
  const unpaid = (pays||[]).filter(p=>p.status==='unpaid')
  const s = stats||{today:0,month:0,debt:0,debtors:0}

  const filtered = (pays||[]).filter(p => filter==='all'||(filter==='paid'&&p.status==='paid')||(filter==='unpaid'&&p.status==='unpaid'))

  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">Pagesat</div><div className="ps">Histori dhe menaxhim i pagesave</div></div>
        <div className="pa">
          <button className="btn btn-s btn-sm" onClick={()=>{reload();rs()}}>↻</button>
          <button className="btn btn-p" onClick={()=>setShowAdd(true)}>+ Regjistro Pagesë</button>
        </div>
      </div>

      <div className="sg">
        <StatCard icon="✅" label="Paguar Sot"    value={fmtNum(s.today)+' L'}  change="sot" up/>
        <StatCard icon="📅" label="Paguar Muaj"   value={fmtNum(s.month)+' L'}  change="muaj" up/>
        <StatCard icon="💸" label="Borxhe"         value={fmtNum(s.debt)+' L'}   change={`${s.debtors} klientë`}/>
        <StatCard icon="#"  label="Total Pagesa"   value={(pays||[]).length}/>
      </div>

      {unpaid.length>0&&(
        <div className="alert al-rd">
          🔴 {unpaid.length} pagesa të papaguara — Borxhi total: <strong>{fmtNum(s.debt)} L</strong>
        </div>
      )}

      <div className="chips">
        {[['all','Të Gjitha'],['paid','✅ Paguara'],['unpaid','⏳ Borxhe']].map(([k,l])=>(
          <button key={k} className={`chip ${filter===k?'active':''}`} onClick={()=>setFilter(k)}>{l}</button>
        ))}
      </div>

      {loading?<Loading/>:(
        <div className="card">
          <div className="card-hd"><div className="card-t">Historiku i Pagesave</div></div>
          <div className="tw"><table>
            <thead><tr><th>#Fatura</th><th>Anëtari</th><th>Plani</th><th>Shuma</th><th>Metoda</th><th>Data</th><th>Statusi</th></tr></thead>
            <tbody>
              {filtered.length===0?<tr><td colSpan={7}><Empty icon="💰" title="Asnjë pagesë" sub="Pagesat shfaqen kur shtoni anëtarë me abonim"/></td></tr>:
              filtered.map(p=>(
                <tr key={p.id}>
                  <td style={{fontFamily:'monospace',fontSize:11,color:'var(--g400)'}}>{p.invoice_number}</td>
                  <td><div className="mc"><Avatar color={p.member?.avatar_color||0} name={`${p.member?.first_name||''} ${p.member?.last_name||''}`} size="sm"/><div className="mn">{p.member?.first_name} {p.member?.last_name}</div></div></td>
                  <td><span className="bdg bdg-gy">{p.membership?.plan?.name||'—'}</span></td>
                  <td style={{fontWeight:600}}>{fmtNum(p.amount)} L</td>
                  <td style={{color:'var(--g500)'}}>💵 {p.method}</td>
                  <td style={{fontSize:12,color:'var(--g500)'}}>{fmtDate(p.created_at)}</td>
                  <td>
                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                      {p.status==='paid'
                        ?<span className="bdg bdg-gr">✅ Paguar</span>
                        :<button className="btn btn-success btn-xs" onClick={async()=>{await markPaymentPaid(gymId,p.id);toast.success('✅ U pagua!');reload();rs()}}>💰 Paguaj</button>}
                      {p.status==='paid'&&<button className="btn btn-g btn-xs" title="Printo Faturën" onClick={()=>printInvoice({
                        invoice_number:p.invoice_number,
                        member:p.member,
                        gym:null,
                        plan:p.membership?.plan,
                        amount:p.amount,
                        method:p.method,
                        date:p.paid_at||p.created_at
                      })}>🧾</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {showAdd&&(
        <Modal title="💰 Regjistro Pagesë" onClose={()=>setShowAdd(false)} footer={
          <><button className="btn btn-s" onClick={()=>setShowAdd(false)}>Anulo</button>
          <button className="btn btn-p" form="payForm" type="submit">✅ Konfirmo</button></>
        }>
          <form id="payForm" onSubmit={async e=>{
            e.preventDefault()
            const fd=new FormData(e.target)
            try{await addPayment(gymId,{memberId:fd.get('mb'),amount:fd.get('am'),method:fd.get('me')});toast.success('✅ Pagesa u shtua!');setShowAdd(false);reload();rs()}
            catch(e){toast.error(e.message)}
          }}>
            <div className="fgp" style={{marginBottom:14}}><label>Anëtari *</label>
              <select name="mb" required>
                <option value="">— Zgjidh anëtarin —</option>
                {(members||[]).map(m=><option key={m.id} value={m.id}>{m.full_name} ({m.plan_name||'pa plan'})</option>)}
              </select>
            </div>
            <div className="fg c2">
              <div className="fgp"><label>Shuma (ALL) *</label><input name="am" type="number" required placeholder="3000" min="0"/></div>
              <div className="fgp"><label>Metoda</label><select name="me"><option value="cash">💵 Cash</option><option value="transfer">📱 Transfertë</option><option value="card">💳 Kartë</option></select></div>
            </div>
            <div className="alert al-bl">📄 Numri i faturës gjenerohet automatikisht</div>
          </form>
        </Modal>
      )}
    </div>
  )
}

// ─── REPORTS ─────────────────────────────────────────────
function Reports({ gymId }) {
  const { data: stats }   = useAsync(() => getGymStats(gymId), [gymId])
  const { data: revenue } = useAsync(() => getRevenueChart(gymId), [gymId])
  const { data: members } = useAsync(() => getMembers(gymId), [gymId])
  const { data: plans }   = useAsync(() => getPlans(gymId), [gymId])
  const revArr = MONTHS.map((_,i) => (revenue||[])[i] ?? 0)
  const s = stats || {}

  const monthTotal = revArr[new Date().getMonth()]
  const planStats = (plans||[]).map(p => ({
    ...p, count: (members||[]).filter(m=>m.plan_id===p.id).length
  })).sort((a,b)=>b.count-a.count)
  const maxPlan = Math.max(...planStats.map(p=>p.count), 1)

  const genderM = (members||[]).filter(m=>m.gender==='M').length
  const genderF = (members||[]).filter(m=>m.gender==='F').length
  const total   = (members||[]).length

  return (
    <div className="page-in">
      <div className="ph"><div><div className="pt">Raporte & Statistika</div><div className="ps">Analiza e palestrës — {new Date().toLocaleDateString('sq-AL',{month:'long',year:'numeric'})}</div></div></div>

      <div className="sg">
        <StatCard icon="💰" label="Të Ardhura Muaj"   value={fmtNum(monthTotal)+' L'} change="muaj" up/>
        <StatCard icon="👥" label="Total Anëtarë"      value={total}                   change="të gjithë" up/>
        <StatCard icon="✅" label="Anëtarë Aktivë"     value={s.active??0}             change="aktivë" up/>
        <StatCard icon="💸" label="Borxhe Totale"       value={fmtNum(s.debt??0)+' L'} change={`${s.debtors??0} klientë`}/>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-hd"><div className="card-t">📈 Të Ardhurat {new Date().getFullYear()}</div></div>
          <div className="card-b"><BarChart data={revArr}/></div>
        </div>
        <div className="card">
          <div className="card-hd"><div className="card-t">🎫 Planet më të Shituara</div></div>
          <div className="card-b" style={{display:'flex',flexDirection:'column',gap:12}}>
            {planStats.slice(0,6).map(p=>(
              <div key={p.id}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:5,fontWeight:500}}>
                  <span>{p.emoji} {p.name}</span>
                  <span style={{color:'var(--g500)'}}>{p.count} anëtarë</span>
                </div>
                <div className="prog"><div className="pf" style={{width:`${Math.round(p.count/maxPlan*100)}%`,background:'var(--g900)'}}/></div>
              </div>
            ))}
            {planStats.length===0&&<Empty icon="🎫" title="Asnjë plan ende"/>}
          </div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-hd"><div className="card-t">👥 Gjinia e Anëtarëve</div></div>
          <div className="card-b" style={{display:'flex',gap:20,alignItems:'center',flexWrap:'wrap'}}>
            {total===0?<Empty icon="👥" title="Asnjë anëtar"/>:<>
              <div style={{flex:1}}>
                {[['♂ Mashkull',genderM,'var(--ac)'],['♀ Femër',genderF,'var(--rd)']].map(([l,n,c])=>(
                  <div key={l} style={{marginBottom:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:5}}><span style={{fontWeight:500}}>{l}</span><span style={{color:'var(--g500)'}}>{n} ({total>0?Math.round(n/total*100):0}%)</span></div>
                    <div className="prog"><div className="pf" style={{width:`${total>0?Math.round(n/total*100):0}%`,background:c}}/></div>
                  </div>
                ))}
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontFamily:'var(--fs)',fontSize:36,fontWeight:900}}>{total}</div>
                <div style={{fontSize:12,color:'var(--g500)'}}>Total</div>
              </div>
            </>}
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><div className="card-t">📊 Statusi i Abonimeve</div></div>
          <div className="card-b">
            {[
              ['Aktivë',      (members||[]).filter(m=>memberStatus(m)==='active').length,   'var(--gr)'],
              ['Skadojnë',    (members||[]).filter(m=>memberStatus(m)==='expiring').length, 'var(--am)'],
              ['Skaduar',     (members||[]).filter(m=>memberStatus(m)==='expired').length,  'var(--rd)'],
              ['Frozen',      (members||[]).filter(m=>memberStatus(m)==='frozen').length,   'var(--ac)'],
              ['Pa Abonim',   (members||[]).filter(m=>memberStatus(m)==='none').length,     'var(--g400)'],
            ].map(([l,n,c])=>(
              <div key={l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--g100)'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:c,flexShrink:0}}/>
                  <span style={{fontSize:13}}>{l}</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontWeight:700,fontSize:14}}>{n}</span>
                  <span style={{fontSize:11,color:'var(--g400)',width:36,textAlign:'right'}}>{total>0?Math.round(n/total*100):0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SETTINGS ────────────────────────────────────────────
function Settings({ gymId }) {
  const { data: gym, loading } = useAsync(() => getGym(gymId), [gymId])
  const { data: plans, reload: reloadPlans } = useAsync(() => getPlans(gymId), [gymId])
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!form && gym) { setForm(gym); return null }
  if (loading || !form) return <Loading/>

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const save = async () => {
    setSaving(true)
    await updateGym(gymId,{name:form.name,phone:form.phone,address:form.address,nipt:form.nipt,email:form.email,city:form.city})
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2000); toast.success('✅ U ruajt!')
  }

  const savePlanPrice = async (planId, price) => {
    await updatePlanPrice(gymId, planId, price)
    toast.success('✅ Çmimi u ndryshua!')
    reloadPlans()
  }

  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">Konfigurimet</div><div className="ps">Menaxho informacionin e palestrës</div></div>
        <button className="btn btn-p" onClick={save} disabled={saving}>{saving?'Duke ruajtur...':saved?'✅ U Ruajt!':'💾 Ruaj'}</button>
      </div>

      <div className="g2">
        <div>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-hd"><div className="card-t">🏋️ Informacioni i Palestrës</div></div>
            <div className="card-b">
              <div className="fg"><div className="fgp"><label>Emri i Palestrës</label><input value={form.name||''} onChange={e=>set('name',e.target.value)}/></div></div>
              <div className="fg c2">
                <div className="fgp"><label>NIPT</label><input value={form.nipt||''} onChange={e=>set('nipt',e.target.value)} placeholder="L12345678A"/></div>
                <div className="fgp"><label>Telefon</label><input value={form.phone||''} onChange={e=>set('phone',e.target.value)} placeholder="+355 69..."/></div>
              </div>
              <div className="fg c2">
                <div className="fgp"><label>Email</label><input type="email" value={form.email||''} onChange={e=>set('email',e.target.value)}/></div>
                <div className="fgp"><label>Qyteti</label><input value={form.city||''} onChange={e=>set('city',e.target.value)}/></div>
              </div>
              <div className="fg" style={{marginBottom:0}}>
                <div className="fgp"><label>Adresa</label><input value={form.address||''} onChange={e=>set('address',e.target.value)}/></div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-hd"><div className="card-t">🔑 Informacioni i Hyrjes</div></div>
            <div className="card-b">
              <div style={{background:'var(--g50)',borderRadius:8,padding:12,fontSize:13}}>
                <div style={{marginBottom:8}}><span style={{color:'var(--g500)'}}>Email:</span> <strong>{form.email}</strong></div>
                <div style={{fontSize:12,color:'var(--g400)'}}>Për të ndryshuar fjalëkalimin, kontakto administratorin e platformës.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-hd"><div className="card-t">💰 Çmimet e Planeve</div><span style={{fontSize:11,color:'var(--g400)'}}>Ndrysho çmimin dhe kliko Enter</span></div>
          <div className="card-b" style={{display:'flex',flexDirection:'column',gap:12}}>
            {(plans||[]).length===0?<Empty icon="🎫" title="Asnjë plan"/>:
            (plans||[]).map(p=>(
              <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0',borderBottom:'1px solid var(--g100)'}}>
                <span style={{fontSize:20}}>{p.emoji}</span>
                <span style={{flex:1,fontSize:13,fontWeight:500}}>{p.name}</span>
                <span style={{fontSize:11,color:'var(--g400)',minWidth:40}}>{p.duration_days}d</span>
                <input
                  type="number"
                  defaultValue={p.price}
                  style={{width:100,textAlign:'right'}}
                  onBlur={e=>{ if(Number(e.target.value)!==p.price) savePlanPrice(p.id,e.target.value) }}
                  onKeyDown={e=>{ if(e.key==='Enter') e.target.blur() }}
                />
                <span style={{fontSize:12,color:'var(--g400)',width:20}}>L</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── LAYOUT ──────────────────────────────────────────────
const NAV = [
  {s:'Kryesore', items:[{id:'dashboard',l:'Dashboard',i:'◻️'},{id:'analytics',l:'Analytics',i:'📊'},{id:'checkin',l:'QR Check-in',i:'📷'},{id:'affiliate',l:'Affiliate',i:'🤝'}]},
  {s:'Menaxhim', items:[{id:'members',l:'Anëtarët',i:'👥'},{id:'memberships',l:'Abonimet',i:'🎫'},{id:'payments',l:'Pagesat',i:'💰'}]},
  {s:'Analiza',  items:[{id:'reports',l:'Raporte',i:'📈'}]},
  {s:'Sistem',   items:[{id:'settings',l:'Konfigurimet',i:'⚙️'}]},
]
const TITLES={dashboard:'Dashboard',checkin:'QR Check-in',members:'Anëtarët',memberships:'Abonimet',payments:'Pagesat',reports:'Raporte',settings:'Konfigurimet'}

export default function GymDashboard() {
  const { profile, gymId, logout } = useAuth()
  const [page,   setPage]   = useState('dashboard')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [sbOpen, setSbOpen] = useState(false)
  const nav = id => { setPage(id); setSbOpen(false) }

  // Check if onboarding needed
  useEffect(()=>{
    if (!gymId) return
    supabase.from('gyms').select('onboarding_done').eq('id',gymId).single().then(({data})=>{
      if (data && !data.onboarding_done) setShowOnboarding(true)
    })
  },[gymId])

  const gymName  = profile?.gym?.name  || 'Vaqo'
  const userName = profile?.data?.name || 'Admin'
  const userRole = profile?.data?.role || 'owner'

  const PAGE = {
    dashboard:   <Dashboard   gymId={gymId} setPage={nav}/>,
    analytics:   <AnalyticsDashboard gymId={gymId}/>,
    affiliate:   <AffiliateDashboard gymId={gymId}/>,
    checkin:     <CheckIn     gymId={gymId}/>,
    members:     <Members     gymId={gymId} gymName={gymName}/>,
    memberships: <Memberships gymId={gymId}/>,
    payments:    <Payments    gymId={gymId}/>,
    reports:     <Reports     gymId={gymId}/>,
    settings:    <Settings    gymId={gymId}/>,
  }

  return (
    <div className="app">
      {/* Onboarding overlay */}
      {showOnboarding&&(
        <div style={{position:'fixed',inset:0,zIndex:9999}}>
          <OnboardingFlow gymId={gymId} onComplete={()=>setShowOnboarding(false)}/>
        </div>
      )}
      <div className={`sbo ${sbOpen?'open':''}`} onClick={()=>setSbOpen(false)}/>

      <aside className={`sidebar ${sbOpen?'open':''}`}>
        <div className="sb-logo">
          <div className="sb-icon">💪</div>
          <div><div className="sb-name">{gymName}</div><div className="sb-sub">Vaqo</div></div>
        </div>
        <nav className="nav">
          {NAV.map(s=>(
            <div key={s.s} className="nav-sec">
              <div className="nav-lbl">{s.s}</div>
              {s.items.map(item=>(
                <div key={item.id} className={`nav-item ${page===item.id?'active':''}`} onClick={()=>nav(item.id)}>
                  <span className="nav-ico">{item.i}</span>{item.l}
                </div>
              ))}
            </div>
          ))}
        </nav>
        <div className="sb-bot">
          <div className="user-card" onClick={logout} title="Dil nga sistemi">
            <div className="user-av">{userName.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()}</div>
            <div>
              <div className="user-nm">{userName}</div>
              <div className="user-rl">{userRole} · Dil →</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="tbl">
            <button className="hmbg" style={{display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setSbOpen(s=>!s)}>☰</button>
            <div className="tb-title">{TITLES[page]||'Dashboard'}</div>
          </div>
          <div className="tbr">
            <PushNotifButton gymId={gymId}/>
            <span style={{fontSize:11,color:'var(--gr)',fontWeight:600}}>● Live</span>
            <span className="bdg bdg-gy">{gymName}</span>
            <button className="btn btn-p btn-sm" onClick={()=>nav('members')}>+ Anëtar i Ri</button>
          </div>
        </div>
        <div className="content">{PAGE[page]||<Dashboard gymId={gymId} setPage={nav}/>}</div>
      </main>
    </div>
  )
}import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../lib/auth'
import { useAsync } from '../../hooks/useAsync'
import {
  getGymStats, getRevenueChart, getExpiringMembers, getUnpaidMembers,
  getTodayCheckins, getMembers, getMemberships, getPayments, getPaymentStats,
  getPlans, getGym, updateGym, updatePlanPrice,
  addMember, renewMembership, freezeMembership, unfreezeMembership,
  markPaymentPaid, addPayment, processQRCheckin, manualCheckin,
  memberStatus, fmtNum, fmtDate, fmtTime, AVC, addDays, today
} from '../../lib/db'
import { StatCard, BarChart, Avatar, StatusBadge, Modal, Loading, Empty } from '../../components/UI'
import QRCodeSVG, { printQR } from '../../components/QRCode'
import { printInvoice } from '../../components/Invoice'
import toast from 'react-hot-toast'
import { smsPaymentConfirm, smsMembershipExpiring } from '../../lib/sms'
import AnalyticsDashboard from './AnalyticsDashboard'
import AffiliateDashboard  from './AffiliateDashboard'
import OnboardingFlow from '../../components/OnboardingFlow'
import PushNotifButton from '../../components/PushNotifButton'

const MONTHS = ['Jan','Feb','Mar','Pri','Maj','Qer','Kor','Gus','Set','Tet','Nën','Dhj']

// ─── DASHBOARD ───────────────────────────────────────────
function Dashboard({ gymId, setPage }) {
  const { data: stats,    loading, reload: rs } = useAsync(() => getGymStats(gymId), [gymId])
  const { data: revenue,  reload: rr } = useAsync(() => getRevenueChart(gymId), [gymId])
  const { data: expiring, reload: re } = useAsync(() => getExpiringMembers(gymId), [gymId])
  const { data: unpaid,   reload: ru } = useAsync(() => getUnpaidMembers(gymId), [gymId])
  const { data: ciToday,  reload: rc } = useAsync(() => getTodayCheckins(gymId), [gymId])
  const s = stats || {}
  const revArr = MONTHS.map((_,i) => (revenue||[])[i] ?? 0)

  if (loading) return <Loading/>
  return (
    <div className="page-in">
      <div className="ph">
        <div>
          <div className="pt">Mirë se erdhe 👋</div>
          <div className="ps">{new Date().toLocaleDateString('sq-AL',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
        </div>
        <button className="btn btn-s btn-sm" onClick={()=>{rs();rr();re();ru();rc()}}>↻ Rifresko</button>
      </div>

      {(s.expiring??0)>0 && <div className="alert al-am" style={{cursor:'pointer'}} onClick={()=>setPage('memberships')}>⚠️ <strong>{s.expiring} abonim</strong> skadojnë brenda 7 ditëve — Klikoni për të parë</div>}
      {(s.debtors??0)>0 && <div className="alert al-rd" style={{cursor:'pointer'}} onClick={()=>setPage('payments')}>🔴 <strong>{s.debtors} klientë</strong> kanë borxh — Klikoni për të menaxhuar</div>}
      {(s.active??0)===0 && <div className="alert al-bl">ℹ️ Dashboardi është gati! Filloni duke shtuar anëtarët e parë nga "Anëtarët".</div>}

      <div className="sg">
        <StatCard icon="👥" label="Anëtarë Aktivë"    value={s.active??0}                   change="abonim aktiv" up/>
        <StatCard icon="💰" label="Të Ardhura Mujore" value={fmtNum(s.paidMonth??0)+' L'}   change="këtë muaj" up/>
        <StatCard icon="🚪" label="Check-ins Sot"     value={s.checkins??0}                 change="hyrje sot" up/>
        <StatCard icon="⏰" label="Skadojnë (7 ditë)" value={s.expiring??0}                 change="kontakto ata"/>
        <StatCard icon="💸" label="Borxhe"             value={fmtNum(s.debt??0)+' L'}       change={`${s.debtors??0} klientë`}/>
        <StatCard icon="💳" label="Pagesa Sot"         value={fmtNum(s.paidToday??0)+' L'}  change="sot" up/>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-hd"><div className="card-t">📈 Të Ardhurat {new Date().getFullYear()}</div></div>
          <div className="card-b"><BarChart data={revArr}/></div>
        </div>
        <div className="card">
          <div className="card-hd"><div className="card-t">⏰ Abonimet që Skadojnë</div><span className="bdg bdg-am">{(expiring||[]).length}</span></div>
          {(expiring||[]).length===0 ? <Empty icon="✅" title="Asnjë abonim skadon shpejt"/> : (
            <div className="tw"><table>
              <thead><tr><th>Anëtari</th><th>Plan</th><th>Skadon</th><th></th></tr></thead>
              <tbody>{(expiring||[]).slice(0,6).map(m=>(
                <tr key={m.id}>
                  <td><div className="mc"><Avatar color={m.avatar_color} name={m.full_name} size="sm"/><div className="mn">{m.full_name}</div></div></td>
                  <td><span className="bdg bdg-gy">{m.plan_name||'—'}</span></td>
                  <td><span className="bdg bdg-am">{m.days_remaining===0?'Sot':m.days_remaining+' ditë'}</span></td>
                  <td><button className="btn btn-g btn-xs" onClick={()=>setPage('payments')}>📩</button></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-hd"><div className="card-t">🚪 Check-ins Sot</div><span className="bdg bdg-gr">{(ciToday||[]).length}</span></div>
          {(ciToday||[]).length===0 ? <Empty icon="🚪" title="Asnjë hyrje sot ende"/> : (
            <div>{(ciToday||[]).map((c,i)=>(
              <div key={c.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:i<ciToday.length-1?'1px solid var(--g100)':'none'}}>
                <div className="mc"><Avatar color={c.avatar_color} name={c.member_name} size="sm"/><div><div className="mn">{c.member_name}</div><div className="ms">{c.plan_name||'—'}</div></div></div>
                <span style={{fontSize:11,color:'var(--g400)'}}>{fmtTime(c.checked_in_at)}</span>
              </div>
            ))}</div>
          )}
        </div>
        <div className="card">
          <div className="card-hd"><div className="card-t">💸 Klientë me Borxh</div><span className="bdg bdg-rd">{(unpaid||[]).length}</span></div>
          {(unpaid||[]).length===0 ? <Empty icon="💚" title="Asnjë borxh"/> : (
            <div className="tw"><table>
              <thead><tr><th>Anëtari</th><th>Borxhi</th><th></th></tr></thead>
              <tbody>{(unpaid||[]).map(m=>(
                <tr key={m.id}>
                  <td><div className="mc"><Avatar color={m.avatar_color} name={m.full_name} size="sm"/><div className="mn">{m.full_name}</div></div></td>
                  <td style={{color:'var(--rd)',fontWeight:700}}>{fmtNum(m.total_debt)} L</td>
                  <td><button className="btn btn-success btn-xs" onClick={()=>setPage('payments')}>Paguaj</button></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── QR CHECK-IN ─────────────────────────────────────────
function CheckIn({ gymId }) {
  const { data: history, reload } = useAsync(() => getTodayCheckins(gymId), [gymId])
  const [result,  setResult]  = useState(null)
  const [search,  setSearch]  = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [idx, setIdx] = useState(0)
  const [tab, setTab] = useState('scanner') // scanner | manual | history

  const showResult = (r) => {
    setResult(r)
    r.success ? toast.success(r.already_checked ? `${r.member_name} — tashmë i regjistruar` : `✅ ${r.member_name} — Hyrja u regjistrua!`)
              : toast.error(`❌ ${r.message}`)
    setTimeout(() => setResult(null), 5000)
  }

  const simulate = async () => {
    setLoading(true)
    try {
      const members = await getMembers(gymId)
      if (!members.length) { toast.error('Asnjë anëtar — shto anëtarë fillimisht'); return }
      const m = members[idx % members.length]; setIdx(i=>i+1)
      showResult(await processQRCheckin(gymId, m.qr_code))
      reload()
    } catch(e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const doSearch = async (v) => {
    setSearch(v)
    if (!v.trim()) { setSearchResults([]); return }
    const all = await getMembers(gymId, v)
    setSearchResults(all.slice(0,5))
  }

  const doManual = async (memberId) => {
    setLoading(true)
    try {
      await manualCheckin(gymId, memberId)
      toast.success('✅ Hyrja u regjistrua!')
      setSearch(''); setSearchResults([]); reload()
    } catch(e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="page-in">
      <div className="ph"><div><div className="pt">QR Check-in</div><div className="ps">Regjistro hyrjen e anëtarëve</div></div></div>

      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {[['scanner','📷 Scanner'],['manual','⌨️ Manual'],['history','📋 Historia']].map(([k,l])=>(
          <button key={k} className={`chip ${tab===k?'active':''}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>

      {tab==='scanner' && (
        <div className="g2">
          <div>
            <div className="card" style={{marginBottom:16}}>
              <div className="card-hd"><div className="card-t">📷 Scanner QR</div></div>
              <div className="card-b">
                <div style={{border:'2px dashed var(--g200)',borderRadius:16,padding:32,textAlign:'center',cursor:loading?'wait':'pointer',transition:'all .2s',marginBottom:14}}
                  onClick={simulate}
                  onMouseEnter={e=>{if(!loading)e.currentTarget.style.borderColor='var(--g900)'}}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='var(--g200)'}>
                  <div style={{width:160,height:160,margin:'0 auto 20px',position:'relative',borderRadius:12,background:'var(--g100)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                    <span style={{fontSize:72,opacity:.12}}>▦</span>
                    {['tl','tr','bl','br'].map(p=>(
                      <div key={p} style={{position:'absolute',width:22,height:22,
                        [p.includes('t')?'top':'bottom']:8,[p.includes('l')?'left':'right']:8,
                        borderColor:'var(--g900)',borderStyle:'solid',
                        borderWidth:p==='tl'?'2px 0 0 2px':p==='tr'?'2px 2px 0 0':p==='bl'?'0 0 2px 2px':'0 2px 2px 0',
                        borderRadius:p==='tl'?'2px 0 0 0':p==='tr'?'0 2px 0 0':p==='bl'?'0 0 0 2px':'0 0 2px 0'}}/>
                    ))}
                    {loading && <div style={{position:'absolute',inset:0,background:'rgba(255,255,255,.8)',display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spn"/></div>}
                  </div>
                  <div style={{fontWeight:600,fontSize:15,marginBottom:6}}>{loading?'Duke procesuar...':'Kliko për Simulim Scan'}</div>
                  <div style={{fontSize:12,color:'var(--g400)'}}>Në pajisje reale: kamera aktivizohet automatikisht</div>
                </div>

                {result && (
                  result.success ? (
                    <div style={{background:'var(--grl)',border:'1px solid #bbf7d0',borderRadius:12,padding:18,display:'flex',alignItems:'center',gap:16}}>
                      <div style={{width:50,height:50,borderRadius:'50%',background:'var(--gr)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:24,flexShrink:0}}>✓</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:17,color:'var(--gr)'}}>{result.already_checked?'Tashmë i Regjistruar':'Hyrja u Regjistrua!'}</div>
                        <div style={{fontWeight:600,fontSize:15,marginTop:2}}>{result.member_name}</div>
                        <div style={{fontSize:12,color:'var(--g500)',marginTop:2}}>{result.plan_name} {result.days_remaining!=null?`• ${result.days_remaining} ditë mbeten`:''}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="alert al-rd">❌ <strong>{result.member_name||'I panjohur'}</strong> — {result.message}</div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-hd"><div className="card-t">Check-ins Sot</div><span className="bdg bdg-gr">{(history||[]).length}</span></div>
            <div style={{maxHeight:480,overflowY:'auto'}}>
              {(history||[]).length===0 ? <Empty icon="🚪" title="Asnjë hyrje sot"/> :
              (history||[]).map(c=>(
                <div key={c.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:'1px solid var(--g100)'}}>
                  <div className="mc"><Avatar color={c.avatar_color} name={c.member_name} size="sm"/><div><div className="mn">{c.member_name}</div><div className="ms">{c.plan_name||'—'} • {c.method==='qr'?'📷':'⌨️'}</div></div></div>
                  <span style={{fontSize:11,color:'var(--g400)'}}>{fmtTime(c.checked_in_at)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==='manual' && (
        <div className="g2">
          <div className="card">
            <div className="card-hd"><div className="card-t">⌨️ Kërko Anëtarin</div></div>
            <div className="card-b">
              <div className="srw"><span className="sri">🔍</span><input autoFocus placeholder="Kërko me emër ose telefon..." value={search} onChange={e=>doSearch(e.target.value)}/></div>
              {searchResults.length===0 && search && <div style={{textAlign:'center',padding:'20px 0',color:'var(--g400)',fontSize:13}}>Asnjë anëtar nuk u gjet</div>}
              {searchResults.map(m=>(
                <div key={m.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid var(--g100)'}}>
                  <div className="mc">
                    <Avatar color={m.avatar_color} name={m.full_name}/>
                    <div>
                      <div className="mn">{m.full_name}</div>
                      <div className="ms">{m.plan_name||'Pa abonim'} • {m.phone||'—'}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <StatusBadge status={memberStatus(m)}/>
                    <button className="btn btn-p btn-sm" onClick={()=>doManual(m.id)} disabled={loading}>Regjistro Hyrjen</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-hd"><div className="card-t">Check-ins Sot</div><span className="bdg bdg-gr">{(history||[]).length}</span></div>
            <div style={{maxHeight:480,overflowY:'auto'}}>
              {(history||[]).length===0 ? <Empty icon="🚪" title="Asnjë hyrje sot"/> :
              (history||[]).map(c=>(
                <div key={c.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:'1px solid var(--g100)'}}>
                  <div className="mc"><Avatar color={c.avatar_color} name={c.member_name} size="sm"/><div><div className="mn">{c.member_name}</div><div className="ms">{c.plan_name||'—'}</div></div></div>
                  <span style={{fontSize:11,color:'var(--g400)'}}>{fmtTime(c.checked_in_at)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==='history' && (
        <div className="card">
          <div className="card-hd"><div className="card-t">Historiku i Hyrjeve — Sot</div><span className="bdg bdg-gr">{(history||[]).length}</span></div>
          <div className="tw"><table>
            <thead><tr><th>Anëtari</th><th>Plani</th><th>Metoda</th><th>Ora</th></tr></thead>
            <tbody>
              {(history||[]).length===0?<tr><td colSpan={4}><Empty icon="🚪" title="Asnjë hyrje sot"/></td></tr>:
              (history||[]).map(c=>(
                <tr key={c.id}>
                  <td><div className="mc"><Avatar color={c.avatar_color} name={c.member_name} size="sm"/><div className="mn">{c.member_name}</div></div></td>
                  <td><span className="bdg bdg-gy">{c.plan_name||'—'}</span></td>
                  <td><span className="bdg bdg-bl">{c.method==='qr'?'📷 QR':'⌨️ Manual'}</span></td>
                  <td style={{fontSize:12,color:'var(--g500)'}}>{fmtTime(c.checked_in_at)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  )
}

// ─── MEMBERS ─────────────────────────────────────────────
function Members({ gymId, gymName }) {
  const [filter,   setFilter]   = useState('all')
  const [search,   setSearch]   = useState('')
  const [showAdd,  setShowAdd]  = useState(false)
  const [profile,  setProfile]  = useState(null)
  const [renew,    setRenew]    = useState(null)
  const [selPlan,  setSelPlan]  = useState('')
  const { data: members, loading, reload } = useAsync(() => getMembers(gymId, search), [gymId, search])
  const { data: plans }  = useAsync(() => getPlans(gymId), [gymId])

  const filtered = (members||[]).filter(m => {
    if (filter==='all') return true
    const s = memberStatus(m)
    if (filter==='active')   return s==='active'||s==='expiring'
    if (filter==='expiring') return s==='expiring'
    if (filter==='expired')  return s==='expired'
    if (filter==='frozen')   return s==='frozen'
    return true
  })

  const doDelete = async (m) => {
    if (!confirm(`Fshi ${m.full_name}?`)) return
    // Soft delete
    const { supabase } = await import('../../lib/supabase')
    await supabase.from('members').update({ is_active:false }).eq('id', m.id)
    toast.success('Anëtari u fshi'); reload()
  }

  if (profile) return (
    <MemberProfile memberId={profile} gymId={gymId} plans={plans||[]} onBack={()=>{setProfile(null);reload()}}/>
  )

  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">Anëtarët</div><div className="ps">{filtered.length} të shfaqur • {(members||[]).length} total</div></div>
        <div className="pa">
          <button className="btn btn-s" onClick={reload}>↻</button>
          <button className="btn btn-p" onClick={()=>setShowAdd(true)}>+ Anëtar i Ri</button>
        </div>
      </div>

      <div className="srw"><span className="sri">🔍</span><input placeholder="Kërko me emër, telefon ose email..." value={search} onChange={e=>setSearch(e.target.value)}/></div>

      <div className="chips">
        {[['all','Të Gjithë'],['active','Aktivë'],['expiring','Skadojnë'],['expired','Skaduar'],['frozen','❄️ Frozen']].map(([k,l])=>(
          <button key={k} className={`chip ${filter===k?'active':''}`} onClick={()=>setFilter(k)}>{l}</button>
        ))}
      </div>

      {loading ? <Loading/> : (
        <div className="card">
          <div className="tw"><table>
            <thead><tr><th>Anëtari</th><th>Telefon</th><th>Plani</th><th>Statusi</th><th>Skadon</th><th>Check-ins</th><th>QR</th><th>Veprime</th></tr></thead>
            <tbody>
              {filtered.length===0 ? <tr><td colSpan={8}><Empty icon="👥" title="Asnjë anëtar" sub="Kliko '+ Anëtar i Ri' për të filluar"/></td></tr> :
              filtered.map(m=>(
                <tr key={m.id} style={{cursor:'pointer'}} onClick={()=>setProfile(m.id)}>
                  <td><div className="mc"><Avatar color={m.avatar_color} name={m.full_name}/><div><div className="mn">{m.full_name}</div><div className="ms">{m.email||'—'}</div></div></div></td>
                  <td style={{color:'var(--g500)'}}>{m.phone||'—'}</td>
                  <td><span className="bdg bdg-gy">{m.plan_name||'Pa abonim'}</span></td>
                  <td><StatusBadge status={memberStatus(m)}/></td>
                  <td style={{fontSize:12,color:m.days_remaining<=3?'var(--rd)':'var(--g500)'}}>{m.end_date?fmtDate(m.end_date):'—'}</td>
                  <td style={{fontWeight:600,textAlign:'center'}}>{m.checkins_this_month??0}</td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div style={{cursor:'pointer'}} title="Printo QR" onClick={()=>printQR(m.full_name, m.qr_code)}>
                      <QRCodeSVG value={m.qr_code} size={36}/>
                    </div>
                  </td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div style={{display:'flex',gap:4}}>
                      <button className="btn btn-p btn-xs" onClick={()=>{setRenew(m);setSelPlan(plans?.[0]?.id||'')}}>💳</button>
                      <button className="btn btn-danger btn-xs" onClick={()=>doDelete(m)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {showAdd && <AddMemberModal gymId={gymId} plans={plans||[]} gymName={gymName} onClose={()=>setShowAdd(false)} onSave={reload}/>}

      {renew && (
        <Modal title="💳 Rinovim Abonoimi" onClose={()=>setRenew(null)} footer={
          <><button className="btn btn-s" onClick={()=>setRenew(null)}>Anulo</button>
          <button className="btn btn-p" onClick={async()=>{
            if(!selPlan){toast.error('Zgjidh planin');return}
            try{await renewMembership(gymId,renew.id,selPlan);toast.success('✅ U rinovua!');setRenew(null);reload()}
            catch(e){toast.error(e.message)}
          }}>✅ Rinovo</button></>
        }>
          <div style={{background:'var(--g50)',borderRadius:10,padding:14,marginBottom:16}}>
            <div style={{fontWeight:600}}>{renew.full_name}</div>
            <div style={{fontSize:12,color:'var(--g500)',marginTop:4}}>Plani aktual: {renew.plan_name||'Pa abonim'} • Skadon: {renew.end_date?fmtDate(renew.end_date):'—'}</div>
          </div>
          <div className="fgp">
            <label>Plani i Ri</label>
            <select value={selPlan} onChange={e=>setSelPlan(e.target.value)}>
              <option value="">— Zgjidh planin —</option>
              {(plans||[]).map(p=><option key={p.id} value={p.id}>{p.emoji} {p.name} — {fmtNum(p.price)} ALL ({p.duration_days} ditë)</option>)}
            </select>
          </div>
          {selPlan && (() => {
            const p = (plans||[]).find(x=>x.id===selPlan)
            return p ? <div className="alert al-gr" style={{marginTop:12}}>✅ {p.name} — skadon {fmtDate(addDays(today(), p.duration_days))} — {fmtNum(p.price)} ALL</div> : null
          })()}
        </Modal>
      )}
    </div>
  )
}

function AddMemberModal({ gymId, plans, gymName, onClose, onSave }) {
  const [saving,    setSaving]    = useState(false)
  const [err,       setErr]       = useState('')
  const [magicLink, setMagicLink] = useState(true)
  const [limitInfo, setLimitInfo] = useState(null)

  // Kontrollo limitin kur hapet modal
  useState(() => {
    import('../../lib/db').then(({ canAddMember }) => {
      canAddMember(gymId).then(info => setLimitInfo(info))
    })
  }, [])

  const PLAN_LABELS = { starter:'Starter (max 100)', pro:'Pro (max 500)', business:'Business (pa limit)' }

  return (
    <Modal title="👤 Anëtar i Ri" onClose={onClose} footer={
      <><button className="btn btn-s" onClick={onClose}>Anulo</button>
      <button className="btn btn-p" form="addForm" type="submit" disabled={saving||limitInfo?.allowed===false}>
        {saving ? '⏳ Duke shtuar...' : '✅ Shto Anëtarin'}
      </button></>
    }>
      {/* Limit info */}
      {limitInfo && (
        <div className={`alert ${limitInfo.allowed ? 'al-bl' : 'al-rd'}`} style={{marginBottom:12}}>
          {limitInfo.allowed
            ? `📊 ${limitInfo.count} / ${limitInfo.limit === Infinity ? '∞' : limitInfo.limit} anëtarë — Paketa ${PLAN_LABELS[limitInfo.plan]||limitInfo.plan}`
            : `❌ Ke arritur limitin! ${limitInfo.count}/${limitInfo.limit} anëtarë. Upgrade planin.`}
        </div>
      )}
      {err && <div className="alert al-rd" style={{marginBottom:12}}>❌ {err}</div>}
      <form id="addForm" onSubmit={async e=>{
        e.preventDefault(); setSaving(true); setErr('')
        const fd = new FormData(e.target)
        try {
          await addMember(gymId, {
            firstName: fd.get('fn'), lastName: fd.get('ln'),
            phone: fd.get('ph'), email: fd.get('em'),
            birthday: fd.get('bd')||null, gender: fd.get('gn'),
            notes: fd.get('no'), planId: fd.get('pl'), method:'cash',
            sendMagicLink: magicLink,
          }, gymName)
          const email = fd.get('em')
          if (magicLink && email) {
            toast.success(`✅ Anëtari u shtua!\n📧 Magic Link u dërgua te ${email}`)
          } else {
            toast.success('✅ Anëtari u shtua!')
          }
          onSave(); onClose()
        } catch(e) { setErr(e.message) }
        finally { setSaving(false) }
      }}>
        <div className="fg c2">
          <div className="fgp"><label>Emri *</label><input name="fn" required placeholder="Emri..."/></div>
          <div className="fgp"><label>Mbiemri *</label><input name="ln" required placeholder="Mbiemri..."/></div>
        </div>
        <div className="fg c2">
          <div className="fgp"><label>Telefon</label><input name="ph" placeholder="+355 69..."/></div>
          <div className="fgp"><label>Email</label><input name="em" type="email" placeholder="email@..."/></div>
        </div>
        <div className="fg c2">
          <div className="fgp"><label>Datëlindja</label><input name="bd" type="date"/></div>
          <div className="fgp"><label>Gjinia</label><select name="gn"><option value="M">Mashkull</option><option value="F">Femër</option></select></div>
        </div>
        <div className="fg">
          <div className="fgp"><label>Plani i Abonoimit</label>
            <select name="pl">
              <option value="">— Pa abonim —</option>
              {plans.map(p=><option key={p.id} value={p.id}>{p.emoji} {p.name} — {fmtNum(p.price)} ALL ({p.duration_days} ditë)</option>)}
            </select>
          </div>
        </div>
        <div className="fg" style={{marginBottom:0}}>
          <div className="fgp"><label>Shënime</label><textarea name="no" placeholder="Opsionale..."/></div>
        </div>

        {/* Magic Link */}
        <div style={{marginTop:16,background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:10,padding:14}}>
          <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
            <input type="checkbox" id="ml" checked={magicLink} onChange={e=>setMagicLink(e.target.checked)}
              style={{width:16,height:16,marginTop:2,flexShrink:0,cursor:'pointer'}}/>
            <div>
              <label htmlFor="ml" style={{fontSize:13,fontWeight:600,color:'#15803d',cursor:'pointer',display:'block',marginBottom:3}}>
                📧 Dërgo Magic Link automatikisht
              </label>
              <div style={{fontSize:12,color:'#16a34a',lineHeight:1.6}}>
                Anëtari merr email me linkun e regjistrimit. <strong>Kërkon email.</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Register link to copy */}
        <div style={{marginTop:10,background:'#eff6ff',border:'1px solid #dbeafe',borderRadius:10,padding:14}}>
          <div style={{fontSize:12,fontWeight:600,color:'#1e40af',marginBottom:8}}>📋 Ose kopjo dhe dërgo manualisht:</div>
          <div style={{background:'#fff',border:'1px solid #bfdbfe',borderRadius:8,padding:'8px 12px',fontSize:12,fontFamily:'monospace',color:'#1e40af',display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}>
            <span style={{wordBreak:'break-all'}}>{window.location.origin}/register</span>
            <button type="button" className="btn btn-g btn-xs" style={{flexShrink:0}} onClick={()=>{
              navigator.clipboard.writeText(window.location.origin+'/register')
              toast.success('✅ Linku u kopjua!')
            }}>📋 Kopjo</button>
          </div>
          <div style={{fontSize:11,color:'#3b82f6',marginTop:6,lineHeight:1.6}}>
            I jep anëtarit këtë link + emailin e tij. Hyn vetë, vendos fjalëkalimin, pa ndihmën tënde.
          </div>
        </div>
      </form>
    </Modal>
  )
}

function MemberProfile({ memberId, gymId, plans, onBack }) {
  const { data: m, loading, reload } = useAsync(async () => {
    const { supabase } = await import('../../lib/supabase')
    const { data } = await supabase.from('members_with_status').select('*').eq('id', memberId).eq('gym_id', gymId).single()
    return data
  }, [memberId])
  const { data: mss, reload: reloadMss } = useAsync(() => getMemberships(gymId, memberId), [memberId])
  const { data: payments } = useAsync(async () => {
    const { supabase } = await import('../../lib/supabase')
    const { data } = await supabase.from('payments').select('*, membership:memberships(plan:plans(name))').eq('member_id', memberId).eq('gym_id', gymId).order('created_at', { ascending:false })
    return data ?? []
  }, [memberId])
  const { data: checkins } = useAsync(async () => {
    const { supabase } = await import('../../lib/supabase')
    const { data } = await supabase.from('check_ins').select('*').eq('member_id', memberId).eq('gym_id', gymId).order('checked_in_at', { ascending:false }).limit(20)
    return data ?? []
  }, [memberId])
  const [tab, setTab] = useState('overview')
  const [showRenew, setShowRenew] = useState(false)
  const [selPlan,   setSelPlan]   = useState('')
  const [editing,   setEditing]   = useState(false)
  const [editForm,  setEditForm]  = useState(null)

  if (loading||!m) return <Loading/>

  const doFreeze = async (msId, frozen) => {
    frozen ? await unfreezeMembership(msId) : await freezeMembership(msId)
    toast.success(frozen?'🔥 Abonimi u shkrij!':'❄️ Abonimi u fryza!')
    reload(); reloadMss()
  }

  const doRenew = async () => {
    if (!selPlan) return
    await renewMembership(gymId, m.id, selPlan)
    toast.success('✅ Abonimi u rinovua!')
      // SMS konfirmim pagese
      try {
        const {data:mem} = await supabase.from('members').select('phone,first_name,last_name').eq('id',memberId).single()
        const {data:gym} = await supabase.from('gyms').select('name,phone').eq('id',gymId).single()
        if (mem?.phone) await smsPaymentConfirm({ member:mem, amount:form.amount||0, plan:{name:selPlan?.name}, gym, channel:'sms' })
      } catch(e){}; setShowRenew(false); reload(); reloadMss()
  }

  const doEdit = async () => {
    const { supabase } = await import('../../lib/supabase')
    await supabase.from('members').update({ first_name:editForm.fn, last_name:editForm.ln, phone:editForm.ph, email:editForm.em, birthday:editForm.bd||null, notes:editForm.no }).eq('id', m.id)
    toast.success('✅ U ruajt!'); setEditing(false); reload()
  }

  const activeMembership = (mss||[]).find(ms=>ms.status==='active')
  const frozenMembership = (mss||[]).find(ms=>ms.status==='frozen')

  return (
    <div className="page-in">
      <div style={{marginBottom:16}}><button className="btn btn-g btn-sm" onClick={onBack}>← Kthehu te lista</button></div>
      <div className="card" style={{marginBottom:16}}>
        <div style={{padding:20,borderBottom:'1px solid var(--g100)',display:'flex',gap:16,alignItems:'flex-start',flexWrap:'wrap'}}>
          <Avatar color={m.avatar_color} name={m.full_name} size="lg"/>
          <div style={{flex:1,minWidth:200}}>
            <div style={{fontFamily:'var(--fs)',fontSize:22,marginBottom:8}}>{m.full_name}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
              <StatusBadge status={memberStatus(m)}/>
              {m.plan_name&&<span className="bdg bdg-gy">{m.plan_emoji} {m.plan_name}</span>}
              {m.phone&&<span style={{fontSize:12,color:'var(--g500)'}}>📞 {m.phone}</span>}
              {m.email&&<span style={{fontSize:12,color:'var(--g500)'}}>📧 {m.email}</span>}
              {m.birthday&&<span style={{fontSize:12,color:'var(--g500)'}}>🎂 {fmtDate(m.birthday)}</span>}
              {m.gender&&<span style={{fontSize:12,color:'var(--g500)'}}>{m.gender==='M'?'♂ Mashkull':'♀ Femër'}</span>}
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="btn btn-p btn-sm" onClick={()=>setShowRenew(true)}>💳 Rinovim</button>
              {activeMembership&&<button className="btn btn-s btn-sm" onClick={()=>doFreeze(activeMembership.id,false)}>❄️ Freeze</button>}
              {frozenMembership&&<button className="btn btn-s btn-sm" onClick={()=>doFreeze(frozenMembership.id,true)}>🔥 Shkrij</button>}
              <button className="btn btn-s btn-sm" onClick={()=>{setEditing(true);setEditForm({fn:m.first_name,ln:m.last_name,ph:m.phone||'',em:m.email||'',bd:m.birthday||'',no:m.notes||''})}}>✏️ Edito</button>
              {m.email&&<button className="btn btn-success btn-sm" onClick={async()=>{
                try{const{sendMagicLink}=await import('../../lib/db');await sendMagicLink(m.email,'Palestra');toast.success('📧 Magic Link u dërgua!')}
                catch(e){toast.error(e.message)}
              }}>📧 Magic Link</button>}
              <button className="btn btn-s btn-sm" onClick={()=>{
                const link = window.location.origin+'/register'
                navigator.clipboard.writeText(link)
                toast.success('✅ Linku u kopjua! Dërgo: ' + link)
              }}>📋 Kopjo Linkun</button>
            </div>
          </div>
          {/* QR Code */}
          <div style={{textAlign:'center',cursor:'pointer'}} onClick={()=>printQR(m.full_name, m.qr_code)} title="Kliko për të printuar">
            <QRCodeSVG value={m.qr_code} size={90}/>
            <div style={{fontSize:10,color:'var(--g400)',marginTop:6}}>Kliko → Printo</div>
          </div>
        </div>

        <div style={{padding:'0 20px 20px'}}>
          <div style={{display:'flex',borderBottom:'1px solid var(--g200)',marginTop:16,marginBottom:16}}>
            {[['overview','📊 Pasqyra'],['memberships','🎫 Abonimet'],['payments','💰 Pagesat'],['checkins','🚪 Check-ins']].map(([k,l])=>(
              <div key={k} style={{padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:500,color:tab===k?'var(--g900)':'var(--g500)',borderBottom:tab===k?'2px solid var(--g900)':'2px solid transparent',transition:'all .12s',whiteSpace:'nowrap'}} onClick={()=>setTab(k)}>{l}</div>
            ))}
          </div>

          {tab==='overview' && (
            <div>
              <div className="g3" style={{marginBottom:16}}>
                {[
                  [m.checkins_this_month??0,'Muaj','Check-ins / Muaj'],
                  [m.days_remaining!=null&&m.days_remaining>=0?m.days_remaining+' ditë':'Skaduar','','Ditë të Mbetura'],
                  [fmtNum(m.total_debt??0)+' L','','Borxhi Total'],
                ].map(([v,,l],i)=>(
                  <div key={i} style={{background:'var(--g50)',border:'1px solid var(--g200)',borderRadius:10,padding:16,textAlign:'center'}}>
                    <div style={{fontFamily:'var(--fs)',fontSize:24,marginBottom:4}}>{v}</div>
                    <div style={{fontSize:11,color:'var(--g500)'}}>{l}</div>
                  </div>
                ))}
              </div>
              {m.notes&&<div style={{background:'var(--g50)',borderRadius:8,padding:12,fontSize:13,color:'var(--g600)'}}>📝 {m.notes}</div>}
            </div>
          )}

          {tab==='memberships' && (
            <div>
              {(!mss||mss.length===0)?<Empty icon="🎫" title="Asnjë abonim"/>:(
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {mss.map(ms=>(
                    <div key={ms.id} style={{background:'var(--g50)',border:'1px solid var(--g200)',borderRadius:10,padding:14,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:14}}>{ms.plan?.emoji} {ms.plan?.name} — {fmtNum(ms.price_paid)} L</div>
                        <div style={{fontSize:12,color:'var(--g500)',marginTop:4}}>{ms.start_date} → {ms.end_date}</div>
                      </div>
                      <div style={{display:'flex',gap:8,alignItems:'center'}}>
                        <span className={`bdg bdg-${ms.status==='active'?'gr':ms.status==='frozen'?'gy':'rd'}`}>{ms.status}</span>
                        {ms.status==='active'&&<button className="btn btn-g btn-xs" onClick={()=>doFreeze(ms.id,false)}>❄️</button>}
                        {ms.status==='frozen'&&<button className="btn btn-g btn-xs" onClick={()=>doFreeze(ms.id,true)}>🔥</button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab==='payments' && (
            (!payments||payments.length===0)?<Empty icon="💰" title="Asnjë pagesë"/>:(
              <div className="tw"><table>
                <thead><tr><th>#Fatura</th><th>Plani</th><th>Shuma</th><th>Metoda</th><th>Data</th><th>Statusi</th></tr></thead>
                <tbody>{payments.map(p=>(
                  <tr key={p.id}>
                    <td style={{fontFamily:'monospace',fontSize:11,color:'var(--g400)'}}>{p.invoice_number}</td>
                    <td><span className="bdg bdg-gy">{p.membership?.plan?.name||'—'}</span></td>
                    <td style={{fontWeight:600}}>{fmtNum(p.amount)} L</td>
                    <td style={{color:'var(--g500)'}}>💵 {p.method}</td>
                    <td style={{fontSize:12,color:'var(--g500)'}}>{fmtDate(p.created_at)}</td>
                    <td>{p.status==='paid'?<span className="bdg bdg-gr">Paguar</span>:<span className="bdg bdg-am">Borxh</span>}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            )
          )}

          {tab==='checkins' && (
            (!checkins||checkins.length===0)?<Empty icon="🚪" title="Asnjë hyrje"/>:(
              <div className="tw"><table>
                <thead><tr><th>Data</th><th>Ora</th><th>Metoda</th></tr></thead>
                <tbody>{checkins.map(c=>(
                  <tr key={c.id}>
                    <td>{fmtDate(c.checked_in_at)}</td>
                    <td style={{color:'var(--g500)'}}>{fmtTime(c.checked_in_at)}</td>
                    <td><span className="bdg bdg-bl">{c.method==='qr'?'📷 QR':'⌨️ Manual'}</span></td>
                  </tr>
                ))}</tbody>
              </table></div>
            )
          )}
        </div>
      </div>

      {showRenew && (
        <Modal title="💳 Rinovim Abonoimi" onClose={()=>setShowRenew(false)} footer={
          <><button className="btn btn-s" onClick={()=>setShowRenew(false)}>Anulo</button>
          <button className="btn btn-p" onClick={doRenew} disabled={!selPlan}>✅ Rinovo</button></>
        }>
          <div className="fgp" style={{marginBottom:14}}>
            <label>Plani i Ri</label>
            <select value={selPlan} onChange={e=>setSelPlan(e.target.value)}>
              <option value="">— Zgjidh planin —</option>
              {plans.map(p=><option key={p.id} value={p.id}>{p.emoji} {p.name} — {fmtNum(p.price)} ALL</option>)}
            </select>
          </div>
        </Modal>
      )}

      {editing && editForm && (
        <Modal title="✏️ Edito Anëtarin" onClose={()=>setEditing(false)} footer={
          <><button className="btn btn-s" onClick={()=>setEditing(false)}>Anulo</button>
          <button className="btn btn-p" onClick={doEdit}>💾 Ruaj</button></>
        }>
          <div className="fg c2">
            <div className="fgp"><label>Emri</label><input value={editForm.fn} onChange={e=>setEditForm(f=>({...f,fn:e.target.value}))}/></div>
            <div className="fgp"><label>Mbiemri</label><input value={editForm.ln} onChange={e=>setEditForm(f=>({...f,ln:e.target.value}))}/></div>
          </div>
          <div className="fg c2">
            <div className="fgp"><label>Telefon</label><input value={editForm.ph} onChange={e=>setEditForm(f=>({...f,ph:e.target.value}))}/></div>
            <div className="fgp"><label>Email</label><input value={editForm.em} onChange={e=>setEditForm(f=>({...f,em:e.target.value}))}/></div>
          </div>
          <div className="fg c2">
            <div className="fgp"><label>Datëlindja</label><input type="date" value={editForm.bd} onChange={e=>setEditForm(f=>({...f,bd:e.target.value}))}/></div>
          </div>
          <div className="fg" style={{marginBottom:0}}>
            <div className="fgp"><label>Shënime</label><textarea value={editForm.no} onChange={e=>setEditForm(f=>({...f,no:e.target.value}))}/></div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── MEMBERSHIPS ─────────────────────────────────────────
function Memberships({ gymId }) {
  const [filter, setFilter] = useState('active')
  const [renew,  setRenew]  = useState(null)
  const [selPlan,setSelPlan]= useState('')
  const { data: mss,   loading, reload } = useAsync(() => getMemberships(gymId), [gymId])
  const { data: plans } = useAsync(() => getPlans(gymId), [gymId])
  const filtered = (mss||[]).filter(ms => ms.status === filter)

  return (
    <div className="page-in">
      <div className="ph"><div><div className="pt">Abonimet</div><div className="ps">Menaxho planet dhe abonimet</div></div></div>

      <div className="card" style={{marginBottom:16}}>
        <div className="card-hd"><div className="card-t">🎫 Planet e Disponueshme</div></div>
        <div className="card-b">
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:10}}>
            {(plans||[]).map(p=>(
              <div key={p.id} style={{background:'var(--g50)',border:'1.5px solid var(--g200)',borderRadius:12,padding:14,textAlign:'center',transition:'all .15s',cursor:'default'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--g900)';e.currentTarget.style.boxShadow='var(--shm)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--g200)';e.currentTarget.style.boxShadow='none'}}>
                <div style={{fontSize:24,marginBottom:8}}>{p.emoji}</div>
                <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>{p.name}</div>
                <div style={{fontFamily:'var(--fs)',fontSize:20,marginBottom:2}}>{fmtNum(p.price)}</div>
                <div style={{fontSize:10,color:'var(--g400)'}}>ALL / {p.duration_days} ditë</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-hd">
          <div className="card-t">Lista e Abonimeve</div>
          <div style={{display:'flex',gap:6}}>
            {[['active','✅ Aktive'],['expired','❌ Skaduar'],['frozen','❄️ Frozen']].map(([k,l])=>(
              <button key={k} className={`chip ${filter===k?'active':''}`} onClick={()=>setFilter(k)}>{l}</button>
            ))}
          </div>
        </div>
        {loading?<Loading/>:(
          <div className="tw"><table>
            <thead><tr><th>Anëtari</th><th>Plani</th><th>Filloi</th><th>Skadon</th><th>Çmimi</th><th>Statusi</th><th>Veprime</th></tr></thead>
            <tbody>
              {filtered.length===0?<tr><td colSpan={7}><Empty icon="🎫" title={`Asnjë abonim ${filter}`}/></td></tr>:
              filtered.map(ms=>{
                const name=`${ms.member?.first_name||''} ${ms.member?.last_name||''}`
                return(
                  <tr key={ms.id}>
                    <td><div className="mc"><Avatar color={ms.member?.avatar_color||0} name={name} size="sm"/><div className="mn">{name}</div></div></td>
                    <td><span className="bdg bdg-gy">{ms.plan?.emoji} {ms.plan?.name}</span></td>
                    <td style={{fontSize:12,color:'var(--g500)'}}>{ms.start_date}</td>
                    <td style={{fontSize:12,color:ms.status==='active'&&(new Date(ms.end_date)-new Date())/(86400000)<7?'var(--rd)':'var(--g500)'}}>{ms.end_date}</td>
                    <td style={{fontWeight:600}}>{fmtNum(ms.price_paid)} L</td>
                    <td><span className={`bdg bdg-${ms.status==='active'?'gr':ms.status==='frozen'?'gy':'rd'}`}>{ms.status}</span></td>
                    <td><div style={{display:'flex',gap:6}}>
                      <button className="btn btn-p btn-xs" onClick={()=>{setRenew(ms);setSelPlan(ms.plan_id||'')}}>💳</button>
                      {ms.status==='active'&&<button className="btn btn-g btn-xs" onClick={async()=>{await freezeMembership(ms.id);toast.success('❄️ U fryza!');reload()}}>❄️</button>}
                      {ms.status==='frozen'&&<button className="btn btn-g btn-xs" onClick={async()=>{await unfreezeMembership(ms.id);toast.success('🔥 U shkrij!');reload()}}>🔥</button>}
                    </div></td>
                  </tr>
                )
              })}
            </tbody>
          </table></div>
        )}
      </div>

      {renew&&(
        <Modal title="💳 Rinovim" onClose={()=>setRenew(null)} footer={
          <><button className="btn btn-s" onClick={()=>setRenew(null)}>Anulo</button>
          <button className="btn btn-p" onClick={async()=>{
            if(!selPlan)return
            await renewMembership(gymId,renew.member_id,selPlan)
            toast.success('✅ U rinovua!'); setRenew(null); reload()
          }}>✅ Rinovo</button></>
        }>
          <p style={{fontSize:13,marginBottom:14,color:'var(--g600)'}}>Anëtari: <strong>{renew.member?.first_name} {renew.member?.last_name}</strong></p>
          <div className="fgp"><label>Plani i Ri</label>
            <select value={selPlan} onChange={e=>setSelPlan(e.target.value)}>
              <option value="">— Zgjidh —</option>
              {(plans||[]).map(p=><option key={p.id} value={p.id}>{p.emoji} {p.name} — {fmtNum(p.price)} ALL ({p.duration_days}d)</option>)}
            </select>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── PAYMENTS ────────────────────────────────────────────
function Payments({ gymId }) {
  const { data: pays,  loading, reload } = useAsync(() => getPayments(gymId), [gymId])
  const { data: stats, reload: rs }      = useAsync(() => getPaymentStats(gymId), [gymId])
  const { data: members } = useAsync(() => getMembers(gymId), [gymId])
  const [showAdd, setShowAdd] = useState(false)
  const [filter,  setFilter]  = useState('all')
  const unpaid = (pays||[]).filter(p=>p.status==='unpaid')
  const s = stats||{today:0,month:0,debt:0,debtors:0}

  const filtered = (pays||[]).filter(p => filter==='all'||(filter==='paid'&&p.status==='paid')||(filter==='unpaid'&&p.status==='unpaid'))

  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">Pagesat</div><div className="ps">Histori dhe menaxhim i pagesave</div></div>
        <div className="pa">
          <button className="btn btn-s btn-sm" onClick={()=>{reload();rs()}}>↻</button>
          <button className="btn btn-p" onClick={()=>setShowAdd(true)}>+ Regjistro Pagesë</button>
        </div>
      </div>

      <div className="sg">
        <StatCard icon="✅" label="Paguar Sot"    value={fmtNum(s.today)+' L'}  change="sot" up/>
        <StatCard icon="📅" label="Paguar Muaj"   value={fmtNum(s.month)+' L'}  change="muaj" up/>
        <StatCard icon="💸" label="Borxhe"         value={fmtNum(s.debt)+' L'}   change={`${s.debtors} klientë`}/>
        <StatCard icon="#"  label="Total Pagesa"   value={(pays||[]).length}/>
      </div>

      {unpaid.length>0&&(
        <div className="alert al-rd">
          🔴 {unpaid.length} pagesa të papaguara — Borxhi total: <strong>{fmtNum(s.debt)} L</strong>
        </div>
      )}

      <div className="chips">
        {[['all','Të Gjitha'],['paid','✅ Paguara'],['unpaid','⏳ Borxhe']].map(([k,l])=>(
          <button key={k} className={`chip ${filter===k?'active':''}`} onClick={()=>setFilter(k)}>{l}</button>
        ))}
      </div>

      {loading?<Loading/>:(
        <div className="card">
          <div className="card-hd"><div className="card-t">Historiku i Pagesave</div></div>
          <div className="tw"><table>
            <thead><tr><th>#Fatura</th><th>Anëtari</th><th>Plani</th><th>Shuma</th><th>Metoda</th><th>Data</th><th>Statusi</th></tr></thead>
            <tbody>
              {filtered.length===0?<tr><td colSpan={7}><Empty icon="💰" title="Asnjë pagesë" sub="Pagesat shfaqen kur shtoni anëtarë me abonim"/></td></tr>:
              filtered.map(p=>(
                <tr key={p.id}>
                  <td style={{fontFamily:'monospace',fontSize:11,color:'var(--g400)'}}>{p.invoice_number}</td>
                  <td><div className="mc"><Avatar color={p.member?.avatar_color||0} name={`${p.member?.first_name||''} ${p.member?.last_name||''}`} size="sm"/><div className="mn">{p.member?.first_name} {p.member?.last_name}</div></div></td>
                  <td><span className="bdg bdg-gy">{p.membership?.plan?.name||'—'}</span></td>
                  <td style={{fontWeight:600}}>{fmtNum(p.amount)} L</td>
                  <td style={{color:'var(--g500)'}}>💵 {p.method}</td>
                  <td style={{fontSize:12,color:'var(--g500)'}}>{fmtDate(p.created_at)}</td>
                  <td>
                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                      {p.status==='paid'
                        ?<span className="bdg bdg-gr">✅ Paguar</span>
                        :<button className="btn btn-success btn-xs" onClick={async()=>{await markPaymentPaid(gymId,p.id);toast.success('✅ U pagua!');reload();rs()}}>💰 Paguaj</button>}
                      {p.status==='paid'&&<button className="btn btn-g btn-xs" title="Printo Faturën" onClick={()=>printInvoice({
                        invoice_number:p.invoice_number,
                        member:p.member,
                        gym:null,
                        plan:p.membership?.plan,
                        amount:p.amount,
                        method:p.method,
                        date:p.paid_at||p.created_at
                      })}>🧾</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {showAdd&&(
        <Modal title="💰 Regjistro Pagesë" onClose={()=>setShowAdd(false)} footer={
          <><button className="btn btn-s" onClick={()=>setShowAdd(false)}>Anulo</button>
          <button className="btn btn-p" form="payForm" type="submit">✅ Konfirmo</button></>
        }>
          <form id="payForm" onSubmit={async e=>{
            e.preventDefault()
            const fd=new FormData(e.target)
            try{await addPayment(gymId,{memberId:fd.get('mb'),amount:fd.get('am'),method:fd.get('me')});toast.success('✅ Pagesa u shtua!');setShowAdd(false);reload();rs()}
            catch(e){toast.error(e.message)}
          }}>
            <div className="fgp" style={{marginBottom:14}}><label>Anëtari *</label>
              <select name="mb" required>
                <option value="">— Zgjidh anëtarin —</option>
                {(members||[]).map(m=><option key={m.id} value={m.id}>{m.full_name} ({m.plan_name||'pa plan'})</option>)}
              </select>
            </div>
            <div className="fg c2">
              <div className="fgp"><label>Shuma (ALL) *</label><input name="am" type="number" required placeholder="3000" min="0"/></div>
              <div className="fgp"><label>Metoda</label><select name="me"><option value="cash">💵 Cash</option><option value="transfer">📱 Transfertë</option><option value="card">💳 Kartë</option></select></div>
            </div>
            <div className="alert al-bl">📄 Numri i faturës gjenerohet automatikisht</div>
          </form>
        </Modal>
      )}
    </div>
  )
}

// ─── REPORTS ─────────────────────────────────────────────
function Reports({ gymId }) {
  const { data: stats }   = useAsync(() => getGymStats(gymId), [gymId])
  const { data: revenue } = useAsync(() => getRevenueChart(gymId), [gymId])
  const { data: members } = useAsync(() => getMembers(gymId), [gymId])
  const { data: plans }   = useAsync(() => getPlans(gymId), [gymId])
  const revArr = MONTHS.map((_,i) => (revenue||[])[i] ?? 0)
  const s = stats || {}

  const monthTotal = revArr[new Date().getMonth()]
  const planStats = (plans||[]).map(p => ({
    ...p, count: (members||[]).filter(m=>m.plan_id===p.id).length
  })).sort((a,b)=>b.count-a.count)
  const maxPlan = Math.max(...planStats.map(p=>p.count), 1)

  const genderM = (members||[]).filter(m=>m.gender==='M').length
  const genderF = (members||[]).filter(m=>m.gender==='F').length
  const total   = (members||[]).length

  return (
    <div className="page-in">
      <div className="ph"><div><div className="pt">Raporte & Statistika</div><div className="ps">Analiza e palestrës — {new Date().toLocaleDateString('sq-AL',{month:'long',year:'numeric'})}</div></div></div>

      <div className="sg">
        <StatCard icon="💰" label="Të Ardhura Muaj"   value={fmtNum(monthTotal)+' L'} change="muaj" up/>
        <StatCard icon="👥" label="Total Anëtarë"      value={total}                   change="të gjithë" up/>
        <StatCard icon="✅" label="Anëtarë Aktivë"     value={s.active??0}             change="aktivë" up/>
        <StatCard icon="💸" label="Borxhe Totale"       value={fmtNum(s.debt??0)+' L'} change={`${s.debtors??0} klientë`}/>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-hd"><div className="card-t">📈 Të Ardhurat {new Date().getFullYear()}</div></div>
          <div className="card-b"><BarChart data={revArr}/></div>
        </div>
        <div className="card">
          <div className="card-hd"><div className="card-t">🎫 Planet më të Shituara</div></div>
          <div className="card-b" style={{display:'flex',flexDirection:'column',gap:12}}>
            {planStats.slice(0,6).map(p=>(
              <div key={p.id}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:5,fontWeight:500}}>
                  <span>{p.emoji} {p.name}</span>
                  <span style={{color:'var(--g500)'}}>{p.count} anëtarë</span>
                </div>
                <div className="prog"><div className="pf" style={{width:`${Math.round(p.count/maxPlan*100)}%`,background:'var(--g900)'}}/></div>
              </div>
            ))}
            {planStats.length===0&&<Empty icon="🎫" title="Asnjë plan ende"/>}
          </div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-hd"><div className="card-t">👥 Gjinia e Anëtarëve</div></div>
          <div className="card-b" style={{display:'flex',gap:20,alignItems:'center',flexWrap:'wrap'}}>
            {total===0?<Empty icon="👥" title="Asnjë anëtar"/>:<>
              <div style={{flex:1}}>
                {[['♂ Mashkull',genderM,'var(--ac)'],['♀ Femër',genderF,'var(--rd)']].map(([l,n,c])=>(
                  <div key={l} style={{marginBottom:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:5}}><span style={{fontWeight:500}}>{l}</span><span style={{color:'var(--g500)'}}>{n} ({total>0?Math.round(n/total*100):0}%)</span></div>
                    <div className="prog"><div className="pf" style={{width:`${total>0?Math.round(n/total*100):0}%`,background:c}}/></div>
                  </div>
                ))}
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontFamily:'var(--fs)',fontSize:36,fontWeight:900}}>{total}</div>
                <div style={{fontSize:12,color:'var(--g500)'}}>Total</div>
              </div>
            </>}
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><div className="card-t">📊 Statusi i Abonimeve</div></div>
          <div className="card-b">
            {[
              ['Aktivë',      (members||[]).filter(m=>memberStatus(m)==='active').length,   'var(--gr)'],
              ['Skadojnë',    (members||[]).filter(m=>memberStatus(m)==='expiring').length, 'var(--am)'],
              ['Skaduar',     (members||[]).filter(m=>memberStatus(m)==='expired').length,  'var(--rd)'],
              ['Frozen',      (members||[]).filter(m=>memberStatus(m)==='frozen').length,   'var(--ac)'],
              ['Pa Abonim',   (members||[]).filter(m=>memberStatus(m)==='none').length,     'var(--g400)'],
            ].map(([l,n,c])=>(
              <div key={l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--g100)'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:c,flexShrink:0}}/>
                  <span style={{fontSize:13}}>{l}</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontWeight:700,fontSize:14}}>{n}</span>
                  <span style={{fontSize:11,color:'var(--g400)',width:36,textAlign:'right'}}>{total>0?Math.round(n/total*100):0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SETTINGS ────────────────────────────────────────────
function Settings({ gymId }) {
  const { data: gym, loading } = useAsync(() => getGym(gymId), [gymId])
  const { data: plans, reload: reloadPlans } = useAsync(() => getPlans(gymId), [gymId])
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!form && gym) { setForm(gym); return null }
  if (loading || !form) return <Loading/>

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const save = async () => {
    setSaving(true)
    await updateGym(gymId,{name:form.name,phone:form.phone,address:form.address,nipt:form.nipt,email:form.email,city:form.city})
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2000); toast.success('✅ U ruajt!')
  }

  const savePlanPrice = async (planId, price) => {
    await updatePlanPrice(gymId, planId, price)
    toast.success('✅ Çmimi u ndryshua!')
    reloadPlans()
  }

  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">Konfigurimet</div><div className="ps">Menaxho informacionin e palestrës</div></div>
        <button className="btn btn-p" onClick={save} disabled={saving}>{saving?'Duke ruajtur...':saved?'✅ U Ruajt!':'💾 Ruaj'}</button>
      </div>

      <div className="g2">
        <div>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-hd"><div className="card-t">🏋️ Informacioni i Palestrës</div></div>
            <div className="card-b">
              <div className="fg"><div className="fgp"><label>Emri i Palestrës</label><input value={form.name||''} onChange={e=>set('name',e.target.value)}/></div></div>
              <div className="fg c2">
                <div className="fgp"><label>NIPT</label><input value={form.nipt||''} onChange={e=>set('nipt',e.target.value)} placeholder="L12345678A"/></div>
                <div className="fgp"><label>Telefon</label><input value={form.phone||''} onChange={e=>set('phone',e.target.value)} placeholder="+355 69..."/></div>
              </div>
              <div className="fg c2">
                <div className="fgp"><label>Email</label><input type="email" value={form.email||''} onChange={e=>set('email',e.target.value)}/></div>
                <div className="fgp"><label>Qyteti</label><input value={form.city||''} onChange={e=>set('city',e.target.value)}/></div>
              </div>
              <div className="fg" style={{marginBottom:0}}>
                <div className="fgp"><label>Adresa</label><input value={form.address||''} onChange={e=>set('address',e.target.value)}/></div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-hd"><div className="card-t">🔑 Informacioni i Hyrjes</div></div>
            <div className="card-b">
              <div style={{background:'var(--g50)',borderRadius:8,padding:12,fontSize:13}}>
                <div style={{marginBottom:8}}><span style={{color:'var(--g500)'}}>Email:</span> <strong>{form.email}</strong></div>
                <div style={{fontSize:12,color:'var(--g400)'}}>Për të ndryshuar fjalëkalimin, kontakto administratorin e platformës.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-hd"><div className="card-t">💰 Çmimet e Planeve</div><span style={{fontSize:11,color:'var(--g400)'}}>Ndrysho çmimin dhe kliko Enter</span></div>
          <div className="card-b" style={{display:'flex',flexDirection:'column',gap:12}}>
            {(plans||[]).length===0?<Empty icon="🎫" title="Asnjë plan"/>:
            (plans||[]).map(p=>(
              <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0',borderBottom:'1px solid var(--g100)'}}>
                <span style={{fontSize:20}}>{p.emoji}</span>
                <span style={{flex:1,fontSize:13,fontWeight:500}}>{p.name}</span>
                <span style={{fontSize:11,color:'var(--g400)',minWidth:40}}>{p.duration_days}d</span>
                <input
                  type="number"
                  defaultValue={p.price}
                  style={{width:100,textAlign:'right'}}
                  onBlur={e=>{ if(Number(e.target.value)!==p.price) savePlanPrice(p.id,e.target.value) }}
                  onKeyDown={e=>{ if(e.key==='Enter') e.target.blur() }}
                />
                <span style={{fontSize:12,color:'var(--g400)',width:20}}>L</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── LAYOUT ──────────────────────────────────────────────
const NAV = [
  {s:'Kryesore', items:[{id:'dashboard',l:'Dashboard',i:'◻️'},{id:'analytics',l:'Analytics',i:'📊'},{id:'checkin',l:'QR Check-in',i:'📷'},{id:'affiliate',l:'Affiliate',i:'🤝'}]},
  {s:'Menaxhim', items:[{id:'members',l:'Anëtarët',i:'👥'},{id:'memberships',l:'Abonimet',i:'🎫'},{id:'payments',l:'Pagesat',i:'💰'}]},
  {s:'Analiza',  items:[{id:'reports',l:'Raporte',i:'📈'}]},
  {s:'Sistem',   items:[{id:'settings',l:'Konfigurimet',i:'⚙️'}]},
]
const TITLES={dashboard:'Dashboard',checkin:'QR Check-in',members:'Anëtarët',memberships:'Abonimet',payments:'Pagesat',reports:'Raporte',settings:'Konfigurimet'}

export default function GymDashboard() {
  const { profile, gymId, logout } = useAuth()
  const [page,   setPage]   = useState('dashboard')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [sbOpen, setSbOpen] = useState(false)
  const nav = id => { setPage(id); setSbOpen(false) }

  // Check if onboarding needed
  useEffect(()=>{
    if (!gymId) return
    supabase.from('gyms').select('onboarding_done').eq('id',gymId).single().then(({data})=>{
      if (data && !data.onboarding_done) setShowOnboarding(true)
    })
  },[gymId])

  const gymName  = profile?.gym?.name  || 'Vaqo'
  const userName = profile?.data?.name || 'Admin'
  const userRole = profile?.data?.role || 'owner'

  const PAGE = {
    dashboard:   <Dashboard   gymId={gymId} setPage={nav}/>,
    analytics:   <AnalyticsDashboard gymId={gymId}/>,
    affiliate:   <AffiliateDashboard gymId={gymId}/>,
    checkin:     <CheckIn     gymId={gymId}/>,
    members:     <Members     gymId={gymId} gymName={gymName}/>,
    memberships: <Memberships gymId={gymId}/>,
    payments:    <Payments    gymId={gymId}/>,
    reports:     <Reports     gymId={gymId}/>,
    settings:    <Settings    gymId={gymId}/>,
  }

  return (
    <div className="app">
      {/* Onboarding overlay */}
      {showOnboarding&&(
        <div style={{position:'fixed',inset:0,zIndex:9999}}>
          <OnboardingFlow gymId={gymId} onComplete={()=>setShowOnboarding(false)}/>
        </div>
      )}
      <div className={`sbo ${sbOpen?'open':''}`} onClick={()=>setSbOpen(false)}/>

      <aside className={`sidebar ${sbOpen?'open':''}`}>
        <div className="sb-logo">
          <div className="sb-icon">💪</div>
          <div><div className="sb-name">{gymName}</div><div className="sb-sub">Vaqo</div></div>
        </div>
        <nav className="nav">
          {NAV.map(s=>(
            <div key={s.s} className="nav-sec">
              <div className="nav-lbl">{s.s}</div>
              {s.items.map(item=>(
                <div key={item.id} className={`nav-item ${page===item.id?'active':''}`} onClick={()=>nav(item.id)}>
                  <span className="nav-ico">{item.i}</span>{item.l}
                </div>
              ))}
            </div>
          ))}
        </nav>
        <div className="sb-bot">
          <div className="user-card" onClick={logout} title="Dil nga sistemi">
            <div className="user-av">{userName.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()}</div>
            <div>
              <div className="user-nm">{userName}</div>
              <div className="user-rl">{userRole} · Dil →</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="tbl">
            <button className="hmbg" style={{display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setSbOpen(s=>!s)}>☰</button>
            <div className="tb-title">{TITLES[page]||'Dashboard'}</div>
          </div>
          <div className="tbr">
            <PushNotifButton gymId={gymId}/>
            <span style={{fontSize:11,color:'var(--gr)',fontWeight:600}}>● Live</span>
            <span className="bdg bdg-gy">{gymName}</span>
            <button className="btn btn-p btn-sm" onClick={()=>nav('members')}>+ Anëtar i Ri</button>
          </div>
        </div>
        <div className="content">{PAGE[page]||<Dashboard gymId={gymId} setPage={nav}/>}</div>
      </main>
    </div>
  )
}
