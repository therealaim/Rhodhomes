
'use strict';
const h=require('./submit.js');
module.exports=async (req,res)=>{ if(req.body && typeof req.body==='object') req.body.type='enquiry'; else req.body={type:'enquiry'}; return h(req,res); };
