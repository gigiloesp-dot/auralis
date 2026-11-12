import test from 'node:test';import assert from 'node:assert/strict';
import {itemIcon,itemIconKind} from '../js/ui/itemIcons.js';
import {ITEM_DEFS} from '../js/equipment/items.js';
test('equipment, potions and materials have distinct readable icon categories with rarity styling',()=>{
 const samples=[['weapon_warrior_1','weapon'],['weapon_archer_1','bow'],['weapon_mage_1','staff'],['weapon_cannoneer_1','cannon'],['weapon_assassin_1','daggers'],['shield_1','shield'],['chest_1','chest'],['helmet_1','helmet'],['boots_1','boots'],['pants_1','pants'],['gloves_1','gloves'],['ring_1','ring'],['amulet_1','amulet'],['hpPotion','hpPotion'],['mpPotion','mpPotion'],['wolfFang','wolfFang'],['wolfPelt','wolfPelt']];
 const output=[];for(const [id,kind]of samples){const item={id,rarity:'rare'},svg=itemIcon(item,ITEM_DEFS[id]);assert.equal(itemIconKind(item,ITEM_DEFS[id]),kind);assert.match(svg,new RegExp('data-item-kind="'+kind+'"'));assert.match(svg,/viewBox="0 0 48 48"/);assert.doesNotMatch(svg,/<script|onload=|<image|href=/);output.push(svg);}
 assert.equal(new Set(output).size,samples.length);assert.notEqual(itemIcon({id:'chest_1',rarity:'common'},ITEM_DEFS.chest_1),itemIcon({id:'chest_1',rarity:'legendary'},ITEM_DEFS.chest_1));
});
