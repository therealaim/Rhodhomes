
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
