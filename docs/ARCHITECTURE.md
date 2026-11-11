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

## Approved gameplay rules (2026-11-11)
- Death: respawn in the nearest eligible town, NEVER at arbitrary map center. Current prototype uses forest village spawn (1030,1140), 40% HP/MP; later extend to seven towns and map-aware nearest safe settlement.
- HUD resource bars vertically stacked: HP red, MP light blue, XP gold. XP bar tracks progress toward next level.
- Attack button: automatic nearest living enemy targeting within current weapon range; prototype melee range 100. Future class-specific targeting, line-of-sight and projectile handling belong in combat modules.
- Keep all these rules when expanding or replacing scenes.

## Menu and character flow (0.4)
- Boot to menu, not directly to world.
- Main menu -> 3 independent slots -> select one of 6 classes -> Latin/digit name (3-16 chars) -> world.
- Each slot stores its own name, class, position, progression and inventory.
- Existing slot continues without resetting progress. Delete requires typed DELETE.
- Pause button saves and pauses the world; resume continues; exit stops world and returns to slot selection.
- RU/EN/ES menu translations selected under settings; gameplay text localization remains future work.
- Existing saves from previous versions remain available in slot 1 through migration.

## Sword basic attacks (0.4.1)
- Holding the attack button repeats attacks automatically; tapping starts one complete attack.
- Starting warrior base interval: 1250 ms, gradually reduced by level, agility and later equipment bonuses; minimum 480 ms.
- Four distinct swings rotate in sequence: right slash, left slash, overhead, diagonal.
- Wind-up, impact and recovery belong to one shared AttackCycle. Damage is applied only on the designated impact frame, once per swing.
- MonsterSystem does not maintain a second independent attack cooldown. Target selection remains automatic within weapon range.
- Animations are temporary rig poses; final sprites will need visual polish without changing combat timing.
