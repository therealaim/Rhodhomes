
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
