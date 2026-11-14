# Проверенная публикация Auralis

## Текущая публикация: средневековый интерфейс

Выпуск **15**: https://auralis-master-test.alertpine18.chatgpt.site. Source `b5ac2e939b70485b9516e66617637b6189a4b360`, [CI 43611818625](https://github.com/gigiloesp-dot/auralis/actions/runs/43611818625) — **10/10 jobs success: 262 unit, 204 check, 23 браузерных suites**, включая 18 сочетаний классов и языков. Контрольная точка до оформления — `756ed8ffaa7974d6ce5efd9cd94f90e642cd0049`.

Hosting source `17f776da62f83792b912d5110e8b8be4de5015e3`; native saved version `appgprj_6af567346ebc8191accf1485254403da~appgver_ab7820da56d48191852360ff298eb488`; deployment `appgdep_6af883d2feb481919bb21af4634de0ae`. Публикация выполнена только в прежний публичный master-test. Версии 13 и 14 были сохранёнными кандидатами и не публиковались; предыдущая опубликованная версия — 12. Старую alpha version1 не меняли. Сохранения в браузере не переносились и не сбрасывались.

Доказательства: [MEDIEVAL_UI_STATUS.md](MEDIEVAL_UI_STATUS.md), [qa/medieval-ci-source.json](qa/medieval-ci-source.json), [qa/medieval-deployment.json](qa/medieval-deployment.json), [qa/medieval-verification.json](qa/medieval-verification.json).

## Задание №2 — выпуск 12, 14 ноября 2026

Адрес: https://auralis-master-test.alertpine18.chatgpt.site

| Поле | Значение |
|---|---|
| Sites / audience / status | 12, public, native deployment succeeded |
| Игровой source | `468499ffbbdc4038fe1d71044af01b7afdb21fe6` |
| CI source | [CI 43607069281](https://github.com/gigiloesp-dot/auralis/actions/runs/43607069281): 10/10 jobs, 262 unit, check 202, 22 suites |
| Project | `appgprj_6af567346ebc8191accf1485254403da` |
| Hosting source | `bf3173f21d533a5d892e7bb6bc09a7c427dcb5d5` |
| Saved version ID | `appgprj_6af567346ebc8191accf1485254403da~appgver_19b67263bb088191ad199ac6431ae11c` |
| Deployment ID | `appgdep_6af876fadc188191b9200fd7c082bacd` |
| Native timestamp | `2026-11-14T14:58:19.598597+00:00` |
| Archive | `sha256:fa61f8000d61f85f6f602a30c90ec054e83e3ebde9244411fd4194bcb3d34d8b`, 320 files |
| Rollback до задания №2 | `0ec6306aff4c51974f34ab2639f9b083aaae87ff`; публикация 8 сохранена ниже |

После native success чистый Chromium без аккаунта проверил все **300 runtime SHA-256**, реальные touch-атаку/добычу/подбор/reload, три региона и три hard dungeon-входа. Новый интерфейс отдельно прошёл по HTTPS на RU/EN/ES (воин): четыре размера, Active/Passive, назначения, эффекты, восемь разделов паузы, локализация подписей мира, quota failure и импорт в паузе. Полная матрица шести классов проверена в CI. Журналы и native provenance — docs/qa/task2-*.

Выпуск 9 был первой опубликованной версией задания №2. Подготовительные 10/11 сохранялись без deployment; они не являются текущей игрой. 12 включает окончательные touch targets настроек, перевод загруженных подписей и восстановление HUD после паузы. Источник отправлен только в существующий hosting project; audience, alpha и GitHub protected refs сохранены. Физического Android нет.

## Задание №1 — выпуск 8, 14 ноября 2026

Адрес: https://auralis-master-test.alertpine18.chatgpt.site

| Поле | Значение |
|---|---|
| Выпуск Sites | 8, public, native deployment succeeded |
| GitHub игровой source | `ce787351fed4d24653a92d1e65a314c741ee5787` |
| Рабочая ветка / PR | `codex/auralis-master-development`, [draft PR #2](https://github.com/gigiloesp-dot/auralis/pull/2), без merge |
| Проверки source | [CI 43594992219](https://github.com/gigiloesp-dot/auralis/actions/runs/43594992219): 7/7 jobs success, 255 unit, 194 check, все 21 browser suites |
| Sites project | `appgprj_6af567346ebc8191accf1485254403da` |
| Hosting source | `acc07740de97b6c67e47d89ca8caef20078728bb` |
| Saved version ID | `appgprj_6af567346ebc8191accf1485254403da~appgver_51d8a68ab3308191b9e2d8b93652afde` |
| Deployment ID | `appgdep_6af855d4b0ac8191ba8aa70045c0a27c` |
| Native deployment timestamp | `2026-11-14T12:36:53.455972+00:00` |
| Archive receipt | `sha256:6f4ea246857f0fa55f603d7ec95cfbb91eae32283e8abcb4c839f34ff8aabef7`, 313 files |
| Контрольная версия до задания №1 | `1a5ffe35105e5ffa91260fbf89b0d081ad9f7d58`; опубликованный выпуск 5 также сохранён в истории Sites |

Экспорт получен из точного committed source через `scripts/export-static.mjs`, затем отправлен только в hosting source существующего master-test. Manifest project_id и public audience сохранены. Версии 6/7 были промежуточными сохранёнными пакетами и не публиковались; публичный адрес переведён непосредственно с выпуска 5 на 8. Игровые файлы после runtime-коммита `9872f13` не менялись; последующие коммиты исправляют тестовые драйверы и документацию.

Публичная браузерная проверка после native success — **PASS**: без аккаунта, все **293 runtime SHA-256**, создание героя, touch-атака и target HP, три анонимных ground drops, 30-секундный таймер, настоящий подбор и reload без дублирования, три региона с 2415 обычными врагами и три hard dungeon-входа. Позиции/HP/loot RNG массовой части подготовлены явными fixtures. Итоговый журнал — `docs/qa/task1-public-release8-verified.log`; детали и границы — TEST_RESULTS. После доставки alpha осталась version 1, GitHub main и stable-alpha сохранили прежние SHA.

Физического Android-устройства нет. Проверки телефона используют Chromium, мобильные размеры и настоящий CDP multi-touch; это не подтверждение FPS, нагрева или реальных системных жестов Android.

## Историческая публикация: выпуск 5

Дата: 13 ноября 2026. Адрес: https://auralis-master-test.alertpine18.chatgpt.site

| Поле | Значение |
|---|---|
| Выпуск Sites | 5, public, deployment succeeded |
| GitHub runtime source | `77a1e7bfad861a008af458884fadc70fe60fa871` |
| Рабочая ветка | `codex/auralis-master-development` |
| Проверки source | [CI 43488997535](https://github.com/gigiloesp-dot/auralis/actions/runs/43488997535): 6/6 jobs, 217 unit, 176 check, 15 browser suites |
| Sites project | `appgprj_6af567346ebc8191accf1485254403da` |
| Hosting source | `acf3a149dd4613908207e1bde3ebe5fe05e4f2c0` |
| Saved version ID | `appgprj_6af567346ebc8191accf1485254403da~appgver_52f4941ac98881919b071a043a48d3ef` |
| Deployment ID | `appgdep_6af7614aa15c81919df2e7260b6d4db2` |
| Native deployment timestamp | `2026-11-13T19:14:05.201079+00:00` |
| Archive receipt | `sha256:5f6b0d893736a470e4985077a23a50dd6aa69bf1bed410a9e7ff2f3d63bea4c1`, 307 files |

Экспорт выполнен из committed source через `scripts/export-static.mjs`; `/build.json` содержит этот source. Финальный hosting commit включает ровно manifest и экспортированную игру. Ограничение Git hosting — 64 MiB на один push: большой первый пакет успешно отправлен пятью отдельными source-коммитами до save/deploy. Промежуточные commits не публиковались. На повторную передачу одного пакета 171 MiB не рассчитывать.

После native success чистый Chromium с мобильным Android user agent проверил HTTPS без аккаунта: **287 runtime-файлов** совпали с Git SHA-256, neutral hero и пять разных NPC действительно загрузились; touch, quest/save/reload, painted wolf/target HP, три региона и три hard dungeon-входа работают. Пропущены только неисполняемые Markdown-файлы. Позиции/уровни последней массовой части явно подготовлены fixtures.

До и после доставки старая alpha `https://auralis-alpha-test.alertpine18.chatgpt.site` осталась Sites version 1. GitHub main остался `274e79d37250a31232d5c2cdca94ff1d85dd00d9`, stable-alpha — `536e776c8ea65a6948889ed7b917fad7996ae87f`. PR #2 остаётся draft и не объединён.

Для следующей доставки сохранять этот project_id и public audience. Экспортировать новый проверенный commit в пустую папку, обновлять только master-test manifest/dist, перед save удостовериться в pushed hosting HEAD и соответствии archive. После deploy выполнить `node tests/browser-public.cjs URL exact-source-SHA`. Старый alpha и пользовательские localStorage не менять. Выпуск 4 доступен в истории Sites для отката.
