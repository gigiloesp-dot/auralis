# MASTER_SPEC: реализация и границы доказательств

Обновлено2026-11-13, ветка`codex/auralis-master-development`, [PR#2](https://github.com/gigiloesp-dot/auralis/pull/2). Эта таблица заменяет старый snapshot7d32be2; старые утверждения о пустом финальном manifest/отсутствии моделей больше не актуальны. Точные sourceSHA/CI/публикация — в [TEST_RESULTS](TEST_RESULTS.md) и [NEXT_ACTIONS](NEXT_ACTIONS.md).

| Раздел ТЗ | Реализация | Доказательство и практическая граница |
|---|---|---|
| §0. Правила | Отдельная ветка,main/alpha неизменны,merge не выполнялся; контрольные коммиты и исходное ТЗ сохранены | Git checkpoint0ee0e08 передAndroid,9d8ea88 для18восстановленныхфайлов,952f26e дляточногоТЗ; текущаяисторияPR#2 |
| §1. Основа | Phaser3.90 локально/MIT, модульные world/combat/UI/save системы, независимые touchpointer IDs | `check`,unit,smoke/soak; software headless измерения не являются Android60FPS |
| §2. Мир | Три реальные карты12000²/14000²/15000²,512chunks,load500/unload700,переходы,iso projection,minimap/карта,естественные дороги | `browser-world` посещает всеcamps/boss/NPC и дороги; `roadPaths` сохраняет каждую исходную encounter-coordinate |
| §3. Монстры | 254лагеря/1145обычных;23вида с собственными PNG и реальными ground/flight/charge/venom/slow/blink/heavy механизмами | `browser-world` считает actualspawn; `browser-bestiary` проверяетэффекты/полёт/стены; `browser-actors` загружаеткаждый вид |
| §4. Открытые боссы | 12мини+6мировых,18своих моделей/имён/типов/особыхатак,телеграфы/награды/таймеры | `browser-world` actualdamage/reward/timer; `browser-boss-art` декодированныйPNG/32кадра/hurt/death/освобождение |
| §5. Поселения/NPC | 7поселений/21житель;merchant/quest/storage/resident/specialmerchant,одна ближайшаяподсказка;168направленныхрисунков | `browser-npcs`21услуга; `browser-actors` все21модель/8направлений/удалениеfallback; mobileпроверяетhide/nearest/range |
| §6. Классы | Все6классов/5навыковкаждому;свои тела/оружие/силуэты,короткийгном-канонир | `browser-classes`6реальныхсозданий/30HUDкастов; `browser-actors`8направлений/разныеPNG/экипировка |
| §7. Развитие | XP1–42,+3атрибута/+1навык,полныеHP/MPзаподъём,пятьхарактеристик/предел42 | unit/progression/attributes/balance; no-fixture first-dungeonзарабатывает7уровень; полного шестикратногоручногозабега1–42 нет |
| §8. Бой | AttackCycle/combo/крит/doublehit/защита/снаряды/статусы/возврат40%;видимостьHPотделенаотфизическогоLOS | combat/classEffects/health/geometrytests; realCDPбойподкронойвAndroidsuite;живое лечение5с/10%неявляетсяrespawn |
| §9. Навыки | 30исполняемыхeffects,ранги/MP/cooldown/4слота,деревопрокрутки/выбор/улучшение | unit/runtime и30реальныхHUDкастов; нетпустыхкнопок |
| §10. Предметы/торговля | 9слотов,уровни/классы/редкости,inventory60,storage100,стак100,транзакции/rollback,обычные≤rare/отдельныеlegendary | unit/stacking/trading/storage иrealmobilebuy/sell/storage; всеallowedgearслоивизуальноменяются/очищаются, слоипроцедурные |
| §11. Подземелья | 12внутреннихкарт×3сложности1/1.2/1.3,26своихbossмоделей,связанные комнаты/gates/награды/выход/смерть/cooldown1ч;minions5мин | `browser-dungeons`36вариантовсfixtureурона; отдельнострогоеестественноепрохождениепервойпещеры408sсо18убийствами/boss/exit/reload |
| §12. Задания | 104разныхID/7типов,цепочки/уровни/NPC/liveevents/tracker/rewards/защита повторов | `browser-quests`104выполнениячерезNPCcallback+событиясfixtures; первые2заданияижизненныйпутьfirst-dungeonбеззаписисостояния |
| §13. UI | MobileHUD/targetHP/инвентарь/сравнение/торговля/skills/quests/dialogues/storage/scroll/44pxactions/ближайшийNPC | mobile4размера844×390/640×360/740×320/915×412,smoke,Androidcombat;физическиеsafeareas/жестытребуюттелефона |
| §14. Графика | 79actorPNG:6героев+23вида+6NPCпаков+44босса;8facings/4paintedбанка/6runtimeсостояний;деревья/домасохранены | 2504используемыхнарисованныхкадра; pixelalpha/seamQA, actualGPUobjects/точныеpixels/leasechecks. Special/hurt/death дополняютсяruntime-трансформациями;финальнуюпокадровуюдоводку/рисованныеgear ещёможноулучшать |
| §15. Локализация | RU/EN/ES во всехсистемах,языксохраняется;readyhomeпроверяетсяпослеинициализации | localizationunit/полныйENESbrowser;автосканыперевода не заменяютредакторскуювычитку |
| §16. Сохранения | 3слота,v1/v2совместимость/backup/JSONexport/import/важныесобытия/5сautosave/pagehide,долговременныеworld/quest/dungeon/cooldowns | save/storage/progressState/smoke/world/dungeon/reload;наличиелокальногосохранениянеявляетсяоблачнымbackup илигарантиейприудаленииданныхбраузера |
| §17. QA | 210unit/check/15browser suites,6CIjobs/артефакты,отдельныйпубличныйsmoke/sourcehash |60cycle/180dungeonsoak340sстабилен279objects/41textures/137DOM/scratch0;физические15–30мин/FPS/нагрев/сонещёнеизмерены |
| §18. Этапы | A–H функциональноинтегрированы;Iавтоматическипроверяется,физическая/редакторскаяприёмкаоткрыта | СистемыисполняютсявWorldScene/Runtime,неявляютсятолькоописаниями/каталогами;полнаясубъективнаяоценкаfinalartнеподменяетсясчётчикомPNG |
| §19. Автономнаяработа | Результатыагентовобъединены,каждыйкрупныйрезультатсохранёнвGit,документыобновляются | MAIN_SPEC/status/next/test/asset/traceability;откатныекоммитыбезmerge/mainchanges |
| §20. Доставка | Отдельныйпубличныйmaster-test,PR#2draft; alpha-test/mainсохранены | Публиковатьтолькопослеуспешныхпроверок;browser-publicсверяеткаждыйruntimeSHA256/actualhero/NPC/wolf/target/touch/save/regions/dungeons. Актуальныйрезультатдоставкисм.TEST_RESULTS |

Наличие79PNG не означаетшестьнезависимонарисованныхclipsдлякаждойсущности. Автоматическиеfixturesявноотмечены; неизмеренныйAndroidFPS,непройденнаявручнуюкампанияи редакторскоекачествонельзяобъявлятьпроверенными.
