// Four additive, physically gatherable objectives. Register only after their
// real world renderer/input and QUEST_MATERIALS inventory integration exist.
import {GATHERING_NODES} from '../world/gatheringData.js';
import {QUEST_MATERIALS} from '../equipment/questMaterials.js';
import {task10OrdinaryXp} from './task10QuestData.js';
const local=(ru,en,es)=>Object.freeze({ru,en,es});
const authored=[
 ['moonflower-supplies','forest','mira',5,'forestMoonflower',local('Лунные цветы у дороги','Moonflowers by the road','Flores lunares junto al camino'),local('Собери три лесных лунных цветка у лесной дороги и принеси их Мире. Не нужно срывать всё растение: свежие цветы появятся позже.','Gather three woodland moonflowers by the forest road and bring them to Mira. Leave their roots intact so fresh blossoms can grow later.','Recoge tres flores lunares del camino del bosque y llévaselas a Mira. Deja las raíces intactas para que vuelvan a brotar flores.')],
 ['frost-herb-supplies','north','freya',27,'northFrostHerb',local('Трава под инеем','Herbs beneath the frost','Hierbas bajo la escarcha'),local('Собери три пучка морозной травы у снежной дороги и вернись к Фрее. Береги серебристые корни от тяжёлых сапог.','Gather three bundles of frost herb beside the snowy road and return to Freya. Keep heavy boots away from their silver roots.','Recoge tres manojos de hierba de escarcha junto al camino nevado y vuelve con Freya. Protege sus raíces plateadas de las botas pesadas.')],
 ['star-bloom-supplies','ancient','aster',37,'ancientStarBloom',local('Цветы древних троп','Flowers of the ancient paths','Flores de las sendas antiguas'),local('Найди и собери три древних звездоцвета у старой дороги. Астер изучает их сияющую пыльцу и ждёт образцы в Лагере рассвета.','Find and gather three ancient star blooms by the old road. Aster studies their luminous pollen and awaits samples at Dawn Camp.','Busca y recoge tres flores estelares antiguas junto al viejo camino. Aster estudia su polen luminoso y espera muestras en el Campamento del alba.')],
 ['sunleaf-supplies','desert','desert-guide',44,'desertSunleaf',local('Солнцелист караванов','Sunleaf for the caravans','Hoja solar para las caravanas'),local('Собери три пустынных солнцелиста у караванного тракта и доставь их проводнику оазиса. Срывай только зрелые листья, оставляя корни в песке.','Gather three desert sunleaves beside the caravan trail and deliver them to the oasis guide. Pick mature leaves and leave the roots in the sand.','Recoge tres hojas solares del desierto junto a la ruta de caravanas y entrégaselas al guía del oasis. Recoge las hojas maduras y deja las raíces en la arena.')]
];
export const GATHERING_QUESTS=Object.freeze(authored.map(([id,region,npcId,level,itemId,title,description])=>{
 if(!QUEST_MATERIALS[itemId])throw Error('Unknown gathering material '+itemId);
 const node=GATHERING_NODES.find(n=>n.region===region&&n.materialId===itemId);if(!node)throw Error('Missing real gathering node '+itemId);
 return Object.freeze({id:'task10-'+id,npcId,region,level,type:'collect',itemId,target:node.id,required:3,xp:task10OrdinaryXp(level,'collect'),gold:60+level*16,category:'ordinary',title,description,location:Object.freeze({region,x:node.x,y:node.y,radius:85})});
}));
