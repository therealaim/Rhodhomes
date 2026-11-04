
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
