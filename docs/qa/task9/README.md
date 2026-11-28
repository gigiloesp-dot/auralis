# Доказательства задания №9

Рабочий игровой commit: `0e402a7406c7c09a3de3435c32fea241a7098e1c`.
Checkpoint: `feb235e4773bed0951c36f315c6eab035f25a0dd` (release20).

- `release20-world.json`: исходные254 лагеря/2415 существ,18 боссов, старые дороги/порталы/города/NPC и104 определения квестов. Tests сравнивают сохранность независимо от нового количества.
- `protected-items-and-art.json`: SHA существующих каталогов/слоёв/PNG/навыков.
- `approved-deltas.json`: явный список разрешённых новых изменений исторических runtime-файлов; сам ledger закреплён SHA в прежнем preservation test.
- `changed-files.txt`: пути изменённых исходников/проверок/документов от checkpoint до игрового commit.
- `settlements/`: все7 расширенных поселений, настоящие PNG-дома, collision/safe-core checks.
- `world/`: четыре карты/углы/reload/направленные переходы, пустынный оазис и руины.
- `progression/`: все6 классов×3 языка, legacy slots/download и окна110skill points. Для визуальной проверки: `ru-warrior-56.png`, `points110-ru.png` и языковые варианты (фактические имена см. каталог).
- `progression-browser-*-final.log`: полный прогон18 class/language сочетаний. `progression-ui-integration.log`: дополнительный warrior/3языка/740×320.
- `unit-final.log`, `check-final.log`: финальные unit/syntax:309/309 и242 файлов PASS.
- `world-integration.log`: расширенный старый browser-world, все470 лагерей/4359 обычных/18 боссов и все дороги.
- `performance/verification.json`, `performance-final.log`:12 warm-up+48 steady visits, дубликаты/чанки/текстуры/GC heap,96 frame samples каждого региона и8 быстрых переходов. Поле renderFps считает реальные Phaser postrender, rafFps — callbacks браузера; это Linux Chromium software rendering при844×390 и параллельных unit-проверках, **не Red Magic/Android**. JS heap не включает всю GPU/native memory.
- `descriptor-isolated.json`: cold Node-метаданные всех4 регионов без параллельных unit/browser процессов:4.45s,RSS65.4MiB,heap16.9MiB. `descriptor-final.json` сохраняет прежний замер8.4s при параллельной нагрузке. Это не FPS и не загрузка всех Phaser-объектов.

Полные CI browser-артефакты загружаются в GitHub Actions: https://github.com/gigiloesp-dot/auralis/actions/runs/43725005224 . Физическую приёмку выполняет владелец.

Публикация: native Sites version21, game SHA0e402a7; `deployment.json` содержит точные saved-version/deployment/source IDs и archive hashes. `public-runtime.log` подтверждает342 runtime SHA-256 по публичному HTTPS, бой/реальную добычу/30s respawn/подбор/reload/4 региона/3 hard dungeon entries и отсутствие JS errors. Новые публичные task9-сценарии записываются отдельно в public-world/public-progression.

`public-world.log`/`world-public/`: публично4 карты/углы/8 реальных направленных переходов/4 reload/новые PNG,ready7.561s в этой среде. `public-progression.log`/`progression-public/`: warrior RU touch42→43/55→56/cap/skills/desert reload и3 legacy slots с точным JSON download. Все6×3 комбинации отдельно прошли CI; на публичной версии повторён warrior RU, не заявляется повтор18 комбинаций.
