// UTC calendar cycles use a saved high-water day. Rolling a device clock back
// never opens an earlier reward cycle. Existing quest records remain untouched.
const DAY_MS=86400000,META='__dailyV1';
const day=value=>Number.isSafeInteger(value)&&value>=0&&value<=100000000?value:null;
const today=now=>Math.max(0,Math.floor((Number.isFinite(now)?now:0)/DAY_MS));
export function dailyEpoch(hero,quests,now=Date.now()){
 let epoch=Math.max(today(now),day(hero.quests?.[META]?.epochDay)??0);
 for(const q of quests){const saved=hero.quests?.[q.id];epoch=Math.max(epoch,day(saved?.day)??0,day(saved?.lastClaimDay)??0);}
 return epoch;
}
export function dailySnapshot(hero,quest,quests,now=Date.now()){
 const epoch=dailyEpoch(hero,quests,now),meta=hero.quests?.[META],saved=hero.quests?.[quest.id],record=day(saved?.day)===epoch?saved:null;
 const claimed=(day(saved?.lastClaimDay)??-1)>=epoch||(record?.state==='claimed');
 const other=quests.some(q=>q.id!==quest.id&&day(hero.quests?.[q.id]?.day)===epoch&&['active','completed','claimed'].includes(hero.quests[q.id].state));
 const blocked=!claimed&&((day(meta?.claimedDay)??-1)>=epoch||other);
 return {epoch,record,claimed,blocked};
}
export function syncDailyQuests(hero,quests,now=Date.now()){
 const previous=hero.quests?.[META];
 // Ordinary adventuring never creates a daily contract or service metadata.
 // Start the high-water clock only after an actual daily record exists.
 if(!previous&&!quests.some(q=>hero.quests?.[q.id]))return false;
 const epoch=dailyEpoch(hero,quests,now);
 if(previous?.version===1&&previous.epochDay===epoch)return false;
 hero.quests??={};hero.quests[META]={...previous,version:1,epochDay:epoch};return true;
}
export function acceptDailyQuest(hero,quest,quests){
 hero.quests??={};syncDailyQuests(hero,quests);const epoch=dailyEpoch(hero,quests),previous=hero.quests[quest.id];
 hero.quests[quest.id]={state:'active',progress:0,day:epoch,...(day(previous?.lastClaimDay)!==null?{lastClaimDay:previous.lastClaimDay}:{})};
 syncDailyQuests(hero,quests);
}
export function claimDailyQuest(hero,quest,quests,progress){
 syncDailyQuests(hero,quests);const epoch=dailyEpoch(hero,quests);
 hero.quests[quest.id]={state:'claimed',progress,day:epoch,lastClaimDay:epoch};
 hero.quests[META]={...hero.quests[META],claimedDay:epoch,claimedQuestId:quest.id};
}
