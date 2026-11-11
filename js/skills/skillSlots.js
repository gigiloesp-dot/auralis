import {getSkills,skillRank} from './skillData.js';
export const SKILL_SLOT_COUNT=4;
export function normalizeSkillSlots(hero){const valid=new Set(getSkills(hero.classId).map(s=>s.id));const used=new Set();return Array.from({length:SKILL_SLOT_COUNT},(_,i)=>{const id=hero.skillSlots?.[i];if(typeof id!=='string'||!valid.has(id)||skillRank(hero,id)<1||used.has(id))return null;used.add(id);return id;});}
export function assignSkillSlot(hero,skillId,slot){if(!Number.isInteger(slot)||slot<1||slot>SKILL_SLOT_COUNT||!getSkills(hero.classId).some(s=>s.id===skillId)||skillRank(hero,skillId)<1)return false;const slots=normalizeSkillSlots(hero);for(let i=0;i<slots.length;i++)if(slots[i]===skillId)slots[i]=null;slots[slot-1]=skillId;hero.skillSlots=slots;return true;}
export function removeSkillSlot(hero,skillId){const slots=normalizeSkillSlots(hero);let removed=false;for(let i=0;i<slots.length;i++)if(slots[i]===skillId){slots[i]=null;removed=true;}hero.skillSlots=slots;return removed;}
export function equippedSkillSlot(hero,skillId){const index=normalizeSkillSlots(hero).indexOf(skillId);return index<0?null:index+1;}
