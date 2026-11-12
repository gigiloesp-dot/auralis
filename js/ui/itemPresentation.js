import {equipmentPrice,materialPrice} from '../systems/trading.js';
import {className} from '../characters/classes.js';
import {itemDefinition,itemName,itemCount} from '../equipment/items.js';
import {itemIcon,RARITY_COLORS} from './itemIcons.js';
const labels={
 ru:{level:'Ур.',quantity:'Количество',classes:'Класс',price:'Цена',sale:'Стоимость продажи',common:'Обычный',uncommon:'Необычный',rare:'Редкий',epic:'Эпический',legendary:'Легендарный'},
 en:{level:'Lv.',quantity:'Quantity',classes:'Class',price:'Price',sale:'Sale value',common:'Common',uncommon:'Uncommon',rare:'Rare',epic:'Epic',legendary:'Legendary'},
 es:{level:'Nv.',quantity:'Cantidad',classes:'Clase',price:'Precio',sale:'Valor de venta',common:'Común',uncommon:'Inusual',rare:'Raro',epic:'Épico',legendary:'Legendario'}
};
const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
export function itemArt(item,definition=itemDefinition(item)){
 const art=node('span',undefined,'item-art-wrap');art.dataset.rarity=item?.rarity||'common';art.innerHTML=itemIcon(item,definition);return art;
}
// Shops, sale offers and storage share the same real icon and requirement text.
// Price and quantities remain supplied by the transaction model, never inferred here.
export function itemSummary(item,{language='ru',definition=itemDefinition(item),name=itemName(item,language),quantity=itemCount(item),price,currency=''}={}){
 const t=labels[language]||labels.ru,rarity=item.rarity||'common',root=node('span',undefined,'item-summary');root.dataset.rarity=rarity;
 root.append(itemArt(item,definition));const copy=node('span',undefined,'item-summary-copy');const title=node('strong',name,'item-summary-name');title.style.color=RARITY_COLORS[rarity]||RARITY_COLORS.common;copy.append(title);
 const requirements=[t[rarity]||t.common,`${t.level} ${definition?.level||1}`];
 if(quantity!==undefined)requirements.push(`×${quantity}`);
 if(definition?.allowedClasses?.length)requirements.push(t.classes+': '+definition.allowedClasses.map(id=>className(id,language)).join(', '));
 copy.append(node('small',requirements.join(' · '),'item-summary-meta'));
 if(Number.isFinite(price))copy.append(node('small',t.price+': '+price+(currency?' '+currency:''),'item-summary-price'));
 root.append(copy);return root;
}

export function itemSaleValue(item){return itemDefinition(item)?.slot?Math.max(1,Math.floor(equipmentPrice(item)*.25)):materialPrice(item);}
export function itemSaleText(item,language='ru'){return (labels[language]||labels.ru).sale+': '+itemSaleValue(item);}
