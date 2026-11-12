// Vector equipment icons: crisp at mobile sizes; item tier and rarity affect appearance.
const shapes={
 bow:'<path d="M13 4q33 19 0 40l9-20z" fill="#80582f" stroke="S" stroke-width="2"/><path d="M13 4v40M7 24h33m-7-5 7 5-7 5" fill="none" stroke="#eee0b7" stroke-width="2"/><path d="m17 10 4 5m-4 18 4-5" stroke="#caa66b" stroke-width="2"/>',
 staff:'<path d="m16 45 10-29 5 2-10 29z" fill="#825b36" stroke="S" stroke-width="2"/><path d="m27 3 10 7-5 14-12-4-2-9z" fill="F" stroke="S" stroke-width="2"/><path d="m27 3 1 15 9-8m-9 8-8 2" fill="none" stroke="#e8f3ff" stroke-width="2"/>',
 cannon:'<path d="m7 31 9-17 26 10-7 17z" fill="#65747b" stroke="S" stroke-width="2"/><ellipse cx="39" cy="32" rx="6" ry="10" transform="rotate(22 39 32)" fill="#26383c" stroke="#b99b61" stroke-width="3"/><path d="m7 25-4 11 12 5 5-10m-5-17 5-7 8 4-2 9" fill="F" stroke="S" stroke-width="2"/><path d="m21 20 8 3m-11 3 8 3" stroke="#bacad0" stroke-width="2"/>',
 daggers:'<path d="m5 4 15 9 8 23-5 3L9 19zM43 4 28 13l-8 23 5 3 14-20z" fill="F" stroke="S" stroke-width="2"/><path d="m14 31 16-6m4 6-16-6M24 37l5 9m-5-9-5 9" stroke="#b69761" stroke-width="4"/>',
 hpPotion:'<path d="M18 4h12v12l9 13v11q-15 9-30 0V29l9-13z" fill="#cfe5df" stroke="S" stroke-width="2"/><path d="m14 28 6-8h8l6 8v10q-10 6-20 0z" fill="#d75249"/><path d="M19 4h10v6H19z" fill="#927047"/><path d="M21 24v11m-5-6h10" stroke="#ffe0bd" stroke-width="3"/><path d="m13 27 5-9" stroke="#fff" stroke-width="2" opacity=".7"/>',
 mpPotion:'<path d="M18 4h12v12l9 13v11q-15 9-30 0V29l9-13z" fill="#cfe5df" stroke="S" stroke-width="2"/><path d="m14 28 6-8h8l6 8v10q-10 6-20 0z" fill="#4c9cdd"/><path d="M19 4h10v6H19z" fill="#927047"/><path d="m25 22-7 9h6l-1 7 7-10h-6z" fill="#e1f7ff"/><path d="m13 27 5-9" stroke="#fff" stroke-width="2" opacity=".7"/>',
 boots:'<path d="M10 7h10v18l8 4v10H5v-9l5-4zM31 7h10v18l5 5v9H26V29l5-4z" fill="F" stroke="S" stroke-width="2"/><path d="M9 18h11m11 0h10M6 34h20m2 0h17" stroke="S" stroke-width="2"/>',
 weapon:'<path d="M24 4l5 8-3 24h-4l-3-24z" fill="F" stroke="S" stroke-width="2"/><path d="M12 33h24v5H12zM22 38h4v8h-4z" fill="S"/>',
 helmet:'<path d="M8 28V20a16 16 0 0 1 32 0v8l-8 9h-5V25h-6v12h-5z" fill="F" stroke="S" stroke-width="2"/>',
 chest:'<path d="M15 6l9 5 9-5 11 12-7 8-4-4v21H15V22l-4 4-7-8z" fill="F" stroke="S" stroke-width="2"/><path d="M24 11v29" stroke="S" stroke-width="2"/>',
 gloves:'<path d="M8 13l4-2 4 13V8l4-2 4 17V7l4-2 4 20 4-11 5 3-4 24H17z" fill="F" stroke="S" stroke-width="2"/>',
 pants:'<path d="M11 7h26l-3 35H24l-1-20-2 20H11z" fill="F" stroke="S" stroke-width="2"/>',
 ring:'<circle cx="24" cy="27" r="13" fill="none" stroke="S" stroke-width="7"/><path d="M24 5l10 10-10 9-10-9z" fill="F" stroke="S" stroke-width="2"/>',
 amulet:'<path d="M10 6q14 27 28 0" fill="none" stroke="S" stroke-width="3"/><path d="M24 18l12 11-12 15-12-15z" fill="F" stroke="S" stroke-width="2"/>',
 shield:'<path d="M24 4L42 12v14q-2 13-18 19Q8 39 6 26V12z" fill="F" stroke="S" stroke-width="2"/><path d="M24 10v27M12 24h24" stroke="S" stroke-width="2"/>',
 wolfFang:'<path d="M13 5Q20 10 35 6Q34 21 24 40Q19 47 17 42Q19 27 13 5Z" fill="#f6e9c9" stroke="#6c5942" stroke-width="2"/><path d="M14 7Q21 14 19 29" fill="none" stroke="#fffaf0" stroke-width="2"/><path d="M26 13Q26 26 20 39" fill="none" stroke="#b4a88c" stroke-width="1.5"/>',
 wolfPelt:'<path d="M7 4L15 10L24 7L33 10L41 4L39 18L45 35L35 32L31 44L24 38L17 44L13 32L3 35L9 18Z" fill="#8b6a4c" stroke="#392c24" stroke-width="2"/><path d="M12 15L17 21L24 16L31 21L36 15L34 29L28 26L24 34L20 26L14 29Z" fill="#c4a27a" stroke="#5d4736" stroke-width="1.5"/><path d="M7 5L14 12M41 5L34 12M13 33L17 39M35 33L31 39" stroke="#dbc09b" stroke-width="2"/>'

};
export const RARITY_COLORS=Object.freeze({common:'#aca596',uncommon:'#62c07b',rare:'#6fa9e2',epic:'#bb83df',legendary:'#e6bc64'});
export function itemIconKind(item,def){
 if(['hpPotion','mpPotion'].includes(item?.id))return item.id;
 if(def?.slot==='weapon')return ({bow:'bow',staff:'staff',daggers:'daggers',cannon:'cannon',sword:'weapon',sword_shield:'weapon'})[def.kind]||'weapon';
 return shapes[def?.slot||item?.id]?def?.slot||item.id:'wolfFang';
}
export function itemIcon(item,def){
 const kind=itemIconKind(item,def);
 const shape=shapes[kind]||shapes.wolfFang;
 const level=Math.max(1,Number(def?.level)||1);
 const tier=level>=35?4:level>=22?3:level>=10?2:level>=4?1:0;
 const colors=['#96734c','#a5a8ad','#9aa9c8','#bca35c','#dfc780'];
 const fill=colors[tier],stroke=tier>=3?'#f8e3a5':'#332b25';
 const rarity=RARITY_COLORS[item?.rarity]||RARITY_COLORS.common;
 const marks=tier?'<path d="M16 46h'+(tier*4+8)+'" stroke="'+rarity+'" stroke-width="2"/>':'';
 return '<svg class="item-art" data-item-kind="'+kind+'" viewBox="0 0 48 48" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="46" height="46" rx="7" fill="#1c2c27" stroke="'+rarity+'" stroke-width="1.5"/>'+shape.replaceAll('fill="F"','fill="'+fill+'"').replaceAll('stroke="S"','stroke="'+stroke+'"')+marks+'</svg>';
}
