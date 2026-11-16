// Stable arrival-only waystones added beside existing roads. They do not create
// return interactions or alter the eight pre-existing regional gateways.
const names=(ru,en,es)=>Object.freeze({ru,en,es});
const receiver=(id,region,x,y,ru,en,es,home=false)=>Object.freeze({id,region,x,y,names:names(ru,en,es),arrivalOnly:true,home});
export const NPC_TRAVEL_LINKS=Object.freeze({forest:Object.freeze(['north','desert']),north:Object.freeze(['forest','ancient']),ancient:Object.freeze(['north','desert']),desert:Object.freeze(['ancient','forest'])});
export const NPC_TRAVEL_RECEIVERS=Object.freeze([
 receiver('receiver-forest-riverhaven','forest',5250,5200,'Речная гавань','Riverhaven','Puerto del río',true),
 receiver('receiver-forest-city-south','forest',15400,16400,'Южная дорога заросшего города','Overgrown city southern road','Camino sur de la ciudad cubierta'),
 receiver('receiver-forest-city-north','forest',16200,4108,'Северная дорога заросшего города','Overgrown city northern road','Camino norte de la ciudad cubierta'),
 receiver('receiver-north-frostford','north',1500,1800,'Морозный брод','Frostford','Vado helado',true),
 receiver('receiver-north-ash-south','north',19208,19600,'Южная пепельная дорога','Southern ash road','Camino sur de ceniza'),
 receiver('receiver-north-ash-north','north',19000,3879,'Северная пепельная дорога','Northern ash road','Camino norte de ceniza'),
 receiver('receiver-ancient-dawncamp','ancient',1600,1800,'Лагерь рассвета','Dawn camp','Campamento del alba',true),
 receiver('receiver-ancient-sanctum','ancient',11554,11263,'Подступы к святилищу','Sanctum approach','Acceso al santuario'),
 receiver('receiver-ancient-crossroads','ancient',6668,6428,'Древний перекрёсток','Ancient crossroads','Cruce antiguo'),
 receiver('receiver-desert-oasis','desert',1600,1800,'Караванный оазис','Caravan oasis','Oasis de caravanas',true),
 receiver('receiver-desert-east','desert',16879,17471,'Восточный караванный тракт','Eastern caravan trail','Ruta oriental de caravanas'),
 receiver('receiver-desert-west','desert',5800,13050,'Западный караванный тракт','Western caravan trail','Ruta occidental de caravanas')
]);
export const regionTravelReceivers=region=>NPC_TRAVEL_RECEIVERS.filter(r=>r.region===region);
