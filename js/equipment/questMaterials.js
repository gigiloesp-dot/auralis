// Additive quest-only materials. Not registered in ITEM_DEFS until integration;
// no equipment, item tier, existing item, merchant stock or drop table changes.
const material=(name,en,es,level,icon)=>Object.freeze({name,names:Object.freeze({ru:name,en,es}),slot:null,level,saleValue:0,questMaterial:true,iconURL:`assets/world/gathering/${icon}.png`});
export const QUEST_MATERIALS=Object.freeze({
 forestMoonflower:material('Лесный лунный цветок','Woodland moonflower','Flor lunar del bosque',1,'moonflower'),
 northFrostHerb:material('Северная морозная трава','Northern frost herb','Hierba de escarcha del norte',22,'frost-herb'),
 ancientStarBloom:material('Древний звездоцвет','Ancient star bloom','Flor estelar antigua',35,'star-bloom'),
 desertSunleaf:material('Пустынный солнцелист','Desert sunleaf','Hoja solar del desierto',42,'sunleaf')
});
