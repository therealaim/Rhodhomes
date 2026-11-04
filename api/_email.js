
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
