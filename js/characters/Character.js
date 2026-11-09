import {getClass} from './classes.js';
export function createCharacter({id='hero',classId='warrior',x=1200,y=1200,level=1,hp=100}={}){
 return {id,classId,x,y,level,hp,maxHp:100,stats:{strength:5,endurance:5,agility:5,luck:5,intelligence:5},equipment:{},skills:[],animation:'idle',facing:2,speed:225*getClass(classId).speed};
}
