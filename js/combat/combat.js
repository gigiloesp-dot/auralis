export function calculateDamage({attack=5,defense=0,critical=false}={}){return Math.max(1,Math.round(attack*(critical?1.5:1)-defense*.45));}
