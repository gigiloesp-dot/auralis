// Versioned point ledger. Legacy releases awarded one point per level through42.
// Never infer spending from learned skills or reset a player's remaining bank.
export const SKILL_POINT_POLICY=2;
export function skillPointState(data={}, {fresh=false}={}){
 const points=Math.max(0,Math.floor(Number.isFinite(data.skillPoints)?data.skillPoints:0));
 const current=data.skillPointPolicy===SKILL_POINT_POLICY||(fresh&&data.version===undefined&&data.skillPointPolicy===undefined);
 const level=Math.max(1,Math.min(42,Math.floor(Number.isFinite(data.level)?data.level:1)));
 return {skillPointPolicy:SKILL_POINT_POLICY,skillPoints:Math.min(Number.MAX_SAFE_INTEGER,points+(current?0:level-1))};
}
