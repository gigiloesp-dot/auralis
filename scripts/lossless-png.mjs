// Publication transform only. No palettes, quantization, or alpha normalization.
import {deflateSync,inflateSync} from 'node:zlib';

const signature=Buffer.from([137,80,78,71,13,10,26,10]);
const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
export function crc32(bytes){let crc=0xffffffff;for(const byte of bytes)crc=crcTable[(crc^byte)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
export function pngChunk(type,data){const out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length);out.write(type,4,4,'ascii');data.copy(out,8);out.writeUInt32BE(crc32(out.subarray(4,-4)),out.length-4);return out;}
export function readPngChunks(bytes){
 if(!bytes.subarray(0,8).equals(signature))throw Error('Invalid PNG signature');
 const chunks=[];let offset=8;
 while(offset<bytes.length){
  if(offset+12>bytes.length)throw Error('Truncated PNG chunk');
  const length=bytes.readUInt32BE(offset),end=offset+length+12;
  if(end>bytes.length)throw Error('Truncated PNG data');
  const type=bytes.toString('ascii',offset+4,offset+8),data=bytes.subarray(offset+8,end-4);
  if(crc32(bytes.subarray(offset+4,end-4))!==bytes.readUInt32BE(end-4))throw Error('PNG CRC mismatch: '+type);
  chunks.push({type,data,raw:bytes.subarray(offset,end)});offset=end;
  if(type==='IEND'){if(length||offset!==bytes.length)throw Error('Invalid PNG end');break;}
 }
 if(chunks[0]?.type!=='IHDR'||chunks.at(-1)?.type!=='IEND'||chunks.filter(c=>c.type==='IHDR').length!==1)throw Error('Invalid PNG structure');
 return chunks;
}
function paeth(a,b,c){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;}
function predictor(filter,left,up,upperLeft){switch(filter){case 0:return 0;case 1:return left;case 2:return up;case 3:return (left+up)>>>1;case 4:return paeth(left,up,upperLeft);default:throw Error('Invalid PNG row filter');}}
export function decodePng(bytes){
 const chunks=readPngChunks(bytes),header=chunks[0].data;
 if(header.length!==13)throw Error('Invalid PNG header');
 const width=header.readUInt32BE(0),height=header.readUInt32BE(4),channels=header[9]===2?3:header[9]===6?4:0;
 if(!width||!height)throw Error('Invalid PNG dimensions');
 if(header[8]!==8||!channels||header[10]!==0||header[11]!==0||header[12]!==0||chunks.some(c=>c.type==='acTL'||(!['IHDR','PLTE','IDAT','IEND'].includes(c.type)&&c.type[0]===c.type[0].toUpperCase())))return null;
 const stride=width*channels,expected=(stride+1)*height;
 if(!Number.isSafeInteger(expected)||expected>512*1024*1024)return null;
 const idats=chunks.filter(c=>c.type==='IDAT');if(!idats.length)throw Error('Missing PNG IDAT');
 const first=chunks.findIndex(c=>c.type==='IDAT');if(chunks.slice(first,first+idats.length).some(c=>c.type!=='IDAT'))throw Error('Nonconsecutive PNG IDAT');
 const filtered=inflateSync(Buffer.concat(idats.map(c=>c.data)),{maxOutputLength:expected});
 if(filtered.length!==expected)throw Error('Wrong PNG scanline length');
 const pixels=Buffer.alloc(stride*height);
 for(let y=0;y<height;y++){
  const row=y*stride,input=y*(stride+1),filter=filtered[input];if(filter>4)throw Error('Invalid PNG row filter');
  for(let x=0;x<stride;x++){const i=row+x;pixels[i]=(filtered[input+x+1]+predictor(filter,x>=channels?pixels[i-channels]:0,y?pixels[i-stride]:0,y&&x>=channels?pixels[i-stride-channels]:0))&255;}
 }
 return {width,height,channels,pixels,chunks};
}
export const LOSSLESS_PNG_TRANSFORM='png-adaptive-deflate9-v1';
export function losslessPng(bytes){
 const metadata={transform:LOSSLESS_PNG_TRANSFORM,originalBytes:bytes.length,outputBytes:bytes.length,optimized:false,supported:false};
 let decoded;try{decoded=decodePng(bytes);}catch(error){return {...metadata,bytes,reason:error.message};}
 if(!decoded)return {...metadata,bytes,reason:'Unsupported PNG encoding'};
 metadata.supported=true;
 const {width,height,channels,pixels,chunks}=decoded,stride=width*channels,filtered=Buffer.alloc((stride+1)*height),candidates=Array.from({length:5},()=>Buffer.alloc(stride));
 const [none,sub,up,average,paethRow]=candidates;
 for(let y=0;y<height;y++){
  const row=y*stride,output=y*(stride+1);let s0=0,s1=0,s2=0,s3=0,s4=0;
  // Decode neighbors once per pixel byte for all five candidate filters.
  for(let x=0;x<stride;x++){
   const i=row+x,value=pixels[i],a=x>=channels?pixels[i-channels]:0,b=y?pixels[i-stride]:0,c=y&&x>=channels?pixels[i-stride-channels]:0;
   const v1=(value-a)&255,v2=(value-b)&255,v3=(value-((a+b)>>>1))&255,v4=(value-paeth(a,b,c))&255;
   none[x]=value;sub[x]=v1;up[x]=v2;average[x]=v3;paethRow[x]=v4;
   s0+=value<128?value:256-value;s1+=v1<128?v1:256-v1;s2+=v2<128?v2:256-v2;s3+=v3<128?v3:256-v3;s4+=v4<128?v4:256-v4;
  }
  const scores=[s0,s1,s2,s3,s4];let best=0;
  // Ascending filter order fixes tie breaking and preserves determinism.
  for(let filter=1;filter<=4;filter++)if(scores[filter]<scores[best])best=filter;
  filtered[output]=best;candidates[best].copy(filtered,output+1);
 }
 const idat=pngChunk('IDAT',deflateSync(filtered,{level:9})),parts=[signature];let inserted=false;
 for(const chunk of chunks){if(chunk.type==='IDAT'){if(!inserted){parts.push(idat);inserted=true;}}else parts.push(chunk.raw);}
 const result=Buffer.concat(parts);
 if(result.length>=bytes.length)return {...metadata,bytes};
 // Decode the actual encoded output and compare every channel, including RGB
 // beneath transparent pixels, before an exporter can write any new bytes.
 const verified=decodePng(result);
 if(!verified||verified.width!==width||verified.height!==height||verified.channels!==channels||!verified.pixels.equals(pixels))throw Error('Lossless PNG verification failed');
 return {...metadata,bytes:result,outputBytes:result.length,optimized:true};
}
