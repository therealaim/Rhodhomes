import pathlib, re
def read(p): return pathlib.Path(p).read_text() if pathlib.Path(p).exists() else ""
def write(p,t): pathlib.Path(p).parent.mkdir(parents=True, exist_ok=True); pathlib.Path(p).write_text(t); print("fixed",p)

# --- 1. COPY BOX + FIX ENQUIRY PREFIX ---
# Find any html/js that shows reference and add copy button
for fname in ["public/index.html","public/apply.html","public/home.js","public/enquiry-config.js","public/form-config.js"]:
    txt=read(fname)
    if not txt: continue
    # Make enquiry use ENQ prefix: if file posts to /api/submit, add type enquiry
    if "enquiry" in fname.lower() and "/api/submit" in txt:
        txt=txt.replace("/api/submit","/api/enquiry")
    # Add copy function if not present
    if "copyRef" not in txt and ".html" in fname:
        txt=txt.replace("</body>", """<script>
function copyRef(){ const el=document.querySelector('[data-ref], .ref-code, #refCode'); const t=el?el.textContent.trim():''; if(t){ navigator.clipboard.writeText(t).then(()=>alert('Copied: '+t)); } }
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.ref-box, [data-ref-box]').forEach(box=>{
    if(!box.querySelector('.copy-btn')){ const b=document.createElement('button'); b.className='copy-btn'; b.textContent='Copy Reference'; b.style.cssText='background:#0a2e1f;color:#fff;border:0;padding:12px;width:100%;border-radius:8px;margin-top:10px;font-weight:bold;'; b.onclick=()=>{ const ref=box.querySelector('[data-ref]')?.textContent||box.textContent.match(/[A-Z]+-\\d+-\\w+/)?.[0]||''; navigator.clipboard.writeText(ref).then(()=>{b.textContent='Copied!'; setTimeout(()=>b.textContent='Copy Reference',2000)}); }; box.after(b); }
  });
  // Also inject copy button right after any element showing RH- or ENQ-
  setTimeout(()=>{
    const els=[...document.querySelectorAll('*')].filter(e=>e.children.length===0 && /^(RH|ENQ)-\\d+-/.test(e.textContent.trim()));
    els.forEach(e=>{ if(e.nextElementSibling?.classList?.contains('copy-btn')) return; const b=document.createElement('button'); b.className='copy-btn'; b.textContent='Copy Reference'; b.style.cssText='background:#0a2e1f;color:#fff;border:0;padding:12px;width:100%;border-radius:8px;margin-top:10px;font-weight:bold;'; b.onclick=()=>{ navigator.clipboard.writeText(e.textContent.trim()).then(()=>{b.textContent='Copied!'; setTimeout(()=>b.textContent='Copy Reference',2000)}); }; e.after(b); const note=document.createElement('p'); note.style.cssText='font-size:13px;color:#555;text-align:center;'; note.textContent='Please do NOT submit twice. Wait 24hrs for follow-up from one of our agents.'; b.after(note); });
  },500);
});
</script></body>""")
    write(fname, txt)

# --- 2. CREATE rhod-fix.js for all 6 corrections ---
fix_js = r"""
// RHODHOMES FIX - 2 Occupation, 3 States, 4 Dropdowns, 5 Payment, Address
(function(){
  const STATES=["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming","District of Columbia"];
  function findEl(text){ const l=[...document.querySelectorAll('label')].find(x=>x.textContent.toLowerCase().includes(text.toLowerCase())); if(!l) return null; return l.parentElement.querySelector('input,select,textarea') || document.getElementById(l.getAttribute('for')); }
  function makeSel(opts,cur){ const s=document.createElement('select'); s.style.cssText='width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;'; s.innerHTML='<option value="">Select...</option>'+opts.map(o=>`<option ${o===cur?'selected':''}>${o}</option>`).join(''); return s; }
  function init(){
    // 2 Occupation dropdown + conditional
    const occ=findEl('Occupation');
    if(occ && occ.tagName!=='SELECT'){
      const sel=makeSel(["Employed","Self-Employed","Unemployed","Student","Retired","Other"], occ.value); sel.name=occ.name||'occupation'; occ.replaceWith(sel);
      const box=document.createElement('div'); box.id='occ-box'; sel.parentElement.after(box);
      function render(){ box.innerHTML=''; const v=sel.value; const add=(lb,nm,tp='text')=>{ const d=document.createElement('div'); d.innerHTML=`<label>${lb}</label><input name="${nm}" type="${tp}" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;" />`; box.appendChild(d); };
        if(v==='Employed'||v==='Self-Employed'){ add('Employer Name','employerName'); add('Post / Title','employerPost'); add('Year Started','yearStarted','number'); add('Do you have 401k or Paystub?','has401kOrPaystub'); }
        if(v==='Retired'){ add('Previous Employer','previousEmployer'); add('Start Date','startDate','date'); add('Retired Date','retiredDate','date'); add('Do you have 401k or Paystub?','has401kOrPaystub'); }
      }
      sel.addEventListener('change',render); render();
    }
    // 3 Locations - all US states multi-select
    const loc=findEl('Locations or areas');
    if(loc && loc.tagName==='TEXTAREA'){
      const box=document.createElement('div'); box.style.cssText='max-height:220px;overflow:auto;border:1px solid #ddd;padding:10px;display:grid;grid-template-columns:1fr 1fr;border-radius:8px;';
      box.innerHTML=STATES.map(s=>`<label style="display:flex;gap:6px;font-size:14px;"><input type="checkbox" name="locations" value="${s}"> ${s}</label>`).join(''); loc.replaceWith(box);
    }
    // 4 Share + Why dropdowns
    const share=findEl('How do you plan to share');
    if(share && share.tagName==='TEXTAREA'){ const s=makeSel(["WhatsApp / SMS","Facebook","Instagram","TikTok","Email Newsletter","Community / Church Group","Word of Mouth","Online Forums / Groups","Other"]); s.name=share.name||'shareMethod'; share.replaceWith(s); }
    const why=findEl('Why are you interested');
    if(why && why.tagName==='TEXTAREA'){ const s=makeSel(["Extra Income","Help People Find Housing","Community Impact","Flexible Work","Learn Real Estate / Rentals","Other"]); s.name=why.name||'interestReason'; why.replaceWith(s); }
    // 5 Payment - debit/credit + bank details
    const pay=findEl('Preferred payment method');
    if(pay && pay.tagName==='SELECT'){
      pay.innerHTML='<option value="">Select...</option><option>Bank Transfer</option><option>Debit Card</option><option>Credit Card</option>';
      let box=document.getElementById('pay-extra'); if(!box){ box=document.createElement('div'); box.id='pay-extra'; pay.parentElement.after(box); }
      pay.addEventListener('change',()=>{ box.innerHTML=''; if(pay.value==='Bank Transfer'){ box.innerHTML=`<label>Institution You Bank With (optional)</label><input name="bankInstitution" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;" /><label>Years With Bank (optional)</label><input name="yearsWithBank" type="number" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;" /><p style="font-size:13px;color:#555;">You can use this for receiving, but we recommend a new account with our partner bank for paying out.</p>`; } });
    }
    // Address - rent/own + how long
    const addr=findEl('Address');
    if(addr && !document.querySelector('[name="housingStatus"]')){
      const w=document.createElement('div'); w.innerHTML=`<label>Do you Rent or Own this address?</label><select name="housingStatus" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;"><option value="">Select...</option><option>Rent</option><option>Own</option><option>Living with Family / Other</option></select><label>How long at this address?</label><input name="yearsAtAddress" placeholder="e.g. 2 years, 6 months" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;" />`; addr.closest('div').after(w);
    }
  }
  document.addEventListener('DOMContentLoaded',init); setTimeout(init,1000);
})();
"""
write("public/rhod-fix.js", fix_js)
# Inject rhod-fix.js into pages if missing
for fname in ["public/index.html","public/apply.html"]:
    txt=read(fname)
    if txt and "rhod-fix.js" not in txt:
        txt=txt.replace("</body>", '<script src="rhod-fix.js"></script></body>')
        write(fname, txt)
print("DONE - restart server")
