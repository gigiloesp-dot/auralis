// Read-only PNG inspection for generated atlases. No image transformations or
// image-library dependency: all committed actor images are 8-bit RGBA PNGs.
import {inflateSync} from 'node:zlib';
import {readFileSync} from 'node:fs';
const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
export function pngAlpha(path){
 const file=readFileSync(path);if(file.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Invalid PNG '+path);
 let width,height,depth,type,interlace;const parts=[];
 for(let at=8;at<file.length;){const length=file.readUInt32BE(at),name=file.toString('ascii',at+4,at+8),data=file.subarray(at+8,at+8+length);if(name==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);depth=data[8];type=data[9];interlace=data[12];}if(name==='IDAT')parts.push(data);at+=length+12;}
 if(depth!==8||type!==6||interlace!==0)throw Error('Expected non-interlaced RGBA8 '+path);
 const raw=inflateSync(Buffer.concat(parts)),stride=width*4,alpha=new Uint8Array(width*height);let previous=new Uint8Array(stride),current=new Uint8Array(stride),at=0;
 for(let y=0;y<height;y++){
  const filter=raw[at++];if(filter>4)throw Error('Unknown PNG row filter '+filter);
  for(let x=0;x<stride;x++){
   const left=x>=4?current[x-4]:0,up=previous[x],corner=x>=4?previous[x-4]:0;
   const predictor=filter===0?0:filter===1?left:filter===2?up:filter===3?Math.floor((left+up)/2):paeth(left,up,corner);
   current[x]=(raw[at++]+predictor)&255;
  }
  for(let x=0;x<width;x++)alpha[y*width+x]=current[x*4+3];
  [previous,current]=[current,previous];
 }
 return {width,height,alpha};
}
