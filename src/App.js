import React, { useState, useEffect, useCallback, useRef } from "react";

// ============================================================
// SUPABASE CONFIG
// ============================================================
const SUPABASE_URL = "https://frfltrcvilohwzsagkyf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Vi37xSbxZuPhmhZfkm3pQg_44lcUroe";

// ============================================================
// NUMÉROS DE PAIEMENT — Remplissez quand vous avez le numéro,
// laissez "" (vide) pour les méthodes pas encore actives.
// Elles n'apparaîtront pas sur le site jusqu'à ce qu'un numéro soit renseigné.
// ============================================================
const PAYMENT_METHODS = [
  { id: "mtn", label: "MTN Mobile Money", number: "01 69 13 58 60", color: "#FFCC00", textColor: "#1C1C1E" },
  { id: "moov", label: "Moov Money", number: "", color: "#0099CC", textColor: "#fff" },
  { id: "wave", label: "Wave", number: "", color: "#1DC9E8", textColor: "#1C1C1E" },
  { id: "celtiis", label: "Celtiis Money", number: "", color: "#E30613", textColor: "#fff" },
].filter(m => m.number); // n'affiche que les méthodes avec un numéro renseigné

const FALLBACK_IMG = "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80";
const MAX_PHOTOS = 8;
const MAX_SIZE_MB = 5;

// ============================================================
// TARIFICATION — modifiez ces deux valeurs pour ajuster les prix
// (ex: promotion temporaire à 1000 XOF)
// ============================================================
const PRICE_STANDARD = 1000;  // publication 60 jours
const PRICE_FEATURED = 5000;  // supplément mise en vedette
const PRICE_TOTAL_FEATURED = PRICE_STANDARD + PRICE_FEATURED;

// ============================================================
// SERVICE CONCIERGE — vérification sur place par un agent mandaté
// ============================================================
const CONCIERGE_FIXED_CITIES = ["Cotonou", "Abomey-Calavi"];
const CONCIERGE_FIXED_PRICE = 11000;

const DEMO_LISTINGS = [
  { id:"1", is_featured:true, type:"Vente", category:"Villa", title:"Villa moderne à Fidjrossè", price:85000000, city:"Cotonou", neighborhood:"Fidjrossè", bedrooms:4, bathrooms:3, area:320, images:["https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80","https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=600&q=80","https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80"], agents:{full_name:"Rodrigue Kossou",phone:"22997001122",agency_name:"Kossou Immobilier"}, created_at:new Date().toISOString(), is_active:true },
  { id:"2", is_featured:true, type:"Location", category:"Appartement", title:"Appart meublé résidence gardée", price:250000, city:"Cotonou", neighborhood:"Cadjehoun", bedrooms:2, bathrooms:1, area:90, images:["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80","https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80"], agents:{full_name:"Aïcha Hounsou",phone:"22996112233",agency_name:null}, created_at:new Date().toISOString(), is_active:true },
  { id:"3", is_featured:false, type:"Vente", category:"Terrain", title:"Terrain titré à Abomey-Calavi", price:18000000, city:"Abomey-Calavi", neighborhood:null, bedrooms:null, bathrooms:null, area:600, images:["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80"], agents:{full_name:"Edmond Zinsou",phone:"22994556677",agency_name:null}, created_at:new Date().toISOString(), is_active:true },
  { id:"4", is_featured:false, type:"Location", category:"Bureau", title:"Bureau climatisé centre-ville", price:180000, city:"Cotonou", neighborhood:"Ganhi", bedrooms:null, bathrooms:1, area:55, images:["https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80","https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=80"], agents:{full_name:"Patricia Dossou",phone:"22991234567",agency_name:"Dossou Properties"}, created_at:new Date().toISOString(), is_active:true },
  { id:"5", is_featured:false, type:"Vente", category:"Maison", title:"Maison F5 à Akpakpa", price:32000000, city:"Cotonou", neighborhood:"Akpakpa", bedrooms:5, bathrooms:2, area:200, images:["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80","https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80"], agents:{full_name:"Comlan Agbessi",phone:"22998877665",agency_name:null}, created_at:new Date().toISOString(), is_active:true },
  { id:"6", is_featured:false, type:"Location", category:"Villa", title:"Villa avec piscine à Sèmè", price:600000, city:"Sèmè-Kpodji", neighborhood:null, bedrooms:3, bathrooms:2, area:250, images:["https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&q=80","https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&q=80"], agents:{full_name:"Nadège Houngbo",phone:"22993344556",agency_name:null}, created_at:new Date().toISOString(), is_active:true },
];

// ============================================================
// SUPABASE CLIENT
// ============================================================
const db = {
  get: (table, params="") => fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
    headers:{ apikey:SUPABASE_ANON_KEY, Authorization:`Bearer ${SUPABASE_ANON_KEY}` }
  }).then(r=>r.json()),
  post: (table, body) => fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method:"POST",
    headers:{ apikey:SUPABASE_ANON_KEY, Authorization:`Bearer ${SUPABASE_ANON_KEY}`, "Content-Type":"application/json", Prefer:"return=representation" },
    body:JSON.stringify(body)
  }).then(r=>r.json()),
  uploadImage: async (file, path) => {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/Listing-Images/${path}`, {
      method:"POST",
      headers:{ apikey:SUPABASE_ANON_KEY, Authorization:`Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": file.type },
      body: file
    });
    if (!res.ok) throw new Error("Upload échoué");
    return `${SUPABASE_URL}/storage/v1/object/public/Listing-Images/${path}`;
  }
};

// ============================================================
// IMAGE COMPRESSION (client-side, no library needed)
// ============================================================
function compressImage(file, maxW=1200, quality=0.82) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = Math.min(1, maxW / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        resolve(new File([blob], file.name, { type: "image/jpeg" }));
      }, "image/jpeg", quality);
    };
    img.src = url;
  });
}

function readAsDataURL(file) {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.readAsDataURL(file);
  });
}

// ============================================================
// HELPERS
// ============================================================
function formatPrice(price, type) {
  return type==="Location" ? `${Number(price).toLocaleString("fr-FR")} XOF/mois` : `${Number(price).toLocaleString("fr-FR")} XOF`;
}
const CATEGORIES = ["Tous","Vente","Location","Terrain","Bureau"];
const CITIES = ["Toutes villes","Cotonou","Abomey-Calavi","Sèmè-Kpodji","Porto-Novo","Parakou"];

// ============================================================
// PHOTO UPLOADER COMPONENT
// ============================================================
function PhotoUploader({ photos, onChange }) {
  const dropRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState([]);

  const processFiles = useCallback(async (files) => {
    setErrors([]);
    const newErrors = [];
    const incoming = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) { newErrors.push(`${file.name} : format non supporté`); continue; }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) { newErrors.push(`${file.name} : taille max ${MAX_SIZE_MB} Mo`); continue; }
      if (photos.length + incoming.length >= MAX_PHOTOS) { newErrors.push(`Maximum ${MAX_PHOTOS} photos autorisées`); break; }
      const compressed = await compressImage(file);
      const preview = await readAsDataURL(compressed);
      incoming.push({ file: compressed, preview, id: Date.now() + Math.random() });
    }
    if (newErrors.length) setErrors(newErrors);
    if (incoming.length) onChange([...photos, ...incoming]);
  }, [photos, onChange]);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const removePhoto = (id) => onChange(photos.filter(p => p.id !== id));

  const movePhoto = (fromIdx, toIdx) => {
    const arr = [...photos];
    const [item] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, item);
    onChange(arr);
  };

  const dragPhoto = useRef(null);

  return (
    <div>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .photo-thumb { animation: fadeIn 0.25s ease; }
        .photo-thumb:hover .remove-btn { opacity:1!important; }
      `}</style>

      {/* Drop Zone */}
      <div
        ref={dropRef}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => document.getElementById("photo-file-input").click()}
        style={{
          border: `2px dashed ${dragging ? "#C0522A" : "#D0C8C0"}`,
          borderRadius: 14,
          padding: "28px 20px",
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? "#FFF0EB" : "#FAFAF8",
          transition: "all 0.2s",
          marginBottom: 14
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 8 }}>📸</div>
        <div style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: 15, color: "#1C1C1E", marginBottom: 4 }}>
          {dragging ? "Déposez ici !" : "Glissez vos photos ici"}
        </div>
        <div style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: "#888" }}>
          ou cliquez pour sélectionner • JPG, PNG, WEBP • Max {MAX_SIZE_MB} Mo/photo • {photos.length}/{MAX_PHOTOS} photos
        </div>
        <input
          id="photo-file-input"
          type="file"
          accept="image/*"
          multiple
          onChange={e => processFiles(e.target.files)}
          style={{ display: "none" }}
        />
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div style={{ background: "#FFEBEE", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
          {errors.map((e, i) => (
            <div key={i} style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: "#C62828" }}>⚠️ {e}</div>
          ))}
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div>
          <div style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: "#888", marginBottom: 8 }}>
            🖱️ Glissez pour réorganiser · La 1ère photo est la photo principale
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                className="photo-thumb"
                draggable
                onDragStart={() => { dragPhoto.current = idx; }}
                onDragOver={e => { e.preventDefault(); }}
                onDrop={e => { e.preventDefault(); e.stopPropagation(); if (dragPhoto.current !== null && dragPhoto.current !== idx) { movePhoto(dragPhoto.current, idx); dragPhoto.current = null; } }}
                style={{
                  position: "relative",
                  borderRadius: 10,
                  overflow: "hidden",
                  aspectRatio: "1",
                  border: idx === 0 ? "3px solid #C0522A" : "2px solid #E0DDD8",
                  cursor: "grab",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}
              >
                <img src={photo.preview} alt={`${idx+1}`} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                {idx === 0 && (
                  <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(192,82,42,0.85)", fontSize:9, fontWeight:700, color:"#fff", textAlign:"center", padding:"3px 0", fontFamily:"Inter,sans-serif" }}>
                    PRINCIPALE
                  </div>
                )}
                <button
                  className="remove-btn"
                  onClick={e => { e.stopPropagation(); removePhoto(photo.id); }}
                  style={{
                    position:"absolute", top:4, right:4, width:22, height:22,
                    borderRadius:"50%", background:"rgba(0,0,0,0.7)", border:"none",
                    color:"#fff", fontSize:12, cursor:"pointer", display:"flex",
                    alignItems:"center", justifyContent:"center",
                    opacity: 0, transition:"opacity 0.2s"
                  }}
                >✕</button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <div
                onClick={() => document.getElementById("photo-file-input").click()}
                style={{
                  borderRadius: 10, border: "2px dashed #D0C8C0", aspectRatio:"1",
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                  cursor:"pointer", background:"#FAFAF8", color:"#AAA", fontSize:22
                }}
              >
                <div>+</div>
                <div style={{ fontSize:9, fontFamily:"Inter,sans-serif", marginTop:2 }}>Ajouter</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PHOTO GALLERY (in listing detail modal)
// ============================================================
function PhotoGallery({ images }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images || images.length === 0) return (
    <img src={FALLBACK_IMG} alt="listing" style={{ width:"100%", height:240, objectFit:"cover", borderRadius:"18px 18px 0 0" }} />
  );

  const prev = (e) => { e.stopPropagation(); setCurrent(i => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setCurrent(i => (i + 1) % images.length); };

  return (
    <>
      <div style={{ position:"relative", borderRadius:"18px 18px 0 0", overflow:"hidden" }}>
        <img
          src={images[current]}
          alt={`${current+1}`}
          onClick={() => setLightbox(true)}
          style={{ width:"100%", height:260, objectFit:"cover", display:"block", cursor:"zoom-in" }}
          onError={e => { e.target.src = FALLBACK_IMG; }}
        />
        {/* Counter badge */}
        <div style={{ position:"absolute", top:12, right:12, background:"rgba(0,0,0,0.6)", color:"#fff", fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:20, fontFamily:"Inter,sans-serif" }}>
          📷 {current+1}/{images.length}
        </div>
        {/* Arrows */}
        {images.length > 1 && <>
          <button onClick={prev} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", background:"rgba(0,0,0,0.55)", border:"none", color:"#fff", width:36, height:36, borderRadius:"50%", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>‹</button>
          <button onClick={next} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"rgba(0,0,0,0.55)", border:"none", color:"#fff", width:36, height:36, borderRadius:"50%", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>›</button>
        </>}
        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"linear-gradient(to top, rgba(0,0,0,0.6), transparent)", padding:"16px 12px 10px", display:"flex", gap:6, justifyContent:"center" }}>
            {images.map((img, i) => (
              <div key={i} onClick={e => { e.stopPropagation(); setCurrent(i); }}
                style={{ width:44, height:32, borderRadius:6, overflow:"hidden", border: i === current ? "2px solid #E8A020" : "2px solid transparent", cursor:"pointer", flexShrink:0 }}>
                <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { e.target.src = FALLBACK_IMG; }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.95)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <button onClick={() => setLightbox(false)} style={{ position:"absolute", top:16, right:16, background:"rgba(255,255,255,0.15)", border:"none", color:"#fff", width:40, height:40, borderRadius:"50%", fontSize:18, cursor:"pointer" }}>✕</button>
          {images.length > 1 && <>
            <button onClick={prev} style={{ position:"absolute", left:16, background:"rgba(255,255,255,0.15)", border:"none", color:"#fff", width:48, height:48, borderRadius:"50%", fontSize:22, cursor:"pointer" }}>‹</button>
            <button onClick={next} style={{ position:"absolute", right:16, background:"rgba(255,255,255,0.15)", border:"none", color:"#fff", width:48, height:48, borderRadius:"50%", fontSize:22, cursor:"pointer" }}>›</button>
          </>}
          <img src={images[current]} alt="" style={{ maxWidth:"90vw", maxHeight:"88vh", borderRadius:12, objectFit:"contain" }} onClick={e => e.stopPropagation()} />
          <div style={{ position:"absolute", bottom:16, left:0, right:0, display:"flex", justifyContent:"center", gap:8 }}>
            {images.map((_,i) => <div key={i} onClick={e=>{e.stopPropagation();setCurrent(i);}} style={{ width: i===current?24:8, height:8, borderRadius:4, background: i===current?"#E8A020":"rgba(255,255,255,0.4)", cursor:"pointer", transition:"all 0.2s" }} /> )}
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// UPLOAD PROGRESS BAR
// ============================================================
function UploadProgress({ current, total, label }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div style={{ background:"#FAF7F2", borderRadius:12, padding:"14px 16px", marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontFamily:"Inter,sans-serif", fontSize:12, fontWeight:600, color:"#555" }}>{label}</span>
        <span style={{ fontFamily:"Poppins,sans-serif", fontSize:13, fontWeight:700, color:"#C0522A" }}>{pct}%</span>
      </div>
      <div style={{ height:6, background:"#E0DDD8", borderRadius:6, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#C0522A,#E8A020)", borderRadius:6, transition:"width 0.3s" }} />
      </div>
      {total > 1 && (
        <div style={{ fontFamily:"Inter,sans-serif", fontSize:11, color:"#888", marginTop:4 }}>
          Photo {current} sur {total} en cours d'upload...
        </div>
      )}
    </div>
  );
}

// ============================================================
// CARD
// ============================================================
function WaBtn({phone,title}) {
  const msg = encodeURIComponent(`Bonjour, je suis intéressé(e) par : "${title}" sur ImmoBénin.`);
  return (
    <a href={`https://wa.me/${phone}?text=${msg}`} target="_blank" rel="noopener noreferrer"
      style={{display:"flex",alignItems:"center",gap:6,background:"#25D366",color:"#fff",border:"none",borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:600,textDecoration:"none",fontFamily:"Inter,sans-serif"}}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      WhatsApp
    </a>
  );
}

function Card({l, onSelect}) {
  const img = l.images?.[0] || FALLBACK_IMG;
  const photoCount = l.images?.length || 0;
  return (
    <div onClick={()=>onSelect(l)}
      style={{background:"#fff",borderRadius:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",cursor:"pointer",transition:"transform 0.2s,box-shadow 0.2s",border:l.is_featured?"2px solid #E8A020":"2px solid transparent",position:"relative"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.14)"}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.08)"}}>
      {l.is_featured&&<div style={{position:"absolute",top:12,left:12,zIndex:2,background:"#E8A020",color:"#fff",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,fontFamily:"Inter,sans-serif"}}>⭐ EN VEDETTE</div>}
      <div style={{position:"absolute",top:12,right:12,zIndex:2,background:l.type==="Vente"?"#C0522A":"#1C6E3D",color:"#fff",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,fontFamily:"Inter,sans-serif"}}>{l.type}</div>
      {photoCount > 1 && <div style={{position:"absolute",bottom:108,right:10,zIndex:2,background:"rgba(0,0,0,0.55)",color:"#fff",fontSize:11,padding:"3px 8px",borderRadius:14,fontFamily:"Inter,sans-serif"}}>📷 {photoCount}</div>}
      <img src={img} alt={l.title} style={{width:"100%",height:200,objectFit:"cover"}} onError={e=>{e.target.src=FALLBACK_IMG}}/>
      <div style={{padding:"14px 14px 12px"}}>
        <div style={{fontSize:11,color:"#888",fontFamily:"Inter,sans-serif",marginBottom:3}}>{l.category} • {l.neighborhood||l.city}</div>
        <div style={{fontSize:15,fontWeight:700,color:"#1C1C1E",fontFamily:"Poppins,sans-serif",marginBottom:6,lineHeight:1.3}}>{l.title}</div>
        <div style={{fontSize:17,fontWeight:800,color:"#C0522A",fontFamily:"Poppins,sans-serif",marginBottom:10}}>{formatPrice(l.price,l.type)}</div>
        <div style={{display:"flex",gap:12,fontSize:12,color:"#555",fontFamily:"Inter,sans-serif",marginBottom:12}}>
          {l.bedrooms&&<span>🛏 {l.bedrooms}</span>}
          {l.bathrooms&&<span>🚿 {l.bathrooms}</span>}
          {l.area&&<span>📐 {l.area} m²</span>}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:12,color:"#999",fontFamily:"Inter,sans-serif"}}>
            <strong style={{color:"#1C1C1E"}}>{l.agents?.full_name||"Agent"}</strong><br/>
            <span style={{fontSize:11}}>{new Date(l.created_at).toLocaleDateString("fr-FR")}</span>
          </div>
          <WaBtn phone={l.agents?.phone||"22997000000"} title={l.title}/>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DETAIL MODAL (with gallery)
// ============================================================
function DetailModal({listing,onClose,onRequestVerification}) {
  const [form,setForm]=useState({name:"",phone:"",message:""});
  const [sent,setSent]=useState(false);
  const [sending,setSending]=useState(false);
  if(!listing) return null;

  const send=async()=>{
    if(!form.name||!form.phone) return;
    setSending(true);
    try { await db.post("inquiries",{listing_id:listing.id,agent_id:listing.agent_id,sender_name:form.name,sender_phone:form.phone,message:form.message||`Intéressé(e) par : ${listing.title}`,channel:"web"}); } catch(e){}
    setSending(false); setSent(true);
  };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:18,maxWidth:600,width:"100%",maxHeight:"92vh",overflow:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>
        {/* Gallery */}
        <PhotoGallery images={listing.images} />

        <div style={{padding:22}}>
          <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
            <span style={{background:listing.type==="Vente"?"#C0522A":"#1C6E3D",color:"#fff",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,fontFamily:"Inter,sans-serif"}}>{listing.type}</span>
            <span style={{background:"#F0EDE8",color:"#555",fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,fontFamily:"Inter,sans-serif"}}>{listing.category}</span>
            {listing.is_featured&&<span style={{background:"#E8A020",color:"#fff",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,fontFamily:"Inter,sans-serif"}}>⭐ En vedette</span>}
            {listing.images?.length>1&&<span style={{background:"#E8F0FE",color:"#1a73e8",fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,fontFamily:"Inter,sans-serif"}}>📷 {listing.images.length} photos</span>}
          </div>
          <h2 style={{fontFamily:"Poppins,sans-serif",fontSize:20,fontWeight:800,color:"#1C1C1E",marginBottom:4}}>{listing.title}</h2>
          <p style={{fontFamily:"Inter,sans-serif",fontSize:13,color:"#777",marginBottom:10}}>📍 {listing.neighborhood?`${listing.neighborhood}, `:""}{listing.city}</p>
          {listing.description&&<p style={{fontFamily:"Inter,sans-serif",fontSize:14,color:"#555",lineHeight:1.6,marginBottom:12}}>{listing.description}</p>}
          <div style={{fontSize:24,fontWeight:800,color:"#C0522A",fontFamily:"Poppins,sans-serif",marginBottom:16}}>{formatPrice(listing.price,listing.type)}</div>
          <div style={{display:"flex",gap:16,marginBottom:18,padding:14,background:"#FAF7F2",borderRadius:12,flexWrap:"wrap"}}>
            {listing.bedrooms&&<div style={{textAlign:"center"}}><div style={{fontSize:20}}>🛏</div><div style={{fontSize:14,fontWeight:700,fontFamily:"Inter,sans-serif"}}>{listing.bedrooms}</div><div style={{fontSize:11,color:"#888"}}>Chambres</div></div>}
            {listing.bathrooms&&<div style={{textAlign:"center"}}><div style={{fontSize:20}}>🚿</div><div style={{fontSize:14,fontWeight:700,fontFamily:"Inter,sans-serif"}}>{listing.bathrooms}</div><div style={{fontSize:11,color:"#888"}}>Sdb</div></div>}
            {listing.area&&<div style={{textAlign:"center"}}><div style={{fontSize:20}}>📐</div><div style={{fontSize:14,fontWeight:700,fontFamily:"Inter,sans-serif"}}>{listing.area}</div><div style={{fontSize:11,color:"#888"}}>m²</div></div>}
          </div>

          {/* CONCIERGE CTA */}
          <button onClick={()=>onRequestVerification?.(listing)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"12px",background:"#FFF8E1",border:"2px solid #FFCC80",borderRadius:12,color:"#7A4F01",fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",marginBottom:18}}>
            🕵️ Faire vérifier ce bien par un agent ImmoBénin
          </button>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:14,background:"#F9F9F9",borderRadius:12,marginBottom:18}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,fontFamily:"Inter,sans-serif"}}>{listing.agents?.full_name||"Agent"}</div>
              {listing.agents?.agency_name&&<div style={{fontSize:12,color:"#888",fontFamily:"Inter,sans-serif"}}>{listing.agents.agency_name}</div>}
            </div>
            <WaBtn phone={listing.agents?.phone||"22997000000"} title={listing.title}/>
          </div>
          <div style={{background:"#FAF7F2",borderRadius:14,padding:16,border:"1px solid #F0EDE8"}}>
            <div style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14,marginBottom:10}}>📩 Envoyer un message</div>
            {sent?(
              <div style={{textAlign:"center",padding:14,color:"#1C6E3D",fontFamily:"Inter,sans-serif",fontWeight:600}}>✅ Message envoyé ! L'agent vous contactera bientôt.</div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                <input placeholder="Votre nom *" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={{padding:"10px 12px",border:"2px solid #E0DDD8",borderRadius:10,fontFamily:"Inter,sans-serif",fontSize:13}}/>
                <input placeholder="WhatsApp / Téléphone *" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} style={{padding:"10px 12px",border:"2px solid #E0DDD8",borderRadius:10,fontFamily:"Inter,sans-serif",fontSize:13}}/>
                <textarea placeholder="Votre message..." value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} rows={3} style={{padding:"10px 12px",border:"2px solid #E0DDD8",borderRadius:10,fontFamily:"Inter,sans-serif",fontSize:13,resize:"vertical"}}/>
                <button onClick={send} disabled={sending||!form.name||!form.phone} style={{padding:11,background:sending?"#ccc":"linear-gradient(135deg,#C0522A,#E8A020)",border:"none",borderRadius:10,color:"#fff",fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:13,cursor:sending?"not-allowed":"pointer"}}>{sending?"Envoi...":"Envoyer"}</button>
              </div>
            )}
          </div>
          <button onClick={onClose} style={{marginTop:12,width:"100%",padding:11,border:"2px solid #F0EDE8",borderRadius:10,background:"transparent",color:"#888",fontFamily:"Inter,sans-serif",fontSize:13,cursor:"pointer"}}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PUBLISH MODAL (with PhotoUploader)
// ============================================================
function PublishModal({onClose,onSuccess}) {
  const [step,setStep]=useState(1);
  const [loading,setLoading]=useState(false);
  const [uploadProgress,setUploadProgress]=useState({current:0,total:0,label:""});
  const [error,setError]=useState("");
  const [photos,setPhotos]=useState([]); // [{file, preview, id}]
  const [f,setF]=useState({type:"Vente",category:"Villa",title:"",description:"",price:"",city:"Cotonou",neighborhood:"",area:"",bedrooms:"",bathrooms:"",is_featured:false,agent_name:"",agent_phone:"",agent_email:"",agency_name:""});
  const [acceptedTerms,setAcceptedTerms]=useState(false);
  const u=(k,v)=>setF(p=>({...p,[k]:v}));
  const cost=f.is_featured?PRICE_TOTAL_FEATURED:PRICE_STANDARD;

  const submit=async()=>{
    setLoading(true); setError(""); setUploadProgress({current:0,total:0,label:""});
    try {
      // 1. Create agent
      setUploadProgress({current:0,total:photos.length,label:"Création du profil agent..."});
      const agentRes=await db.post("agents",{full_name:f.agent_name,phone:f.agent_phone,email:f.agent_email||null,agency_name:f.agency_name||null,city:f.city});
      const agent=Array.isArray(agentRes)?agentRes[0]:agentRes;
      if(!agent?.id) throw new Error("Erreur lors de la création du profil agent");

      // 2. Upload photos
      const imageUrls=[];
      for(let i=0;i<photos.length;i++){
        setUploadProgress({current:i+1,total:photos.length,label:`Upload photo ${i+1}/${photos.length}...`});
        const ext=photos[i].file.name.split(".").pop()||"jpg";
        const path=`${agent.id}_${Date.now()}_${i}.${ext}`;
        try {
          const url=await db.uploadImage(photos[i].file, path);
          imageUrls.push(url);
        } catch(e){ /* skip failed uploads */ }
      }

      // 3. Create listing
      setUploadProgress({current:photos.length,total:photos.length,label:"Enregistrement de l'annonce..."});
      const listingRes=await db.post("listings",{agent_id:agent.id,title:f.title,description:f.description||null,type:f.type,category:f.category,city:f.city,neighborhood:f.neighborhood||null,price:parseInt(f.price),area:f.area?parseInt(f.area):null,bedrooms:f.bedrooms?parseInt(f.bedrooms):null,bathrooms:f.bathrooms?parseInt(f.bathrooms):null,is_featured:f.is_featured,images:imageUrls,payment_status:"pending",terms_accepted_at:new Date().toISOString()});
      const listing=Array.isArray(listingRes)?listingRes[0]:listingRes;
      if(!listing?.id) throw new Error("Erreur lors de la création de l'annonce");

      // 4. Payment record
      await db.post("payments",{listing_id:listing.id,agent_id:agent.id,amount:cost,type:f.is_featured?"featured":"standard",status:"pending"});

      setStep(4); onSuccess?.();
    } catch(err){ setError(err.message||"Une erreur est survenue"); }
    setLoading(false); setUploadProgress({current:0,total:0,label:""});
  };

  const inp=(placeholder,key,type="text",extra={})=>(
    <input placeholder={placeholder} type={type} value={f[key]} onChange={e=>u(key,e.target.value)}
      style={{padding:"10px 12px",border:"2px solid #E0DDD8",borderRadius:10,fontFamily:"Inter,sans-serif",fontSize:13,...extra}}/>
  );

  const canNext1 = f.title && f.price;
  const canNext2 = f.agent_name && f.agent_phone;

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:18,maxWidth:540,width:"100%",maxHeight:"92vh",overflow:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>
        <div style={{background:"linear-gradient(135deg,#C0522A,#E8A020)",padding:"20px 22px 16px",borderRadius:"18px 18px 0 0"}}>
          <h2 style={{fontFamily:"Poppins,sans-serif",color:"#fff",fontSize:19,fontWeight:800,margin:0}}>Publier une annonce</h2>
          <p style={{fontFamily:"Inter,sans-serif",color:"rgba(255,255,255,0.85)",fontSize:12,margin:"4px 0 0"}}>
            {["","Étape 1 — Votre bien & photos","Étape 2 — Vos coordonnées","Étape 3 — Récapitulatif","✅ Annonce créée !"][step]}
          </p>
        </div>

        <div style={{padding:22}}>
          {/* STEP 1 */}
          {step===1&&(
            <div style={{display:"flex",flexDirection:"column",gap:11}}>
              <div style={{display:"flex",gap:8}}>
                {["Vente","Location"].map(t=>(
                  <button key={t} onClick={()=>u("type",t)} style={{flex:1,padding:9,border:`2px solid ${f.type===t?"#C0522A":"#E0DDD8"}`,borderRadius:10,background:f.type===t?"#FFF0EB":"#fff",color:f.type===t?"#C0522A":"#555",fontWeight:700,fontFamily:"Inter,sans-serif",cursor:"pointer"}}>{t}</button>
                ))}
              </div>
              <select value={f.category} onChange={e=>u("category",e.target.value)} style={{padding:"10px 12px",border:"2px solid #E0DDD8",borderRadius:10,fontFamily:"Inter,sans-serif",fontSize:13}}>
                {["Villa","Appartement","Maison","Terrain","Bureau","Local commercial"].map(c=><option key={c}>{c}</option>)}
              </select>
              {inp("Titre de l'annonce *","title")}
              <textarea placeholder="Description du bien..." value={f.description} onChange={e=>u("description",e.target.value)} rows={2} style={{padding:"10px 12px",border:"2px solid #E0DDD8",borderRadius:10,fontFamily:"Inter,sans-serif",fontSize:13,resize:"vertical"}}/>
              {inp("Prix en XOF *","price","number")}
              <div style={{display:"flex",gap:8}}>
                <select value={f.city} onChange={e=>u("city",e.target.value)} style={{flex:1,padding:"10px 12px",border:"2px solid #E0DDD8",borderRadius:10,fontFamily:"Inter,sans-serif",fontSize:13}}>
                  {CITIES.slice(1).map(c=><option key={c}>{c}</option>)}
                </select>
                {inp("Quartier","neighborhood","text",{flex:1})}
              </div>
              <div style={{display:"flex",gap:8}}>
                {inp("m²","area","number",{flex:1})}
                {inp("Chambres","bedrooms","number",{flex:1})}
                {inp("Sdb","bathrooms","number",{flex:1})}
              </div>

              {/* PHOTO UPLOADER */}
              <div style={{background:"#FAF7F2",borderRadius:14,padding:14,border:"1px solid #F0EDE8"}}>
                <div style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14,marginBottom:10}}>📸 Photos du bien</div>
                <PhotoUploader photos={photos} onChange={setPhotos}/>
              </div>

              <label style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",background:"#FAF7F2",padding:12,borderRadius:12,border:"2px solid #F0EDE8"}}>
                <input type="checkbox" checked={f.is_featured} onChange={e=>u("is_featured",e.target.checked)} style={{marginTop:3,width:18,height:18}}/>
                <div>
                  <div style={{fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:13,color:"#E8A020"}}>⭐ Mettre en vedette (+5 000 XOF)</div>
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#777"}}>Badge doré + position prioritaire</div>
                </div>
              </label>
            </div>
          )}

          {/* STEP 2 */}
          {step===2&&(
            <div style={{display:"flex",flexDirection:"column",gap:11}}>
              {inp("Nom complet *","agent_name")}
              {inp("Numéro WhatsApp * (ex: 22997001122)","agent_phone")}
              {inp("Email (optionnel)","agent_email","email")}
              {inp("Nom de l'agence (optionnel)","agency_name")}
            </div>
          )}

          {/* STEP 3 */}
          {step===3&&(
            <div>
              {photos.length>0&&(
                <div style={{marginBottom:14}}>
                  <div style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14,marginBottom:8}}>📸 {photos.length} photo{photos.length>1?"s":""} sélectionnée{photos.length>1?"s":""}</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {photos.map((p,i)=>(
                      <div key={p.id} style={{width:52,height:52,borderRadius:8,overflow:"hidden",border:i===0?"2px solid #C0522A":"2px solid #E0DDD8"}}>
                        <img src={p.preview} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{background:"#FAF7F2",borderRadius:14,padding:16,marginBottom:14}}>
                <div style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:14,marginBottom:10}}>Récapitulatif</div>
                {[["Type",`${f.type} — ${f.category}`],["Titre",f.title||"—"],["Ville",`${f.neighborhood?f.neighborhood+", ":""}${f.city}`],["Prix",`${parseInt(f.price||0).toLocaleString("fr-FR")} XOF`],["Superficie",f.area?`${f.area} m²`:"—"],["Vendeur",f.agent_name],["WhatsApp",f.agent_phone]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,fontFamily:"Inter,sans-serif",padding:"5px 0",borderBottom:"1px solid #E8E4DF"}}>
                    <span style={{color:"#888"}}>{k}</span><span style={{fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{background:"#fff3e0",borderRadius:14,padding:16,border:"2px solid #E8A020",marginBottom:12}}>
                <div style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:14,marginBottom:8}}>Montant à payer</div>
                <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Inter,sans-serif",fontSize:13,marginBottom:3}}><span>Publication 60 jours</span><span style={{fontWeight:700}}>{PRICE_STANDARD.toLocaleString("fr-FR")} XOF</span></div>
                {f.is_featured&&<div style={{display:"flex",justifyContent:"space-between",fontFamily:"Inter,sans-serif",fontSize:13,marginBottom:3}}><span>⭐ Mise en vedette</span><span style={{fontWeight:700}}>{PRICE_FEATURED.toLocaleString("fr-FR")} XOF</span></div>}
                <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Poppins,sans-serif",fontSize:19,fontWeight:800,color:"#C0522A",marginTop:8,paddingTop:8,borderTop:"2px solid #E8A020"}}><span>Total</span><span>{cost.toLocaleString("fr-FR")} XOF</span></div>
              </div>
              <div style={{background:"#FAF7F2",borderRadius:14,padding:16,border:"2px solid #E0DDD8"}}>
                <div style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:14,marginBottom:10}}>💳 Comment payer</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {PAYMENT_METHODS.map(m=>(
                    <div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:m.color,color:m.textColor,borderRadius:10,padding:"10px 14px"}}>
                      <span style={{fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:13}}>{m.label}</span>
                      <span style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:15,letterSpacing:0.5}}>{m.number}</span>
                    </div>
                  ))}
                </div>
                <div style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#888",marginTop:10}}>
                  Envoyez exactement <strong>{cost.toLocaleString("fr-FR")} XOF</strong> à l'un de ces numéros, puis attendez la confirmation.
                </div>
              </div>

              {/* DISCLAIMER LÉGAL */}
              <div style={{background:"#FFF8E1",border:"2px solid #FFCC80",borderRadius:14,padding:16,marginTop:14}}>
                <div style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:13,color:"#7A4F01",marginBottom:8}}>⚖️ Engagement de bonne foi</div>
                <ul style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#5D4500",lineHeight:1.6,margin:"0 0 10px",paddingLeft:18}}>
                  <li>Je certifie que ce bien existe réellement et que j'ai le droit de le vendre ou de le louer.</li>
                  <li>Les informations fournies (prix, localisation, état du bien) sont exactes à ma connaissance.</li>
                  <li>Je comprends que la publication d'une fausse annonce, d'une annonce frauduleuse, ou l'usurpation de l'identité d'un tiers est passible de poursuites pénales conformément à la législation béninoise en vigueur.</li>
                  <li>ImmoBénin se réserve le droit de suspendre tout compte ou annonce signalé pour fraude, sans remboursement, et de transmettre les informations aux autorités compétentes si nécessaire.</li>
                </ul>
                <label style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer"}}>
                  <input type="checkbox" checked={acceptedTerms} onChange={e=>setAcceptedTerms(e.target.checked)} style={{marginTop:2,width:18,height:18,flexShrink:0}}/>
                  <span style={{fontFamily:"Inter,sans-serif",fontSize:12,fontWeight:700,color:"#5D4500"}}>
                    J'ai lu et j'accepte ces conditions. Je confirme que cette annonce est authentique.
                  </span>
                </label>
              </div>
              {loading && uploadProgress.total>0 && <div style={{marginTop:12}}><UploadProgress {...uploadProgress}/></div>}
              {error&&<div style={{background:"#FFEBEE",borderRadius:10,padding:12,marginTop:10,color:"#C62828",fontFamily:"Inter,sans-serif",fontSize:12}}>⚠️ {error}</div>}
            </div>
          )}

          {/* STEP 4 — SUCCESS */}
          {step===4&&(
            <div style={{textAlign:"center",padding:"18px 0"}}>
              <div style={{fontSize:52,marginBottom:14}}>🎉</div>
              <h3 style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:19,color:"#1C6E3D",marginBottom:8}}>Annonce créée avec succès !</h3>
              <p style={{fontFamily:"Inter,sans-serif",fontSize:13,color:"#555",marginBottom:14,lineHeight:1.6}}>
                En attente de paiement de <strong>{cost.toLocaleString("fr-FR")} XOF</strong> :
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14,textAlign:"left"}}>
                {PAYMENT_METHODS.map(m=>(
                  <div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:m.color,color:m.textColor,borderRadius:10,padding:"10px 14px"}}>
                    <span style={{fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:13}}>{m.label}</span>
                    <span style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:15,letterSpacing:0.5}}>{m.number}</span>
                  </div>
                ))}
              </div>
              <div style={{background:"#FAF7F2",borderRadius:12,padding:12,fontSize:12,fontFamily:"Inter,sans-serif",color:"#555"}}>
                📱 Confirmation dans les <strong>2 heures</strong> suivant le paiement.
              </div>
            </div>
          )}

          {/* BUTTONS */}
          <div style={{display:"flex",gap:10,marginTop:18}}>
            {step>1&&step<4&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:12,border:"2px solid #E0DDD8",borderRadius:12,background:"#fff",color:"#555",fontFamily:"Inter,sans-serif",fontSize:13,fontWeight:600,cursor:"pointer"}}>← Retour</button>}
            {step<3&&<button onClick={()=>setStep(s=>s+1)} disabled={(step===1&&!canNext1)||(step===2&&!canNext2)} style={{flex:2,padding:12,background:"linear-gradient(135deg,#C0522A,#E8A020)",border:"none",borderRadius:12,color:"#fff",fontFamily:"Poppins,sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",opacity:((step===1&&!canNext1)||(step===2&&!canNext2))?0.5:1}}>Continuer →</button>}
            {step===3&&<button onClick={submit} disabled={loading||!acceptedTerms} style={{flex:2,padding:12,background:(loading||!acceptedTerms)?"#ccc":"#1C6E3D",border:"none",borderRadius:12,color:"#fff",fontFamily:"Poppins,sans-serif",fontSize:14,fontWeight:700,cursor:(loading||!acceptedTerms)?"not-allowed":"pointer"}}>{loading?"Upload en cours...":!acceptedTerms?"Acceptez les conditions ci-dessus":"✓ Confirmer & Enregistrer"}</button>}
            {step===4&&<button onClick={onClose} style={{flex:1,padding:12,background:"linear-gradient(135deg,#C0522A,#E8A020)",border:"none",borderRadius:12,color:"#fff",fontFamily:"Poppins,sans-serif",fontSize:14,fontWeight:700,cursor:"pointer"}}>Voir les annonces</button>}
          </div>
          {step<4&&<div style={{display:"flex",gap:6,justifyContent:"center",marginTop:12}}>{[1,2,3].map(n=><div key={n} style={{width:n===step?24:8,height:8,borderRadius:4,background:n<=step?"#C0522A":"#E0DDD8",transition:"all 0.3s"}}/>)}</div>}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SPINNER
// ============================================================
function Spinner() {
  return (
    <div style={{display:"flex",justifyContent:"center",padding:60}}>
      <div style={{width:40,height:40,borderRadius:"50%",border:"4px solid #F0EDE8",borderTopColor:"#C0522A",animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ============================================================
// SERVICE CONCIERGE — page dédiée
// ============================================================
function ConciergePage({ onBack, prefillListing }) {
  const [form, setForm] = useState({
    listing_title: prefillListing?.title || "",
    city: prefillListing?.city || "Cotonou",
    requester_name: "",
    requester_phone: "",
    requester_role: "acheteur",
    notes: "",
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const isFixedPrice = CONCIERGE_FIXED_CITIES.includes(form.city);
  const priceLabel = isFixedPrice ? `${CONCIERGE_FIXED_PRICE.toLocaleString("fr-FR")} XOF` : "Sur devis";

  const u = (k,v) => setForm(f=>({...f,[k]:v}));
  const canSubmit = form.requester_name && form.requester_phone && form.city;

  const submit = async () => {
    setSending(true); setError("");
    try {
      await db.post("concierge_requests",{
        listing_id: prefillListing?.id || null,
        listing_title: form.listing_title || null,
        city: form.city,
        requester_name: form.requester_name,
        requester_phone: form.requester_phone,
        requester_role: form.requester_role,
        notes: form.notes || null,
        price_quoted: isFixedPrice ? CONCIERGE_FIXED_PRICE : null,
        status: "pending"
      });
      setSent(true);
    } catch(e) { setError("Une erreur est survenue, réessayez."); }
    setSending(false);
  };

  return (
    <div style={{fontFamily:"Inter,sans-serif",background:"#FAF7F2",minHeight:"100vh"}}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      <header style={{background:"#fff",borderBottom:"1px solid #F0EDE8",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <div style={{maxWidth:900,margin:"0 auto",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:64}}>
          <div onClick={onBack} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
            <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#C0522A,#E8A020)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:18}}>🏡</span></div>
            <span style={{fontFamily:"Poppins,sans-serif",fontWeight:900,fontSize:20,color:"#1C1C1E"}}>Immo<span style={{color:"#C0522A"}}>Bénin</span></span>
          </div>
          <button onClick={onBack} style={{background:"#F0EDE8",color:"#555",border:"none",borderRadius:10,padding:"9px 16px",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:13,cursor:"pointer"}}>← Retour au site</button>
        </div>
      </header>

      {/* HERO */}
      <div style={{backgroundImage:"url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&q=85')",backgroundSize:"cover",backgroundPosition:"center",position:"relative",padding:"48px 16px 40px"}}>
        <div style={{position:"absolute",inset:0,background:"rgba(20,10,5,0.78)"}}/>
        <div style={{maxWidth:700,margin:"0 auto",textAlign:"center",position:"relative",zIndex:1}}>
          <div style={{fontSize:40,marginBottom:10}}>🕵️</div>
          <h1 style={{fontFamily:"Poppins,sans-serif",fontWeight:900,fontSize:"clamp(24px,4vw,32px)",color:"#fff",margin:"0 0 10px"}}>Service Concierge</h1>
          <p style={{color:"rgba(255,255,255,0.75)",fontFamily:"Inter,sans-serif",fontSize:14,lineHeight:1.6,maxWidth:520,margin:"0 auto"}}>
            Avant d'acheter ou de louer, faites vérifier un bien sur place par l'un de nos agents mandatés — visite physique, vérification du titre, photos supplémentaires. Réponse en <strong style={{color:"#E8A020"}}>24h</strong>.
          </p>
        </div>
      </div>

      <div style={{maxWidth:700,margin:"0 auto",padding:"32px 16px 60px"}}>
        {/* COMMENT ÇA MARCHE */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:28}}>
          {[
            {icon:"📝",title:"1. Vous demandez",desc:"Remplissez le formulaire ci-dessous avec le bien à vérifier"},
            {icon:"📞",title:"2. On vous contacte",desc:"Un agent vous appelle pour confirmer les détails et le tarif"},
            {icon:"🏠",title:"3. Vérification sur place",desc:"Visite physique, contrôle du titre, photos et compte-rendu"},
            {icon:"✅",title:"4. Rapport en 24h",desc:"Vous recevez un compte-rendu détaillé par WhatsApp"},
          ].map(s=>(
            <div key={s.title} style={{background:"#fff",borderRadius:14,padding:16,boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
              <div style={{fontSize:24,marginBottom:6}}>{s.icon}</div>
              <div style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:13,color:"#1C1C1E",marginBottom:4}}>{s.title}</div>
              <div style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#777",lineHeight:1.5}}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* TARIFS */}
        <div style={{background:"#fff",borderRadius:16,padding:22,marginBottom:28,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",border:"2px solid #F0EDE8"}}>
          <div style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:16,marginBottom:14}}>💰 Tarifs</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:"#FFF0EB",borderRadius:12,marginBottom:10}}>
            <div>
              <div style={{fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:14,color:"#1C1C1E"}}>Cotonou & Abomey-Calavi</div>
              <div style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#888"}}>Prix fixe, sans surprise</div>
            </div>
            <div style={{fontFamily:"Poppins,sans-serif",fontWeight:900,fontSize:20,color:"#C0522A"}}>{CONCIERGE_FIXED_PRICE.toLocaleString("fr-FR")} XOF</div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:"#F5F5F5",borderRadius:12}}>
            <div>
              <div style={{fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:14,color:"#1C1C1E"}}>Autres villes du Bénin</div>
              <div style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#888"}}>Selon la distance et l'accessibilité</div>
            </div>
            <div style={{fontFamily:"Poppins,sans-serif",fontWeight:900,fontSize:16,color:"#555"}}>Sur devis</div>
          </div>
          <div style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#888",marginTop:12,lineHeight:1.5}}>
            Le service peut être payé par l'acheteur intéressé ou par le vendeur souhaitant rassurer ses visiteurs.
          </div>
        </div>

        {/* FORMULAIRE */}
        <div style={{background:"#fff",borderRadius:16,padding:22,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",border:"2px solid #F0EDE8"}}>
          {sent ? (
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{fontSize:48,marginBottom:12}}>🎉</div>
              <h3 style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:18,color:"#1C6E3D",marginBottom:8}}>Demande envoyée !</h3>
              <p style={{fontFamily:"Inter,sans-serif",fontSize:13,color:"#555",lineHeight:1.6}}>
                Un agent ImmoBénin vous contactera sur WhatsApp dans les 24h pour confirmer les détails{!isFixedPrice&&" et le tarif"}.
              </p>
            </div>
          ) : (
            <>
              <div style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:16,marginBottom:16}}>📋 Demander une vérification</div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <input placeholder="Titre ou lien de l'annonce concernée (optionnel)" value={form.listing_title} onChange={e=>u("listing_title",e.target.value)}
                  style={{padding:"11px 13px",border:"2px solid #E0DDD8",borderRadius:10,fontFamily:"Inter,sans-serif",fontSize:13}}/>
                <select value={form.city} onChange={e=>u("city",e.target.value)} style={{padding:"11px 13px",border:"2px solid #E0DDD8",borderRadius:10,fontFamily:"Inter,sans-serif",fontSize:13}}>
                  {CITIES.slice(1).map(c=><option key={c}>{c}</option>)}
                </select>
                <div style={{display:"flex",gap:8}}>
                  {["acheteur","vendeur"].map(r=>(
                    <button key={r} onClick={()=>u("requester_role",r)} style={{flex:1,padding:10,border:`2px solid ${form.requester_role===r?"#C0522A":"#E0DDD8"}`,borderRadius:10,background:form.requester_role===r?"#FFF0EB":"#fff",color:form.requester_role===r?"#C0522A":"#555",fontWeight:700,fontFamily:"Inter,sans-serif",cursor:"pointer",textTransform:"capitalize"}}>{r}</button>
                  ))}
                </div>
                <input placeholder="Votre nom complet *" value={form.requester_name} onChange={e=>u("requester_name",e.target.value)}
                  style={{padding:"11px 13px",border:"2px solid #E0DDD8",borderRadius:10,fontFamily:"Inter,sans-serif",fontSize:13}}/>
                <input placeholder="Votre numéro WhatsApp *" value={form.requester_phone} onChange={e=>u("requester_phone",e.target.value)}
                  style={{padding:"11px 13px",border:"2px solid #E0DDD8",borderRadius:10,fontFamily:"Inter,sans-serif",fontSize:13}}/>
                <textarea placeholder="Précisions utiles (adresse exacte, disponibilités pour la visite...)" value={form.notes} onChange={e=>u("notes",e.target.value)}
                  rows={3} style={{padding:"11px 13px",border:"2px solid #E0DDD8",borderRadius:10,fontFamily:"Inter,sans-serif",fontSize:13,resize:"vertical"}}/>

                <div style={{background:isFixedPrice?"#E8F5E9":"#FFF3CD",borderRadius:10,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontFamily:"Inter,sans-serif",fontSize:13,fontWeight:600,color:isFixedPrice?"#2e7d32":"#856404"}}>Tarif estimé</span>
                  <span style={{fontFamily:"Poppins,sans-serif",fontSize:16,fontWeight:800,color:isFixedPrice?"#2e7d32":"#856404"}}>{priceLabel}</span>
                </div>

                {error&&<div style={{background:"#FFEBEE",borderRadius:10,padding:12,color:"#C62828",fontFamily:"Inter,sans-serif",fontSize:12}}>⚠️ {error}</div>}

                <button onClick={submit} disabled={!canSubmit||sending} style={{padding:13,background:(!canSubmit||sending)?"#ccc":"linear-gradient(135deg,#C0522A,#E8A020)",border:"none",borderRadius:12,color:"#fff",fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14,cursor:(!canSubmit||sending)?"not-allowed":"pointer"}}>
                  {sending?"Envoi...":"Envoyer ma demande →"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <footer style={{background:"#1C1C1E",padding:"22px 16px",textAlign:"center"}}>
        <div style={{fontFamily:"Poppins,sans-serif",fontWeight:900,fontSize:19,color:"#fff",marginBottom:4}}>Immo<span style={{color:"#C0522A"}}>Bénin</span></div>
        <p style={{fontFamily:"Inter,sans-serif",fontSize:11,color:"rgba(255,255,255,0.4)",margin:0}}>© 2025 ImmoBénin · Cotonou, Bénin · contact@immobenin.bj</p>
      </footer>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function ImmoBenin() {
  const [listings,setListings]=useState([]);
  const [loading,setLoading]=useState(true);
  const [dbConnected,setDbConnected]=useState(false);
  const [filter,setFilter]=useState("Tous");
  const [city,setCity]=useState("Toutes villes");
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState(null);
  const [showPublish,setShowPublish]=useState(false);
  const [featIdx,setFeatIdx]=useState(0);
  const [view,setView]=useState("home"); // "home" | "concierge"

  const fetchListings=useCallback(async()=>{
    setLoading(true);
    try {
      const data=await db.get("listings","?select=*,agents(full_name,phone,agency_name)&is_active=eq.true&order=is_featured.desc,created_at.desc");
      if(Array.isArray(data)&&data.length>0){ setListings(data); setDbConnected(true); }
      else { setListings(DEMO_LISTINGS); setDbConnected(false); }
    } catch { setListings(DEMO_LISTINGS); setDbConnected(false); }
    setLoading(false);
  },[]);

  useEffect(()=>{fetchListings();},[fetchListings]);

  const featured=listings.filter(l=>l.is_featured);
  useEffect(()=>{
    if(featured.length<2) return;
    const t=setInterval(()=>setFeatIdx(i=>(i+1)%featured.length),4000);
    return ()=>clearInterval(t);
  },[featured.length]);

  const filtered=listings.filter(l=>{
    const mf=filter==="Tous"||l.type===filter||l.category===filter;
    const mc=city==="Toutes villes"||(l.city||"").includes(city);
    const ms=!search||l.title.toLowerCase().includes(search.toLowerCase())||(l.city||"").toLowerCase().includes(search.toLowerCase())||(l.neighborhood||"").toLowerCase().includes(search.toLowerCase());
    return mf&&mc&&ms;
  });

  const curFeat=featured[featIdx]||featured[0]||listings[0];

  if (view==="concierge") {
    return <ConciergePage onBack={()=>setView("home")} prefillListing={selected} />;
  }

  return (
    <div style={{fontFamily:"Inter,sans-serif",background:"#FAF7F2",minHeight:"100vh"}}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      {/* STATUS */}
      {!dbConnected&&!loading&&(
        <div style={{background:"#FFF3CD",borderBottom:"1px solid #FFEAA7",padding:"7px 16px",textAlign:"center"}}>
          <span style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#856404"}}>⚠️ <strong>Mode démo</strong> — Remplacez SUPABASE_URL et SUPABASE_ANON_KEY pour activer la base de données</span>
        </div>
      )}
      {dbConnected&&(
        <div style={{background:"#D4EDDA",borderBottom:"1px solid #C3E6CB",padding:"7px 16px",textAlign:"center"}}>
          <span style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#155724"}}>✅ <strong>Supabase connecté</strong> — {listings.length} annonce{listings.length>1?"s":""} active{listings.length>1?"s":""}</span>
        </div>
      )}

      {/* HEADER */}
      <header style={{background:"#fff",borderBottom:"1px solid #F0EDE8",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:64}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#C0522A,#E8A020)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:18}}>🏡</span></div>
            <span style={{fontFamily:"Poppins,sans-serif",fontWeight:900,fontSize:20,color:"#1C1C1E"}}>Immo<span style={{color:"#C0522A"}}>Bénin</span></span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>{setSelected(null);setView("concierge");}} style={{background:"#FAF7F2",color:"#555",border:"2px solid #F0EDE8",borderRadius:10,padding:"9px 16px",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
              🕵️ <span style={{display:window.innerWidth<640?"none":"inline"}}>Service Concierge</span>
            </button>
            <button onClick={()=>setShowPublish(true)} style={{background:"linear-gradient(135deg,#C0522A,#E8A020)",color:"#fff",border:"none",borderRadius:10,padding:"10px 20px",fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:"0 4px 14px rgba(192,82,42,0.35)"}}>
              + Publier une annonce
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <div style={{backgroundImage:"url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=85')",backgroundSize:"cover",backgroundPosition:"center 30%",position:"relative",padding:"64px 16px 52px"}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(192,82,42,0.82) 0%,rgba(28,28,30,0.78) 100%)"}}/>
        <div style={{maxWidth:700,margin:"0 auto",textAlign:"center",position:"relative",zIndex:1}}>
          <div style={{fontSize:12,fontWeight:700,letterSpacing:2,color:"#E8A020",marginBottom:12,fontFamily:"Inter,sans-serif"}}>IMMOBILIER AU BÉNIN</div>
          <h1 style={{fontFamily:"Poppins,sans-serif",fontWeight:900,fontSize:"clamp(28px,5vw,48px)",color:"#fff",margin:"0 0 14px",lineHeight:1.2}}>Trouvez votre bien idéal<br/><span style={{color:"#E8A020"}}>au Bénin</span></h1>
          <p style={{color:"rgba(255,255,255,0.65)",fontFamily:"Inter,sans-serif",fontSize:14,marginBottom:26}}>Villas, appartements, terrains, bureaux — vente & location dans tout le pays</p>
          <div style={{display:"flex",gap:8,background:"#fff",borderRadius:14,padding:8,maxWidth:520,margin:"0 auto"}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par quartier, type de bien..." style={{flex:1,border:"none",outline:"none",fontFamily:"Inter,sans-serif",fontSize:13,padding:"8px 10px",background:"transparent",color:"#1C1C1E"}}/>
            <button style={{background:"linear-gradient(135deg,#C0522A,#E8A020)",border:"none",borderRadius:10,padding:"10px 18px",color:"#fff",fontWeight:700,fontFamily:"Inter,sans-serif",cursor:"pointer",fontSize:13}}>Chercher</button>
          </div>
          <div style={{display:"flex",gap:28,justifyContent:"center",marginTop:26}}>
            {[["🏠",listings.filter(l=>l.type==="Vente").length,"À vendre"],["🔑",listings.filter(l=>l.type==="Location").length,"À louer"],["📷",listings.reduce((s,l)=>s+(l.images?.length||0),0),"Photos"]].map(([icon,n,label])=>(
              <div key={label} style={{textAlign:"center"}}>
                <div style={{fontSize:18}}>{icon}</div>
                <div style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:22,color:"#E8A020"}}>{n}</div>
                <div style={{fontFamily:"Inter,sans-serif",fontSize:11,color:"rgba(255,255,255,0.6)"}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AD BANNER */}
      <div style={{background:"#1C6E3D",padding:"9px 16px",textAlign:"center"}}>
        <span style={{fontFamily:"Inter,sans-serif",fontSize:13,color:"#fff"}}>📢 <strong>Espace publicitaire disponible</strong> — Votre agence ici · Contactez-nous</span>
      </div>

      {/* FEATURED */}
      {curFeat&&(
        <div style={{maxWidth:1100,margin:"28px auto 0",padding:"0 16px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <h2 style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:19,color:"#1C1C1E",margin:0}}>⭐ Annonces en vedette</h2>
            {featured.length>1&&<div style={{display:"flex",gap:6}}>{featured.map((_,i)=><div key={i} onClick={()=>setFeatIdx(i)} style={{width:i===featIdx?24:8,height:8,borderRadius:4,background:i===featIdx?"#C0522A":"#D0C8C0",cursor:"pointer",transition:"all 0.3s"}}/>)}</div>}
          </div>
          <div style={{borderRadius:18,overflow:"hidden",position:"relative",cursor:"pointer",boxShadow:"0 8px 32px rgba(0,0,0,0.14)",border:"2px solid #E8A020"}} onClick={()=>setSelected(curFeat)}>
            <img src={curFeat.images?.[0]||FALLBACK_IMG} alt={curFeat.title} style={{width:"100%",height:260,objectFit:"cover",display:"block"}}/>
            {curFeat.images?.length>1&&<div style={{position:"absolute",top:12,right:12,background:"rgba(0,0,0,0.6)",color:"#fff",fontSize:11,padding:"3px 10px",borderRadius:14,fontFamily:"Inter,sans-serif"}}>📷 {curFeat.images.length} photos</div>}
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 50%)"}}/>
            <div style={{position:"absolute",bottom:0,left:0,right:0,padding:22}}>
              <div style={{display:"flex",gap:8,marginBottom:6}}>
                <span style={{background:"#E8A020",color:"#fff",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,fontFamily:"Inter,sans-serif"}}>⭐ EN VEDETTE</span>
                <span style={{background:curFeat.type==="Vente"?"#C0522A":"#1C6E3D",color:"#fff",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,fontFamily:"Inter,sans-serif"}}>{curFeat.type}</span>
              </div>
              <h3 style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:21,color:"#fff",margin:"0 0 4px"}}>{curFeat.title}</h3>
              <p style={{fontFamily:"Inter,sans-serif",fontSize:13,color:"rgba(255,255,255,0.8)",margin:"0 0 6px"}}>📍 {curFeat.neighborhood?`${curFeat.neighborhood}, `:""}{curFeat.city}</p>
              <div style={{fontSize:21,fontWeight:800,color:"#E8A020",fontFamily:"Poppins,sans-serif"}}>{formatPrice(curFeat.price,curFeat.type)}</div>
            </div>
          </div>
        </div>
      )}

      {/* LISTINGS */}
      <div style={{maxWidth:1100,margin:"26px auto 0",padding:"0 16px"}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setFilter(c)} style={{padding:"7px 16px",borderRadius:30,border:`2px solid ${filter===c?"#C0522A":"#E0DDD8"}`,background:filter===c?"#C0522A":"#fff",color:filter===c?"#fff":"#555",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer",transition:"all 0.2s"}}>{c}</button>
          ))}
          <select value={city} onChange={e=>setCity(e.target.value)} style={{padding:"7px 14px",borderRadius:30,border:"2px solid #E0DDD8",background:"#fff",color:"#555",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>
            {CITIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#888",marginBottom:18}}>
          {filtered.length} annonce{filtered.length>1?"s":""} trouvée{filtered.length>1?"s":""}
          {dbConnected&&<span style={{color:"#1C6E3D",marginLeft:8}}>• En direct depuis Supabase</span>}
        </div>
        {loading?<Spinner/>:(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:18,marginBottom:40}}>
            {filtered.map(l=><Card key={l.id} l={l} onSelect={setSelected}/>)}
          </div>
        )}
        {!loading&&filtered.length===0&&(
          <div style={{textAlign:"center",padding:"60px 20px",color:"#888"}}>
            <div style={{fontSize:46,marginBottom:10}}>🔍</div>
            <div style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:17,color:"#1C1C1E",marginBottom:6}}>Aucune annonce trouvée</div>
            <button onClick={()=>{setFilter("Tous");setCity("Toutes villes");setSearch("");}} style={{color:"#C0522A",border:"none",background:"none",fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"Inter,sans-serif"}}>Réinitialiser les filtres</button>
          </div>
        )}
      </div>

      {/* PRICING SECTION */}
      <div style={{backgroundImage:"url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&q=85')",backgroundSize:"cover",backgroundPosition:"center",position:"relative",padding:"40px 16px",textAlign:"center",margin:"10px 0 0"}}>
        <div style={{position:"absolute",inset:0,background:"rgba(20,10,5,0.80)"}}/>
        <div style={{maxWidth:700,margin:"0 auto",position:"relative",zIndex:1}}>
          <h2 style={{fontFamily:"Poppins,sans-serif",fontWeight:900,fontSize:22,color:"#fff",marginBottom:4}}>Publiez votre bien sur ImmoBénin</h2>
          <p style={{fontFamily:"Inter,sans-serif",color:"rgba(255,255,255,0.65)",marginBottom:24,fontSize:13}}>Simple, rapide, efficace — jusqu'à 8 photos par annonce</p>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:24}}>
            {[{label:"Annonce standard",price:`${PRICE_STANDARD.toLocaleString("fr-FR")} XOF`,desc:"60 jours · 8 photos",icon:"📋"},{label:"Annonce en vedette",price:`${PRICE_TOTAL_FEATURED.toLocaleString("fr-FR")} XOF`,desc:"Standard + badge ⭐ + priorité",icon:"⭐"},{label:"Espace publicitaire",price:"Sur devis",desc:"Bandeau ou sidebar",icon:"📢"}].map(p=>(
              <div key={p.label} style={{background:"rgba(255,255,255,0.08)",borderRadius:14,padding:"18px 20px",textAlign:"center",minWidth:150,border:"1px solid rgba(232,160,32,0.3)"}}>
                <div style={{fontSize:26,marginBottom:5}}>{p.icon}</div>
                <div style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:13,color:"#fff",marginBottom:3}}>{p.label}</div>
                <div style={{fontFamily:"Poppins,sans-serif",fontWeight:900,fontSize:18,color:"#E8A020",marginBottom:3}}>{p.price}</div>
                <div style={{fontFamily:"Inter,sans-serif",fontSize:11,color:"rgba(255,255,255,0.55)"}}>{p.desc}</div>
              </div>
            ))}
          </div>
          <button onClick={()=>setShowPublish(true)} style={{background:"linear-gradient(135deg,#C0522A,#E8A020)",border:"none",borderRadius:12,padding:"13px 32px",color:"#fff",fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:15,cursor:"pointer",boxShadow:"0 6px 20px rgba(192,82,42,0.4)"}}>+ Publier maintenant</button>
        </div>
      </div>

      {/* AVERTISSEMENT ACHETEURS */}
      <div style={{background:"#FFF8E1",borderTop:"1px solid #FFE0B2",padding:"16px 16px"}}>
        <div style={{maxWidth:700,margin:"0 auto",textAlign:"center"}}>
          <p style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#7A4F01",lineHeight:1.6,margin:0}}>
            ⚠️ <strong>Avis important :</strong> ImmoBénin met en relation acheteurs et vendeurs mais ne vérifie pas systématiquement chaque annonce. Faites toujours vos propres vérifications avant tout paiement ou engagement (visite, titre de propriété, identité du vendeur). En cas de doute, utilisez notre <button onClick={()=>{setSelected(null);setView("concierge");}} style={{background:"none",border:"none",color:"#C0522A",fontWeight:700,textDecoration:"underline",cursor:"pointer",fontFamily:"Inter,sans-serif",fontSize:12,padding:0}}>service Concierge</button>.
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{background:"#1C1C1E",padding:"22px 16px",textAlign:"center"}}>
        <div style={{fontFamily:"Poppins,sans-serif",fontWeight:900,fontSize:19,color:"#fff",marginBottom:4}}>Immo<span style={{color:"#C0522A"}}>Bénin</span></div>
        <p style={{fontFamily:"Inter,sans-serif",fontSize:11,color:"rgba(255,255,255,0.4)",margin:0}}>© 2025 ImmoBénin · Cotonou, Bénin · contact@immobenin.bj</p>
      </footer>

      {selected&&<DetailModal listing={selected} onClose={()=>setSelected(null)} onRequestVerification={()=>setView("concierge")}/>}
      {showPublish&&<PublishModal onClose={()=>setShowPublish(false)} onSuccess={fetchListings}/>}
    </div>
  );
}
