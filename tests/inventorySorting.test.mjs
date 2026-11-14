import test from 'node:test';
import assert from 'node:assert/strict';
import {InventoryPanel,sortedInventory} from '../js/ui/InventoryPanel.js';
const item=(id,rarity='common',quantity=1)=>({id,rarity,quantity});
test('inventory sorts by actual slot, rarity and item level without merging or losing stacks',()=>{
 const items=[item('wolfFang','common',61),item('boots_3','rare'),item('weapon_mage_1'),item('weapon_mage_6','epic'),item('wolfFang','common',12),item('helmet_0','legendary')];
 const before=structuredClone(items);
 assert.deepEqual(sortedInventory(items,'type','en').map(x=>x.id),['weapon_mage_6','weapon_mage_1','helmet_0','boots_3','wolfFang','wolfFang']);
 assert.equal(sortedInventory(items,'rarity')[0].id,'helmet_0');
 assert.equal(sortedInventory(items,'level')[0].id,'weapon_mage_6');
 assert.deepEqual(items,before);assert.equal(sortedInventory(items)[4],items[0]);assert.equal(sortedInventory(items)[5],items[4]);
 for(const mode of ['type','rarity','level'])assert.deepEqual([...sortedInventory(items,mode)].sort((a,b)=>items.indexOf(a)-items.indexOf(b)),items);
});
test('sorting persists the displayed order and rolls back exactly on failed or throwing saves',()=>{
 for(const failure of [false,'throw']){
  const original=[item('wolfPelt','common',80),item('weapon_warrior_1','rare')],hero={inventory:original};let rendered=0,message='';
  const panel={scene:{hero,save(){assert.equal(hero.inventory[0],original[1]);if(failure==='throw')throw Error('quota');return false;}},language:'en',render(){rendered++;},notice(text){message=text;},t:x=>x};
  assert.equal(InventoryPanel.prototype.sort.call(panel,'type'),false);assert.equal(hero.inventory,original);assert.equal(hero.inventory[0].quantity,80);assert.equal(message,'Save failed');assert.equal(rendered,1);
 }
 const hero={inventory:[item('wolfPelt'),item('weapon_warrior_1')]};let saved;
 const panel={scene:{hero,save(){saved=JSON.stringify(hero.inventory);return true;}},language:'en',render(){},notice(){},t:x=>x};
 assert.equal(InventoryPanel.prototype.sort.call(panel,'type'),true);assert.equal(hero.inventory[0].id,'weapon_warrior_1');assert.equal(saved,JSON.stringify(hero.inventory));
});
