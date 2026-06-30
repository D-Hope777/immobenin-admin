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

const LOGO_ICON = "data:image/png;base64,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";

function formatPrice(p) { return `${Number(p).toLocaleString("fr-FR")} F CFA`; }
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
  ],
  concierge: [
    { id:"c1", listing_title:"Villa moderne à Fidjrossè", city:"Cotonou", requester_name:"Jean Dossou", requester_phone:"22995001122", requester_role:"acheteur", notes:"Disponible ce weekend", price_quoted:11000, status:"pending", created_at:"2025-06-15T10:00:00Z" },
    { id:"c2", listing_title:"Terrain à Kpomassè", city:"Kpomassè", requester_name:"Fatima Alabi", requester_phone:"22994223344", requester_role:"vendeur", notes:"Veut rassurer les acheteurs", price_quoted:null, status:"quoted", created_at:"2025-06-16T14:00:00Z" },
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
    ref_not_found: { bg:"#FFE0B2", color:"#E65100", label:"🔍 Réf. introuvable" },
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
        <KPI icon="💰" label="Revenus confirmés" value={`${totalRevenue.toLocaleString("fr-FR")}`} sub="F CFA encaissés" color="#C0522A"/>
        <KPI icon="⏳" label="Paiements en attente" value={pending.length} sub={`${pendingRev.toLocaleString("fr-FR")} F CFA à encaisser`} color="#856404"/>
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
              • <strong>{p.agents?.full_name}</strong> — {p.amount.toLocaleString("fr-FR")} F CFA ({p.type==="featured"?"vedette":"standard"}) · {formatDate(p.created_at)}
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
    if (statusFilter === "awaiting_approval") return !l.is_active;
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
        {[["all","Toutes"],["awaiting_approval","🆕 En attente d'approbation"],["active","Actives"],["inactive","Inactives"],["pending","Paiement en attente"],["featured","En vedette"]].map(([v,l])=>(
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
                  <button onClick={()=>onAction(l.is_active?"deactivate":"activate",l)} style={{padding:"7px 14px",background:l.is_active?"#fff":"#1C6E3D",border:`2px solid ${l.is_active?"#C0522A":"#1C6E3D"}`,borderRadius:8,color:l.is_active?"#C0522A":"#fff",fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                    {l.is_active?"🚫 Désactiver":"✅ Approuver & Publier"}
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
          {payments.filter(p=>p.status==="confirmed").reduce((s,p)=>s+p.amount,0).toLocaleString("fr-FR")} F CFA encaissés
        </div>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {[["all","Tous"],["pending","En attente"],["confirmed","Confirmés"],["ref_not_found","Réf. introuvable"],["failed","Échoués"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{padding:"6px 14px",borderRadius:20,border:`2px solid ${filter===v?"#C0522A":"#E0DDD8"}`,background:filter===v?"#C0522A":"#fff",color:filter===v?"#fff":"#555",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>{l}</button>
        ))}
      </div>
      {loading ? <Spinner/> : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filtered.map(p=>{
            const mismatch = p.amount_declared && p.amount_declared!==p.amount;
            return (
            <div key={p.id} style={{background:"#fff",borderRadius:14,padding:"14px 16px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",border:`2px solid ${p.status==="pending"?"#FFF3CD":p.status==="confirmed"?"#D4EDDA":p.status==="ref_not_found"?"#FFE0B2":"#F8D7DA"}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,flexWrap:"wrap"}}>
                <div>
                  <div style={{display:"flex",gap:6,marginBottom:5,flexWrap:"wrap"}}>
                    <Badge status={p.status}/>
                    <Badge status={p.type}/>
                    {p.payment_method&&<span style={{background:"#EDE7F6",color:"#5E35B1",fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:14,fontFamily:"Inter,sans-serif",textTransform:"uppercase"}}>{p.payment_method}</span>}
                  </div>
                  <div style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:15,color:"#C0522A"}}>{p.amount.toLocaleString("fr-FR")} F CFA attendu</div>
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#555",marginTop:3}}>
                    Annonce : <strong>{p.listings?.title||"—"}</strong>
                  </div>
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#888",marginTop:2}}>
                    Agent : {p.agents?.full_name||"—"} · {p.agents?.phone||"—"}
                  </div>

                  {p.payment_ref && (
                    <div style={{background:"#F3F0FF",borderRadius:8,padding:"8px 12px",marginTop:8,display:"inline-block"}}>
                      <div style={{fontFamily:"Inter,sans-serif",fontSize:11,color:"#5E35B1",fontWeight:600}}>📌 Référence déclarée</div>
                      <div style={{fontFamily:"Poppins,sans-serif",fontSize:14,fontWeight:800,color:"#1C1C1E",letterSpacing:0.5}}>{p.payment_ref}</div>
                      {p.amount_declared&&<div style={{fontFamily:"Inter,sans-serif",fontSize:12,color:mismatch?"#C62828":"#555",fontWeight:mismatch?700:400}}>Montant déclaré : {p.amount_declared.toLocaleString("fr-FR")} F CFA {mismatch&&"⚠️ ne correspond pas"}</div>}
                    </div>
                  )}

                  <div style={{fontFamily:"Inter,sans-serif",fontSize:11,color:"#AAA",marginTop:6}}>
                    Soumis le {formatDate(p.created_at)} {p.confirmed_at?`· Confirmé le ${formatDate(p.confirmed_at)}`:""}
                  </div>
                </div>
                {p.status==="pending"&&(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <button onClick={()=>onAction("confirm_payment_direct",p)} style={{padding:"9px 16px",background:"#1C6E3D",border:"none",borderRadius:9,color:"#fff",fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>✅ Confirmer</button>
                    <button onClick={()=>onAction("ref_not_found",p)} style={{padding:"9px 16px",background:"#fff",border:"2px solid #E8A020",borderRadius:9,color:"#E8A020",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>🔍 Réf. introuvable</button>
                    <button onClick={()=>onAction("reject_payment",p)} style={{padding:"9px 16px",background:"#fff",border:"2px solid #C0522A",borderRadius:9,color:"#C0522A",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>❌ Rejeter</button>
                  </div>
                )}
                {p.status==="ref_not_found"&&(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <button onClick={()=>onAction("confirm_payment_direct",p)} style={{padding:"9px 16px",background:"#1C6E3D",border:"none",borderRadius:9,color:"#fff",fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>✅ Trouvée, confirmer</button>
                    <button onClick={()=>onAction("reject_payment",p)} style={{padding:"9px 16px",background:"#fff",border:"2px solid #C0522A",borderRadius:9,color:"#C0522A",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>❌ Rejeter</button>
                  </div>
                )}
              </div>
            </div>
          );})}
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

function ConciergeTable({ requests, onAction, loading }) {
  const [filter, setFilter] = useState("all");
  const filtered = requests.filter(r => filter==="all"||r.status===filter);

  return (
    <div>
      <h2 style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:20,color:"#1C1C1E",marginBottom:18}}>🕵️ Demandes Concierge</h2>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {[["all","Toutes"],["pending","Nouvelles"],["quoted","Devis envoyé"],["paid","Payées"],["in_progress","En cours"],["completed","Terminées"],["cancelled","Annulées"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{padding:"6px 14px",borderRadius:20,border:`2px solid ${filter===v?"#C0522A":"#E0DDD8"}`,background:filter===v?"#C0522A":"#fff",color:filter===v?"#fff":"#555",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>{l}</button>
        ))}
      </div>
      {loading ? <Spinner/> : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filtered.map(r=>(
            <div key={r.id} style={{background:"#fff",borderRadius:14,padding:"14px 16px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",border:`2px solid ${r.status==="pending"?"#FFF3CD":"#F0EDE8"}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,flexWrap:"wrap"}}>
                <div>
                  <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap"}}>
                    <span style={{background:r.requester_role==="acheteur"?"#E8F0FE":"#FCE4EC",color:r.requester_role==="acheteur"?"#1a73e8":"#AD1457",fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:14,fontFamily:"Inter,sans-serif",textTransform:"capitalize"}}>{r.requester_role}</span>
                    <Badge status={r.status==="pending"?"pending":r.status==="completed"||r.status==="paid"?"confirmed":r.status==="cancelled"?"failed":"pending"}/>
                    {r.price_quoted&&<span style={{background:"#E8F5E9",color:"#2e7d32",fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:14,fontFamily:"Inter,sans-serif"}}>{r.price_quoted.toLocaleString("fr-FR")} F CFA</span>}
                  </div>
                  <div style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14,color:"#1C1C1E"}}>{r.listing_title||"Bien non précisé"}</div>
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#888",marginTop:2}}>📍 {r.city} · Demandé par <strong>{r.requester_name}</strong> ({r.requester_phone})</div>
                  {r.notes&&<div style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#555",marginTop:4,fontStyle:"italic"}}>"{r.notes}"</div>}
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:11,color:"#AAA",marginTop:4}}>{formatDate(r.created_at)}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  <a href={`https://wa.me/${r.requester_phone}`} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:5,background:"#25D366",color:"#fff",border:"none",borderRadius:9,padding:"8px 13px",fontSize:12,fontWeight:600,textDecoration:"none",fontFamily:"Inter,sans-serif",justifyContent:"center"}}>WhatsApp</a>
                  {r.status==="pending"&&<button onClick={()=>onAction("mark_quoted",r)} style={{padding:"7px 13px",background:"#E8A020",border:"none",borderRadius:9,color:"#fff",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>Devis envoyé</button>}
                  {(r.status==="pending"||r.status==="quoted")&&<button onClick={()=>onAction("mark_paid",r)} style={{padding:"7px 13px",background:"#1C6E3D",border:"none",borderRadius:9,color:"#fff",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>Marquer payé</button>}
                  {r.status==="paid"&&<button onClick={()=>onAction("mark_completed",r)} style={{padding:"7px 13px",background:"#1C6E3D",border:"none",borderRadius:9,color:"#fff",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>Marquer terminé</button>}
                </div>
              </div>
            </div>
          ))}
          {filtered.length===0&&<div style={{textAlign:"center",padding:40,color:"#888",fontFamily:"Inter,sans-serif"}}>Aucune demande dans cette catégorie</div>}
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
  const [data, setData] = useState({ listings:[], payments:[], inquiries:[], agents:[], concierge:[] });
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
      const [listings,payments,inquiries,agents,concierge] = await Promise.all([
        db.get("listings","?select=*,agents(full_name,phone,agency_name)&order=created_at.desc"),
        db.get("payments","?select=*,listings(title),agents(full_name,phone)&order=created_at.desc"),
        db.get("inquiries","?select=*,listings(title),agents(full_name)&order=created_at.desc"),
        db.get("agents","?select=*&order=created_at.desc"),
        db.get("concierge_requests","?select=*&order=created_at.desc"),
      ]);
      if(Array.isArray(listings)&&listings.length>0){
        setData({listings,payments:Array.isArray(payments)?payments:[],inquiries:Array.isArray(inquiries)?inquiries:[],agents:Array.isArray(agents)?agents:[],concierge:Array.isArray(concierge)?concierge:[]});
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
      confirm_payment_direct: `Confirmer le paiement de ${item.amount?.toLocaleString("fr-FR")} F CFA de ${item.agents?.full_name} ?`,
      reject_payment: `Rejeter le paiement de ${item.agents?.full_name} pour ${item.amount?.toLocaleString("fr-FR")} F CFA ?`,
      ref_not_found: `Marquer la référence "${item.payment_ref}" comme introuvable ? Le client sera notifié de vérifier sa référence.`,
      mark_quoted: `Marquer le devis comme envoyé à ${item.requester_name} ?`,
      mark_paid: `Marquer la demande Concierge de ${item.requester_name} comme payée ?`,
      mark_completed: `Marquer la vérification de "${item.listing_title}" comme terminée ?`,
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
        let concierge = [...(d.concierge||[])];
        if (action==="confirm_payment") listings = listings.map(l=>l.id===item.id?{...l,payment_status:"paid",is_active:true}:l);
        if (action==="feature") listings = listings.map(l=>l.id===item.id?{...l,is_featured:true}:l);
        if (action==="unfeature") listings = listings.map(l=>l.id===item.id?{...l,is_featured:false}:l);
        if (action==="deactivate") listings = listings.map(l=>l.id===item.id?{...l,is_active:false}:l);
        if (action==="activate") listings = listings.map(l=>l.id===item.id?{...l,is_active:true}:l);
        if (action==="delete") listings = listings.filter(l=>l.id!==item.id);
        if (action==="confirm_payment_direct") payments = payments.map(p=>p.id===item.id?{...p,status:"confirmed",confirmed_at:new Date().toISOString()}:p);
        if (action==="reject_payment") payments = payments.map(p=>p.id===item.id?{...p,status:"failed"}:p);
        if (action==="ref_not_found") payments = payments.map(p=>p.id===item.id?{...p,status:"ref_not_found"}:p);
        if (action==="mark_quoted") concierge = concierge.map(c=>c.id===item.id?{...c,status:"quoted"}:c);
        if (action==="mark_paid") concierge = concierge.map(c=>c.id===item.id?{...c,status:"paid"}:c);
        if (action==="mark_completed") concierge = concierge.map(c=>c.id===item.id?{...c,status:"completed"}:c);
        return {...d,listings,payments,concierge};
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
      if (action==="ref_not_found") await db.patch("payments",item.id,{status:"ref_not_found"});
      if (action==="mark_quoted") await db.patch("concierge_requests",item.id,{status:"quoted"});
      if (action==="mark_paid") await db.patch("concierge_requests",item.id,{status:"paid"});
      if (action==="mark_completed") await db.patch("concierge_requests",item.id,{status:"completed"});
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
          <img src={LOGO_ICON} alt="" style={{width:68,height:68,objectFit:"contain",margin:"0 auto 16px",display:"block"}}/>
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
    {id:"concierge",icon:"🕵️",label:`Concierge (${(data.concierge||[]).filter(c=>c.status==="pending").length} nouvelles)`},
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
          <img src={LOGO_ICON} alt="" style={{width:36,height:36,objectFit:"contain"}}/>
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
          <div style={{paddingTop:20,borderTop:"1px solid #F0EDE8",marginTop:16}}>
            <a href="https://immobenin-orcin.vercel.app" style={{display:"block",textAlign:"center",fontFamily:"Inter,sans-serif",fontSize:12,color:"#C0522A",fontWeight:600,textDecoration:"none",padding:"8px 0"}}>← Retour au site</a>
          </div>
        </nav>

        {/* CONTENT */}
        <main style={{flex:1,padding:"28px 24px",overflow:"auto",maxWidth:"calc(100vw - 220px)"}}>
          {tab==="overview"&&<Overview data={data}/>}
          {tab==="listings"&&<ListingsTable listings={data.listings} onAction={handleAction} loading={loading}/>}
          {tab==="payments"&&<PaymentsTable payments={data.payments} onAction={handleAction} loading={loading}/>}
          {tab==="concierge"&&<ConciergeTable requests={data.concierge||[]} onAction={handleAction} loading={loading}/>}
          {tab==="inquiries"&&<InquiriesTable inquiries={data.inquiries} loading={loading}/>}
          {tab==="agents"&&<AgentsTable agents={data.agents} loading={loading}/>}
        </main>
      </div>
    </div>
  );
}
