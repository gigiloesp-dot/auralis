import {Save} from './save.js';
import {itemDefinition,INVENTORY_CAPACITY} from '../equipment/items.js';
import {insertStack} from '../equipment/stacking.js';
export const STORAGE_CAPACITY=100;
export const STORAGE_KEY='auralis_shared_storage_v1';
const copy=items=>items.map(item=>({...item}));
const validItem=item=>item&&typeof item.id==='string'&&(item.quantity===undefined||(Number.isInteger(item.quantity)&&item.quantity>=1&&item.quantity<=100));
function read(){const raw=localStorage.getItem(STORAGE_KEY);if(raw===null)return {version:1,items:[]};const state=JSON.parse(raw);if(state.version!==1||!Array.isArray(state.items)||state.items.length>STORAGE_CAPACITY||!state.items.every(validItem))throw new Error('Invalid storage');if(localStorage.getItem(STORAGE_KEY+'_backup')===null){try{localStorage.setItem(STORAGE_KEY+'_backup',raw);}catch{}}return state;}
export const SharedStorage={
 // A transfer's inventory and storage are committed in one atomic localStorage record.
 // Replaying the journal makes a tab close between the two save writes harmless.
 load(){try{const state=read();if(state.pending){const {slot,hero}=state.pending;if(!Number.isInteger(slot)||slot<1||slot>3||!hero||!Array.isArray(hero.inventory))return null;if(Save.write(hero,slot)){delete state.pending;try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{}}}return copy(state.items);}catch{return null;}},
 transfer(hero,direction,index,slot=Save.activeSlot){
  if(!hero||!Array.isArray(hero.inventory)||!Number.isInteger(index)||!['deposit','withdraw'].includes(direction)||!Number.isInteger(slot)||slot<1||slot>3)return {ok:false,reason:'invalid'};
  const items=this.load();if(!items)return {ok:false,reason:'storage'};
  let state;try{state=read();}catch{return {ok:false,reason:'storage'};}if(state.pending)return {ok:false,reason:'storage'};
  const inventory=copy(hero.inventory),source=direction==='deposit'?inventory:items,target=direction==='deposit'?items:inventory,capacity=direction==='deposit'?STORAGE_CAPACITY:INVENTORY_CAPACITY,item=source[index];
  if(!validItem(item)||!itemDefinition(item))return {ok:false,reason:'invalid'};
  const definition=itemDefinition(item);if(definition.slot&&item.quantity!==undefined&&item.quantity!==1)return {ok:false,reason:'invalid'};
  const result=insertStack(target,item,definition,capacity);if(result.remainder)return {ok:false,reason:'full'};
  source.splice(index,1);const saved=Save.normalize({...hero,inventory});if(!saved)return {ok:false,reason:'invalid'};
  const committed={version:1,items,pending:{slot,hero:saved}};
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(committed));}catch{return {ok:false,reason:'storage'};}
  hero.inventory=inventory;
  if(Save.write(saved,slot)){delete committed.pending;try{localStorage.setItem(STORAGE_KEY,JSON.stringify(committed));}catch{}}
  return {ok:true};
 }
};
