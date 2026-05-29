import { AVC } from '../lib/db'

export function Avatar({ color=0, name='?', size='' }) {
  const ini = (name||'?').split(' ').filter(Boolean).map(x=>x[0]).join('').toUpperCase().slice(0,2)
  return <div className={`av${size?' av-'+size:''}`} style={{background:AVC[color%8]}}>{ini}</div>
}

export function StatusBadge({ status }) {
  const MAP = {
    active:   <span className="bdg bdg-gr"><span className="dot dot-gr"/>Aktiv</span>,
    expiring: <span className="bdg bdg-am"><span className="dot dot-am"/>Skadon Shpejt</span>,
    expired:  <span className="bdg bdg-rd"><span className="dot dot-rd"/>Skaduar</span>,
    frozen:   <span className="bdg bdg-gy">❄️ Frozen</span>,
  }
  return MAP[status] || <span className="bdg bdg-gy">—</span>
}

export function StatCard({ icon, label, value, change, up }) {
  return (
    <div className="sc">
      <div className="si">{icon}</div>
      <div className="sl">{label}</div>
      <div className="sv">{value ?? 0}</div>
      {change && <div className={`sch ${up?'up':'dn'}`}>{up?'↑':'↓'} {change}</div>}
    </div>
  )
}

export function BarChart({ data=[] }) {
  const MONTHS = ['Jan','Feb','Mar','Pri','Maj','Qer','Kor','Gus','Set','Tet','Nën','Dhj']
  const max = Math.max(...data, 1)
  return (
    <div style={{display:'flex',alignItems:'flex-end',gap:6,height:140}}>
      {data.map((v,i)=>(
        <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4,height:'100%',justifyContent:'flex-end'}}>
          {v>0&&<div style={{fontSize:9,color:'var(--g500)',fontWeight:600}}>{Math.round(v/1000)}K</div>}
          <div style={{width:'100%',height:v>0?`${(v/max)*100}%`:'3px',background:v>0?'var(--g900)':'var(--g200)',borderRadius:'4px 4px 0 0',minHeight:3}}/>
          <div style={{fontSize:9,color:'var(--g400)'}}>{MONTHS[i]}</div>
        </div>
      ))}
    </div>
  )
}

export function Modal({ title, children, footer, onClose }) {
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="mhd">
          <div className="mt">{title}</div>
          <button className="mcl" onClick={onClose}>✕</button>
        </div>
        <div className="mb">{children}</div>
        {footer&&<div className="mft">{footer}</div>}
      </div>
    </div>
  )
}

export function Loading() {
  return <div className="ldg"><div className="spn"/><span>Duke ngarkuar...</span></div>
}

export function Empty({ icon='📭', title='Asnjë të dhënë', sub='' }) {
  return (
    <div className="empty">
      <div className="ei">{icon}</div>
      <div className="et">{title}</div>
      {sub&&<div className="es">{sub}</div>}
    </div>
  )
}
