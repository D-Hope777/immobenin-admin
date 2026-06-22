import React, { useState, useEffect, useCallback } from "react";

// ============================================================
// SUPABASE CONFIG — same as main app
// ============================================================
const SUPABASE_URL = "https://frfltrcvilohwzsagkyf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Vi37xSbxZuPhmhZfkm3pQg_44lcUroe";
const ADMIN_PASSWORD = "77Warlock2026!$"; // Change this!

const db = {
  get: (table, params="") => fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
    headers:{ apikey:SUPABASE_ANON_KEY, Authorization:`Bearer ${SUPABASE_ANON_KEY}` }
  }).then(r=>r.json()),
  patch: (table, id, body) => fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method:"PATCH",
    headers:{ apikey:SUPABASE_ANON_KEY, Authorization:`Bearer ${SUPABASE_ANON_KEY}`, "Content-Type":"application/json", Prefer:"return=representation" },
    body:JSON.stringify(body)
  }).then(r=>r.json()),
  delete: (table, id) => fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method:"DELETE",
    headers:{ apikey:SUPABASE_ANON_KEY, Authorization:`Bearer ${SUPABASE_ANON_KEY}` }
  }).then(r=>r.ok),
};

function formatPrice(p) { return `${Number(p).toLocaleString("fr-FR")} XOF`; }
function formatDate(d) { return d ? new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}) : "—"; }
function daysLeft(exp) {
  if(!exp) return null;
  const diff = Math.ceil((new Date(exp) - new Date()) / 86400000);
  return diff;
}

const FALLBACK = "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=200&q=60";

// ============================================================
// DEMO DATA
// ============================================================
const DEMO = {
  listings: [
    { id:"l1", title:"Villa moderne à Fidjrossè", type:"Vente", category:"Villa", city:"Cotonou", price:85000000, is_featured:true, is_active:true, payment_status:"paid", created_at:"2025-05-10T08:00:00Z", expires_at:"2025-07-09T08:00:00Z", images:["https://images.unsplash.com/photo-1613977257363-707ba9348227?w=200&q=60"], agents:{full_name:"Rodrigue Kossou",phone:"22997001122",agency_name:"Kossou Immo"} },
    { id:"l2", title:"Appart meublé Cadjehoun", type:"Location", category:"Appartement", city:"Cotonou", price:250000, is_featured:true, is_active:true, payment_status:"paid", created_at:"2025-05-18T09:00:00Z", expires_at:"2025-07-17T09:00:00Z", images:["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=60"], agents:{full_name:"Aïcha Hounsou",phone:"22996112233",agency_name:null} },
    { id:"l3", title:"Terrain titré Abomey-Calavi", type:"Vente", category:"Terrain", city:"Abomey-Calavi", price:18000000, is_featured:false, is_active:true, payment_status:"pending", created_at:"2025-06-01T10:00:00Z", expires_at:"2025-07-31T10:00:00Z", images:["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&q=60"], agents:{full_name:"Edmond Zinsou",phone:"22994556677",agency_name:null} },
    { id:"l4", title:"Bureau climatisé Ganhi", type:"Location", category:"Bureau", city:"Cotonou", price:180000, is_featured:false, is_active:false, payment_status:"expired", created_at:"2025-03-01T08:00:00Z", expires_at:"2025-04-30T08:00:00Z", images:["https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&q=60"], agents:{full_name:"Patricia Dossou",phone:"22991234567",agency_name:"Dossou Properties"} },
    { id:"l5", title:"Maison F5 Akpakpa", type:"Vente", category:"Maison", city:"Cotonou", price:32000000, is_featured:false, is_active:true, payment_status:"pending", created_at:"2025-06-05T11:00:00Z", expires_at:"2025-08-04T11:00:00Z", images:["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=200&q=60"], agents:{full_name:"Comlan Agbessi",phone:"22998877665",agency_name:null} },
  ],
  payments: [
    { id:"p1", amount:7000, type:"featured", status:"confirmed", method:"mtn_momo", reference:"MTN2025001", created_at:"2025-05-10T09:00:00Z", confirmed_at:"2025-05-10T11:00:00Z", listings:{title:"Villa moderne à Fidjrossè"}, agents:{full_name:"Rodrigue Kossou",phone:"22997001122"} },
    { id:"p2", amount:7000, type:"featured", status:"confirmed", method:"moov_money", reference:"MOOV2025002", created_at:"2025-05-18T10:00:00Z", confirmed_at:"2025-05-18T13:00:00Z", listings:{title:"Appart meublé Cadjehoun"}, agents:{full_name:"Aïcha Hounsou",phone:"22996112233"} },
    { id:"p3", amount:2000, type:"standard", status:"pending", method:null, reference:null, created_at:"2025-06-01T10:30:00Z", confirmed_at:null, listings:{title:"Terrain titré Abomey-Calavi"}, agents:{full_name:"Edmond Zinsou",phone:"22994556677"} },
    { id:"p4", amount:2000, type:"standard", status:"pending", method:null, reference:null, created_at:"2025-06-05T12:00:00Z", confirmed_at:null, listings:{title:"Maison F5 Akpakpa"}, agents:{full_name:"Comlan Agbessi",phone:"22998877665"} },
    { id:"p5", amount:2000, type:"standard", status:"failed", method:"mtn_momo", reference:"MTN2025FAIL", created_at:"2025-03-01T09:00:00Z", confirmed_at:null, listings:{title:"Bureau climatisé Ganhi"}, agents:{full_name:"Patricia Dossou",phone:"22991234567"} },
  ],
  inquiries: [
    { id:"i1", sender_name:"Kossi Gbenou", sender_phone:"22996001122", message:"Bonjour, disponible ce weekend ?", channel:"web", created_at:"2025-06-10T10:00:00Z", listings:{title:"Villa moderne à Fidjrossè"}, agents:{full_name:"Rodrigue Kossou"} },
    { id:"i2", sender_name:"Marie Adjovi", sender_phone:"22994887766", message:"Quel est le prix négociable ?", channel:"whatsapp", created_at:"2025-06-11T14:00:00Z", listings:{title:"Appart meublé Cadjehoun"}, agents:{full_name:"Aïcha Hounsou"} },
    { id:"i3", sender_name:"Jean-Baptiste Hounkpè", sender_phone:"22997445566", message:"Je souhaite visiter dès que possible", channel:"web", created_at:"2025-06-12T08:30:00Z", listings:{title:"Terrain titré Abomey-Calavi"}, agents:{full_name:"Edmond Zinsou"} },
  ],
  agents: [
    { id:"a1", full_name:"Rodrigue Kossou", phone:"22997001122", email:"rodrigue@immobenin.bj", agency_name:"Kossou Immobilier", city:"Cotonou", is_verified:true, created_at:"2025-05-10T08:00:00Z" },
    { id:"a2", full_name:"Aïcha Hounsou", phone:"22996112233", email:null, agency_name:null, city:"Cotonou", is_verified:false, created_at:"2025-05-18T09:00:00Z" },
    { id:"a3", full_name:"Edmond Zinsou", phone:"22994556677", email:null, agency_name:null, city:"Abomey-Calavi", is_verified:false, created_at:"2025-06-01T10:00:00Z" },
    { id:"a4", full_name:"Patricia Dossou", phone:"22991234567", email:"patricia@immobenin.bj", agency_name:"Dossou Properties", city:"Cotonou", is_verified:true, created_at:"2025-03-01T08:00:00Z" },
    { id:"a5", full_name:"Comlan Agbessi", phone:"22998877665", email:null, agency_name:null, city:"Cotonou", is_verified:false, created_at:"2025-06-05T11:00:00Z" },
  ]
};

// ============================================================
// COMPONENTS
// ============================================================
function Spinner() {
  return <div style={{display:"flex",justifyContent:"center",padding:40}}>
    <div style={{width:32,height:32,borderRadius:"50%",border:"4px solid #F0EDE8",borderTopColor:"#C0522A",animation:"spin 0.8s linear infinite"}}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>;
}

function Badge({ status }) {
  const map = {
    paid:       { bg:"#D4EDDA", color:"#155724", label:"Payé" },
    confirmed:  { bg:"#D4EDDA", color:"#155724", label:"Confirmé" },
    pending:    { bg:"#FFF3CD", color:"#856404", label:"En attente" },
    failed:     { bg:"#F8D7DA", color:"#721C24", label:"Échoué" },
    expired:    { bg:"#E2E3E5", color:"#383D41", label:"Expiré" },
    active:     { bg:"#D4EDDA", color:"#155724", label:"Active" },
    inactive:   { bg:"#F8D7DA", color:"#721C24", label:"Inactive" },
    featured:   { bg:"#FFF3CD", color:"#856404", label:"⭐ Vedette" },
    standard:   { bg:"#E8F4FD", color:"#0c5460", label:"Standard" },
    web:        { bg:"#E8F4FD", color:"#0c5460", label:"Web" },
    whatsapp:   { bg:"#D4EDDA", color:"#155724", label:"WhatsApp" },
    call:       { bg:"#F8D7DA", color:"#721C24", label:"Appel" },
  };
  const s = map[status] || { bg:"#eee", color:"#555", label: status };
  return <span style={{background:s.bg,color:s.color,fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:14,fontFamily:"Inter,sans-serif",whiteSpace:"nowrap"}}>{s.label}</span>;
}

function KPI({ icon, label, value, sub, color="#C0522A" }) {
  return (
    <div style={{background:"#fff",borderRadius:14,padding:"18px 20px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",flex:1,minWidth:140}}>
      <div style={{fontSize:24,marginBottom:8}}>{icon}</div>
      <div style={{fontFamily:"Poppins,sans-serif",fontWeight:900,fontSize:26,color,marginBottom:2}}>{value}</div>
      <div style={{fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:13,color:"#1C1C1E",marginBottom:2}}>{label}</div>
      {sub&&<div style={{fontFamily:"Inter,sans-serif",fontSize:11,color:"#888"}}>{sub}</div>}
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div onClick={onCancel} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,padding:28,maxWidth:360,width:"100%",boxShadow:"0 20px 50px rgba(0,0,0,0.25)",textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:12}}>⚠️</div>
        <p style={{fontFamily:"Inter,sans-serif",fontSize:15,color:"#1C1C1E",marginBottom:22,lineHeight:1.5}}>{message}</p>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} style={{flex:1,padding:"11px",border:"2px solid #E0DDD8",borderRadius:10,background:"#fff",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:14,cursor:"pointer"}}>Annuler</button>
          <button onClick={onConfirm} style={{flex:1,padding:"11px",border:"none",borderRadius:10,background:"#C0522A",color:"#fff",fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14,cursor:"pointer"}}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SECTIONS
// ============================================================

function Overview({ data }) {
  const totalRevenue = data.payments.filter(p=>p.status==="confirmed").reduce((s,p)=>s+p.amount,0);
  const pending = data.payments.filter(p=>p.status==="pending");
  const pendingRev = pending.reduce((s,p)=>s+p.amount,0);
  const active = data.listings.filter(l=>l.is_active);
  const expiringSoon = data.listings.filter(l=>{ const d=daysLeft(l.expires_at); return d!==null&&d<=7&&d>0; });

  return (
    <div>
      <h2 style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:20,color:"#1C1C1E",marginBottom:20}}>Vue d'ensemble</h2>

      {/* KPIs */}
      <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:24}}>
        <KPI icon="📋" label="Annonces actives" value={active.length} sub={`/${data.listings.length} total`} color="#1C6E3D"/>
        <KPI icon="⭐" label="En vedette" value={data.listings.filter(l=>l.is_featured).length} sub="annonces boostées" color="#E8A020"/>
        <KPI icon="💰" label="Revenus confirmés" value={`${totalRevenue.toLocaleString("fr-FR")}`} sub="XOF encaissés" color="#C0522A"/>
        <KPI icon="⏳" label="Paiements en attente" value={pending.length} sub={`${pendingRev.toLocaleString("fr-FR")} XOF à encaisser`} color="#856404"/>
        <KPI icon="👥" label="Agents enregistrés" value={data.agents.length} sub={`${data.agents.filter(a=>a.is_verified).length} vérifiés`} color="#1C1C1E"/>
        <KPI icon="📩" label="Messages reçus" value={data.inquiries.length} sub="demandes de contact" color="#0c5460"/>
      </div>

      {/* Alerts */}
      {expiringSoon.length > 0 && (
        <div style={{background:"#FFF3CD",borderRadius:12,padding:"14px 18px",marginBottom:20,border:"1px solid #FFEAA7"}}>
          <div style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14,color:"#856404",marginBottom:6}}>⚠️ Annonces expirant bientôt</div>
          {expiringSoon.map(l=>(
            <div key={l.id} style={{fontFamily:"Inter,sans-serif",fontSize:13,color:"#555",padding:"3px 0"}}>
              • <strong>{l.title}</strong> — expire dans <strong>{daysLeft(l.expires_at)} jour{daysLeft(l.expires_at)>1?"s":""}</strong>
            </div>
          ))}
        </div>
      )}

      {pending.length > 0 && (
        <div style={{background:"#FFF0EB",borderRadius:12,padding:"14px 18px",border:"1px solid #F5CBA7"}}>
          <div style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14,color:"#C0522A",marginBottom:6}}>🔔 {pending.length} paiement{pending.length>1?"s":""} en attente de confirmation</div>
          {pending.map(p=>(
            <div key={p.id} style={{fontFamily:"Inter,sans-serif",fontSize:13,color:"#555",padding:"3px 0"}}>
              • <strong>{p.agents?.full_name}</strong> — {p.amount.toLocaleString("fr-FR")} XOF ({p.type==="featured"?"vedette":"standard"}) · {formatDate(p.created_at)}
            </div>
          ))}
        </div>
      )}

      {/* Revenue chart bars */}
      <div style={{background:"#fff",borderRadius:14,padding:20,marginTop:20,boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
        <div style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:15,marginBottom:14}}>💰 Répartition des paiements</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[
            {label:"Confirmés",value:data.payments.filter(p=>p.status==="confirmed").length,total:data.payments.length,color:"#1C6E3D"},
            {label:"En attente",value:data.payments.filter(p=>p.status==="pending").length,total:data.payments.length,color:"#E8A020"},
            {label:"Échoués",value:data.payments.filter(p=>p.status==="failed").length,total:data.payments.length,color:"#C0522A"},
          ].map(r=>(
            <div key={r.label}>
              <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Inter,sans-serif",fontSize:12,marginBottom:4}}>
                <span style={{fontWeight:600}}>{r.label}</span><span style={{color:"#888"}}>{r.value}/{r.total}</span>
              </div>
              <div style={{height:8,background:"#F0EDE8",borderRadius:6,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${r.total>0?Math.round(r.value/r.total*100):0}%`,background:r.color,borderRadius:6,transition:"width 0.6s"}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ListingsTable({ listings, onAction, loading }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = listings.filter(l => {
    if (statusFilter === "active") return l.is_active;
    if (statusFilter === "inactive") return !l.is_active;
    if (statusFilter === "pending") return l.payment_status === "pending";
    if (statusFilter === "featured") return l.is_featured;
    return true;
  }).filter(l => !search || l.title.toLowerCase().includes(search.toLowerCase()) || (l.agents?.full_name||"").toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:18}}>
        <h2 style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:20,color:"#1C1C1E",margin:0}}>Gestion des annonces</h2>
        <input placeholder="🔍 Rechercher..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{padding:"8px 14px",border:"2px solid #E0DDD8",borderRadius:30,fontFamily:"Inter,sans-serif",fontSize:13,outline:"none"}}/>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {[["all","Toutes"],["active","Actives"],["inactive","Inactives"],["pending","Paiement en attente"],["featured","En vedette"]].map(([v,l])=>(
          <button key={v} onClick={()=>setStatusFilter(v)} style={{padding:"6px 14px",borderRadius:20,border:`2px solid ${statusFilter===v?"#C0522A":"#E0DDD8"}`,background:statusFilter===v?"#C0522A":"#fff",color:statusFilter===v?"#fff":"#555",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>{l}</button>
        ))}
      </div>
      {loading ? <Spinner/> : (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {filtered.map(l => {
            const days = daysLeft(l.expires_at);
            return (
              <div key={l.id} style={{background:"#fff",borderRadius:14,padding:"14px 16px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",border:`2px solid ${!l.is_active?"#F8D7DA":l.payment_status==="pending"?"#FFF3CD":"#F0EDE8"}`}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <img src={l.images?.[0]||FALLBACK} alt="" style={{width:64,height:64,objectFit:"cover",borderRadius:10,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:5}}>
                      <Badge status={l.is_active?"active":"inactive"}/>
                      <Badge status={l.payment_status}/>
                      {l.is_featured&&<Badge status="featured"/>}
                      {days!==null&&days<=7&&days>0&&<span style={{background:"#F8D7DA",color:"#721C24",fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:14,fontFamily:"Inter,sans-serif"}}>⚠️ Expire dans {days}j</span>}
                    </div>
                    <div style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14,color:"#1C1C1E",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.title}</div>
                    <div style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#888",marginBottom:4}}>
                      {l.type} · {l.city} · {formatPrice(l.price)} · Par <strong>{l.agents?.full_name||"—"}</strong>
                    </div>
                    <div style={{fontFamily:"Inter,sans-serif",fontSize:11,color:"#AAA"}}>Créée le {formatDate(l.created_at)} · Expire le {formatDate(l.expires_at)}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12,borderTop:"1px solid #F5F0EC",paddingTop:10}}>
                  {l.payment_status==="pending"&&(
                    <button onClick={()=>onAction("confirm_payment",l)} style={{padding:"7px 14px",background:"#1C6E3D",border:"none",borderRadius:8,color:"#fff",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>✅ Confirmer paiement</button>
                  )}
                  {!l.is_featured&&l.is_active&&(
                    <button onClick={()=>onAction("feature",l)} style={{padding:"7px 14px",background:"#E8A020",border:"none",borderRadius:8,color:"#fff",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>⭐ Mettre en vedette</button>
                  )}
                  {l.is_featured&&(
                    <button onClick={()=>onAction("unfeature",l)} style={{padding:"7px 14px",background:"#fff",border:"2px solid #E8A020",borderRadius:8,color:"#E8A020",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>Retirer vedette</button>
                  )}
                  <button onClick={()=>onAction(l.is_active?"deactivate":"activate",l)} style={{padding:"7px 14px",background:"#fff",border:`2px solid ${l.is_active?"#C0522A":"#1C6E3D"}`,borderRadius:8,color:l.is_active?"#C0522A":"#1C6E3D",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>
                    {l.is_active?"🚫 Désactiver":"✅ Réactiver"}
                  </button>
                  <button onClick={()=>onAction("delete",l)} style={{padding:"7px 14px",background:"#fff",border:"2px solid #F8D7DA",borderRadius:8,color:"#C0522A",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>🗑 Supprimer</button>
                </div>
              </div>
            );
          })}
          {filtered.length===0&&<div style={{textAlign:"center",padding:40,color:"#888",fontFamily:"Inter,sans-serif"}}>Aucune annonce trouvée</div>}
        </div>
      )}
    </div>
  );
}

function PaymentsTable({ payments, onAction, loading }) {
  const [filter, setFilter] = useState("all");

  const filtered = payments.filter(p => filter==="all"||p.status===filter);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:18}}>
        <h2 style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:20,color:"#1C1C1E",margin:0}}>Paiements</h2>
        <div style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:15,color:"#C0522A"}}>
          {payments.filter(p=>p.status==="confirmed").reduce((s,p)=>s+p.amount,0).toLocaleString("fr-FR")} XOF encaissés
        </div>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {[["all","Tous"],["pending","En attente"],["confirmed","Confirmés"],["failed","Échoués"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{padding:"6px 14px",borderRadius:20,border:`2px solid ${filter===v?"#C0522A":"#E0DDD8"}`,background:filter===v?"#C0522A":"#fff",color:filter===v?"#fff":"#555",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>{l}</button>
        ))}
      </div>
      {loading ? <Spinner/> : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filtered.map(p=>(
            <div key={p.id} style={{background:"#fff",borderRadius:14,padding:"14px 16px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",border:`2px solid ${p.status==="pending"?"#FFF3CD":p.status==="confirmed"?"#D4EDDA":"#F8D7DA"}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,flexWrap:"wrap"}}>
                <div>
                  <div style={{display:"flex",gap:6,marginBottom:5,flexWrap:"wrap"}}>
                    <Badge status={p.status}/>
                    <Badge status={p.type}/>
                  </div>
                  <div style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:15,color:"#C0522A"}}>{p.amount.toLocaleString("fr-FR")} XOF</div>
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#555",marginTop:3}}>
                    Annonce : <strong>{p.listings?.title||"—"}</strong>
                  </div>
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#888",marginTop:2}}>
                    Agent : {p.agents?.full_name||"—"} · {p.agents?.phone||"—"}
                  </div>
                  {p.method&&<div style={{fontFamily:"Inter,sans-serif",fontSize:11,color:"#AAA",marginTop:2}}>Via {p.method.replace("_"," ").toUpperCase()} {p.reference?`· Réf: ${p.reference}`:""}</div>}
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:11,color:"#AAA",marginTop:2}}>
                    Soumis le {formatDate(p.created_at)} {p.confirmed_at?`· Confirmé le ${formatDate(p.confirmed_at)}`:""}
                  </div>
                </div>
                {p.status==="pending"&&(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <button onClick={()=>onAction("confirm_payment_direct",p)} style={{padding:"9px 16px",background:"#1C6E3D",border:"none",borderRadius:9,color:"#fff",fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>✅ Confirmer</button>
                    <button onClick={()=>onAction("reject_payment",p)} style={{padding:"9px 16px",background:"#fff",border:"2px solid #C0522A",borderRadius:9,color:"#C0522A",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>❌ Rejeter</button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length===0&&<div style={{textAlign:"center",padding:40,color:"#888",fontFamily:"Inter,sans-serif"}}>Aucun paiement dans cette catégorie</div>}
        </div>
      )}
    </div>
  );
}

function InquiriesTable({ inquiries, loading }) {
  return (
    <div>
      <h2 style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:20,color:"#1C1C1E",marginBottom:18}}>Messages reçus</h2>
      {loading ? <Spinner/> : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {inquiries.map(i=>(
            <div key={i.id} style={{background:"#fff",borderRadius:14,padding:"14px 16px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",border:"2px solid #F0EDE8"}}>
              <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                <div>
                  <div style={{display:"flex",gap:6,marginBottom:5}}><Badge status={i.channel}/></div>
                  <div style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14,color:"#1C1C1E"}}>{i.sender_name}</div>
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#888",marginTop:2}}>📱 {i.sender_phone}</div>
                  {i.message&&<div style={{fontFamily:"Inter,sans-serif",fontSize:13,color:"#555",marginTop:5,fontStyle:"italic",lineHeight:1.5}}>"{i.message}"</div>}
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#888",marginTop:5}}>
                    Annonce : <strong>{i.listings?.title||"—"}</strong> · Agent : {i.agents?.full_name||"—"}
                  </div>
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:11,color:"#AAA",marginTop:3}}>{formatDate(i.created_at)}</div>
                </div>
                <a href={`https://wa.me/${i.sender_phone}?text=${encodeURIComponent(`Bonjour ${i.sender_name}, suite à votre message sur ImmoBénin...`)}`} target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",gap:6,background:"#25D366",color:"#fff",border:"none",borderRadius:9,padding:"9px 14px",fontSize:12,fontWeight:600,textDecoration:"none",fontFamily:"Inter,sans-serif",alignSelf:"flex-start"}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Répondre
                </a>
              </div>
            </div>
          ))}
          {inquiries.length===0&&<div style={{textAlign:"center",padding:40,color:"#888",fontFamily:"Inter,sans-serif"}}>Aucun message reçu</div>}
        </div>
      )}
    </div>
  );
}

function AgentsTable({ agents, loading }) {
  return (
    <div>
      <h2 style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:20,color:"#1C1C1E",marginBottom:18}}>Agents & Vendeurs</h2>
      {loading ? <Spinner/> : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {agents.map(a=>(
            <div key={a.id} style={{background:"#fff",borderRadius:14,padding:"14px 16px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",border:"2px solid #F0EDE8",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#C0522A,#E8A020)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:16,color:"#fff",flexShrink:0}}>
                  {a.full_name.charAt(0)}
                </div>
                <div>
                  <div style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14,color:"#1C1C1E",display:"flex",alignItems:"center",gap:6}}>
                    {a.full_name}
                    {a.is_verified&&<span style={{background:"#D4EDDA",color:"#155724",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:10,fontFamily:"Inter,sans-serif"}}>✓ Vérifié</span>}
                  </div>
                  {a.agency_name&&<div style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#888"}}>{a.agency_name}</div>}
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#888"}}>📱 {a.phone} {a.email?`· ${a.email}`:""}</div>
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:11,color:"#AAA"}}>📍 {a.city||"—"} · Depuis {formatDate(a.created_at)}</div>
                </div>
              </div>
              <a href={`https://wa.me/${a.phone}`} target="_blank" rel="noopener noreferrer"
                style={{display:"flex",alignItems:"center",gap:5,background:"#25D366",color:"#fff",border:"none",borderRadius:9,padding:"8px 13px",fontSize:12,fontWeight:600,textDecoration:"none",fontFamily:"Inter,sans-serif"}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN ADMIN APP
// ============================================================
export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwdErr, setPwdErr] = useState(false);
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState({ listings:[], payments:[], inquiries:[], agents:[] });
  const [loading, setLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const showToast = (msg, type="success") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null),3200);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [listings,payments,inquiries,agents] = await Promise.all([
        db.get("listings","?select=*,agents(full_name,phone,agency_name)&order=created_at.desc"),
        db.get("payments","?select=*,listings(title),agents(full_name,phone)&order=created_at.desc"),
        db.get("inquiries","?select=*,listings(title),agents(full_name)&order=created_at.desc"),
        db.get("agents","?select=*&order=created_at.desc"),
      ]);
      if(Array.isArray(listings)&&listings.length>0){
        setData({listings,payments:Array.isArray(payments)?payments:[],inquiries:Array.isArray(inquiries)?inquiries:[],agents:Array.isArray(agents)?agents:[]});
        setDbConnected(true);
      } else {
        setData(DEMO);
        setDbConnected(false);
      }
    } catch { setData(DEMO); setDbConnected(false); }
    setLoading(false);
  }, []);

  useEffect(() => { if(authed) fetchAll(); }, [authed, fetchAll]);

  const handleAction = (action, item) => {
    const messages = {
      confirm_payment: `Confirmer le paiement pour l'annonce "${item.title}" ?`,
      feature: `Mettre en vedette l'annonce "${item.title}" ?`,
      unfeature: `Retirer l'annonce "${item.title}" de la vedette ?`,
      deactivate: `Désactiver l'annonce "${item.title}" ? Elle ne sera plus visible.`,
      activate: `Réactiver l'annonce "${item.title}" ?`,
      delete: `Supprimer définitivement l'annonce "${item.title}" ? Cette action est irréversible.`,
      confirm_payment_direct: `Confirmer le paiement de ${item.amount?.toLocaleString("fr-FR")} XOF de ${item.agents?.full_name} ?`,
      reject_payment: `Rejeter le paiement de ${item.agents?.full_name} pour ${item.amount?.toLocaleString("fr-FR")} XOF ?`,
    };
    setConfirm({ action, item, message: messages[action] || "Confirmer cette action ?" });
  };

  const executeAction = async () => {
    const { action, item } = confirm;
    setConfirm(null);

    // In demo mode, just update local state
    if (!dbConnected) {
      setData(d => {
        let listings = [...d.listings];
        let payments = [...d.payments];
        if (action==="confirm_payment") listings = listings.map(l=>l.id===item.id?{...l,payment_status:"paid",is_active:true}:l);
        if (action==="feature") listings = listings.map(l=>l.id===item.id?{...l,is_featured:true}:l);
        if (action==="unfeature") listings = listings.map(l=>l.id===item.id?{...l,is_featured:false}:l);
        if (action==="deactivate") listings = listings.map(l=>l.id===item.id?{...l,is_active:false}:l);
        if (action==="activate") listings = listings.map(l=>l.id===item.id?{...l,is_active:true}:l);
        if (action==="delete") listings = listings.filter(l=>l.id!==item.id);
        if (action==="confirm_payment_direct") payments = payments.map(p=>p.id===item.id?{...p,status:"confirmed",confirmed_at:new Date().toISOString()}:p);
        if (action==="reject_payment") payments = payments.map(p=>p.id===item.id?{...p,status:"failed"}:p);
        return {...d,listings,payments};
      });
      showToast("Action effectuée (mode démo)","success");
      return;
    }

    // Real Supabase actions
    try {
      if (action==="confirm_payment") await db.patch("listings",item.id,{payment_status:"paid",is_active:true});
      if (action==="feature") await db.patch("listings",item.id,{is_featured:true});
      if (action==="unfeature") await db.patch("listings",item.id,{is_featured:false});
      if (action==="deactivate") await db.patch("listings",item.id,{is_active:false});
      if (action==="activate") await db.patch("listings",item.id,{is_active:true});
      if (action==="delete") await db.delete("listings",item.id);
      if (action==="confirm_payment_direct") await db.patch("payments",item.id,{status:"confirmed",confirmed_at:new Date().toISOString()});
      if (action==="reject_payment") await db.patch("payments",item.id,{status:"failed"});
      showToast("Action effectuée avec succès","success");
      fetchAll();
    } catch(e) { showToast("Erreur : "+e.message,"error"); }
  };

  // LOGIN SCREEN
  if (!authed) {
    return (
      <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1C1C1E 0%,#2D1A0E 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
        <div style={{background:"#fff",borderRadius:20,padding:"36px 32px",maxWidth:380,width:"100%",boxShadow:"0 24px 60px rgba(0,0,0,0.4)",textAlign:"center"}}>
          <div style={{width:60,height:60,borderRadius:16,background:"linear-gradient(135deg,#C0522A,#E8A020)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:28}}>🏡</div>
          <h1 style={{fontFamily:"Poppins,sans-serif",fontWeight:900,fontSize:22,color:"#1C1C1E",marginBottom:4}}>ImmoBénin</h1>
          <p style={{fontFamily:"Inter,sans-serif",fontSize:13,color:"#888",marginBottom:28}}>Tableau de bord administrateur</p>
          <input
            type="password"
            placeholder="Mot de passe admin"
            value={pwd}
            onChange={e=>{setPwd(e.target.value);setPwdErr(false);}}
            onKeyDown={e=>{if(e.key==="Enter"){if(pwd===ADMIN_PASSWORD){setAuthed(true);}else{setPwdErr(true);}}}}
            style={{width:"100%",padding:"12px 14px",border:`2px solid ${pwdErr?"#C0522A":"#E0DDD8"}`,borderRadius:12,fontFamily:"Inter,sans-serif",fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:8}}
          />
          {pwdErr&&<div style={{color:"#C0522A",fontFamily:"Inter,sans-serif",fontSize:12,marginBottom:8}}>⚠️ Mot de passe incorrect</div>}
          <button onClick={()=>{if(pwd===ADMIN_PASSWORD){setAuthed(true);}else{setPwdErr(true);}}} style={{width:"100%",padding:"13px",background:"linear-gradient(135deg,#C0522A,#E8A020)",border:"none",borderRadius:12,color:"#fff",fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:15,cursor:"pointer",boxShadow:"0 4px 14px rgba(192,82,42,0.35)"}}>
            Connexion →
          </button>
          <p style={{fontFamily:"Inter,sans-serif",fontSize:11,color:"#BBB",marginTop:16}}>Mot de passe par défaut : <strong>admin2025</strong></p>
        </div>
      </div>
    );
  }

  const TABS = [
    {id:"overview",icon:"📊",label:"Vue d'ensemble"},
    {id:"listings",icon:"🏠",label:`Annonces (${data.listings.length})`},
    {id:"payments",icon:"💰",label:`Paiements (${data.payments.filter(p=>p.status==="pending").length} en attente)`},
    {id:"inquiries",icon:"📩",label:`Messages (${data.inquiries.length})`},
    {id:"agents",icon:"👥",label:`Agents (${data.agents.length})`},
  ];

  return (
    <div style={{fontFamily:"Inter,sans-serif",background:"#FAF7F2",minHeight:"100vh"}}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      {/* TOAST */}
      {toast&&(
        <div style={{position:"fixed",top:20,right:20,zIndex:4000,background:toast.type==="error"?"#C0522A":"#1C6E3D",color:"#fff",padding:"12px 20px",borderRadius:12,fontFamily:"Inter,sans-serif",fontSize:13,fontWeight:600,boxShadow:"0 8px 24px rgba(0,0,0,0.25)",animation:"fadeIn 0.3s ease"}}>
          {toast.type==="error"?"❌":"✅"} {toast.msg}
        </div>
      )}
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* CONFIRM DIALOG */}
      {confirm&&<ConfirmModal message={confirm.message} onConfirm={executeAction} onCancel={()=>setConfirm(null)}/>}

      {/* HEADER */}
      <header style={{background:"#1C1C1E",padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:60,boxShadow:"0 2px 12px rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#C0522A,#E8A020)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🏡</div>
          <span style={{fontFamily:"Poppins,sans-serif",fontWeight:900,fontSize:17,color:"#fff"}}>Immo<span style={{color:"#E8A020"}}>Bénin</span> <span style={{fontWeight:400,fontSize:12,color:"rgba(255,255,255,0.5)"}}>Admin</span></span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          {dbConnected
            ? <span style={{fontFamily:"Inter,sans-serif",fontSize:11,color:"#4CAF50",fontWeight:600}}>● Supabase connecté</span>
            : <span style={{fontFamily:"Inter,sans-serif",fontSize:11,color:"#E8A020",fontWeight:600}}>● Mode démo</span>
          }
          <button onClick={fetchAll} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,padding:"7px 12px",color:"#fff",fontFamily:"Inter,sans-serif",fontSize:12,cursor:"pointer"}}>↻ Actualiser</button>
          <button onClick={()=>setAuthed(false)} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"7px 12px",color:"rgba(255,255,255,0.6)",fontFamily:"Inter,sans-serif",fontSize:12,cursor:"pointer"}}>Déconnexion</button>
        </div>
      </header>

      <div style={{display:"flex",minHeight:"calc(100vh - 60px)"}}>
        {/* SIDEBAR */}
        <nav style={{width:220,background:"#fff",borderRight:"1px solid #F0EDE8",padding:"20px 12px",flexShrink:0,boxShadow:"2px 0 8px rgba(0,0,0,0.04)"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:12,border:"none",background:tab===t.id?"#FFF0EB":"transparent",color:tab===t.id?"#C0522A":"#555",fontFamily:"Inter,sans-serif",fontWeight:tab===t.id?700:500,fontSize:13,cursor:"pointer",textAlign:"left",marginBottom:4,transition:"all 0.15s"}}>
              <span>{t.icon}</span><span style={{lineHeight:1.3}}>{t.label}</span>
            </button>
          ))}
          <div style={{marginTop:"auto",paddingTop:20,borderTop:"1px solid #F0EDE8",marginTop:16}}>
            <a href="#" style={{display:"block",textAlign:"center",fontFamily:"Inter,sans-serif",fontSize:12,color:"#C0522A",fontWeight:600,textDecoration:"none",padding:"8px 0"}}>← Retour au site</a>
          </div>
        </nav>

        {/* CONTENT */}
        <main style={{flex:1,padding:"28px 24px",overflow:"auto",maxWidth:"calc(100vw - 220px)"}}>
          {tab==="overview"&&<Overview data={data}/>}
          {tab==="listings"&&<ListingsTable listings={data.listings} onAction={handleAction} loading={loading}/>}
          {tab==="payments"&&<PaymentsTable payments={data.payments} onAction={handleAction} loading={loading}/>}
          {tab==="inquiries"&&<InquiriesTable inquiries={data.inquiries} loading={loading}/>}
          {tab==="agents"&&<AgentsTable agents={data.agents} loading={loading}/>}
        </main>
      </div>
    </div>
  );
}
