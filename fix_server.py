import pathlib
def w(p,t):
    pathlib.Path(p).write_text(t)
    print("fixed",p)

# 1. Fix test-server.js - add res.status().json() shim for Termux
w("test-server.js", r"""
const http=require('http'); const fs=require('fs'); const path=require('path');
const submit=require('./api/submit.js'); const admin=require('./api/admin.js');
function shim(res){
  res.status=(code)=>{ res.statusCode=code; return res; };
  res.json=(obj)=>{ res.setHeader('Content-Type','application/json'); res.end(JSON.stringify(obj)); };
  return res;
}
const server=http.createServer(async(req,res)=>{
  shim(res);
  const url=new URL(req.url,'http://localhost:8000');
  if(url.pathname==='/api/submit' || url.pathname==='/api/enquiry'){ let b=''; req.on('data',c=>b+=c); req.on('end',async()=>{ req.body=b; req.query={}; await submit(req,res); }); return; }
  if(url.pathname==='/api/admin'){ req.query=Object.fromEntries(url.searchParams); await admin(req,res); return; }
  let file=path.join(__dirname,'public',url.pathname==='/'?'index.html':url.pathname);
  if(!fs.existsSync(file)){ res.writeHead(404); return res.end('Not found'); }
  let t='text/html'; if(file.endsWith('.css'))t='text/css'; if(file.endsWith('.js'))t='text/javascript'; if(file.endsWith('.png'))t='image/png';
  res.writeHead(200,{'Content-Type':t}); res.end(fs.readFileSync(file));
});
server.listen(8000,()=>console.log('Running http://localhost:8000  Admin: http://localhost:8000/admin.html  password: rhod1234'));
""")

# 2. RHODHOMES styled Admin Log with header + logo
w("public/admin.html", r"""
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>RHODHOMES Admin Log</title><style>
*{box-sizing:border-box} body{font-family:Arial,sans-serif;background:#f3f7f3;margin:0;padding:0;color:#222}
.header{background:#0a2e1f;padding:18px 16px;text-align:center;color:#fff}
.header img{height:52px;background:#fff;border-radius:8px;padding:4px}
.header h1{margin:6px 0 0;font-size:24px} .header h1 span{color:#2ecc71}
.header p{color:#c8e6c9;margin:4px 0 0;font-size:13px}
.wrap{padding:16px;max-width:800px;margin:0 auto}
.card{background:#fff;padding:16px;border-radius:12px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
input,button{padding:13px;width:100%;margin:6px 0;border-radius:8px;border:1px solid #ddd;font-size:15px}
button{background:#0a2e1f;color:#fff;border:0;font-weight:bold} button:active{opacity:.85}
pre{white-space:pre-wrap;background:#f5f5f5;padding:10px;overflow:auto;border-radius:8px;font-size:12px}
.ref{color:#0a2e1f;font-weight:bold;background:#e8f5e9;padding:2px 8px;border-radius:20px}
.badge{background:#2ecc71;color:#fff;padding:3px 10px;border-radius:20px;font-size:12px}
</style></head><body>
<div class="header"><img src="logo.png" onerror="this.style.display='none'"><h1>RHOD<span>HOMES</span></h1><p>Rental Referral Partner Network - Admin Log</p></div>
<div class="wrap"><p>All submissions with Ref ID. Use Ref ID in every follow-up.</p>
<input id="pwd" type="password" placeholder="Admin password - rhod1234"><button onclick="load()">View Submissions</button><div id="out"></div></div>
<script>async function load(){ const k=document.getElementById('pwd').value; const r=await fetch('/api/admin?key='+encodeURIComponent(k)); const j=await r.json(); if(!j.ok){ document.getElementById('out').innerHTML='<p>Wrong password</p>'; return; } document.getElementById('out').innerHTML='<h3>Total: '+j.total+'</h3>'+j.submissions.map(s=>`<div class="card"><p>Ref: <span class="ref">${s.ref}</span> <span class="badge">${s.type}</span></p><p>${s.createdAt} | ${s.status}</p><p><b>${s.name}</b> - ${s.email} - ${s.phone}</p><pre>${JSON.stringify(s.data,null,2)}</pre><p><b>Manual Follow-up Template - copy:</b></p><pre>${s.manualTemplate.replace(/</g,'&lt;')}</pre><button onclick="navigator.clipboard.writeText(this.nextElementSibling.textContent);alert('Copied')">Copy Template</button><pre style="display:none">${s.manualTemplate}</pre></div>`).join(''); }</script>
</body></html>
""")
print("DONE - now run node test-server.js")
