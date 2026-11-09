export const PROJECTILE_TYPES=Object.freeze({
 arrow:{speed:480,radius:3},magic:{speed:360,radius:6},cannonball:{speed:300,radius:9,areaRadius:55}
});
export function projectileSpec(type){return PROJECTILE_TYPES[type]??PROJECTILE_TYPES.arrow;}
