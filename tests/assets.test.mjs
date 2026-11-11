import test from 'node:test';
import assert from 'node:assert/strict';
import {queueAssets,createAssetAnimations,ASSET_DIRECTIONS,validateAsset} from '../js/assets/AssetLoader.js';
import {getSkills} from '../js/skills/skillData.js';
test('asset queue loads real image, sheet and atlas definitions and skips incomplete files',()=>{
 const calls=[],scene={load:{image:(...args)=>calls.push(['image',...args]),spritesheet:(...args)=>calls.push(['spritesheet',...args]),atlas:(...args)=>calls.push(['atlas',...args])}};
 queueAssets(scene,{characters:{warrior:{type:'spritesheet',url:'warrior.png',frameWidth:128,frameHeight:160}},world:{tree:{type:'image',url:'tree.png'},bad:{type:'image'}},effects:{magic:{type:'atlas',url:'magic.png',atlasURL:'magic.json'}}});
 assert.equal(calls.length,3);assert.equal(calls[0][0],'spritesheet');assert.deepEqual(calls[0][3],{frameWidth:128,frameHeight:160});assert.equal(calls[2][0],'atlas');assert.equal(validateAsset({type:'spritesheet',url:'broken.png',frameWidth:0,frameHeight:10}),false);
});
test('eight-direction atlas animation creation is idempotent and death does not loop',()=>{
 const animations=new Map(),scene={textures:{exists:()=>true},anims:{exists:key=>animations.has(key),create:definition=>animations.set(definition.key,definition)}};
 const directions=Object.fromEntries(ASSET_DIRECTIONS.map(dir=>[dir,[dir+'/0',dir+'/1']]));
 const entry={type:'atlas',url:'warrior.png',atlasURL:'warrior.json',states:{idle:{directions,frameRate:6},death:{directions,frameRate:12}}};
 assert.equal(createAssetAnimations(scene,'warrior',entry).length,16);createAssetAnimations(scene,'warrior',entry);assert.equal(animations.size,16);assert.equal(animations.get('warrior:death:n').repeat,0);assert.equal(animations.get('warrior:idle:n').repeat,-1);assert.deepEqual(animations.get('warrior:idle:n').frames,[{key:'warrior',frame:'n/0'},{key:'warrior',frame:'n/1'}]);
 scene.textures.exists=()=>false;assert.deepEqual(createAssetAnimations(scene,'missing',entry),[]);
});
test('all thirty combat skills have distinct safe vector icons',()=>{
 const icons=['warrior','archer','mage','paladin','assassin','cannoneer'].flatMap(id=>getSkills(id).map(skill=>skill.iconSvg));assert.equal(new Set(icons).size,30);for(const svg of icons){assert.match(svg,/^<svg /);assert.match(svg,/viewBox="0 0 48 48"/);assert.doesNotMatch(svg,/<script|onload=|https?:\/\/(?!www\.w3\.org)/);}
});
