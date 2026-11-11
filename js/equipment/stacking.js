export const STACK_LIMIT=100;
export function itemCount(item){const n=Number(item?.quantity);return Number.isInteger(n)&&n>0?Math.min(STACK_LIMIT,n):1;}
export function stackable(item,definition){return !definition?.slot;}
export function stackKey(item){return [item.id,item.rarity||'common',item.level||'',item.variant||''].join('|');}
export function insertStack(inventory,item,definition,capacity=60){
 if(!Array.isArray(inventory)||!item||!definition)return {added:0,remainder:itemCount(item)};
 let left=itemCount(item),added=0;
 if(stackable(item,definition)){
  for(const existing of inventory){if(!stackable(existing,definition)||stackKey(existing)!==stackKey(item))continue;const room=STACK_LIMIT-itemCount(existing);if(room<=0)continue;const n=Math.min(room,left);existing.quantity=itemCount(existing)+n;left-=n;added+=n;if(!left)break;}
 }
 while(left&&inventory.length<capacity){const n=stackable(item,definition)?Math.min(left,STACK_LIMIT):1;inventory.push({...item,quantity:n});left-=n;added+=n;}
 return {added,remainder:left};
}
export function compactStacks(inventory,getDefinition,capacity=60){
 const result=[];for(const item of inventory||[]){const total=Math.max(1,Math.trunc(Number(item.quantity)||1));let left=total;while(left>0){const n=Math.min(STACK_LIMIT,left);insertStack(result,{...item,quantity:n},getDefinition(item),capacity);left-=n;}}return result;
}
