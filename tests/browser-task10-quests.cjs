// Reuse the full actual NPC acceptance/objective/claim journey for every new
// definition. Daily tier fixtures advance one UTCday and set their real band.
process.env.AURALIS_QUEST_SCOPE='task10';
require('./browser-quests.cjs');
