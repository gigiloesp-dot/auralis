export const ANIMATIONS=Object.freeze({idle:'idle',run:'run',attack:'attack',hurt:'hurt',death:'death'});
export function facing8(dx,dy){if(!dx&&!dy)return 2;return (Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8;}
