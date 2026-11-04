import pathlib
def w(p,t):
    pathlib.Path(p).parent.mkdir(parents=True, exist_ok=True)
    pathlib.Path(p).write_text(t)
    print("created",p)

# --- Shared store: works on Vercel (memory) + Termux (file) ---
w("api/_store.js", r"""
'use strict';
const fs=require('fs'); const path=require('path');
const FILE=path.join(__dirname,'..','db.json');
let mem=[];
try{ if(fs.existsSync(FILE)) mem=JSON.parse(fs.readFileSync(FILE,'utf8')); }catch(e){ mem=[]; }
function all(){ return mem; }
function save(rec){
  mem.unshift(rec);
  try{ fs.writeFileSync(FILE, JSON.stringify(mem.slice(0,500),null,2)); }catch(e){}
  return rec;
}
function makeRef(prefix){
  const d=new Date().toISOString().slice(0,10).replace(/-/g,'');
  const h=Math.random().toString(36).slice(2,8).toUpperCase();
  return `${prefix}-${d}-${h}`;
}
module.exports={all,save,makeRef};
""")

# --- Shared email templates RHODHOMES style ---
w("api/_email.js", r"""
'use strict';
function clean(v){ return String(v||'').replace(/[<>&"]/g,''); }
function style(){ return `font-family:Arial,sans-serif;background:#f3f7f3;padding:20px;color:#222;`; }
function header(){ return `<div style="background:#0a2e1f;padding:20px;text-align:center;"><h1 style="color:#fff;margin:0;">RHOD<span style="color:#2ecc71;">HOMES</span></h1><p style="color:#c8e6c9;margin:5px 0 0;">Rental Referral Partner Network</p></div>`; }
function footer(){ return `<p style="font-size:12px;color:#777;">RHODHOMES - Rental Referral Partner Network<br>Do not reply with passwords, card numbers or ID numbers.</p>`; }
function buildAdminEmail(data, ref, type){
  const rows=Object.entries(data).map(([k,v])=>`<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">${clean(k)}</td><td style="padding:8px;border:1px solid #ddd;">${clean(typeof v==='object'?JSON.stringify(v):v)}</td></tr>`).join('');
  return { subject:`[${type}] New Submission ${ref} - ${clean(data.email||data.fullName||'')}`, html:`<div style="${style()}">${header()}<h2>New ${type} - ${ref}</h2><table style="border-collapse:collapse;width:100%;">${rows}</table><p>Ref ID: <b>${ref}</b> - Use this in all follow-ups.</p>${footer()}</div>`, text:`New ${type} ${ref}\n${JSON.stringify(data,null,2)}` };
}
function buildReceiptEmail(data, ref, type){
  const name=clean(data.fullName||data.firstName||'Applicant');
  return { subject:`RHODHOMES - We received your ${type} [${ref}]`, html:`<div style="${style()}">${header()}<div style="background:#fff;padding:24px;border-radius:8px;"><h2>Hello ${name},</h2><p>Thank you for your ${type}. We have received it.</p><div style="background:#e8f5e9;padding:16px;border-radius:8px;text-align:center;"><p style="margin:0;color:#666;">Your Reference ID</p><h1 style="margin:5px 0;color:#0a2e1f;">${ref}</h1><p style="margin:0;">Please keep this for all follow-ups.</p></div><p><b>Please do NOT submit twice.</b> Duplicate submissions delay review.</p><p>Please wait <b>24 hours</b> for a follow-up from one of our agents. Our agent will contact you on the email / phone you provided.</p><p>If you need to contact us, quote your Ref ID: <b>${ref}</b></p></div>${footer()}</div>`, text:`Hello ${name},\n\nWe received your ${type}.\nYour Reference ID: ${ref}\n\nPlease do NOT submit twice. Wait 24 hours for a follow-up from one of our agents.\n\nRHODHOMES` };
}
function buildManualTemplate(data, ref){
  return `Subject: RHODHOMES - Follow-up on your submission [${ref}]\n\nHello ${clean(data.fullName||'Applicant')},\n\nThank you for your submission to RHODHOMES. Your Reference ID is ${ref}.\n\nWe have reviewed your details and would like to follow up...\n\n[Write your message here]\n\nPlease reply to this email quoting your Ref ID: ${ref}\n\nBest regards,\nRHODHOMES Team\nRental Referral Partner Network`;
}
module.exports={clean, buildAdminEmail, buildReceiptEmail, buildManualTemplate};
""")

# --- Universal submit handler for BOTH apply + enquiry ---
w("api/submit.js", r"""
'use strict';
const {save, makeRef}=require('./_store.js');
const {buildAdminEmail, buildReceiptEmail}=require('./_email.js');
module.exports=async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({ok:false,message:'Method not allowed.'});
  let body=req.body; if(typeof body==='string'){ try{body=JSON.parse(body);}catch(e){body={}} }
  const data=(body.data||body)||{};
  if(body.website && String(body.website).trim()!=='') return res.status(200).json({ok:true,reference:'RH-'+Date.now().toString(36).toUpperCase()});
  if(!(Number(body.elapsedMs)>=1000)) return res.status(400).json({ok:false,message:'Please review your answers then submit again.'});
  const type = body.type==='enquiry' ? 'Enquiry' : 'Partner Application';
  const prefix = type==='Enquiry' ? 'ENQ' : 'RH';
  const ref = makeRef(prefix);
  const rec={ ref, type, createdAt:new Date().toISOString(), email:data.email||'', name:data.fullName||data.firstName||'', phone:data.phone||'', data, status:'New' };
  save(rec);
  // Email - admin + applicant (best effort, but still return success if saved)
  const apiKey=process.env.RESEND_API_KEY; const to=process.env.NOTIFY_EMAIL||'rhodhomes@outlook.com';
  const from=process.env.FROM_EMAIL||'RHODHOMES <onboarding@resend.dev>';
  if(apiKey){
    try{
      const admin=buildAdminEmail(data,ref,type);
      await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],reply_to:data.email||to,subject:admin.subject,html:admin.html,text:admin.text})});
      if(data.email){
        const rcpt=buildReceiptEmail(data,ref,type);
        await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[data.email],subject:rcpt.subject,html:rcpt.html,text:rcpt.text})});
      }
    }catch(e){ console.log('email failed',e.message); }
  }
  return res.status(200).json({ok:true,reference:ref, message:'Received. Please do NOT submit twice. Wait 24hrs for follow-up.'});
};
""")

w("api/enquiry.js", r"""
'use strict';
const h=require('./submit.js');
module.exports=async (req,res)=>{ if(req.body && typeof req.body==='object') req.body.type='enquiry'; else req.body={type:'enquiry'}; return h(req,res); };
""")

# --- Admin API ---
w("api/admin.js", r"""
'use strict';
const {all}=require('./_store.js');
const {buildManualTemplate}=require('./_email.js');
module.exports=async (req,res)=>{
  const key=req.query.key||req.headers['x-admin-key']||'';
  if(key!==process.env.ADMIN_PASSWORD && key!=='rhod1234') return res.status(401).json({ok:false,message:'Wrong admin password'});
  const list=all().map(r=>({...r, manualTemplate: buildManualTemplate(r.data||{}, r.ref)}));
  return res.status(200).json({ok:true, total:list.length, submissions:list});
};
""")

# --- Admin Log Page ---
w("public/admin.html", r"""
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>RHODHOMES Admin Log</title><style>body{font-family:Arial;background:#f3f7f3;padding:16px} .card{background:#fff;padding:16px;border-radius:10px;margin-bottom:12px} input,button{padding:12px;width:100%;margin:6px 0} button{background:#0a2e1f;color:#fff;border:0;border-radius:8px} pre{white-space:pre-wrap;background:#f5f5f5;padding:10px;overflow:auto} .ref{color:#0a2e1f;font-weight:bold}</style></head><body>
<h1>RHODHOMES - Admin Log</h1><p>All submissions with Ref ID. Use Ref ID in follow-up.</p>
<input id="pwd" type="password" placeholder="Admin password"><button onclick="load()">View Submissions</button><div id="out"></div>
<script>async function load(){ const k=document.getElementById('pwd').value; const r=await fetch('/api/admin?key='+encodeURIComponent(k)); const j=await r.json(); if(!j.ok){ document.getElementById('out').innerHTML='<p>Wrong password</p>'; return; } document.getElementById('out').innerHTML='<h3>Total: '+j.total+'</h3>'+j.submissions.map(s=>`<div class="card"><p>Ref: <span class="ref">${s.ref}</span> | ${s.type} | ${s.createdAt} | ${s.status}</p><p>${s.name} - ${s.email} - ${s.phone}</p><pre>${JSON.stringify(s.data,null,2)}</pre><p><b>Manual Follow-up Template - copy:</b></p><pre>${s.manualTemplate.replace(/</g,'&lt;')}</pre></div>`).join(''); }</script>
</body></html>
""")

# --- Fix test-server.js for local testing ---
w("test-server.js", r"""
const http=require('http'); const fs=require('fs'); const path=require('path');
const submit=require('./api/submit.js'); const admin=require('./api/admin.js');
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost:8000');
  if(url.pathname==='/api/submit' || url.pathname==='/api/enquiry'){ let b=''; req.on('data',c=>b+=c); req.on('end',async()=>{ req.body=b; req.query={}; await submit(req,res); }); return; }
  if(url.pathname==='/api/admin'){ req.query=Object.fromEntries(url.searchParams); await admin(req,res); return; }
  let file=path.join(__dirname,'public',url.pathname==='/'?'index.html':url.pathname);
  if(!fs.existsSync(file)){ res.writeHead(404); return res.end('Not found'); }
  let t='text/html'; if(file.endsWith('.css'))t='text/css'; if(file.endsWith('.js'))t='text/javascript';
  res.writeHead(200,{'Content-Type':t}); res.end(fs.readFileSync(file));
});
server.listen(8000,()=>console.log('Running http://localhost:8000  Admin: http://localhost:8000/admin.html  password: rhod1234'));
""")
print("DONE")
