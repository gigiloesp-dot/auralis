// Vector equipment icons: crisp at mobile sizes; item tier and rarity affect appearance.
const shapes={
 boots:'<path d="M10 7h10v18l8 4v10H5v-9l5-4zM31 7h10v18l5 5v9H26V29l5-4z" fill="F" stroke="S" stroke-width="2"/><path d="M9 18h11m11 0h10M6 34h20m2 0h17" stroke="S" stroke-width="2"/>',
 weapon:'<path d="M24 4l5 8-3 24h-4l-3-24z" fill="F" stroke="S" stroke-width="2"/><path d="M12 33h24v5H12zM22 38h4v8h-4z" fill="S"/>',
 helmet:'<path d="M8 28V20a16 16 0 0 1 32 0v8l-8 9h-5V25h-6v12h-5z" fill="F" stroke="S" stroke-width="2"/>',
 chest:'<path d="M15 6l9 5 9-5 11 12-7 8-4-4v21H15V22l-4 4-7-8z" fill="F" stroke="S" stroke-width="2"/><path d="M24 11v29" stroke="S" stroke-width="2"/>',
 gloves:'<path d="M8 13l4-2 4 13V8l4-2 4 17V7l4-2 4 20 4-11 5 3-4 24H17z" fill="F" stroke="S" stroke-width="2"/>',
 pants:'<path d="M11 7h26l-3 35H24l-1-20-2 20H11z" fill="F" stroke="S" stroke-width="2"/>',
 ring:'<circle cx="24" cy="27" r="13" fill="none" stroke="S" stroke-width="7"/><path d="M24 5l10 10-10 9-10-9z" fill="F" stroke="S" stroke-width="2"/>',
 amulet:'<path d="M10 6q14 27 28 0" fill="none" stroke="S" stroke-width="3"/><path d="M24 18l12 11-12 15-12-15z" fill="F" stroke="S" stroke-width="2"/>',
 shield:'<path d="M24 4L42 12v14q-2 13-18 19Q8 39 6 26V12z" fill="F" stroke="S" stroke-width="2"/><path d="M24 10v27M12 24h24" stroke="S" stroke-width="2"/>',
 wolfFang:'<path d="M13 6q14 10 23 0-2 23-18 36 3-20-5-36z" fill="F" stroke="S" stroke-width="2"/>',
 wolfPelt:'<path d="M10 5l10 8 9-7 10 4-3 12 8 15-13-2-8 9-8-9-12 2 8-16z" fill="F" stroke="S" stroke-width="2"/>'
};
export function itemIcon(item,def){
 const kind=def?.slot||item?.id||'wolfFang';
 const shape=shapes[kind]||shapes.wolfFang;
 const level=Math.max(1,Number(def?.level)||1);
 const tier=level>=35?4:level>=22?3:level>=10?2:level>=4?1:0;
 const colors=['#96734c','#a5a8ad','#9aa9c8','#bca35c','#dfc780'];
 const fill=colors[tier],stroke=tier>=3?'#f8e3a5':'#332b25';
 const rarity={common:'#7e786d',uncommon:'#4ebf6b',rare:'#448fdd',epic:'#ae63e4',legendary:'#e6b943'}[item?.rarity]||'#7e786d';
 const marks=tier?'<path d="M16 46h'+(tier*4+8)+'" stroke="'+rarity+'" stroke-width="2"/>':'';
 return '<svg class="item-art" viewBox="0 0 48 48" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">'+shape.replaceAll('F',fill).replaceAll('S',stroke)+marks+'</svg>';
}
