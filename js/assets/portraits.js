// One real 1536x1024 painted image, six square 512px cells. Browser CSS selects
// cells directly; no copied crops or generated animation frames are required.
export const PORTRAIT_SHEET_URL=new URL('../../assets/portraits/class-portraits.png',import.meta.url).href;
const order=['warrior','archer','mage','paladin','assassin','cannoneer'];
export const PORTRAITS=Object.freeze(Object.fromEntries(order.map((id,index)=>{
 const column=index%3,row=Math.floor(index/3);
 return [id,Object.freeze({url:PORTRAIT_SHEET_URL,column,row,width:512,height:512,backgroundSize:'300% 200%',backgroundPosition:`${column*50}% ${row*100}%`})];
})));
export const getPortrait=classId=>Object.hasOwn(PORTRAITS,classId)?PORTRAITS[classId]:PORTRAITS.warrior;
