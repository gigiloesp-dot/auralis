import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {UI_TRANSLATIONS,uiText} from '../js/i18n/uiText.js';
import {getSkills} from '../js/skills/skillData.js';
import {CLASSES,className} from '../js/characters/classes.js';
import {ITEM_DEFS,itemName} from '../js/equipment/items.js';
import {createCharacter} from '../js/characters/Character.js';
import {CharacterPanel} from '../js/ui/CharacterPanel.js';
import {InventoryPanel} from '../js/ui/InventoryPanel.js';
import {SkillsPanel} from '../js/ui/SkillsPanel.js';
const cyrillic=/[А-Яа-яЁё]/;
test('all six classes, thirty skills and every defined item have English and Spanish names',()=>{
 for(const lang of ['en','es']){
  for(const id of Object.keys(CLASSES)){assert.ok(className(id,lang));assert.equal(cyrillic.test(className(id,lang)),false);for(const s of getSkills(id,lang)){assert.equal(cyrillic.test(s.name+s.description),false);assert.equal(s.id,getSkills(id).find(x=>x.index===s.index).id);}}
  for(const id of Object.keys(ITEM_DEFS)){assert.ok(itemName({id},lang));assert.equal(cyrillic.test(itemName({id},lang)),false,id);}
 }
 assert.equal(itemName({id:'rustySword'}),'Ржавый меч');assert.equal(getSkills('warrior')[0].name,'Мощный удар');
});
test('every static UI label used by the three panels is translated',()=>{
 for(const file of ['CharacterPanel','InventoryPanel','SkillsPanel']){
  const source=readFileSync(new URL('../js/ui/'+file+'.js',import.meta.url),'utf8');
  for(const match of source.matchAll(/this\.t\('([^']+)'\)/g))for(const lang of ['en','es']){assert.ok(UI_TRANSLATIONS[match[1]],file+': '+match[1]);assert.equal(cyrillic.test(uiText(match[1],lang)),false);}
 }
});
class Node{
 constructor(tag='div'){this.tag=tag;this.children=[];this.style={};this.attrs={};this.hidden=false;this.isConnected=true;this._text='';}
 set textContent(t){this._text=String(t);this.children=[];}get textContent(){return this._text+this.children.map(c=>c.textContent??String(c)).join(' ');}
 append(...nodes){this.children.push(...nodes);}replaceChildren(...nodes){this._text='';this.children=nodes;}
 addEventListener(){}removeEventListener(){}setAttribute(k,v){this.attrs[k]=v;}querySelector(){return null;}getBoundingClientRect(){return {left:0,right:40,top:0,height:40};}
}
test('English and Spanish panels render translated text and keep stat/skill actions functional',()=>{
 const previous={document:globalThis.document,window:globalThis.window,localStorage:globalThis.localStorage};
 try{
  for(const lang of ['en','es']){
   const roots=new Map();globalThis.document={getElementById:id=>{if(!roots.has(id))roots.set(id,new Node());return roots.get(id);},createElement:tag=>new Node(tag),addEventListener(){},removeEventListener(){}};
   globalThis.window={innerWidth:844,innerHeight:390,addEventListener(){},removeEventListener(){}};globalThis.localStorage={getItem:()=>lang};
   const scene={language:lang,hero:createCharacter({classId:'warrior',name:'Tester',level:5,skillPoints:2,attributePoints:3,inventory:[{id:'rustySword',rarity:'common'}]}),save(){},refreshHud(){},refreshSkillSlots(){}};
   const cp=new CharacterPanel(scene);cp.show();assert.equal(cyrillic.test(cp.root.textContent),false);const row=cp.root.children.find(x=>x.className==='attribute-grid').children[0];row.children[1].onclick();assert.equal(scene.hero.stats.strength,6);
   const ip=new InventoryPanel(scene);ip.show();assert.equal(cyrillic.test(ip.root.textContent),false);ip.changePage('bag');assert.ok(ip.root.textContent.includes(lang==='en'?'Backpack':'Mochila'));ip.select('bag',0,new Node('button'));assert.equal(cyrillic.test(ip.root.textContent),false);
   const sp=new SkillsPanel(scene);sp.show();sp.selectSkill('warrior_0');assert.equal(cyrillic.test(sp.root.textContent),false);const learn=sp.root.children.find(x=>x.className==='skill-layout').children[1].children.find(x=>x.className==='skill-learn');learn.onclick();assert.equal(scene.hero.learnedSkills.warrior_0,1);assert.equal(cyrillic.test(sp.root.textContent),false);
   cp.destroy();ip.destroy();sp.destroy();
  }
 }finally{Object.assign(globalThis,previous);}
});
