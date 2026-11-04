
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
