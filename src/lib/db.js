import { supabase } from './supabase'

export const fmtNum  = (n) => (n ?? 0).toLocaleString('sq-AL')
export const fmtDate = (d) => d ? new Date(d).toLocaleDateString('sq-AL') : '—'
export const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('sq-AL', { hour:'2-digit', minute:'2-digit' }) : '—'
export const today   = () => new Date().toISOString().split('T')[0]
export const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate()+n); return r.toISOString().split('T')[0] }
export const AVC     = ['#18181b','#2563eb','#16a34a','#d97706','#dc2626','#7c3aed','#0891b2','#be185d']

export const memberStatus = (m) => {
  if (!m?.membership_status) return 'none'
  if (m.membership_status === 'frozen') return 'frozen'
  const d = m.days_remaining
  if (d == null || d < 0) return 'expired'
  if (d <= 7) return 'expiring'
  return 'active'
}

// ─── PLATFORM ADMIN ───────────────────────────────────────
export const getApplications = async () => {
  const { data } = await supabase.from('applications').select('*').order('created_at', { ascending:false })
  return data ?? []
}

export const getGyms = async () => {
  const { data } = await supabase.from('gyms').select('*').order('created_at', { ascending:false })
  return data ?? []
}

export const getPlatformStats = async () => {
  const [a, g, m, n] = await Promise.all([
    supabase.from('gyms').select('id',{count:'exact',head:true}).eq('status','approved'),
    supabase.from('gyms').select('id',{count:'exact',head:true}),
    supabase.from('members').select('id',{count:'exact',head:true}).eq('is_active',true),
    supabase.from('applications').select('id',{count:'exact',head:true}).eq('status','new'),
  ])
  return { approved: a.count??0, total: g.count??0, members: m.count??0, newApps: n.count??0 }
}

export const approveGym = async (appId, gymData) => {
  // 1. Krijo gym
  const { data: gym, error } = await supabase.from('gyms').insert({
    name: gymData.name, email: gymData.email,
    phone: gymData.phone, address: gymData.address,
    city: gymData.city, status: 'approved',
    approved_at: new Date().toISOString(),
  }).select().single()
  if (error) throw new Error(error.message)

  // 2. Plane default
  await supabase.rpc('create_default_plans', { p_gym_id: gym.id })

  // 3. Gym user (owner)
  await supabase.from('gym_users').insert({
    gym_id: gym.id, name: gymData.ownerName,
    email: gymData.email, role: 'owner',
  })

  // 4. Update application
  await supabase.from('applications').update({ status:'approved', gym_id: gym.id }).eq('id', appId)

  return gym
}

export const rejectApp = async (appId) => {
  await supabase.from('applications').update({ status:'rejected' }).eq('id', appId)
}

export const suspendGym = async (gymId) => {
  await supabase.from('gyms').update({ status:'suspended' }).eq('id', gymId)
}

export const activateGym = async (gymId) => {
  await supabase.from('gyms').update({ status:'approved' }).eq('id', gymId)
}

export const submitApplication = async (f) => {
  const { error } = await supabase.from('applications').insert({
    name: f.gymName, owner_name: f.ownerName,
    email: f.email, phone: f.phone,
    city: f.city, address: f.address, message: f.message,
  })
  if (error) throw new Error(error.message)
}

// ─── GYM ──────────────────────────────────────────────────
export const getGymStats = async (gymId) => {
  const { data } = await supabase.rpc('get_gym_stats', { p_gym_id: gymId })
  return data ?? {}
}

export const getRevenueChart = async (gymId) => {
  const { data } = await supabase.from('gym_monthly_revenue').select('*').eq('gym_id', gymId).limit(12)
  const arr = Array(12).fill(0)
  const yr = new Date().getFullYear()
  ;(data??[]).forEach(r => {
    const d = new Date(r.month)
    if (d.getFullYear() === yr) arr[d.getMonth()] = Number(r.total)
  })
  return arr
}

export const getExpiringMembers = async (gymId) => {
  const { data } = await supabase.from('members_with_status').select('*').eq('gym_id', gymId).gte('days_remaining', 0).lte('days_remaining', 7)
  return data ?? []
}

export const getUnpaidMembers = async (gymId) => {
  const { data } = await supabase.from('members_with_status').select('*').eq('gym_id', gymId).gt('total_debt', 0)
  return data ?? []
}

export const getTodayCheckins = async (gymId) => {
  const { data } = await supabase.from('todays_checkins').select('*').eq('gym_id', gymId)
  return data ?? []
}

export const getMembers = async (gymId, search='') => {
  let q = supabase.from('members_with_status').select('*').eq('gym_id', gymId).eq('is_active', true).order('last_name')
  if (search.trim()) q = q.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%`)
  const { data } = await q
  return data ?? []
}

export const getPlans = async (gymId) => {
  const { data } = await supabase.from('plans').select('*').eq('gym_id', gymId).eq('is_active', true).order('sort_order')
  return data ?? []
}

export const getMemberships = async (gymId, memberId=null) => {
  let q = supabase.from('memberships')
    .select('*, plan:plans(name,emoji,price,duration_days), member:members(first_name,last_name,avatar_color)')
    .eq('gym_id', gymId).order('end_date', { ascending:false })
  if (memberId) q = q.eq('member_id', memberId)
  const { data } = await q
  return data ?? []
}

export const getPayments = async (gymId) => {
  const { data } = await supabase.from('payments')
    .select('*, member:members(first_name,last_name,avatar_color), membership:memberships(plan:plans(name))')
    .eq('gym_id', gymId).order('created_at', { ascending:false }).limit(100)
  return data ?? []
}

export const getPaymentStats = async (gymId) => {
  const t  = today()
  const mo = t.slice(0,7) + '-01'
  const [td, mo_, d] = await Promise.all([
    supabase.from('payments').select('amount').eq('gym_id',gymId).eq('status','paid').gte('created_at',t),
    supabase.from('payments').select('amount').eq('gym_id',gymId).eq('status','paid').gte('created_at',mo),
    supabase.from('payments').select('amount').eq('gym_id',gymId).eq('status','unpaid'),
  ])
  return {
    today:   td.data?.reduce((a,p)=>a+p.amount,0)  ?? 0,
    month:   mo_.data?.reduce((a,p)=>a+p.amount,0) ?? 0,
    debt:    d.data?.reduce((a,p)=>a+p.amount,0)   ?? 0,
    debtors: d.data?.length ?? 0,
  }
}

export const addMember = async (gymId, f) => {
  const { data: m, error } = await supabase.from('members').insert({
    gym_id: gymId, first_name: f.firstName, last_name: f.lastName,
    phone: f.phone||null, email: f.email||null, birthday: f.birthday||null,
    gender: f.gender, notes: f.notes||null,
    avatar_color: Math.floor(Math.random()*8),
  }).select().single()
  if (error) throw new Error(error.message)

  if (f.planId) {
    const { data: plan } = await supabase.from('plans').select('*').eq('id', f.planId).single()
    const t = today()
    const { data: ms } = await supabase.from('memberships').insert({
      gym_id: gymId, member_id: m.id, plan_id: f.planId,
      start_date: t, end_date: addDays(t, plan.duration_days),
      price_paid: plan.price, status: 'active',
    }).select().single()
    await supabase.from('payments').insert({
      gym_id: gymId, member_id: m.id, membership_id: ms.id,
      amount: plan.price, method: f.method||'cash',
      status: 'paid', paid_at: new Date().toISOString(),
    })
  }
  return m
}

export const renewMembership = async (gymId, memberId, planId, method='cash') => {
  const { data: plan } = await supabase.from('plans').select('*').eq('id', planId).single()
  const t = today()
  await supabase.from('memberships').update({ status:'expired' }).eq('gym_id', gymId).eq('member_id', memberId).eq('status','active')
  const { data: ms } = await supabase.from('memberships').insert({
    gym_id: gymId, member_id: memberId, plan_id: planId,
    start_date: t, end_date: addDays(t, plan.duration_days),
    price_paid: plan.price, status: 'active',
  }).select().single()
  await supabase.from('payments').insert({
    gym_id: gymId, member_id: memberId, membership_id: ms.id,
    amount: plan.price, method, status: 'paid', paid_at: new Date().toISOString(),
  })
}

export const freezeMembership   = async (id) => supabase.rpc('freeze_membership',   { p_membership_id: id })
export const unfreezeMembership = async (id) => supabase.rpc('unfreeze_membership', { p_membership_id: id })

export const markPaymentPaid = async (gymId, id) => {
  await supabase.from('payments').update({ status:'paid', paid_at: new Date().toISOString() }).eq('id', id).eq('gym_id', gymId)
}

export const addPayment = async (gymId, f) => {
  await supabase.from('payments').insert({
    gym_id: gymId, member_id: f.memberId,
    amount: Number(f.amount), method: f.method||'cash',
    status: 'paid', paid_at: new Date().toISOString(),
  })
}

export const processQRCheckin = async (gymId, qrCode) => {
  const { data, error } = await supabase.rpc('process_qr_checkin', { p_qr_code: qrCode, p_gym_id: gymId })
  if (error) throw error
  return data
}

export const manualCheckin = async (gymId, memberId) => {
  const { data: ms } = await supabase.from('memberships').select('id')
    .eq('gym_id', gymId).eq('member_id', memberId).eq('status','active')
    .gte('end_date', today()).order('end_date',{ascending:false}).limit(1).maybeSingle()
  const { error } = await supabase.from('check_ins').insert({
    gym_id: gymId, member_id: memberId, membership_id: ms?.id||null, method:'manual',
  })
  if (error && !error.message.includes('unique')) throw error
}

export const getGym = async (gymId) => {
  const { data } = await supabase.from('gyms').select('*').eq('id', gymId).single()
  return data
}

export const updateGym = async (gymId, u) => {
  await supabase.from('gyms').update(u).eq('id', gymId)
}

export const updatePlanPrice = async (gymId, planId, price) => {
  await supabase.from('plans').update({ price: parseInt(price)||0 }).eq('id', planId).eq('gym_id', gymId)
}
