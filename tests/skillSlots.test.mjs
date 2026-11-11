import test from 'node:test';import assert from 'node:assert/strict';import {assignSkillSlot,removeSkillSlot,normalizeSkillSlots,equippedSkillSlot} from '../js/skills/skillSlots.js';
const hero=()=>({classId:'warrior',learnedSkills:{warrior_0:1,warrior_1:1},skillSlots:[null,null,null,null]});
test('assign learned skill to slot 1-4',()=>{const h=hero();assert.equal(assignSkillSlot(h,'warrior_0',3),true);assert.equal(equippedSkillSlot(h,'warrior_0'),3);});
test('moving same skill clears old slot',()=>{const h=hero();assignSkillSlot(h,'warrior_0',1);assignSkillSlot(h,'warrior_0',4);assert.deepEqual(normalizeSkillSlots(h),[null,null,null,'warrior_0']);});
test('reject unlearned, invalid class, and invalid slots',()=>{const h=hero();assert.equal(assignSkillSlot(h,'warrior_2',1),false);assert.equal(assignSkillSlot(h,'mage_0',1),false);assert.equal(assignSkillSlot(h,'warrior_0',5),false);});
test('remove skill from assigned slot',()=>{const h=hero();assignSkillSlot(h,'warrior_0',2);assert.equal(removeSkillSlot(h,'warrior_0'),true);assert.equal(equippedSkillSlot(h,'warrior_0'),null);});
test('corrupt and duplicate saved slots are sanitized',()=>{const h=hero();h.skillSlots=['warrior_0','warrior_0','mage_0','warrior_1'];assert.deepEqual(normalizeSkillSlots(h),['warrior_0',null,null,'warrior_1']);});
