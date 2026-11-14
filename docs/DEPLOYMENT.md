# Проверенная публикация Auralis

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
