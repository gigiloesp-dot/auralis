import {Save} from '../systems/save.js';
import {createCharacter} from '../characters/Character.js';
const TEXT={
 ru:{open:'Резервные копии',title:'Сохранения и резервные копии',slot:'Персонаж в слоте',export:'Скачать персонажа',original:'Скачать исходную резервную копию',previous:'Скачать копию до импорта',importTitle:'Восстановить персонажа',file:'Выбрать JSON-файл',paste:'Или вставь JSON сохранения',preview:'Проверить сохранение',close:'Закрыть',cancel:'Отмена',confirm:'Заменить персонажа',confirmation:'Я понимаю, что персонаж в этом слоте будет заменён.',warning:'Экспорт содержит только этого персонажа. Общее хранилище не заменяется при импорте.',replacement:'Будет восстановлен',level:'Уровень',region:'Регион',invalid:'Файл не является корректным сохранением Auralis.',json:'Не удалось прочитать JSON. Проверь содержимое файла.',version:'Эта версия сохранения пока не поддерживается. Исходный файл не изменён.',size:'Файл слишком большой. Допустимый размер: 2 МБ.',failed:'Не удалось записать сохранение. Освободи место в хранилище браузера и повтори.',downloaded:'Файл подготовлен для скачивания.',saved:'Сохранение восстановлено.',read:'Не удалось прочитать выбранный файл.'},
 en:{open:'Save backups',title:'Saves and backups',slot:'Character in slot',export:'Download character',original:'Download original backup',previous:'Download pre-import backup',importTitle:'Restore character',file:'Choose JSON file',paste:'Or paste save JSON',preview:'Validate save',close:'Close',cancel:'Cancel',confirm:'Replace character',confirmation:'I understand that the character in this slot will be replaced.',warning:'The export contains this character only. Importing does not replace shared storage.',replacement:'Character to restore',level:'Level',region:'Region',invalid:'This file is not a valid Auralis save.',json:'Could not parse JSON. Check the file contents.',version:'This save version is not supported yet. The original file has not changed.',size:'The file is too large. Maximum size: 2 MB.',failed:'Could not write the save. Free browser storage space and retry.',downloaded:'The file is ready to download.',saved:'Save restored.',read:'Could not read the selected file.'},
 es:{open:'Copias de seguridad',title:'Partidas y copias de seguridad',slot:'Personaje en ranura',export:'Descargar personaje',original:'Descargar copia original',previous:'Descargar copia anterior',importTitle:'Restaurar personaje',file:'Elegir archivo JSON',paste:'O pega el JSON de la partida',preview:'Validar partida',close:'Cerrar',cancel:'Cancelar',confirm:'Reemplazar personaje',confirmation:'Entiendo que se reemplazará el personaje de esta ranura.',warning:'La exportación contiene solo este personaje. La importación no reemplaza el almacén compartido.',replacement:'Personaje que se restaurará',level:'Nivel',region:'Región',invalid:'El archivo no es una partida válida de Auralis.',json:'No se pudo leer el JSON. Revisa el contenido.',version:'Esta versión de partida aún no es compatible. El archivo original no ha cambiado.',size:'El archivo es demasiado grande. Máximo: 2 MB.',failed:'No se pudo guardar. Libera espacio en el navegador e inténtalo de nuevo.',downloaded:'El archivo está listo para descargar.',saved:'Partida restaurada.',read:'No se pudo leer el archivo seleccionado.'}
};
const el=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
export class SavePanel{
 constructor(scene,onImported){
  this.scene=scene;this.onImported=onImported;this.opened=false;this.pending=null;
  this.language=scene.language||'ru';this.text=TEXT[this.language]||TEXT.ru;
  this.button=el('button',undefined,'save-backup-btn');this.button.type='button';this.button.setAttribute('aria-label',this.text.open);this.button.title=this.text.open;
  this.button.innerHTML='<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 5h23l4 5v25H5V5z" fill="#5a704d" stroke="#edce8e" stroke-width="2"/><path d="M12 5v11h16V5M11 25h18v10H11z" fill="#bda879" stroke="#edce8e" stroke-width="2"/><path d="M24 7v6" stroke="#3a4e37" stroke-width="3"/></svg>';
  this.button.onclick=()=>this.opened?this.close():this.show();
  (document.querySelector('.rpg-toolbar')||document.body).append(this.button);
  this.root=el('section',undefined,'save-panel');this.root.hidden=true;this.root.setAttribute('role','dialog');this.root.setAttribute('aria-modal','true');this.root.setAttribute('aria-label',this.text.title);document.body.append(this.root);
  this.onEscape=event=>{if(event.key==='Escape'&&this.opened)this.close();};document.addEventListener('keydown',this.onEscape);
 }
 show(){
  for(const name of ['inventoryPanel','characterPanel','skillsPanel','npcPanel','storagePanel','mapPanel','travelPanel','dungeonPanel'])this.scene[name]?.close();
  this.scene.controls?.reset();this.opened=true;this.root.hidden=false;this.pending=null;this.render();
 }
 close(){this.opened=false;this.pending=null;this.root.hidden=true;}
 action(label,fn){const button=el('button',label);button.type='button';button.onclick=fn;return button;}
 heading(){const header=el('header');header.append(el('h2',this.text.title),this.action(this.text.close,()=>this.close()));this.root.append(header);}
 render(message=''){
  const t=this.text,h=this.scene.hero;this.root.replaceChildren();this.heading();
  this.root.append(el('p',`${t.slot} ${this.scene.saveSlot}: ${h.name||h.classId} · ${t.level} ${h.level}`),el('p',t.warning,'save-warning'));
  const downloads=el('div',undefined,'save-downloads');this.root.append(downloads);
  downloads.append(this.action(t.export,()=>{if(!this.scene.save()){this.status.textContent=t.failed;return;}this.download(Save.export(this.scene.saveSlot),'character');}));
  const original=this.action(t.original,()=>this.download(Save.exportBackup(this.scene.saveSlot),'original'));original.disabled=!Save.exportBackup(this.scene.saveSlot);downloads.append(original);
  const previous=this.action(t.previous,()=>this.download(Save.exportReplacementBackup(this.scene.saveSlot),'before-import'));previous.disabled=!Save.exportReplacementBackup(this.scene.saveSlot);downloads.append(previous);
  this.root.append(el('h3',t.importTitle));
  const fileLabel=el('label',t.file,'save-file-label'),file=el('input');file.type='file';file.accept='.json,application/json';file.setAttribute('aria-label',t.file);fileLabel.append(file);this.root.append(fileLabel);
  file.onchange=async()=>{const selected=file.files?.[0];if(!selected)return;if(selected.size>2*1024*1024){this.status.textContent=t.size;return;}try{this.preview(await selected.text());}catch{this.status.textContent=t.read;}};
  const pasteLabel=el('label',t.paste),textarea=el('textarea');textarea.rows=4;textarea.maxLength=2*1024*1024;textarea.setAttribute('aria-label',t.paste);pasteLabel.append(textarea);this.root.append(pasteLabel,this.action(t.preview,()=>this.preview(textarea.value)));
  this.status=el('p',message,'save-status');this.status.setAttribute('role','status');this.root.append(this.status);
 }
 preview(json){
  const checked=Save.validateImport(json);
  if(!checked.ok){this.status.textContent=this.text[checked.reason]||this.text.invalid;return false;}
  this.pending={json,data:checked.data};this.renderConfirmation();return true;
 }
 renderConfirmation(){
  const t=this.text,data=this.pending.data;this.root.replaceChildren();this.heading();
  this.root.append(el('h3',t.replacement),el('p',`${data.name||data.classId} · ${t.level} ${data.level} · ${t.region}: ${data.region}`),el('p',t.warning,'save-warning'));
  const confirmation=el('label',undefined,'save-confirmation'),checkbox=el('input');checkbox.type='checkbox';checkbox.setAttribute('aria-label',t.confirmation);confirmation.append(checkbox,el('span',t.confirmation));this.root.append(confirmation);
  const actions=el('div',undefined,'save-downloads'),apply=this.action(t.confirm,()=>this.applyImport());apply.disabled=true;checkbox.onchange=()=>{apply.disabled=!checkbox.checked;};actions.append(this.action(t.cancel,()=>{this.pending=null;this.render();}),apply);this.root.append(actions);
  this.status=el('p','','save-status');this.status.setAttribute('role','status');this.root.append(this.status);
 }
 applyImport(){
  if(!this.pending)return false;
  if(!Save.import(this.pending.json,this.scene.saveSlot)){this.status.textContent=this.text.failed;return false;}
  // Replace the live value before restarting: shutdown must not save the old hero
  // over the imported character. All new runtime systems receive it on restart.
  this.scene.hero=createCharacter(Save.load(this.scene.saveSlot));this.close();
  if(this.onImported)this.onImported(this.scene.hero);
  else if(this.scene.requestReload)this.scene.requestReload();
  else this.scene.scene?.restart();
  return true;
 }
 download(json,suffix){
  if(!json){this.status.textContent=this.text.failed;return false;}
  const blob=new Blob([json],{type:'application/json'}),url=URL.createObjectURL(blob),link=el('a');
  link.href=url;link.download=`auralis-slot-${this.scene.saveSlot}-${suffix}.json`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);this.status.textContent=this.text.downloaded;return true;
 }
 destroy(){document.removeEventListener('keydown',this.onEscape);this.button.remove();this.root.remove();this.opened=false;}
}
