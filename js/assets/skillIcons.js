// One consistent vector icon system, with a distinct drawn motif for each skill.
const colors={warrior:'#e4aa55',archer:'#8fbd68',mage:'#8dbaed',paladin:'#eddd8d',assassin:'#b896d8',cannoneer:'#dd9670'};
const motifs={
 warrior:['M12 36L35 9l5 5-27 24M10 26l13 12M11 37l-4 5','M24 6L39 13v13Q36 37 24 43Q12 37 9 26V13zM24 13v21','M12 11q28-5 24 22q-10 16-25 1M12 11l1 11 10-9M21 32l12-14','M9 26L25 10v31L9 26zM30 17q12 7 0 14M33 10q21 14 0 28','M12 7l25 28-8 8L8 13zM30 7L8 36M26 36h15'],
 archer:['M12 7q29 17 0 34M12 7v34M8 24h33M34 17l7 7-7 7','M9 31l15-21 15 21M9 31h30M16 31v10M32 31v10M24 13v22','M7 15h34M33 9l8 6-8 6M7 25h34M33 19l8 6-8 6M7 35h34M33 29l8 6-8 6','M5 24Q24 3 43 24Q24 45 5 24zM24 17a7 7 0 1 0 0 14a7 7 0 1 0 0-14','M10 7v31M5 32l5 8 5-8M24 3v32M19 29l5 8 5-8M38 7v31M33 32l5 8 5-8'],
 mage:['M25 5Q38 21 34 31Q31 43 20 41Q5 36 13 22Q20 30 25 5z','M24 5l16 9v15L24 43 8 29V14zM24 12v23M14 18l20 12M14 30l20-12','M9 39L39 9M27 8h13v13M19 17l12 12M13 24l11 11M5 13l10 1M34 35l9 4','M24 5v9M24 35v8M5 24h9M35 24h8M10 10l7 7M31 31l7 7M10 38l7-7M31 17l7-7M24 17l7 7-7 7-7-7z','M10 35Q4 23 16 21Q25 18 26 29Q27 42 14 41M20 21L39 5M26 29L43 12M30 33l12-11'],
 paladin:['M19 6h10v13h13v10H29v13H19V29H6V19h13z','M24 6L39 13v14Q36 36 24 42Q12 36 9 27V13zM24 14v20M15 24h18','M20 9h8v11h11v8H28v11h-8V28H9v-8h11zM7 7l5 5M41 7l-5 5M7 41l5-5M41 41l-5-5','M24 4L38 13v15L24 40 10 28V13zM4 33q20 20 40 0M24 13v16M18 21h12','M11 9l13 14 13-14M24 23v19M7 17l17 13 17-13M19 4h10'],
 assassin:['M9 39L32 6l8 10-24 27M9 39l-3 4M12 29l11 9','M8 27Q24 7 40 27M12 28l-5 8M36 28l5 8M19 22l5 5 5-5M15 9l-5-4M33 9l5-4','M11 37L32 7l7 9-23 26M13 29l12 9M8 10q-8 13 1 14q9-1-1-14z','M6 30h15l-7 10M7 16h22l-7 10M23 6h18v18M41 6L20 27','M10 8l28 31M38 8L10 39M8 24h10M30 24h10M24 5v9M24 34v9'],
 cannoneer:['M9 29l7-17 25 10-7 17zM11 18l25 10M10 30l-6 9M33 8l4-4M40 14l5-1','M15 8h18l8 12-6 21H13L7 20zM16 17h16M18 25h12M21 8v9','M7 25l13-10 10 5-13 11zM28 10l12-5M32 20l13-1M28 30l12 6M21 33l8 11','M16 13h16v24H16zM19 7h10v6M20 22h8M24 18v8M9 19l-5-3M39 19l5-3','M24 5l5 12 13-7-6 14 9 7-15 2-6 12-6-12-15-2 9-7-6-14 13 7z']
};
const cache=new Map();
export function skillIcon(skill){
 const classId=skill.classId||String(skill.id||'warrior_0').split('_')[0],index=Math.max(0,Math.min(4,Number(skill.index)||0));
 const key=classId+':'+index;if(cache.has(key))return cache.get(key);
 const path=motifs[classId]?.[index]||motifs.warrior[0],color=colors[classId]||colors.warrior;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true"><rect x="2" y="2" width="44" height="44" rx="10" fill="#172b26" stroke="${color}" stroke-width="2"/><path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;cache.set(key,svg);return svg;
}
