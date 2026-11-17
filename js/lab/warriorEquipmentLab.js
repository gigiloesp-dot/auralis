// Explicit test entry only. Prefix every storage operation before importing any
// game module: the ordinary page and its three character slots stay untouched.
const backing=window.localStorage,prefix='auralis_warrior_equipment_lab_v1:';
const keys=()=>Array.from({length:backing.length},(_,i)=>backing.key(i)).filter(k=>k?.startsWith(prefix));
const isolated={getItem:key=>backing.getItem(prefix+key),setItem:(key,value)=>backing.setItem(prefix+key,String(value)),removeItem:key=>backing.removeItem(prefix+key),clear:()=>keys().forEach(k=>backing.removeItem(k)),key:i=>keys()[i]?.slice(prefix.length)??null,get length(){return keys().length;}};
Object.defineProperty(window,'localStorage',{configurable:true,value:isolated});
if(!isolated.getItem('auralis_language'))isolated.setItem('auralis_language',backing.getItem('auralis_language')||'ru');
const [{Save},{createCharacter},{WARRIOR_REFERENCE_ITEMS},{equipItem,unequipItem}]=await Promise.all([import('../systems/save.js'),import('../characters/Character.js'),import('../assets/warriorEquipmentArt.js'),import('../equipment/items.js')]);
if(!Save.load(1)){const hero=createCharacter({classId:'warrior',level:5,name:'WarriorSetQA',x:1030,y:1140,equipment:{},inventory:WARRIOR_REFERENCE_ITEMS.map(id=>({id,rarity:'common',quantity:1}))});if(!Save.write(hero,1))throw Error('Could not save isolated equipment fixture');}
Save.setSlot(1);
await import('../main.js');
const until=async fn=>{for(let i=0;i<600;i++){const value=fn();if(value)return value;await new Promise(r=>setTimeout(r,50));}throw Error('Warrior lab startup timeout');};
(await until(()=>document.querySelector('[data-menu-action=continue]'))).click();
(await until(()=>document.querySelector('.slot-row .primary'))).click();
const s=await until(()=>{const scene=window.Auralis?.game.scene.getScene('world');return scene?.rig?.paintedActive?scene:null;});
const words={ru:{title:'Комплект воина · отдельное сохранение',all:'Надеть комплект',none:'Снять всё',inspect:'Осмотр',play:'Играть',hide:'Скрыть',open:'Экипировка QA',direction:'Направление',state:'Анимация'},en:{title:'Warrior set · separate save',all:'Equip set',none:'Unequip all',inspect:'Inspect',play:'Play',hide:'Hide',open:'Equipment QA',direction:'Direction',state:'Animation'},es:{title:'Guerrero · guardado separado',all:'Equipar conjunto',none:'Quitar todo',inspect:'Inspeccionar',play:'Jugar',hide:'Ocultar',open:'Equipo QA',direction:'Dirección',state:'Animación'}};
const t=words[Auralis.menu.lang]||words.ru,tools=document.createElement('aside');tools.id='warrior-lab-tools';tools.setAttribute('aria-label',t.title);const title=document.createElement('strong');title.textContent=t.title;tools.append(title);let inspect=false,direction='s',state='idle',savedCamera;
const button=(text,action,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.dataset.labAction=action;b.onclick=fn;tools.append(b);return b;};
const refresh=()=>{s.inventoryPanel?.render?.();s.save();s.refreshHud();};
const equipAll=()=>{for(const id of WARRIOR_REFERENCE_ITEMS){const i=s.hero.inventory.findIndex(item=>item.id===id);if(i>=0){const result=equipItem(s.hero,i);if(!result.ok)throw Error('Lab equipment rejected: '+id);}}refresh();};
const unequipAll=()=>{for(const slot of Object.keys(s.hero.equipment))if(!unequipItem(s.hero,slot))throw Error('Lab bag cannot accept '+slot);refresh();};
button(t.all,'all',equipAll);button(t.none,'none',unequipAll);
const mode=button(t.inspect,'inspect',()=>{inspect=!inspect;mode.textContent=inspect?t.play:t.inspect;selectors.hidden=!inspect;if(inspect){savedCamera={zoom:s.cameras.main.zoom};s.scene.pause();s.cameras.main.stopFollow().setZoom(Math.min(2.2,savedCamera.zoom*2)).centerOn(s.body.x,s.body.y-35);}else{s.cameras.main.setZoom(savedCamera.zoom).startFollow(s.body,true,.16,.16);s.scene.resume();}});
const selectors=document.createElement('div');selectors.className='warrior-lab-selectors';selectors.hidden=true;
for(const [name,label,values]of [['direction',t.direction,['n','ne','e','se','s','sw','w','nw']],['state',t.state,['idle','run','attack','special','hurt','death']]]){const box=document.createElement('label');box.textContent=label;const select=document.createElement('select');select.dataset.labSelect=name;for(const value of values){const o=document.createElement('option');o.value=o.textContent=value;select.append(o);}select.value=name==='direction'?direction:state;select.onchange=()=>{if(name==='direction')direction=select.value;else state=select.value;};box.append(select);selectors.append(box);}
tools.append(selectors);const opener=document.createElement('button');opener.id='warrior-lab-open';opener.textContent=t.open;opener.hidden=true;opener.onclick=()=>{tools.hidden=false;opener.hidden=true;};button(t.hide,'hide',()=>{if(inspect)mode.click();tools.hidden=true;opener.hidden=false;});document.body.append(tools,opener);
const angles={e:0,se:Math.PI/4,s:Math.PI/2,sw:3*Math.PI/4,w:Math.PI,nw:-3*Math.PI/4,n:-Math.PI/2,ne:-Math.PI/4};
const step=(_time,delta)=>{if(inspect&&!s.closed)s.rig.painted.update(state,angles[direction],Math.min(.05,(delta||16)/1000),{progress:.6});};Auralis.game.events.on('step',step);s.events.on('shutdown',()=>{inspect=false;mode.textContent=t.inspect;selectors.hidden=true;});
window.AuralisWarriorLab={prefix,items:WARRIOR_REFERENCE_ITEMS,get inspecting(){return inspect;},equipAll,unequipAll};
