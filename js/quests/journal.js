import {QUESTS,questProgress} from './quests.js';

// Claimed records remain in the save for prerequisites and one-time rewards.
// The active journal is only a view of accepted, unfinished turn-ins.
export function activeJournalEntries(hero){
 return QUESTS.flatMap(quest=>{
  const progress=questProgress(hero,quest.id);
  return ['active','completed'].includes(progress.state)?[{quest,progress}]:[];
 });
}
// Older saves can contain more than six accepted contracts. Original records
// stay intact and resume in saved order as active slots become free.
export function queuedJournalEntries(hero){
 return QUESTS.flatMap(quest=>{const progress=questProgress(hero,quest.id);return progress.state==='queued'?[{quest,progress}]:[];});
}
