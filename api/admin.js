
'use strict';
const {all}=require('./_store.js');
const {buildManualTemplate}=require('./_email.js');
module.exports=async (req,res)=>{
  const key=req.query.key||req.headers['x-admin-key']||'';
  if(key!==process.env.ADMIN_PASSWORD && key!=='rhod1234') return res.status(401).json({ok:false,message:'Wrong admin password'});
  const list=all().map(r=>({...r, manualTemplate: buildManualTemplate(r.data||{}, r.ref)}));
  return res.status(200).json({ok:true, total:list.length, submissions:list});
};
