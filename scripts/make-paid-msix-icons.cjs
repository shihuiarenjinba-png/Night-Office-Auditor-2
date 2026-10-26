"use strict";
// Reproducible review-only images; customer-facing artwork requires separate approval.
const fs=require("node:fs"),path=require("node:path"),zlib=require("node:zlib");
const dir=path.resolve("build/appx");
const sizes={"StoreLogo.png":[50,50],"Square44x44Logo.png":[44,44],
 "Square150x150Logo.png":[150,150],"Wide310x150Logo.png":[310,150]};
const table=Array.from({length:256},(_,v)=>{
 let c=v;for(let k=0;k<8;k++)c=c&1?(0xedb88320^(c>>>1)):(c>>>1);return c>>>0;
});
function crc32(buffer){let c=0xffffffff;for(const v of buffer)c=table[(c^v)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
function chunk(name,data){
 const n=Buffer.from(name),size=Buffer.alloc(4),crc=Buffer.alloc(4);
 size.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([n,data])));
 return Buffer.concat([size,n,data,crc]);
}
function paint(w,h){
 const rows=Buffer.alloc(h*(w*4+1));
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const off=y*(w*4+1)+1+x*4,u=x/w,v=y/h;
  const bg=[12,26,39,255],gold=[211,168,94,255],white=[246,241,225,255];
  const bx=(w>h?.38:.5),dx=(u-bx)/(h/w),dy=v-.5;
  const frame=(Math.abs(dx)<.29&&Math.abs(dy)<.36)&&
    (Math.abs(Math.abs(dx)-.27)<.035||Math.abs(Math.abs(dy)-.34)<.03);
  const line=Math.abs(dx)<.17&&(Math.abs(dy+.11)<.025||Math.abs(dy-.02)<.025||Math.abs(dy-.15)<.025);
  const p=frame?gold:line?white:bg;
  for(let k=0;k<4;k++)rows[off+k]=p[k];
 }
 const hdata=Buffer.alloc(13);hdata.writeUInt32BE(w,0);hdata.writeUInt32BE(h,4);hdata[8]=8;hdata[9]=6;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),
  chunk("IHDR",hdata),chunk("IDAT",zlib.deflateSync(rows,{level:9})),chunk("IEND",Buffer.alloc(0))]);
}
function generate(){
 fs.mkdirSync(dir,{recursive:true});
 for(const [name,[w,h]] of Object.entries(sizes)){
  const file=path.join(dir,name);
  if(fs.existsSync(file))throw Error("Refusing to overwrite existing approved/review artwork: "+file);
  fs.writeFileSync(file,paint(w,h),{flag:"wx"});
  console.log("REVIEW_ONLY_ICON "+name+" "+w+"x"+h);
 }
}
if(require.main===module)generate();
module.exports={sizes,paint,generate};
