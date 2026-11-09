# Auralis — организация персонажей и предметов

## Персонажи
assets/sprites/characters/{warrior,archer,mage,paladin,assassin,cannoneer}/ — независимые художественные ресурсы.
js/characters/classes/ — будущие отдельные файлы механик классов.
js/characters/Character.js — общая модель.

## Оружие
assets/equipment/weapons/{swords,bows,staffs,daggers,cannons}/ — модели и визуальные ресурсы.
js/equipment/weapons.js — текущие определения оружия.

## Доспехи
assets/equipment/armor/{helmets,chests,gloves,pants,boots,shields}/.
assets/equipment/accessories/{rings,amulets}/.

## Редкость
Один и тот же предмет одного уровня может иметь common, uncommon, rare, epic, legendary.
Храним уникальные ID экземпляров, baseItemId, level, rarity, rolls, visualId.
Редкость не означает обязательную копию изображения. Уникальные легендарные предметы могут иметь собственную модель и эффекты.
js/equipment/rarity.js содержит стартовые коэффициенты для будущей балансировки, не подключённые к бою.

## Принцип
Не дублировать 5 одинаковых моделей только ради редкости; разделять конфигурацию, игровой экземпляр и визуальные ресурсы.
