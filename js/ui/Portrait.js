import {getPortrait,PORTRAIT_SHEET_URL} from '../assets/portraits.js';
let sheetReady;
function preload(){
 return sheetReady??=new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(true);image.onerror=()=>resolve(false);image.src=PORTRAIT_SHEET_URL;});
}
// Keep the existing silhouette/SVG until the real image is decoded. A stale
// callback must not overwrite a reused HUD element after changing characters.
export function applyPortrait(element,classId){
 const portrait=getPortrait(classId);element.dataset.portraitClass=classId;
 preload().then(ready=>{if(!ready||element.dataset.portraitClass!==classId)return;Object.assign(element.style,{backgroundImage:`url("${portrait.url}")`,backgroundSize:portrait.backgroundSize,backgroundPosition:portrait.backgroundPosition});element.classList.add('has-portrait');});
}
