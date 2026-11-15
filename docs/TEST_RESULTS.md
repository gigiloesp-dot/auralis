# Результаты проверок Auralis

## Активно задание №10 — в работе

Checkpoint `c36c8fa34370080479bc6b2ec53fea5e56f159ff`,основа release21/a13d61f. Климат3010ee7 и2.5D-рельефfa59295:CI20/20 success. Теперь actual257 спотов80/76/45/56×11=2827,alias470/4359,versioned world migration/exact backup,104 старых квеста проверены после переназначения30 целей. Unit323/323,syntax262,3slots×3locales/browser-world/all104quests PASS. **Следующий этап5:257 уникальных видов и реальный арт;сейчас257 уникальных моделей НЕ готово,используются23 временных базовых вида.** Кандидаты скорпиона/кактуса ещё не подключены. Этапы7–15/dungeons/NPC/teleport/daily/navigation/maps ещё впереди. [Полный статус](TASK_10_STATUS.md). Master-test остаётся21;весьTask10не готов,новую публикацию не выполняли. Не начинать заново и не заменять pending арт одинаковыми PNG.

## Актуально: задание №9

Готовы4 карты/8 поселений/21 NPC/470 лагерей/4359 обычных;cap56/110 skill points,version3 migration и pre-upgrade backup. Выпуск21 опубликован: https://auralis-master-test.alertpine18.chatgpt.site . Game source `0e402a7406c7c09a3de3435c32fea241a7098e1c`; checkpoint `feb235e4773bed0951c36f315c6eab035f25a0dd`. Unit309/309,syntax242,CI43725005224 —19/19 success (33 browser suites),публично342 runtime hashes/4 карты/8 переходов/reload/level56/backup PASS. Ожидать физической Red Magic11 Pro-приёмки владельцем; следующий пакет NPC/квестов не начинать. См. [TASK_9_STATUS.md](TASK_9_STATUS.md). Master-test21; main/stable-alpha/alpha1 прежние,merge нет.

## Задание №8 — выпуск 20

https://auralis-master-test.alertpine18.chatgpt.site — source `7e17ebdbdb232920d9bdc932791ef472f0f1edca`, checkpoint `9c7864dfe90fb60172a64167a2232649d3497168`, основа `5565d048b265970004b3f981998567c1fc37d2ca`. Пять кнопок2/3,44px touch, логотип до1.7× с ограничением на низких экранах. Один потоковый NPC-значок: готовность → доступность → прогресс, обычное выше ежедневного при равном статусе. Quest/save/reward-код и каталог сохранены; ежедневных заданий в исходном каталоге нет, зелёные состояния проверены renderer fixtures. CI15/15,295 unit,227 syntax,29 browser suites; публично335 runtime-хешей,task8 RU/EN/ES21 сочетание и cover18/18. [Отчёт](TASK_8_STATUS.md), [скриншоты](qa/task8/README.md), [доставка](qa/task8/deployment.json). Main/stable-alpha/старая alpha сохранены, merge нет. Физическую Android-приёмку выполняет владелец.


## Задание №7 — выпуск 19, завершено

https://auralis-master-test.alertpine18.chatgpt.site — source `5b2d2a9e06ae9f5b461db4d207fbeea5b2005409`. Контрольная точка `411f4005fe63f729ca94c6eac80d9f482ef029e1`, исходная ветка после задания6 `cc5c7bb9fa8c6ed3cfd704f2e63563ec3850e077`. Главное меню заполняет экран через cover вместо contain; один runtime CSS-delta. Журнал уже был правильным, код сохранён и подтверждён реальными NPC/reload-тестами RU/EN/ES. 290 unit,223 syntax,CI15/15,28 browser suites; публично333 runtime-хеша,18 сочетаний меню и journal3/3. [Отчёт](TASK_7_STATUS.md), [до/после](qa/task7/README.md), [доставка](qa/task7/deployment.json). Main/stable-alpha и старая alpha сохранены, merge нет. Задание6 и экипировка не изменены. Физический Android не использовался.


## Задание №6 — выпуск 18, комплект воина

Опубликован выпуск **18**: https://auralis-master-test.alertpine18.chatgpt.site. [Игровая лаборатория комплекта](https://auralis-master-test.alertpine18.chatgpt.site/warrior-equipment-lab.html) использует отдельные сохранения. Source `eaf29399db88b51ea22fccafe79a19f48b36cb9b`, контрольная точка `6847769bed1e7e19cf72ca7fd70e7e4718de02df`. [CI 43693685829](https://github.com/gigiloesp-dot/auralis/actions/runs/43693685829) — **15/15 success, 290 unit, 222 syntax, 27 browser suites**.

Подключены семь прозрачных PNG для реальных ID меча 4-го уровня, начальной брони 1-го уровня и щита 5-го уровня. Крепления измерены для 32 поз и восьми направлений; части ног и обуви следуют суставам, оружие — кистям, передние и задние слои учитывают направление. Другие классы/уровни не создавались. Интерфейс выпуска 17, каталог/бой/карты/NPC/монстры/квесты/обычные сохранения сохранены. Публично прошли 333 runtime-хеша, полный новый набор с 448 комбинациями трансформаций, сохранениями и 20 циклами texture residency, обычный игровой smoke.

[Отчёт и ограничения](TASK_6_STATUS.md), [PNG](qa/task6/assets.json), [восемь направлений](qa/task6/eight-directions-idle.png), [CI](qa/task6/ci-source.json), [публикация](qa/task6/deployment.json), [публичные проверки](qa/task6/public-equipment-verification.json). Новые независимые клипы special/hurt/death не заявляются; физический Android и окончательная художественная приёмка остаются для ручной проверки.


## Задание №5 — выпуск17

Опубликован **выпуск17**: https://auralis-master-test.alertpine18.chatgpt.site. Игровой source `28615cbc4fe1288b1aba242aec0cf0baeb7b39bb`. [CI43658226026](https://github.com/gigiloesp-dot/auralis/actions/runs/43658226026) — **14/14 jobs success,284 unit,213 syntax,26 browser suites**. Проверены пять landscape-размеров и RU/EN/ES, все шесть классов, сохранения, бой, добыча, streaming и soak.

Централизован компактный масштаб окон; исправлены фон/флаг/главные кнопки, прокрутка хранилища,44px touch regions, доступность паузы рядом с NPC, абсолютные таймеры обычных монстров и фильтр claimed в журнале. Боевые контролы и круглая мини-карта сохранены. Контрольная точка — `98d7b1a9b46385a07ec4b931e4371e957b592455`. Подробности: [TASK_5_STATUS.md](TASK_5_STATUS.md), [CI](qa/task5-ci-source.json), [доставка](qa/task5-deployment.json), [сравнение скриншотов](qa/task5-screens/README.md). Публично подтверждены310 runtime-хешей, бой/добыча/save/reload/регионы, журнал RU/EN/ES и112 новых RU UI-измерений на пяти разрешениях. [Квитанция проверок](qa/task5-verification.json). Физический Android остаётся для ручной приёмки.

## Задание №4 — проверено и опубликовано

Опубликован **выпуск 16**: https://auralis-master-test.alertpine18.chatgpt.site. Игровой source `140103da211aac3ad8460d769c240df421bf4e27`. [CI 43633093953](https://github.com/gigiloesp-dot/auralis/actions/runs/43633093953) — **11/11 jobs success, 272 unit, check207 файлов, все 24 browser suites**. Включены 18 сочетаний классов/языков и новый сценарий добычи RU/EN/ES.

Публично: 307 точных хешей и loot UI RU/EN/ES без JS ошибок. Проверки включают отсутствие автоматической выдачи по касанию, grouping, single/all/full/partial, закрытие, range180/181, stale window, repeated touch, quota rollback, reload/streaming, пять редкостей и source restrictions. Прежние unit/browser assertions сохранены, профильные ожидания обновлены под новое ТЗ.

Подробности: [TASK_4_STATUS.md](TASK_4_STATUS.md), [qa/task4-ci-source.json](qa/task4-ci-source.json), [qa/task4-deployment.json](qa/task4-deployment.json), [qa/task4-verification.json](qa/task4-verification.json).

## Главное меню и средневековая тема — проверено и опубликовано

Выпуск **15**: https://auralis-master-test.alertpine18.chatgpt.site. Source `b5ac2e939b70485b9516e66617637b6189a4b360`, [CI 43611818625](https://github.com/gigiloesp-dot/auralis/actions/runs/43611818625) — **10/10 jobs success: 262 unit, 204 check, 23 браузерных suites**, включая 18 сочетаний классов и языков. Контрольная точка до оформления — `756ed8ffaa7974d6ce5efd9cd94f90e642cd0049`.

Пять настоящих кнопок, новая игра без перезаписи, продолжение, настройки, авторы и корректный браузерный выход проверены RU/EN/ES. Разметка проверена на 1280×721, 844×390, 640×360, 740×320 и 915×412, в том числе до загрузки портретов. Публично проверены все 305 runtime SHA-256, бой, добыча, сохранение/перезагрузка, три региона и новые меню.

Локально: шесть созданий/30 навыков; семь ресурсных циклов/21 dungeon вход-выход; естественное первое подземелье — 426 секунд, 18 обычных врагов и босс, заработанный уровень 7, пеший выход и восстановление. Ранее найденные переполнение создания/слотов и сдвиг из-за декодирования портрета исправлены; маршрут тестового подбора использует действующий радиус, без ослабления проверок. Физический Android не проверялся.

Доказательства: [MEDIEVAL_UI_STATUS.md](MEDIEVAL_UI_STATUS.md), [qa/medieval-ci-source.json](qa/medieval-ci-source.json), [qa/medieval-deployment.json](qa/medieval-deployment.json), [qa/medieval-verification.json](qa/medieval-verification.json).

## Задание №2 — проверено и опубликовано

**Выпуск 12**: https://auralis-master-test.alertpine18.chatgpt.site. Игровой source `468499ffbbdc4038fe1d71044af01b7afdb21fe6`, контрольная точка до задания — `0ec6306aff4c51974f34ab2639f9b083aaae87ff`.

[CI 43607069281](https://github.com/gigiloesp-dot/auralis/actions/runs/43607069281): **10/10 jobs success, 262 unit, check 202 файлов, все 22 браузерных suites**. Новый сценарий проверяет все 18 сочетаний шести классов и трёх языков. По публичному HTTPS отдельно прошли все 300 runtime SHA-256, регрессия боя/добычи/save/reload/трёх регионов и интерфейс RU/EN/ES на воине.

Уменьшены портрет и полосы ресурсов; добавлены только действующие временные эффекты с отсчётом. Навыки разделены на активные и существующие автоматические классовые свойства, без новых бонусов или изменения баланса. Пауза содержит восемь квадратных кнопок; мир остановлен во вложенных окнах и после импорта. Смена языка обновляет окна и уже загруженные подписи без перезапуска мира; при возобновлении восстанавливается положение панели цели. Хранилище остаётся только у NPC.

Данные квестов, NPC, география, бой, баланс, дроп, графические ассеты, старые save keys и геометрия боевых кнопок/джойстика не изменены. Физический Android остаётся непроверенным. Следующие пакеты не начинались. Подробности — [TASK_2_STATUS.md](TASK_2_STATUS.md), исходные доказательства — docs/qa.

## Доказательства задания №2

Исходные журналы, их SHA-256 и native provenance сохранены в [qa/task2-verification.json](qa/task2-verification.json), [qa/task2-ci-source.json](qa/task2-ci-source.json), [qa/task2-deployment.json](qa/task2-deployment.json). Публичные сценарии запускаются командой `node tests/browser-public.cjs URL SOURCE_SHA` и `AURALIS_TASK2_CLASSES=warrior node tests/browser-task2-ui.cjs URL`. Полная локальная матрица — `npm run test:browser:task2`; фильтры языка используются CI matrix, фильтр класса в CI не задаётся.

## Историческая проверка задания №1 — интеграция 14 ноября 2026

Проверенный runtime блока №1: `9872f13b19c4be3a681f2389daed4313418df8ed`, ветка `codex/auralis-master-development`, [draft PR #2](https://github.com/gigiloesp-dot/auralis/pull/2). Контрольная версия до задания №1: `1a5ffe35105e5ffa91260fbf89b0d081ad9f7d58`. `main`, stable-alpha, прежняя alpha-публикация и графика выпуска 5 сохранены; merge не выполняется.

**Локально: 255/255 unit PASS, check 194 файла PASS.** Все 12 подземелий на трёх сложностях прошли профильную браузерную проверку. Длительные проверки добычи и streaming завершены успешно: по 60 циклов. Полный пакет сохраняет 15 прежних браузерных suites и добавляет шесть новых — всего 21 suite в семи CI jobs.

**Задание №1 проверено и опубликовано.** [CI 43594992219](https://github.com/gigiloesp-dot/auralis/actions/runs/43594992219) на `ce787351fed4d24653a92d1e65a314c741ee5787`: **7/7 jobs success, все 21 браузерный suite, 255 unit и 194 файла check PASS**. Выпуск **8** доступен по https://auralis-master-test.alertpine18.chatgpt.site. После native success чистый мобильный Chromium без аккаунта подтвердил все 293 runtime SHA-256, реальную атаку, три анонимных предмета на земле, 30-секундный таймер, touch-подбор, reload без дублирования, три региона и три hard-входа. Массовые позиции, HP и RNG явно подготовлены fixtures; естественные прохождения проверяются отдельно. Точные native IDs — [DEPLOYMENT.md](DEPLOYMENT.md). Физическое Android-устройство остаётся непроверенной границей.

Подробные механики, доказательства, измерения streaming и следующий шаг — [TASK_1_STATUS.md](TASK_1_STATUS.md).


## Проверки задания №1 на конечном runtime

| Сценарий | Подтверждённый результат |
|---|---|
| Unit / синтаксис и импорты | 255/255 PASS; 194 файла PASS. Сохранения v1/v2, персистентные визиты/таймеры/агрессия, placement, loot rollback и streaming включены. |
| `browser-task1-dungeons` | Все 36 вариантов; 78 фактических boss-kill обработчиков; reload в трёх minion-сценариях и в завершённом dungeon12 hard. Визит, отдельные часовые cooldown, добровольный портал, обычный выход и защита повторной награды. Массовые победы используют явные damage fixtures. |
| `browser-task1-ai` | Настоящий дальний touch-урон вне detection активирует ограниченную погоню; patrol/пауза, безопасный 30-секундный respawn и возвращение. |
| `browser-ground-loot` | Убийство → три отдельных предмета без auto-inventory → streaming/переход/reload → дальность/full bag → quota rollback → настоящий tap → reload без дублирования. Явные loot fixtures отделены от реального ввода подбора. |
| `browser-monster-stream` | Нулевые пропуски видимых объектов на трёх размерах; удержание активного боя, сохранённые позиции и ограниченные residency/edge churn. Полный замер — TASK_1_STATUS. |
| `browser-multitouch` | Четыре мобильных размера; 16 реальных применений навыков с удержанным joystick, три пальца joystick/атака/зелье, cooldown, cancel, portrait, landscape 180°, blur/visibility. Жизненный цикл эмулирован, физический Android не использован. |
| `browser-loot-soak`, длинный прогон | 60 циклов / 180 регионов / 360 позиций, 607 секунд PASS. Все 54 предмета сохранены; markers/input 18 рядом и 0 вдали. Children 443, fixed 257, textures 81 → 77, DOM 137, scratch 0; post-GC heap 12 045 424 → 12 785 796 bytes. |
| Прежний `browser-soak`, длинный прогон | 60 циклов / 180 входов-выходов dungeon, 256 секунд PASS. Children 425, textures 77, DOM 137, monsters 42, scratch 0. Mean headless frame 146.89 ms, p95 218.50 ms под нагрузкой среды; это не Android FPS. |
| Естественная `browser-journey` | 70 секунд PASS: пять реальных убийств, два задания, заработанные очки, два touch-подбора, покупка и reload без runtime-state writes. Отдельный профильный loot-suite подтверждает три выпавших предмета и один ручной подбор. |
| Естественный `browser-first-dungeon` | **339 секунд PASS** с конечным драйвером: заработанный уровень 5, все 18 обычных врагов и босс, пеший выход, reload; итог уровень 7 / XP 1 / золото 474. Нет state writes, fixture-урона или телепортов. |
| Повторный `browser-bestiary` | PASS всех механизмов и flight collision после изоляции fixture ID по виду. Проверки способностей не ослаблены. |

Журналы: `work/task1-unit-frozen.log`, `work/task1-check-frozen.log`, `work/browser/task1-loot-soak-frozen-60.log`, `work/browser/task1-stream-soak-frozen-60.log`, `work/browser/task1-bestiary-final.log`, `work/browser/task1-journey-final.log`, `work/browser/task1-first-dungeon-frame-pulse.log`, `work/browser/task1-journey-frame-pulse.log`, `work/browser/task1-public-release8-verified.log`. Локальные журналы в `work/` не являются опубликованными CI-артефактами. Их контрольные суммы и конечные результаты сохранены в [qa/task1-local-verification.json](qa/task1-local-verification.json). Для повторения длинных прогонов: `AURALIS_LOOT_SOAK_CYCLES=60 node tests/browser-loot-soak.cjs` и `AURALIS_SOAK_CYCLES=60 node tests/browser-soak.cjs`. First-dungeon с последним драйвером и общий CI 43594992219 PASS.

## Публичная проверка выпуска 8

`node tests/browser-public.cjs https://auralis-master-test.alertpine18.chatgpt.site ce787351fed4d24653a92d1e65a314c741ee5787` — **PASS**. Чистый Chromium с мобильным Android user agent, без аккаунта. Все 293 runtime-файла совпали с Git SHA-256. Нейтральный герой и пять жителей реально загрузились; настоящий touch-удар обновляет HP; следующий удар создаёт три анонимных ground drops без auto-inventory. Проверены 30-секундный таймер, настоящий подбор одного предмета и reload: один предмет в сумке, два на земле, повторного получения нет. Затем проверены три карты 12000/14000/15000, 94/85/75 лагерей, 895/805/715 обычных врагов и три hard dungeon-входа. JavaScript errors отсутствуют.

Массовые HP/позиции и loot RNG — явные fixtures. RNG фиксируется только внутри loot-модуля: глобальный постоянный RNG нарушал уникальность служебных Phaser texture IDs в первоначальном тесте. Исправлен проверочный сценарий, игровые файлы не менялись. Итоговый полный журнал и его SHA-256 сохранены в docs/qa. Естественные сценарии выше обходятся без записи состояния и fixture-урона.

Дополнительная проверка синхронизации памяти: старый soak снимал число текстур через два кадра после перехода, до завершения всех скачиваний. В CI 43597035457 последний снимок попал на 94 временно загружаемые текстуры при обычных 81. Тест теперь ждёт idle загрузчика и actorPending=0, затем строго сверяет все atlas keys и точные refcounts с живыми владельцами и отсутствие orphan textures. Прежние пределы children/textures/DOM/heap не изменены. Усиленный локальный прогон — **7 циклов / 21 dungeon вход-выход за 42 секунды PASS**: во всех циклах ровно 81 текстура, children 425, DOM 137, scratch 0. Runtime и опубликованный выпуск не менялись; исходные длинные 60-cycle проверки сохраняются как отдельные результаты.

## Историческая проверенная доставка: выпуск 5

Обновлено 13 ноября 2026. Проверенный и опубликованный игровой source: `77a1e7bfad861a008af458884fadc70fe60fa871`, ветка `codex/auralis-master-development`. Последующие изменения отчётов не меняют игровые файлы. [CI 43488997535](https://github.com/gigiloesp-dot/auralis/actions/runs/43488997535): **6/6 jobs success**. [Draft PR #2](https://github.com/gigiloesp-dot/auralis/pull/2) не объединён.

## Автоматические проверки

`npm run check`: **176 файлов PASS**. `npm test`: **217/217 PASS**. Все **15 браузерных suites**, распределённые между пятью CI jobs, успешно прошли. Отдельная проверка публичной версии выполнена после публикации.

| Проверка | Фактический результат и граница |
|---|---|
| Unit | Сохранения v1/v2, storage journal, экономика, экипировка, навыки, бой/AI, уровни 1–42, мир/дороги/streaming, задания и dungeon. Все 24 сохранённых PNG/JSON совпадают с контрольными суммами; отдельные слоты очищаются после unequip и не меняют героя. |
| `browser-smoke` | Бой, смерть, XP/характеристики/навык, предметы/зелья, NPC/торговля/storage, save/reload/экспорт/импорт, пауза/portrait и мобильные размеры. Сетевой CDN заблокирован: Phaser запускается локально. |
| `browser-world` | Реальные 3 карты / 254 лагеря / 1145 обычных spawn / 18 открытых боссов / 7 поселений / 21 NPC, свободные spawn, коллизии/дороги, углы мира, переходы/arena/reload. Подготовка позиций и уровней обозначена как fixtures. |
| `browser-npcs` | Все 21 настоящие NPC-взаимодействия и услуги. |
| `browser-quests` | Все 104 задания: accept/claim, реальные обработчики kill/talk/explore/collect/dungeon, зависимости, расход ресурсов, однократная награда. Уровни, позиции и ресурсы подготовлены fixtures. |
| `browser-dungeons` | Все 36 вариантов 12 подземелий: входы/уровневые ворота/комнаты/награды/выход/reload/смерть и возврат. Массовые победы используют явные hit fixtures. |
| `browser-locales` | EN/ES меню, классы, HUD, панели, предметы, NPC и dungeon; язык сохраняется. Отсутствие кириллицы не заменяет редакторскую вычитку. |
| `browser-classes` | Шесть настоящих созданий героя с neutral body и все 30 HUD-навыков с расходом MP/cooldown/эффектами. Боевые уровни и мишени подготовлены fixtures. |
| `browser-soak` | Настоящие два пальца CDP: движение и урон одновременно, корректный сброс pointer ID. Региональные переходы и входы/выходы dungeon ограничивают объекты, текстуры, DOM и служебные ссылки. Дополнительный длинный прогон описан ниже. |
| `browser-journey` | Начало новым воином без записей состояния: пять настоящих убийств, два задания, заработанный третий уровень, характеристики/навык/покупка/save/reload. |
| `browser-first-dungeon` | **343 секунды в CI**, новый воин → заработанный 5-й уровень и покупки → все 18 обычных врагов и босс → пеший выход → reload. Нет записи runtime-состояния, fixture урона, XP или телепортов. Итог: уровень 7, XP 12, золото 499; completed/rewarded и часовой таймер сохранены. |
| `browser-android-combat` | Настоящие атака/навык/ручная цель, HP/recovery/death/region/dungeon, четыре размера. Бой под настоящей кроной доступен без раскрытия скрытых HP. Target timeout продолжает идти в открытом меню. |
| `browser-mobile-panels` | 844×390, 640×360, 740×320, 915×412: реальные buy/sell/storage, различимые иконки/редкость/цены/уровни/классы/количество, длинные названия, scroll, 44px-действия, одна ближайшая подсказка и доступное меню. |
| `browser-bestiary` | Разные механизмы наземных/летающих, рывков, яда, slow, тяжёлых и магических врагов; полёт учитывает высокие препятствия и закрытые комнаты. |
| `browser-actors` | Все 6 героев / 23 вида / 21 NPC, фактические PNG на игровых объектах, восемь направлений/шаги/атака/hurt/сокеты. Все допустимые слоты показываются и очищаются. У каждого героя нет gear в 48 сочетаниях состояния/направления; legacy hero texture не загружается. Точные key/refcount leases и выгрузка NPC-паков проверены. |
| `browser-boss-art` | Все **44 уникальные boss entities**, 32 кадра каждой, SHA-256 декодированных пикселей против PNG, масштаб/hurt/death/socket и освобождение после каждой встречи. |
| `browser-public` — после CI | **287 runtime SHA-256** совпали с опубликованным source. Без аккаунта загружены neutral warrior без gear и пять жителей; настоящая touch-атака повредила painted wolf и обновила target HUD. Создание героя, touch, задание, save/reload, три региона и hard-вход dungeon каждого прошли без JS-ошибок. Последние проверки регионов используют явные position/level fixtures. |

## Длительная проверка новых слоёв

`AURALIS_SOAK_CYCLES=60 node tests/browser-soak.cjs`: **60 циклов / 180 входов-выходов PASS, 289 секунд** после подключения новых баз и отдельных слоёв. Объекты — 279, DOM — 137, scratch references — 0 во всех 60 снимках. Текстуры — 41 в итоговом снимке; в одном промежуточном снимке 51, в следующем снова 41. Постоянного накопления не наблюдалось. Post-GC heap: примерно 10.00 → 10.46 MiB, пик 11.15 MiB.

Программный Chromium: mean 57.84 ms, p95 85.10 ms. Это не измерение Android FPS, GPU-памяти, нагрева или устойчивости после сна. Короткая или длительная автоматическая проверка не доказывает отсутствие любой возможной утечки.

## Исправленные причины CI

- В workflow используется уже установленный runner Chrome; `playwright install --with-deps` и зависимость от apt отсутствуют.
- `43426205296`: раннее чтение EN/ES до готовности home. Тест теперь ждёт настоящее локализованное меню; прежние проверки всего body сохранены.
- `43428805025`: короткие CDP-пульсы полного стика перескакивали допуск 18px возле NPC. В `d93619b` добавлен удерживаемый палец с RAF-обратной связью; допуск, реальные 18 смертей и запрет записей состояния сохранены.
- `43488379177`: пять jobs прошли; smoke читал rotate-hint до доставки resize после CDP viewport acknowledgement. `77a1e7b` ждёт фактическую видимость/скрытие перед прежними assertions. Исправленный полный локальный smoke и общий CI прошли.

## Публикация и сохранность

Master-test: https://auralis-master-test.alertpine18.chatgpt.site — **выпуск 5**, публичный HTTPS без установки. Точный source и native IDs: [DEPLOYMENT.md](DEPLOYMENT.md). Старая alpha остаётся выпуском 1; main и stable-alpha не изменены. Исторический выпуск 4 (`d5627a9`, 97 runtime SHA) сохранён для отката; его меньшие числа не описывают текущий объём игры.

Шесть новых neutral body PNG/JSON добавлены отдельно. Прежние герои и NPC сохранены byte-identical; [манифест 24 хешей](art/PRESERVED_CHARACTER_ASSETS.json). Активны 79 актёрных PNG, всего сохранено 85. Это четыре нарисованных банка поз и шесть runtime-состояний, не шесть независимых рисованных clips.

## Что не завершено

Модульные нейтральные тела 21 NPC; покадровая калибровка креплений и глубины предметов; независимо нарисованные gear layers и special/hurt/death; ручная оценка всей кампании 1–42 всеми шестью классами; редактура RU/EN/ES; физическая Android-приёмка. Перечень следующих действий: [NEXT_ACTIONS.md](NEXT_ACTIONS.md). Полное выполнение MASTER_SPEC пока не заявляется.
