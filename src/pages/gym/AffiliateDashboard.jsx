// src/pages/gym/AffiliateDashboard.jsx
// Dashboard Referralesh — Vaqo Affiliate Program

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const PLAN_PRICE = { starter:4900, pro:7900, business:14900 }
const fmt  = n => (n||0).toLocaleString('sq-AL')
const fmtL = n => `${fmt(n)} L`

function copyText(text, setCopied) {
  navigator.clipboard?.writeText(text).then(() => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  })
}

export default function AffiliateDashboard({ gymId }) {
  const [data,      setData]    = useState(null)
  const [referrals, setReferrals] = useState([])
  const [payments,  setPayments]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [copied,    setCopied]    = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [tab,       setTab]       = useState('overview')

  useEffect(() => { load() }, [gymId])

  async function load() {
    setLoading(true)
    try {
      const [
        { data: summary },
        { data: refs },
        { data: pays },
        { data: gym },
      ] = await Promise.all([
        supabase.from('affiliate_summary').select('*').eq('gym_id', gymId).single(),
        supabase.from('referrals').select('*,referred:referred_gym_id(name,city,plan,status)').eq('referrer_gym_id', gymId).order('created_at', { ascending: false }),
        supabase.from('affiliate_payments').select('*,referred:referred_gym_id(name)').eq('referrer_gym_id', gymId).order('created_at', { ascending: false }),
        supabase.from('gyms').select('name').eq('id', gymId).single(),
      ])

      // If no code yet, generate one manually
      let code = summary?.code
      if (!code) {
        const base = (gym?.data?.name || 'GYM').replace(/[^A-Za-z0-9]/g,'').toUpperCase().slice(0,6)
        code = base + Math.floor(Math.random()*90+10)
        await supabase.from('affiliate_codes').upsert({ gym_id: gymId, code }, { onConflict: 'gym_id' })
      }

      setData({ ...summary, code, gym_name: gym?.data?.name })
      setReferrals(refs || [])
      setPayments(pays || [])
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const refUrl = `https://vaqo.al/apply?ref=${data?.code || ''}`
  const refLink = `https://vaqo.al?ref=${data?.code || ''}`

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:60,color:'#71717a',gap:12}}>
      <div style={{width:18,height:18,border:'2px solid #e4e4e7',borderTopColor:'#7c3aed',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Duke ngarkuar...
    </div>
  )

  const TABS = [
    { id:'overview', l:'📊 Pasqyra' },
    { id:'referrals',l:`🤝 Referalet (${referrals.length})` },
    { id:'payments', l:`💰 Pagesat (${payments.length})` },
    { id:'tools',    l:'🛠️ Materialet' },
  ]

  const thisMonth = new Date().toISOString().slice(0,7)
  const monthPayments = payments.filter(p => p.month === thisMonth)
  const monthEarnings = monthPayments.reduce((s,p)=>s+(p.commission_amt||0),0)

  return (
    <div style={{fontFamily:'system-ui,sans-serif'}}>
      <style>{`.affrow:hover{background:#fafafa!important}`}</style>

      {/* Header */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div>
          <div style={{fontFamily:'Georgia,serif',fontSize:21,fontWeight:900,marginBottom:3}}>🤝 Affiliate Program</div>
          <div style={{fontSize:13,color:'#71717a'}}>Rekomandon Vaqo — fito <strong style={{color:'#16a34a'}}>10%</strong> nga çdo biznes që regjistron</div>
        </div>
        <button onClick={load} style={{background:'#f4f4f5',border:'none',padding:'8px 14px',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>↻</button>
      </div>

      {/* CODE CARD — always visible */}
      <div style={{background:'linear-gradient(135deg,#18181b 0%,#2d1b69 100%)',borderRadius:16,padding:28,marginBottom:20,color:'#fff'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>Kodi juaj i Referimit</div>
            <div style={{fontFamily:'Georgia,serif',fontSize:44,fontWeight:900,letterSpacing:2,color:'#c8a96e',lineHeight:1}}>
              {data?.code || '—'}
            </div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.4)',marginTop:8}}>
              Kur dikush aplikon me këtë kod → fitoni 10%/muaj
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <button onClick={()=>copyText(data?.code, setCopied)} style={{display:'flex',alignItems:'center',gap:8,background:copied?'#16a34a':'rgba(255,255,255,.1)',color:'#fff',border:'1px solid rgba(255,255,255,.15)',padding:'10px 18px',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all .2s',whiteSpace:'nowrap'}}>
              {copied ? '✅ U kopjua!' : '📋 Kopjo Kodin'}
            </button>
            <button onClick={()=>copyText(refUrl, setCopiedUrl)} style={{display:'flex',alignItems:'center',gap:8,background:copiedUrl?'#16a34a':'rgba(255,255,255,.1)',color:'#fff',border:'1px solid rgba(255,255,255,.15)',padding:'10px 18px',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all .2s',whiteSpace:'nowrap'}}>
              {copiedUrl ? '✅ U kopjua!' : '🔗 Kopjo Linkun'}
            </button>
          </div>
        </div>

        {/* URL preview */}
        <div style={{marginTop:20,background:'rgba(0,0,0,.3)',borderRadius:9,padding:'10px 14px',fontSize:12,color:'rgba(255,255,255,.5)',fontFamily:'monospace',wordBreak:'break-all'}}>
          {refUrl}
        </div>
      </div>

      {/* Stats row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:20}}>
        {[
          ['🤝', 'Referale aktive',   data?.active_referrals||0,   '', '#7c3aed'],
          ['💰', 'Total fituar',       fmtL(data?.total_earned||0), '',  '#16a34a'],
          ['⏳', 'Pritje pagesë',      fmtL(data?.pending_earnings||0),'','#d97706'],
          ['📅', 'Ky muaj',            fmtL(monthEarnings),          '', '#2563eb'],
        ].map(([ico,label,value,sub,color])=>(
          <div key={label} style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:12,padding:18}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <div style={{width:30,height:30,borderRadius:8,background:`${color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>{ico}</div>
              <div style={{fontSize:11,color:'#71717a',fontWeight:500}}>{label}</div>
            </div>
            <div style={{fontSize:26,fontWeight:900,lineHeight:1}}>{value}</div>
            {sub&&<div style={{fontSize:11,color:'#71717a',marginTop:3}}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:20,borderBottom:'1px solid #f0f0f0'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'9px 16px',border:'none',background:'none',cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'inherit',color:tab===t.id?'#7c3aed':'#71717a',borderBottom:`2px solid ${tab===t.id?'#7c3aed':'transparent'}`,marginBottom:-1,whiteSpace:'nowrap',transition:'color .15s'}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab==='overview'&&(
        <>
          {/* How it works */}
          <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:24,marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>💡 Si funksionon</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
              {[
                ['1️⃣','Jep Kodin','Ndaj kodin tuaj me biznese që njohni.','#f5f3ff'],
                ['2️⃣','Ata Regjistrohen','Kur aplikojnë me kodin tuaj, jeni i lidhur.','#f0fdf4'],
                ['3️⃣','Paguhen','Çdo muaj marrin faturat e tyre.','#eff6ff'],
                ['4️⃣','Ju Fitoni 10%','Ne ju dërgojmë 10% nga çdo pagesë mujore.','#fffbeb'],
              ].map(([n,t,d,bg])=>(
                <div key={n} style={{background:bg,borderRadius:12,padding:18,textAlign:'center'}}>
                  <div style={{fontSize:28,marginBottom:10}}>{n}</div>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>{t}</div>
                  <div style={{fontSize:12,color:'#71717a',lineHeight:1.6}}>{d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Earnings calculator */}
          <div style={{background:'#18181b',borderRadius:14,padding:24}}>
            <div style={{fontWeight:700,fontSize:14,color:'#fff',marginBottom:16}}>💰 Llogaritësi i Fitimeve</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
              {[['1 referim','Starter','4,900 L',490],['5 referime','Mix','~6,000 L avg',3000],['10 referime','Pro','7,900 L',7900]].map(([refs,plan,rev,earn])=>(
                <div key={refs} style={{background:'rgba(255,255,255,.05)',borderRadius:12,padding:20,textAlign:'center'}}>
                  <div style={{fontSize:13,color:'rgba(255,255,255,.5)',marginBottom:6}}>{refs}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,.3)',marginBottom:10}}>{plan} · {rev}/muaj</div>
                  <div style={{fontFamily:'Georgia,serif',fontSize:32,fontWeight:900,color:'#c8a96e',lineHeight:1}}>{fmtL(earn)}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,.3)',marginTop:4}}>/ muaj</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:16,fontSize:12,color:'rgba(255,255,255,.25)',textAlign:'center'}}>
              Pagesa bëhet çdo muaj · Cash ose transfertë
            </div>
          </div>

          {/* Recent referrals */}
          {referrals.length>0&&(
            <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:24,marginTop:16}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>🆕 Referalet e Fundit</div>
              {referrals.slice(0,5).map(r=>(
                <div key={r.id} className="affrow" style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid #f5f5f5',transition:'background .15s'}}>
                  <div style={{width:36,height:36,borderRadius:9,background:'#f5f3ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>🏢</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:13}}>{r.referred?.name||'—'}</div>
                    <div style={{fontSize:11,color:'#71717a'}}>{r.referred?.city||''}</div>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,background:r.status==='active'?'#dcfce7':'#f4f4f5',color:r.status==='active'?'#15803d':'#71717a'}}>
                    {r.status==='active'?'✅ Aktiv':'⏳ Pritje'}
                  </span>
                  <div style={{fontWeight:700,fontSize:13,color:'#16a34a',minWidth:80,textAlign:'right'}}>
                    {fmtL(Math.round(PLAN_PRICE[r.referred?.plan||'starter']*0.1))}/muaj
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── REFERRALS ── */}
      {tab==='referrals'&&(
        <>
          {referrals.length===0?(
            <div style={{background:'#fafafa',border:'1px solid #e4e4e7',borderRadius:14,padding:48,textAlign:'center'}}>
              <div style={{fontSize:48,marginBottom:12}}>🤝</div>
              <div style={{fontFamily:'Georgia,serif',fontSize:18,fontWeight:700,marginBottom:8}}>Asnjë referim ende</div>
              <div style={{fontSize:14,color:'#71717a',maxWidth:380,margin:'0 auto',lineHeight:1.7}}>
                Ndaj kodin tuaj me biznese që njohni dhe filloni të fitoni 10% çdo muaj.
              </div>
            </div>
          ):(
            <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,overflow:'hidden'}}>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',padding:'10px 16px',background:'#fafafa',borderBottom:'1px solid #e4e4e7'}}>
                {['Biznesi','Plani','Status','Komisioni/muaj'].map(h=>(
                  <div key={h} style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.04em',color:'#71717a'}}>{h}</div>
                ))}
              </div>
              {referrals.map(r=>(
                <div key={r.id} className="affrow" style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',padding:'12px 16px',borderBottom:'1px solid #f8f8f8',transition:'background .15s'}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:13}}>{r.referred?.name||'—'}</div>
                    <div style={{fontSize:11,color:'#a1a1aa'}}>{new Date(r.created_at).toLocaleDateString('sq-AL')}</div>
                  </div>
                  <div>
                    <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:20,textTransform:'uppercase',background:r.referred?.plan==='pro'?'#f5f3ff':'#f4f4f5',color:r.referred?.plan==='pro'?'#7c3aed':'#52525b'}}>
                      {r.referred?.plan||'starter'}
                    </span>
                  </div>
                  <div>
                    <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:20,background:r.status==='active'?'#dcfce7':'#fffbeb',color:r.status==='active'?'#15803d':'#92400e'}}>
                      {r.status==='active'?'✅ Aktiv':'⏳ Pritje'}
                    </span>
                  </div>
                  <div style={{fontWeight:700,fontSize:14,color:'#16a34a'}}>
                    {r.status==='active' ? fmtL(Math.round((PLAN_PRICE[r.referred?.plan||'starter']||4900)*r.commission_pct/100)) : '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── PAYMENTS ── */}
      {tab==='payments'&&(
        <>
          {payments.length===0?(
            <div style={{background:'#fafafa',border:'1px solid #e4e4e7',borderRadius:14,padding:48,textAlign:'center'}}>
              <div style={{fontSize:48,marginBottom:12}}>💰</div>
              <div style={{fontFamily:'Georgia,serif',fontSize:18,fontWeight:700,marginBottom:8}}>Asnjë pagesë ende</div>
              <div style={{fontSize:14,color:'#71717a'}}>Pagesat shfaqen këtu çdo muaj pasi bizneset e referuara paguajnë.</div>
            </div>
          ):(
            <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,overflow:'hidden'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr',padding:'10px 16px',background:'#fafafa',borderBottom:'1px solid #e4e4e7'}}>
                {['Biznesi','Muaji','Plani','Komisioni','Status'].map(h=>(
                  <div key={h} style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.04em',color:'#71717a'}}>{h}</div>
                ))}
              </div>
              {payments.map(p=>(
                <div key={p.id} className="affrow" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr',padding:'12px 16px',borderBottom:'1px solid #f8f8f8',transition:'background .15s'}}>
                  <div style={{fontWeight:600,fontSize:13}}>{p.referred?.name||'—'}</div>
                  <div style={{fontSize:13,color:'#52525b'}}>{p.month}</div>
                  <div>
                    <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:20,background:'#f4f4f5',color:'#52525b',textTransform:'uppercase'}}>{p.referred_plan||'—'}</span>
                  </div>
                  <div style={{fontWeight:700,fontSize:14,color:'#16a34a'}}>{fmtL(p.commission_amt)}</div>
                  <div>
                    <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:20,background:p.status==='paid'?'#dcfce7':'#fffbeb',color:p.status==='paid'?'#15803d':'#92400e'}}>
                      {p.status==='paid'?'✅ Paguar':'⏳ Pritje'}
                    </span>
                  </div>
                </div>
              ))}

              {/* Totals */}
              <div style={{padding:'12px 16px',background:'#fafafa',display:'flex',justifyContent:'flex-end',gap:24,fontSize:13}}>
                <span style={{color:'#71717a'}}>Total fituar: <strong style={{color:'#16a34a'}}>{fmtL(payments.filter(p=>p.status==='paid').reduce((s,p)=>s+p.commission_amt,0))}</strong></span>
                <span style={{color:'#71717a'}}>Pritje: <strong style={{color:'#d97706'}}>{fmtL(payments.filter(p=>p.status==='pending').reduce((s,p)=>s+p.commission_amt,0))}</strong></span>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── TOOLS ── */}
      {tab==='tools'&&(
        <>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {/* Share messages */}
            <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:24}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>📱 Mesazhe Gati për WhatsApp / SMS</div>
              {[
                {
                  title:'Mesazh i shkurtër',
                  text:`Hej! Po përdor Vaqo për menaxhimin e biznesit tim dhe jam shumë i kënaqur. Nëse dëshiron të provosh, regjistrohu me kodin tim "${data?.code}" dhe merr 30 ditë falas: ${refUrl}`,
                },
                {
                  title:'Mesazh i detajuar',
                  text:`Hej! Kam filluar të përdor Vaqo — platformën shqiptare për menaxhimin e bizneseve wellness. Ka rezervime online, QR check-in, pagesa automatike dhe shumë të tjera. 30 ditë falas pa kartë krediti. Regjistrohu me kodin tim "${data?.code}": ${refUrl}`,
                },
              ].map((msg,i)=>{
                const [cop, setCop] = useState(false)
                return (
                  <div key={i} style={{background:'#f8f8f8',borderRadius:10,padding:16,marginBottom:10}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                      <span style={{fontSize:12,fontWeight:700,color:'#52525b'}}>{msg.title}</span>
                      <button onClick={()=>copyText(msg.text,setCop)} style={{background:cop?'#16a34a':'#18181b',color:'#fff',border:'none',padding:'5px 12px',borderRadius:7,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all .2s'}}>
                        {cop?'✅ Kopjuar':'📋 Kopjo'}
                      </button>
                    </div>
                    <div style={{fontSize:13,color:'#52525b',lineHeight:1.6}}>{msg.text}</div>
                  </div>
                )
              })}
            </div>

            {/* Social share */}
            <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:24}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>🌐 Ndaj Online</div>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                {[
                  ['WhatsApp','#25D366',`https://wa.me/?text=${encodeURIComponent(`Provoni Vaqo me kodin tim ${data?.code}: ${refUrl}`)}`,'💬'],
                  ['Facebook','#1877F2',`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(refUrl)}`,'👍'],
                  ['LinkedIn','#0A66C2',`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(refUrl)}`,'💼'],
                ].map(([name,color,url,ico])=>(
                  <a key={name} href={url} target="_blank" rel="noopener noreferrer"
                    style={{display:'flex',alignItems:'center',gap:8,background:color,color:'#fff',padding:'10px 18px',borderRadius:9,fontSize:13,fontWeight:600,textDecoration:'none',transition:'opacity .2s'}}
                    onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                    {ico} {name}
                  </a>
                ))}
              </div>
            </div>

            {/* Referral link */}
            <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:24}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>🔗 Linqet e Referimit</div>
              {[
                { label:'Link Aplikimi (rekomanduar)', url:refUrl, desc:'Shkon direkt te formulari i aplikimit me kodin tuaj pre-filled' },
                { label:'Link Landing Page', url:refLink, desc:'Shkon te kryefaqja e Vaqo me kodin tuaj' },
              ].map((l,i)=>{
                const [c,setC] = useState(false)
                return (
                  <div key={i} style={{marginBottom:12}}>
                    <div style={{fontSize:12,fontWeight:600,color:'#52525b',marginBottom:4}}>{l.label}</div>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <div style={{flex:1,background:'#f4f4f5',borderRadius:8,padding:'8px 12px',fontSize:12,color:'#71717a',fontFamily:'monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {l.url}
                      </div>
                      <button onClick={()=>copyText(l.url,setC)} style={{background:c?'#16a34a':'#18181b',color:'#fff',border:'none',padding:'8px 14px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',flexShrink:0,transition:'all .2s'}}>
                        {c?'✅':'📋'}
                      </button>
                    </div>
                    <div style={{fontSize:11,color:'#a1a1aa',marginTop:4}}>{l.desc}</div>
                  </div>
                )
              })}
            </div>

            {/* Terms */}
            <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:12,padding:18}}>
              <div style={{fontWeight:700,fontSize:13,color:'#92400e',marginBottom:10}}>📋 Kushtet e Programit</div>
              {['Komisioni është 10% nga plani mujor i biznesit të referuar','Pagesa bëhet çdo muaj, brenda 15 ditëve të para','Komisioni është aktiv gjatë gjithë kohës që biznesi mbetet abonent','Nëse biznesi i referuar anuloi abonimin → komisioni ndalet','Minumumi i pagesës: 2,900 L (1 Starter referim)','Pagesa bëhet cash ose transfertë bankare'].map((t,i)=>(
                <div key={i} style={{display:'flex',gap:10,padding:'4px 0',fontSize:12,color:'#78350f'}}>
                  <span style={{flexShrink:0}}>•</span><span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
