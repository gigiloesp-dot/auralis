// Separate full-world catalogue. The earlier257 catalogue is read-only input.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {inflateSync} from 'node:zlib';
import {getRegionContent} from '../js/world/regionContent.js';
import {monsterKind} from '../js/monsters/monsters.js';
import {AUR203_SPECIES} from '../js/monsters/aur203Species.js';
import {INTEGRATED_SPECIES_ART} from '../js/assets/speciesArtRegistry.js';
import {movementProfile} from '../js/monsters/movementProfiles.js';
import {MONSTER_MATERIAL_BY_LOOT} from '../js/equipment/monsterMaterials.js';
import {ITEM_DEFS} from '../js/equipment/items.js';
import {climateAt} from '../js/world/climate.js';
const root=new URL('../',import.meta.url),path=p=>new URL(p,root),read=p=>readFileSync(path(p));
const sha=data=>createHash('sha256').update(data).digest('hex'),fileSHA=p=>sha(read(p));
const regions={forest:97,north:94,ancient:62,desert:88},banks=['idle','run-a','run-b','attack','hurt','death'],directions=['n','ne','e','se','s','sw','w','nw'];
const preservedFiles={'docs/bestiary/TASK_10_SPECIES.json':'f9142fc6c25c853e02adf3c6b0866a5abc8190d527750ff497ec079d308646c1','docs/bestiary/TASK_10_SPECIES.md':'6e3e22c3dda22c62e6423dd5b7f0c758790d3df55e0bb80e37b2e948da4ec043'};
const oldIDsSHA='3ca1ac323627f23655215091b5f769a1c80238dfd1699f2dc603246f1f3b01ac';
const reference=p=>({path:p,sha256:fileSHA(p)});

// Canonical new84 sheets are noninterlaced8-bit RGBA PNGs. Decode only that
// actual format with Node built-ins to verify native frame bytes independently.
export function nativeFrameHashes(pngPath,frames){
 const png=read(pngPath);assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 const width=png.readUInt32BE(16),height=png.readUInt32BE(20);assert.equal(png[24],8);assert.equal(png[25],6);assert.equal(png[28],0);
 const chunks=[];for(let offset=8;offset<png.length;){const size=png.readUInt32BE(offset),kind=png.subarray(offset+4,offset+8).toString();if(kind==='IDAT')chunks.push(png.subarray(offset+8,offset+8+size));offset+=size+12;}
 const raw=inflateSync(Buffer.concat(chunks)),stride=width*4,pixels=Buffer.alloc(height*stride);assert.equal(raw.length,height*(stride+1));
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<height;y++){const filter=raw[y*(stride+1)];assert.ok(filter<=4);for(let x=0;x<stride;x++){const value=raw[y*(stride+1)+1+x],left=x>=4?pixels[y*stride+x-4]:0,up=y?pixels[(y-1)*stride+x]:0,upperLeft=y&&x>=4?pixels[(y-1)*stride+x-4]:0;pixels[y*stride+x]=(value+(filter===0?0:filter===1?left:filter===2?up:filter===3?Math.floor((left+up)/2):paeth(left,up,upperLeft)))&255;}}
 return Object.fromEntries(Object.entries(frames).map(([name,entry])=>{const {x,y,w,h}=entry.frame;assert.ok(x>=0&&y>=0&&w===128&&h===192&&x+w<=width&&y+h<=height);const hash=createHash('sha256');for(let row=y;row<y+h;row++)hash.update(pixels.subarray(row*stride+x*4,row*stride+(x+w)*4));return[name,hash.digest('hex')];}));
}

export function buildAur203Catalogue(){
 for(const [file,hash]of Object.entries(preservedFiles))assert.equal(fileSHA(file),hash,'preserve earlier catalogue bytes: '+file);
 const earlier=JSON.parse(read('docs/bestiary/TASK_10_SPECIES.json')),oldById=new Map(earlier.species.map(row=>[row.id,row]));
 const species=[],regionSummary={};
 for(const [region,expected]of Object.entries(regions)){
  const content=getRegionContent(region);assert.equal(content.camps.length,expected);let residents=0,added=0;
  for(const camp of content.camps){
   const id=camp.plannedSpeciesId,definition=AUR203_SPECIES[id],kind=monsterKind(camp.spawns[0]),profile=movementProfile(kind),art=INTEGRATED_SPECIES_ART[id];
   assert.ok(id&&art,'actual canonical species art '+id);assert.equal(camp.spawns.length,11);assert.equal(kind.level,camp.level);
   const atlas=JSON.parse(read(art.atlasURL)),frames=atlas.frames;assert.equal(Object.keys(frames).length,48);
   for(const bank of banks)for(const direction of directions)assert.ok(frames[bank+'/'+direction],id+' '+bank+'/'+direction);
   const materialId=MONSTER_MATERIAL_BY_LOOT[kind.loot]||null,material=materialId?ITEM_DEFS[materialId]:null;
   const image={key:art.key,png:reference(art.url),atlas:reference(art.atlasURL),frameWidth:art.frameWidth,frameHeight:art.frameHeight,frameCount:48,poseBanks:banks,directions,drawnDeath:art.drawnDeath===true,animationScope:'48 direction/state poses: six banks × eight directions; run-a and run-b are two movement drawings, not six new multi-frame clips'};
   assert.equal(image.drawnDeath,true);
   if(definition){
    const pack=art.url.split('/')[2],provenance='art/source/'+pack+'/provenance.json',validation='art/source/'+pack+'/validation.json';
    assert.ok(existsSync(path(provenance))&&existsSync(path(validation)));
    const origin=JSON.parse(read(provenance)),checked=JSON.parse(read(validation)).models.find(row=>row.id===id);assert.ok(checked);
    const hashes=nativeFrameHashes(art.url,frames),unique=new Set(Object.values(hashes)).size;
    assert.equal(unique,48);assert.equal(checked.frames??checked.frameCount,48);
    const recordedUnique=checked.distinctRGBAHashes??checked.uniqueFrameRGBAHashes??checked.uniqueFrameSHA256Count??checked.uniqueRGBAHashes;if(recordedUnique!==undefined)assert.equal(recordedUnique,48);
    const recorded=checked.rgbaHashes||checked.frameSHA256;if(recorded)assert.deepEqual(Object.values(hashes).sort(),[...recorded].sort(),'actual native validation frame hashes '+id);
    image.provenance={...reference(provenance),pack,validation:reference(validation),validatedId:id,uniqueRGBAFrames:unique,nativeRGBAFrameSHA256:hashes,source:checked.source?reference(checked.source):null};
    if(origin.speciesCards)image.provenance.speciesCards=reference(origin.speciesCards);
    const originRow=(origin.models||origin.species||[]).find(row=>(row.id||row.placementId)===id);
    if(originRow){assert.deepEqual(originRow.names,kind.names);assert.equal(originRow.level,camp.level);assert.equal(originRow.biome,definition.biome);}
    else{assert.ok(origin.speciesCards);const cards=JSON.parse(read(origin.speciesCards)),card=cards.find(row=>(row.id||row.placementId)===id);assert.deepEqual(card.names||card.name,kind.names);assert.equal(card.biome,definition.biome);if(card.level!==undefined)assert.equal(card.level,camp.level);}
    if(['desert-species-069','desert-species-076'].includes(id))image.provenance.finalTransparencyRepairManifest=reference('art/source/aur203-desert-b/art-readiness-manifest.json');
    assert.ok(materialId&&material,'registered thematic material '+id);added++;
   }else assert.ok(oldById.has(id),'preserved earlier identity '+id);
   species.push({id,campId:camp.id,region,cohort:definition?'aur203-added84':'preserved257',names:kind.names,type:camp.type,sourceArchetype:kind.sourceArchetype||camp.type,nativeLevel:camp.level,biome:definition?.biome||climateAt(content,camp.x,camp.y).id,position:{x:camp.x,y:camp.y},residents:camp.spawns.map(spawn=>({id:spawn.id,x:spawn.x,y:spawn.y,level:spawn.level})),stats:Object.fromEntries(['hp','attack','defense','magicDefense','speed','xp','gold','respawnMs'].map(key=>[key,kind[key]])),abilities:profile.abilityPattern||[profile.ability],movementProfile:kind.movementProfile,movement:profile.movement,locomotion:profile.locomotion,abilityConfig:profile,behaviorConfig:kind.behaviorConfig||{},stunOnStomp:profile.stunOnStomp?{durationMs:profile.stunOnStomp,windupMs:profile.windup,postStunImmunityMs:1000}:null,loot:{label:kind.loot,materialId,material:material?{names:material.names,slot:material.slot,saleValue:material.saleValue,icon:reference(material.iconURL)}:null,policy:'Existing loot pipeline and gear probabilities retained'},art:image,artStatus:definition?'original48PoseModel':oldById.get(id).status});
   residents+=camp.spawns.length;
  }
  regionSummary[region]={camps:content.camps.length,residents,preservedCamps:content.camps.length-added,addedCamps:added};
 }
 const oldIDs=species.filter(row=>row.cohort==='preserved257').map(row=>row.id),newRows=species.filter(row=>row.cohort==='aur203-added84');
 assert.deepEqual(oldIDs,earlier.species.map(row=>row.id));assert.equal(sha(JSON.stringify(oldIDs)),oldIDsSHA);assert.equal(species.length,341);assert.equal(newRows.length,84);
 const totalResidents=species.reduce((n,row)=>n+row.residents.length,0);assert.equal(totalResidents,3751);
 return {requirement:'AUR-203',scope:'Separate actual full world: preserved257 plus added84; prior TASK_10_SPECIES files untouched',totalCamps:341,totalResidents,preservedCamps:257,addedCamps:84,regions:regionSummary,preservation:{earlierCatalogueFiles:Object.entries(preservedFiles).map(([p,sha256])=>({path:p,sha256})),original257SpeciesIDsSHA256:oldIDsSHA,original257SpeciesIDsUnchanged:true},artCoverage:{canonicalModels:341,sixBankModels:341,new84PaintedPoses:84*48,note:'Pose banks with two run drawings; not six new multi-frame animation clips'},gameplay:{stunSpecies:newRows.filter(row=>row.stunOnStomp).map(row=>row.id),stunPolicy:'Actual bounded200–800ms state with1000ms post-stun immunity; only three explicit stomp opt-ins'},acceptance:{catalogueVerified:true,finalBrowserAcceptanceClaim:false,physicalAndroidClaim:false,note:'This generated registry records current runtime definitions/assets and does not independently certify final browser, CI or physical-device acceptance.'},species};
}

export function catalogueMarkdown(report){
 let md='# AUR-203: actual341-species catalogue\n\n341 camps and3,751 residents: preserved257 plus added84. The earlier TASK_10_SPECIES catalogue remains byte-for-byte unchanged. This separate catalogue records runtime names, native stats, abilities, tactics, material references, current homes and canonical asset hashes.\n\nArt comprises six banks × eight directions, with two run drawings; these are pose banks, not six new multi-frame clips. This document does not claim final browser, CI or physical Android acceptance. Full provenance and hashes are in [JSON](AUR_203_SPECIES.json).\n\n| Region | Camps | Residents | Preserved | Added |\n| --- | ---: | ---: | ---: | ---: |\n';
 for(const [region,row]of Object.entries(report.regions))md+=`| ${region} | ${row.camps} | ${row.residents} | ${row.preservedCamps} | ${row.addedCamps} |\n`;
 md+='\nOriginal257 ID SHA256: `'+report.preservation.original257SpeciesIDsSHA256+'`. Three actual bounded stun stomp opt-ins: North084700ms, Ancient052600ms, Desert078800ms; each has a visible warning of at least1,100ms and1,000ms post-stun immunity.\n\n| Species / camp | RU / EN / ES | Native level | HP / attack / defense / speed | Actual abilities | Tactics / stun | Material | Canonical art |\n| --- | --- | ---: | --- | --- | --- | --- | --- |\n';
 const escape=value=>String(value).replaceAll('|','\\|').replaceAll('\n',' ');
 for(const row of report.species){const tactics=Object.keys(row.behaviorConfig).join(', ')||'—',stun=row.stunOnStomp?`; stun ${row.stunOnStomp.durationMs}ms / warning ${row.stunOnStomp.windupMs}ms`:'';md+=`| ${row.id} / ${row.campId} | ${escape(['ru','en','es'].map(l=>row.names[l]).join(' / '))} | ${row.nativeLevel} | ${[row.stats.hp,row.stats.attack,row.stats.defense,row.stats.speed].join(' / ')} | ${row.abilities.join(', ')} | ${tactics}${stun} | ${row.loot.materialId||'Existing loot label: '+row.loot.label} | [PNG](../../${row.art.png.path}) · [atlas](../../${row.art.atlas.path}) |\n`;}
 return md;
}

export function writeAur203Catalogue({check=false}={}){
 const report=buildAur203Catalogue(),outputs={'docs/bestiary/AUR_203_SPECIES.json':JSON.stringify(report,null,2)+'\n','docs/bestiary/AUR_203_SPECIES.md':catalogueMarkdown(report)};
 if(!check)mkdirSync(path('docs/bestiary/'),{recursive:true});
 for(const [file,content]of Object.entries(outputs))if(check){if(read(file).toString()!==content)throw new Error('Stale AUR-203 catalogue: '+file);}else writeFileSync(path(file),content);
 return {camps:report.totalCamps,residents:report.totalResidents,preserved:report.preservedCamps,added:report.addedCamps,check};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===fileURLToPath(new URL(process.argv[1],'file://')))console.log(JSON.stringify(writeAur203Catalogue({check:process.argv.includes('--check')})));
