import { useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { supabase } from '../../lib/supabase'
import { fmtNum, fmtDate } from '../../lib/db'
import { StatCard, Modal, Loading, Empty } from '../../components/UI'
import toast from 'react-hot-toast'

async function getProducts() {
  const { data } = await supabase.from('products')
    .select('*, category:product_categories(name,emoji)')
    .order('is_featured', { ascending:false })
  return data ?? []
}

async function getCategories() {
  const { data } = await supabase.from('product_categories').select('*').order('sort_order')
  return data ?? []
}

async function getOrders() {
  const { data } = await supabase.from('product_orders')
    .select('*, product:products(name,price)')
    .order('created_at', { ascending:false })
    .limit(100)
  return data ?? []
}

async function getShopStats() {
  const [ordersR, revenueR, productsR] = await Promise.all([
    supabase.from('product_orders').select('id', {count:'exact',head:true}).neq('status','cancelled'),
    supabase.from('product_orders').select('platform_amount').eq('status','delivered'),
    supabase.from('products').select('id', {count:'exact',head:true}).eq('is_active',true),
  ])
  return {
    orders: ordersR.count ?? 0,
    revenue: revenueR.data?.reduce((a,o)=>a+o.platform_amount,0) ?? 0,
    products: productsR.count ?? 0,
  }
}

// ── PRODUCTS MANAGER ─────────────────────────────────────
function ProductsManager() {
  const { data: products, loading, reload } = useAsync(getProducts)
  const { data: categories } = useAsync(getCategories)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [catFilter, setCatFilter] = useState('all')
  const [form, setForm] = useState({ name:'', description:'', price:'', stock:'', brand:'', weight:'', category_id:'', image_url:'', is_featured:false, commission_pct:30 })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const filtered = catFilter === 'all' ? (products||[]) : (products||[]).filter(p=>p.category_id===catFilter)

  const save = async () => {
    if (!form.name||!form.price) { toast.error('Emri dhe çmimi janë të detyrueshme'); return }
    setSaving(true)
    try {
      const data = { name:form.name, description:form.description, price:parseInt(form.price)||0, stock:parseInt(form.stock)||0, brand:form.brand, weight:form.weight, category_id:form.category_id||null, image_url:form.image_url||null, is_featured:form.is_featured, commission_pct:parseInt(form.commission_pct)||30, is_active:true }
      if (editing) {
        await supabase.from('products').update(data).eq('id', editing.id)
        toast.success('✅ Produkti u përditësua!')
      } else {
        await supabase.from('products').insert(data)
        toast.success('✅ Produkti u shtua!')
      }
      setShowAdd(false); setEditing(null); reload()
    } catch(e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const startEdit = (p) => {
    setForm({ name:p.name, description:p.description||'', price:p.price, stock:p.stock, brand:p.brand||'', weight:p.weight||'', category_id:p.category_id||'', image_url:p.image_url||'', is_featured:p.is_featured, commission_pct:p.commission_pct||30 })
    setEditing(p); setShowAdd(true)
  }

  const toggleActive = async (p) => {
    await supabase.from('products').update({ is_active:!p.is_active }).eq('id', p.id)
    toast.success(p.is_active?'Produkti u çaktivizua':'Produkti u aktivizua'); reload()
  }

  const toggleFeatured = async (p) => {
    await supabase.from('products').update({ is_featured:!p.is_featured }).eq('id', p.id)
    toast.success(p.is_featured?'U hoq nga të rekomanduarat':'U shtua te të rekomanduarat'); reload()
  }

  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">Produktet</div><div className="ps">{(products||[]).length} produkte totale</div></div>
        <button className="btn btn-p" onClick={()=>{setEditing(null);setForm({name:'',description:'',price:'',stock:'',brand:'',weight:'',category_id:'',image_url:'',is_featured:false,commission_pct:30});setShowAdd(true)}}>+ Produkt i Ri</button>
      </div>

      <div className="chips">
        <button className={`chip ${catFilter==='all'?'active':''}`} onClick={()=>setCatFilter('all')}>Të Gjitha</button>
        {(categories||[]).map(c=>(
          <button key={c.id} className={`chip ${catFilter===c.id?'active':''}`} onClick={()=>setCatFilter(c.id)}>{c.emoji} {c.name}</button>
        ))}
      </div>

      {loading?<Loading/>:(
        <div className="card">
          <div className="tw"><table>
            <thead><tr><th>Produkti</th><th>Kategoria</th><th>Çmimi</th><th>Stoku</th><th>Komisioni</th><th>Shitur</th><th>Statusi</th><th>Veprime</th></tr></thead>
            <tbody>
              {filtered.length===0?<tr><td colSpan={8}><Empty icon="📦" title="Asnjë produkt" sub="Shto produktin e parë"/></td></tr>:
              filtered.map(p=>(
                <tr key={p.id} style={{opacity:p.is_active?1:.5}}>
                  <td>
                    <div>
                      <div style={{fontWeight:500,display:'flex',alignItems:'center',gap:6}}>
                        {p.is_featured&&<span style={{fontSize:10,background:'var(--aml)',color:'var(--am)',padding:'1px 6px',borderRadius:10,fontWeight:700}}>⭐ TOP</span>}
                        {p.name}
                      </div>
                      {p.brand&&<div style={{fontSize:11,color:'var(--g400)'}}>{p.brand} {p.weight&&`· ${p.weight}`}</div>}
                    </div>
                  </td>
                  <td><span className="bdg bdg-gy">{p.category?.emoji} {p.category?.name||'—'}</span></td>
                  <td style={{fontWeight:700}}>{fmtNum(p.price)} L</td>
                  <td>
                    <span className={`bdg ${p.stock>10?'bdg-gr':p.stock>0?'bdg-am':'bdg-rd'}`}>
                      {p.stock>0?`${p.stock} copë`:'Mbaruar'}
                    </span>
                  </td>
                  <td><span className="bdg bdg-bl">{p.commission_pct}% platforma</span></td>
                  <td style={{fontWeight:600,textAlign:'center'}}>{p.sold_count||0}</td>
                  <td>{p.is_active?<span className="bdg bdg-gr">Aktiv</span>:<span className="bdg bdg-rd">Joaktiv</span>}</td>
                  <td>
                    <div style={{display:'flex',gap:4}}>
                      <button className="btn btn-g btn-xs" onClick={()=>startEdit(p)} title="Edito">✏️</button>
                      <button className="btn btn-g btn-xs" onClick={()=>toggleFeatured(p)} title="Featured">{p.is_featured?'⭐':'☆'}</button>
                      <button className={`btn btn-xs ${p.is_active?'btn-danger':'btn-success'}`} onClick={()=>toggleActive(p)}>{p.is_active?'⏸':'▶'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {showAdd&&(
        <Modal title={editing?'✏️ Edito Produktin':'📦 Produkt i Ri'} onClose={()=>{setShowAdd(false);setEditing(null)}} footer={
          <><button className="btn btn-s" onClick={()=>{setShowAdd(false);setEditing(null)}}>Anulo</button>
          <button className="btn btn-p" onClick={save} disabled={saving}>{saving?'Duke ruajtur...':'✅ Ruaj'}</button></>
        }>
          <div className="fg"><div className="fgp"><label>Emri *</label><input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Proteinë Whey 1kg"/></div></div>
          <div className="fg c2">
            <div className="fgp"><label>Çmimi (ALL) *</label><input type="number" value={form.price} onChange={e=>set('price',e.target.value)} placeholder="4500"/></div>
            <div className="fgp"><label>Stoku (copë)</label><input type="number" value={form.stock} onChange={e=>set('stock',e.target.value)} placeholder="50"/></div>
          </div>
          <div className="fg c2">
            <div className="fgp"><label>Brendi</label><input value={form.brand} onChange={e=>set('brand',e.target.value)} placeholder="MyProtein"/></div>
            <div className="fgp"><label>Pesha/Madhësia</label><input value={form.weight} onChange={e=>set('weight',e.target.value)} placeholder="1kg"/></div>
          </div>
          <div className="fg c2">
            <div className="fgp"><label>Kategoria</label>
              <select value={form.category_id} onChange={e=>set('category_id',e.target.value)}>
                <option value="">— Zgjidh —</option>
                {(categories||[]).map(c=><option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
              </select>
            </div>
            <div className="fgp"><label>Komisioni Platformës (%)</label><input type="number" value={form.commission_pct} onChange={e=>set('commission_pct',e.target.value)} min="0" max="100"/></div>
          </div>
          <div className="fg"><div className="fgp"><label>Përshkrimi</label><textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Përshkrim i produktit..."/></div></div>
          <div className="fg" style={{marginBottom:0}}><div className="fgp"><label>URL e Fotos</label><input value={form.image_url} onChange={e=>set('image_url',e.target.value)} placeholder="https://..."/></div></div>
          <div style={{marginTop:14,display:'flex',alignItems:'center',gap:10}}>
            <input type="checkbox" id="featured" checked={form.is_featured} onChange={e=>set('is_featured',e.target.checked)} style={{width:16,height:16}}/>
            <label htmlFor="featured" style={{fontSize:13,fontWeight:500,cursor:'pointer'}}>⭐ Produkt i Rekomanduar (shfaqet i pari)</label>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── ORDERS MANAGER ────────────────────────────────────────
function OrdersManager() {
  const { data: orders, loading, reload } = useAsync(getOrders)
  const [filter, setFilter] = useState('all')
  const filtered = filter==='all' ? (orders||[]) : (orders||[]).filter(o=>o.status===filter)

  const updateStatus = async (id, status) => {
    await supabase.from('product_orders').update({ status }).eq('id', id)
    toast.success('Statusi u ndryshua'); reload()
  }

  const statusBadge = { pending:<span className="bdg bdg-am">⏳ Pritje</span>, confirmed:<span className="bdg bdg-bl">✅ Konfirmuar</span>, delivered:<span className="bdg bdg-gr">📦 Dorëzuar</span>, cancelled:<span className="bdg bdg-rd">❌ Anuluar</span> }

  return (
    <div className="page-in">
      <div className="ph"><div><div className="pt">Porositë</div><div className="ps">{(orders||[]).length} porosi totale</div></div></div>
      <div className="chips">
        {[['all','Të Gjitha'],['pending','⏳ Pritje'],['confirmed','✅ Konfirmuara'],['delivered','📦 Dorëzuara'],['cancelled','❌ Anuluara']].map(([k,l])=>(
          <button key={k} className={`chip ${filter===k?'active':''}`} onClick={()=>setFilter(k)}>{l}</button>
        ))}
      </div>
      {loading?<Loading/>:(
        <div className="card">
          <div className="tw"><table>
            <thead><tr><th>#</th><th>Klienti</th><th>Produkti</th><th>Sasia</th><th>Totali</th><th>Platforma (30%)</th><th>Data</th><th>Statusi</th><th>Veprime</th></tr></thead>
            <tbody>
              {filtered.length===0?<tr><td colSpan={9}><Empty icon="🛒" title="Asnjë porosi"/></td></tr>:
              filtered.map(o=>(
                <tr key={o.id}>
                  <td style={{fontFamily:'monospace',fontSize:11,color:'var(--g400)'}}>{o.invoice_number}</td>
                  <td><div><div style={{fontWeight:500}}>{o.buyer_name}</div><div style={{fontSize:11,color:'var(--g400)'}}>{o.buyer_phone}</div></div></td>
                  <td><span className="bdg bdg-gy">{o.product?.name||'—'}</span></td>
                  <td style={{textAlign:'center',fontWeight:500}}>{o.quantity}</td>
                  <td style={{fontWeight:700}}>{fmtNum(o.total_amount)} L</td>
                  <td style={{fontWeight:600,color:'var(--gr)'}}>{fmtNum(o.platform_amount)} L</td>
                  <td style={{fontSize:12,color:'var(--g500)'}}>{fmtDate(o.created_at)}</td>
                  <td>{statusBadge[o.status]}</td>
                  <td>
                    {o.status==='pending'&&<div style={{display:'flex',gap:4}}>
                      <button className="btn btn-success btn-xs" onClick={()=>updateStatus(o.id,'confirmed')}>✅</button>
                      <button className="btn btn-danger btn-xs" onClick={()=>updateStatus(o.id,'cancelled')}>❌</button>
                    </div>}
                    {o.status==='confirmed'&&<button className="btn btn-p btn-xs" onClick={()=>updateStatus(o.id,'delivered')}>📦 Dorëzo</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  )
}

// ── PUBLIC SHOP ───────────────────────────────────────────
export function PublicShop({ gymId, memberId, memberName }) {
  const { data: products, loading } = useAsync(getProducts)
  const { data: categories } = useAsync(getCategories)
  const [catFilter, setCatFilter] = useState('all')
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [showOrder, setShowOrder] = useState(null)
  const [ordering, setOrdering] = useState(false)
  const [orderForm, setOrderForm] = useState({ name:memberName||'', phone:'' })

  const filtered = (products||[]).filter(p=>p.is_active&&p.stock>0)
    .filter(p=>catFilter==='all'||p.category_id===catFilter)

  const addToCart = (product) => {
    const existing = cart.find(i=>i.id===product.id)
    if (existing) setCart(cart.map(i=>i.id===product.id?{...i,qty:i.qty+1}:i))
    else setCart([...cart,{...product,qty:1}])
    toast.success(`✅ ${product.name} u shtua në shportë`)
  }

  const removeFromCart = (id) => setCart(cart.filter(i=>i.id!==id))

  const cartTotal = cart.reduce((a,i)=>a+i.price*i.qty, 0)

  const placeOrder = async () => {
    if (!orderForm.name) { toast.error('Vendos emrin'); return }
    setOrdering(true)
    try {
      for (const item of cart) {
        await supabase.from('product_orders').insert({
          product_id: item.id,
          gym_id: gymId||null,
          member_id: memberId||null,
          buyer_name: orderForm.name,
          buyer_phone: orderForm.phone,
          quantity: item.qty,
          unit_price: item.price,
          total_amount: item.price * item.qty,
          platform_amount: Math.round(item.price * item.qty * (item.commission_pct||30) / 100),
          payment_method: 'cash',
          status: 'pending',
        })
        // Redukto stokun
        await supabase.from('products').update({ stock: item.stock - item.qty, sold_count: (item.sold_count||0)+item.qty }).eq('id', item.id)
      }
      toast.success('✅ Porosia u dërgua! Recepsioni do t\'ju kontaktojë.')
      setCart([]); setShowCart(false)
    } catch(e) { toast.error(e.message) }
    finally { setOrdering(false) }
  }

  if (loading) return <Loading/>

  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">🛒 Dyqani</div><div className="ps">Produkte sportive dhe suplemente</div></div>
        {cart.length>0&&<button className="btn btn-p" onClick={()=>setShowCart(true)}>🛒 Shporta ({cart.length}) — {fmtNum(cartTotal)} L</button>}
      </div>

      <div className="chips">
        <button className={`chip ${catFilter==='all'?'active':''}`} onClick={()=>setCatFilter('all')}>Të Gjitha</button>
        {(categories||[]).map(c=>(
          <button key={c.id} className={`chip ${catFilter===c.id?'active':''}`} onClick={()=>setCatFilter(c.id)}>{c.emoji} {c.name}</button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16}}>
        {filtered.length===0?<Empty icon="📦" title="Asnjë produkt disponibël"/>:
        filtered.map(p=>(
          <div key={p.id} className="card" style={{overflow:'visible'}}>
            {p.is_featured&&<div style={{background:'var(--am)',color:'#fff',fontSize:10,fontWeight:700,padding:'3px 10px',textAlign:'center',letterSpacing:'.05em'}}>⭐ I REKOMANDUAR</div>}
            {p.image_url?(
              <img src={p.image_url} alt={p.name} style={{width:'100%',height:160,objectFit:'cover'}}/>
            ):(
              <div style={{height:140,background:'var(--g100)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:48}}>
                {p.category?.emoji||'📦'}
              </div>
            )}
            <div style={{padding:16}}>
              <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{p.name}</div>
              {p.brand&&<div style={{fontSize:11,color:'var(--g400)',marginBottom:8}}>{p.brand} {p.weight&&`· ${p.weight}`}</div>}
              {p.description&&<div style={{fontSize:12,color:'var(--g600)',marginBottom:12,lineHeight:1.5}}>{p.description}</div>}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontFamily:'var(--fs)',fontSize:22,fontWeight:900}}>{fmtNum(p.price)}</div>
                  <div style={{fontSize:11,color:'var(--g400)'}}>ALL · {p.stock} në stok</div>
                </div>
                <button className="btn btn-p btn-sm" onClick={()=>addToCart(p)}>+ Shporta</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCart&&(
        <Modal title="🛒 Shporta Ime" onClose={()=>setShowCart(false)} footer={
          <><button className="btn btn-s" onClick={()=>setShowCart(false)}>Mbyll</button>
          <button className="btn btn-p" onClick={placeOrder} disabled={ordering||cart.length===0}>{ordering?'Duke dërguar...':'📦 Porosit Cash'}</button></>
        }>
          {cart.map(item=>(
            <div key={item.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--g100)'}}>
              <div><div style={{fontWeight:500}}>{item.name}</div><div style={{fontSize:12,color:'var(--g500)'}}>× {item.qty} = {fmtNum(item.price*item.qty)} L</div></div>
              <button className="btn btn-danger btn-xs" onClick={()=>removeFromCart(item.id)}>✕</button>
            </div>
          ))}
          <div style={{display:'flex',justifyContent:'space-between',fontWeight:700,fontSize:16,padding:'14px 0',borderTop:'2px solid var(--g900)',marginTop:8}}>
            <span>Totali</span><span>{fmtNum(cartTotal)} L</span>
          </div>
          <div className="alert al-bl" style={{marginTop:8}}>💵 Pagesa bëhet cash te recepsioni i palestrës pas konfirmimit.</div>
          <div className="fg c2" style={{marginTop:14}}>
            <div className="fgp"><label>Emri *</label><input value={orderForm.name} onChange={e=>setOrderForm(f=>({...f,name:e.target.value}))}/></div>
            <div className="fgp"><label>Telefon</label><input value={orderForm.phone} onChange={e=>setOrderForm(f=>({...f,phone:e.target.value}))} placeholder="+355 69..."/></div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── ADMIN SHOP PANEL ──────────────────────────────────────
const NAV = [
  {s:'Dyqani', items:[{id:'dashboard',l:'Dashboard',i:'📊'},{id:'products',l:'Produktet',i:'📦'},{id:'orders',l:'Porositë',i:'🛒'}]},
]

export default function ShopAdmin({ logout }) {
  const [page, setPage] = useState('dashboard')
  const [sbOpen, setSbOpen] = useState(false)
  const { data: stats } = useAsync(getShopStats)
  const nav = id => { setPage(id); setSbOpen(false) }

  const Dashboard = () => (
    <div className="page-in">
      <div className="ph"><div><div className="pt">Dyqani Online</div><div className="ps">Menaxho produktet dhe porositë</div></div></div>
      <div className="sg">
        <StatCard icon="📦" label="Produkte Aktive"    value={stats?.products||0}             change="aktive" up/>
        <StatCard icon="🛒" label="Total Porosi"       value={stats?.orders||0}               change="porosi" up/>
        <StatCard icon="💰" label="Të Ardhura (30%)"   value={fmtNum(stats?.revenue||0)+' L'} change="komisioni" up/>
      </div>
      <div className="g2">
        <div className="card" style={{padding:32,textAlign:'center'}}>
          <div style={{fontSize:40,marginBottom:12}}>📦</div>
          <div style={{fontFamily:'var(--fs)',fontSize:18,marginBottom:8}}>Menaxho Produktet</div>
          <div style={{fontSize:13,color:'var(--g500)',marginBottom:20}}>Shto, edito dhe menaxho inventarin</div>
          <button className="btn btn-p" onClick={()=>nav('products')}>Shko te Produktet →</button>
        </div>
        <div className="card" style={{padding:32,textAlign:'center'}}>
          <div style={{fontSize:40,marginBottom:12}}>🛒</div>
          <div style={{fontFamily:'var(--fs)',fontSize:18,marginBottom:8}}>Menaxho Porositë</div>
          <div style={{fontSize:13,color:'var(--g500)',marginBottom:20}}>Konfirmo dhe dorëzo porositë</div>
          <button className="btn btn-p" onClick={()=>nav('orders')}>Shko te Porositë →</button>
        </div>
      </div>
    </div>
  )

  const PAGE = { dashboard:<Dashboard/>, products:<ProductsManager/>, orders:<OrdersManager/> }

  return (
    <div className="app">
      <div className={`sbo ${sbOpen?'open':''}`} onClick={()=>setSbOpen(false)}/>
      <aside className={`sidebar ${sbOpen?'open':''}`}>
        <div className="sb-logo"><div className="sb-icon">🛒</div><div><div className="sb-name">Vaqo Shop</div><div className="sb-sub">Admin Panel</div></div></div>
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
        <div className="sb-bot"><div className="user-card" onClick={logout}><div className="user-av">🛒</div><div><div className="user-nm">Shop Admin</div><div className="user-rl">Dil →</div></div></div></div>
      </aside>
      <main className="main">
        <div className="topbar">
          <div className="tbl">
            <button className="hmbg" style={{display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setSbOpen(s=>!s)}>☰</button>
            <div className="tb-title">{page==='dashboard'?'Dashboard':page==='products'?'Produktet':'Porositë'}</div>
          </div>
          <div className="tbr"><span className="bdg bdg-gy">🛒 Dyqani</span></div>
        </div>
        <div className="content">{PAGE[page]}</div>
      </main>
    </div>
  )
}
