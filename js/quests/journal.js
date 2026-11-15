import {QUESTS,questProgress} from './quests.js';

// Claimed records remain in the save for prerequisites and one-time rewards.
// The active journal is only a view of accepted, unfinished turn-ins.
export function activeJournalEntries(hero){
 return QUESTS.flatMap(quest=>{
  const progress=questProgress(hero,quest.id);
  return ['active','completed'].includes(progress.state)?[{quest,progress}]:[];
 });
}
