# Auralis — структура проекта
- index.html — только оболочка приложения
- css/game.css — стили интерфейса
- js/main.js — точка входа и настройка движка
- js/world/WorldScene.js — текущая первая сцена (будет разделена на renderer, input, world streaming)
- js/world/worldData.js — параметры регионов
- js/characters/Character.js — данные персонажа
- js/characters/classes.js — шесть классов
- js/characters/animations.js — направления и названия анимаций
- js/equipment/weapons.js — оружие
- js/equipment/armor.js — броня, редкость, слоты
- js/combat/combat.js — формулы боя
- js/combat/projectiles.js — типы снарядов
- js/monsters/monsters.js — монстры
- js/npc/npcData.js — NPC
- js/quests/quests.js — квесты
- js/ui/hud.js — интерфейс
- js/systems/save.js — автосохранение
- assets/sprites/ — персонажи, NPC, монстры, эффекты
- assets/world/ — окружение
- assets/equipment/ — визуальные предметы

## Правило
Не создавать дублирующие определения классов, оружия или предметов внутри сцен. Сцены постепенно переводятся на импорт отдельных модулей. Некоторые модули пока являются подготовленной структурой, а не реализованными игровыми механиками.
