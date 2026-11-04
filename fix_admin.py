import pathlib
def w(p,t): pathlib.Path(p).write_text(t); print("fixed",p)

w("public/admin.html", r"""
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>RHODHOMES Admin Log</title><style>
*{box-sizing:border-box} body{font-family:Arial,sans-serif;background:#eef3ee;margin:0;color:#222}
.header{background:#0a2e1f;padding:18px;text-align:center;color:#fff;position:sticky;top:0;z-index:10}
.header img{height:48px;background:#fff;border-radius:8px;padding:4px}
.header h1{margin:6px 0 0} .header h1 span{color:#2ecc71} .header p{color:#c8e6c9;margin:4px 0 0;font-size:13px}
.wrap{padding:14px;max-width:1100px;margin:0 auto}
.toolbar{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0} .toolbar input{flex:1;padding:12px;border:1px solid #ddd;border-radius:8px} .toolbar button{padding:12px 18px;background:#0a2e1f;color:#fff;border:0;border-radius:8px;font-weight:bold}
.stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:12px 0} .stat{background:#fff;padding:14px;border-radius:10px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.05)} .stat b{font-size:22px;color:#0a2e1f}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.05)}
th{background:#0a2e1f;color:#fff;padding:12px 8px;text-align:left;font-size:13px} td{padding:12px 8px;border-bottom:1px solid #eee;font-size:13px;vertical-align:top}
.ref{background:#e8f5e9;color:#0a2e1f;padding:4px 8px;border-radius:20px;font-weight:bold;white-space:nowrap}
.badge{background:#2ecc71;color:#fff;padding:3px 8px;border-radius:20px;font-size:11px}
.btn{padding:8px 12px;border:0;border-radius:6px;font-weight:bold;cursor:pointer} .btn-green{background:#0a2e1f;color:#fff} .btn-copy{background:#2ecc71;color:#fff} .btn-html{background:#f1c40f;color:#222}
.detail{display:none;background:#fff;padding:16px;border-radius:10px;margin:-5px 0 12px;border:1px solid #ddd}
.detail pre{white-space:pre-wrap;background:#f8f8f8;padding:10px;border-radius:8px;font-size:12px;overflow:auto;max-height:300px}
.copybox{margin-top:10px} .copybox textarea{width:100%;height:180px;padding:10px;font-size:11px;border:1px solid #ddd;border-radius:8px}
@media(max-width:700px){ .stats{grid-template-columns:1fr} table{font-size:12px} th:nth-child(4),td:nth-child(4){display:none} }
</style></head><body>
<div class="header"><img src="logo.png" onerror="this.style.display='none'"><h1>RHOD<span>HOMES</span></h1><p>Rental Referral Partner Network — Admin Log</p></div>
<div class="wrap">
<div class="toolbar"><input id="pwd" type="password" placeholder="Admin password"><button onclick="load()">View Submissions</button><input id="search" placeholder="Search name / email / ref..." oninput="filter()"></div>
<div class="stats"><div class="stat"><div>Total</div><b id="tTotal">-</b></div><div class="stat"><div>Applications</div><b id="tApp">-</b></div><div class="stat"><div>Enquiries</div><b id="tEnq">-</b></div></div>
<div style="overflow-x:auto;"><table><thead><tr><th>Ref ID</th><th>Type</th><th>Name</th><th>Email / Phone</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody id="rows"></tbody></table></div>
<div id="details"></div></div>
<script>
let ALL=[];
function esc(s){ return String(s||'').replace(/</g,'&lt;'); }
function buildHtmlEmail(s){
  return `<!DOCTYPE html><html><body style="font-family:Arial;background:#f3f7f3;padding:20px;"><div style="background:#0a2e1f;padding:20px;text-align:center;"><h1 style="color:#fff;margin:0;">RHOD<span style="color:#2ecc71;">HOMES</span></h1><p style="color:#c8e6c9;">Rental Referral Partner Network</p></div><div style="background:#fff;padding:24px;border-radius:8px;"><h2>Hello ${esc(s.name)},</h2><p>Thank you for your submission. Your Reference ID is <b>${s.ref}</b></p><p>We have reviewed your details and will follow up within 24 hours.</p><p>Please quote your Ref ID <b>${s.ref}</b> in all replies.</p><p>Best regards,<br>RHODHOMES Team</p></div><p style="font-size:12px;color:#777;">RHODHOMES - Do not share passwords or card numbers.</p></body></html>`;
}
function load(){ const k=document.getElementById('pwd').value; fetch('/api/admin?key='+encodeURIComponent(k)).then(r=>r.json()).then(j=>{ if(!j.ok){ alert('Wrong password'); return; } ALL=j.submissions; document.getElementById('tTotal').textContent=j.total; document.getElementById('tApp').textContent=ALL.filter(x=>x.type.includes('Application')).length; document.getElementById('tEnq').textContent=ALL.filter(x=>x.type.includes('Enquiry')).length; render(ALL); }); }
function render(list){
  document.getElementById('rows').innerHTML=list.map((s,i)=>`<tr><td><span class="ref">${s.ref}</span><br><button class="btn btn-copy" onclick="navigator.clipboard.writeText('${s.ref}')">Copy Ref</button></td><td><span class="badge">${s.type}</span></td><td><b>${esc(s.name)}</b></td><td>${esc(s.email)}<br>${esc(s.phone)}</td><td>${new Date(s.createdAt).toLocaleString()}</td><td>${s.status}</td><td><button class="btn btn-green" onclick="toggle(${i})">View</button></td></tr>`).join('');
  document.getElementById('details').innerHTML=list.map((s,i)=>`<div class="detail" id="d${i}"><h3>${esc(s.name)} - ${s.ref}</h3><pre>${esc(JSON.stringify(s.data,null,2))}</pre><div class="copybox"><b>1. Manual Follow-up Text (copy):</b><textarea readonly>${esc(s.manualTemplate||'')}</textarea><button class="btn btn-copy" onclick="navigator.clipboard.writeText(this.previousElementSibling.value);this.textContent='Copied!'">Copy Manual Template</button></div><div class="copybox"><b>2. RHODHOMES Styled HTML Email (copy & paste into email):</b><textarea readonly id="html${i}">${esc(buildHtmlEmail(s))}</textarea><button class="btn btn-html" onclick="navigator.clipboard.writeText(document.getElementById('html${i}').value);this.textContent='HTML Copied!'">Copy HTML Code</button></div><div style="background:#e8f5e9;padding:12px;border-radius:8px;margin-top:10px;"><b>Preview:</b><div style="background:#fff;padding:12px;border-radius:8px;margin-top:8px;"><h3>RHODHOMES</h3><p>Hello ${esc(s.name)}, Thank you for your submission. Your Ref is <b>${s.ref}</b></p></div></div></div>`).join('');
}
function toggle(i){ const d=document.getElementById('d'+i); d.style.display=d.style.display==='block'?'none':'block'; d.scrollIntoView({behavior:'smooth'}); }
function filter(){ const q=document.getElementById('search').value.toLowerCase(); render(ALL.filter(s=>(s.ref+s.name+s.email+s.phone).toLowerCase().includes(q))); }
</script></body></html>
""")
print("DONE")
