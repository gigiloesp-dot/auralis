# Задание №1: текущая интеграция

Обновлено 14 ноября 2026. Ветка `codex/auralis-master-development`, PR #2. **Работа продолжается; новая версия пока не опубликована.** Онлайн остаётся выпуск 5.

Контрольный коммит до изменений: `1a5ffe35105e5ffa91260fbf89b0d081ad9f7d58` (точный рабочий выпуск 5 и отчёты). Прерванные результаты предыдущих агентов сохранены в `7fe9d82`, а затем интегрированы; не начинать их заново.

| Пункт | Реальная интеграция | Доказательство / состояние |
|---|---|---|
| Посещения dungeon | visitId, killedMinions, killedBosses и completionBosses; вечная смерть обычного врага в визите, новый вход сбрасывает только minions | Новые unit всех 36 modes и actual browser 36/36 прошли; итоговый общий CI ещё нужен |
| Боссы / портал | Независимые per-boss hour timers per difficulty; действительная текущая смерть не принимается за старый cooldown. Добровольный glow portal и обычный выход; partial completion через несколько visits корректна | 14 dungeon unit и browser36 modes + реальные reload прошли |
| Агрессия / патрули | Урон вне detection вызывает chase; bounded obstacle detour, возврат, сохранение позиции/угрозы; offline-expired threat возвращается домой. Патруль с остановками и разделением | 25 профильных новых и прежних AI/health/combat unit PASS; actual ranged-touch/patrol/respawn browser PASS |
| 30 секунд | Внешний обычный respawn и старые 11-секундные смерти переходят на 30 секунд, включая expired-death unload/reload; позиции не пересекают героя/препятствия/соседей | Новые runtime unit и browser PASS; мировые boss timers не менялись |
| Добыча | Pure probability rolls; три анонимных вида реальных Graphics, layout без пересечения видимых иконок, ручной touch, 90-world-px радиус. Полный bag и quota rollback сохраняют предмет; death ledger и monotonic IDs предотвращают повтор | 22 профильных loot/item units PASS; actual browser kill→3drops→unload/reload→full→quota→pickup→reload PASS. Pending размещения сохраняются, проверяют полную геометрию, nearby-only retry с бюджетом один job / 2s |
| 254 / 2415 | Ровно +5 в каждом camp; 895 / 805 / 715. Все 23 вида, одна семья в лагере; уровни 1–25 / 22–38 / 35–42. 1144 прежних координаты сохранены, starter wolf3 с тем же ID отодвинут с дороги | Проверки полного размещения и original IDs PASS |
| Stream | Viewport + размер спрайта + hysteresis; minimum radial350/500, padding96/192 projected px, hot-combat pin. Environment stream не менялся | Benchmark: старый500/700 пропускал видимые descriptors; новый — 0 пропусков на3размерах, max54–55 resident из2415. Затраты и рост residency требуют честного отчёта |
| Android | Второй палец не всегда генерирует click: pointerup action + dedupe click/keyboard/accessibility и cleanup. TouchControls сохранён | 4размера, 16 реальных skill casts с удержанным joy, 3пальца attack/potion, cancellation/lifecycle PASS; физического Android нет |

Последняя естественная journey без записей состояния прошла за 63 секунды: пять убийств, настоящий touch-подбор трёх предметов, два задания, характеристики/навык, покупка и reload. Старые assertions сохранены. CDP touchEnd исправлен: перечисляются отпускаемые пальцы, а не удерживаемый joystick.

Новый loot-memory сценарий прошёл 6 циклов /18 регионов/36 позиций: 54 записанных предмета сохраняются, 18 видимых маркеров имеют ровно18 InputPlugin объектов, далеко от них markers/input0. Число постоянных объектов257, общий финальный children443/textures81/DOM137, scratch0. Нужен длинный прогон, старый soak и итоговые проверки.

## Следующее обязательное действие

1. `npm test` **253/253 PASS**, `check` **194 файла PASS**. Дождаться естественного first-dungeon, исправить настоящие регрессии без ослабления проверок. Старые unit, ожидавшие auto-inventory loot и1145/11sec/5min, приведены к явно изменённым требованиям, а новые tests проверяют более строгую транзакционность/точные2415/visits.
2. Запустить все прежние браузерные группы, новые шесть task1 suites и длинные проверки streaming/loot памяти. Package/CI сохраняют все15 прежних suites и добавляют6: всего21, CI7jobs.
3. После успешной интеграции — рабочие коммиты, push только рабочей ветки, зелёный CI, update PR #2, затем новый выпуск того же master-test. Проверить публичный build.json, все runtime SHA-256, реальные новые механики. Alpha/main/stable-alpha не трогать.
4. Обновить IMPLEMENTATION_STATUS, TEST_RESULTS, NEXT_ACTIONS и DEPLOYMENT точными результатами и source SHA. Графика персонажей/сюжет/90 навыков не входят в этот блок.
