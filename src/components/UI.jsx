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
          {v>0&&<div style={{fontSize:9,color:'var(--tx3)',fontWeight:600}}>{Math.round(v/1000)}K</div>}
          <div style={{width:'100%',height:v>0?`${(v/max)*100}%`:'3px',background:v>0?'var(--tx)':'var(--border)',borderRadius:'4px 4px 0 0',minHeight:3}}/>
          <div style={{fontSize:9,color:'var(--tx4)'}}>{MONTHS[i]}</div>
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


// Skeleton loading components
export function SkeletonCard({ h = 80 }) {
  return (
    <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:12,padding:18,boxShadow:"var(--sh)",overflow:"hidden",position:"relative"}}>
      <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
      <div style={{height:h,background:"linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)",backgroundSize:"800px 100%",animation:"shimmer 1.5s infinite",borderRadius:8}}/>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid var(--border)"}}>
      <div style={{width:36,height:36,borderRadius:"50%",background:"#f0f0f0",flexShrink:0,animation:"shimmer 1.5s infinite",backgroundImage:"linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",backgroundSize:"400px 100%"}}/>
      <div style={{flex:1}}>
        <div style={{height:13,background:"#f0f0f0",borderRadius:6,marginBottom:6,width:"60%",animation:"shimmer 1.5s infinite",backgroundImage:"linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",backgroundSize:"400px 100%"}}/>
        <div style={{height:11,background:"#f0f0f0",borderRadius:6,width:"40%",animation:"shimmer 1.5s infinite",backgroundImage:"linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",backgroundSize:"400px 100%"}}/>
      </div>
    </div>
  )
}

export function SkeletonStats({ count = 4 }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:20}}>
      {Array.from({length:count}).map((_,i)=>(
        <div key={i} style={{background:"#fff",border:"1px solid var(--border)",borderRadius:12,padding:18,boxShadow:"var(--sh)"}}>
          <div style={{height:12,background:"#f0f0f0",borderRadius:6,width:"50%",marginBottom:10,animation:"shimmer 1.5s infinite",backgroundImage:"linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",backgroundSize:"400px 100%"}}/>
          <div style={{height:28,background:"#f0f0f0",borderRadius:6,width:"70%",animation:"shimmer 1.5s infinite",backgroundImage:"linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",backgroundSize:"400px 100%"}}/>
        </div>
      ))}
    </div>
  )
}
