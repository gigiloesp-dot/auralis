# Проверенная публикация Auralis

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
