// Prepared additive materials for the first20 original AUR-203 species.
// Registration/drop integration is intentionally owned by the runtime stage.
// No new prices, crafting recipes, equipment or probability rules live here.
const material=(name,en,es,level,icon)=>Object.freeze({
 name,names:Object.freeze({ru:name,en,es}),slot:null,level,saleValue:0,
 monsterMaterial:true,aur203Material:true,
 iconURL:`assets/icons/monster-materials/aur203-${icon}.png`
});
export const AUR203_MATERIALS=Object.freeze({
 chestnutCrabChitin:material('Хитин каштанового краба','Chestnut crab chitin','Quitina de cangrejo castaño',1,'chestnut-crab-chitin'),
 reedHeronFeather:material('Перо тростниковой цапли','Reed heron feather','Pluma de garza de los juncos',1,'reed-heron-feather'),
 lanternSnailMucus:material('Слизь улитки-фонаря','Lantern snail mucus','Baba de caracol farol',1,'lantern-snail-mucus'),
 acornHopperAntenna:material('Усик желудёвого прыгуна','Acorn hopper antenna','Antena de saltador bellota',1,'acorn-hopper-antenna'),
 sundewResin:material('Смола живой росянки','Living sundew resin','Resina de drosera viviente',1,'sundew-resin'),
 mossToadMembrane:material('Перепонка моховой жабы','Moss toad membrane','Membrana de sapo musgoso',1,'moss-toad-membrane'),
 amberDragonflyWing:material('Крыло янтарной стрекозы','Amber dragonfly wing','Ala de libélula de ámbar',1,'amber-dragonfly-wing'),
 fernNewtScale:material('Чешуя папоротникового тритона','Fern newt scale','Escama de tritón helecho',1,'fern-newt-scale'),
 rimeWalrusTusk:material('Бивень инеистого моржа','Rime walrus tusk','Colmillo de morsa de escarcha',22,'rime-walrus-tusk'),
 powderMuskoxWool:material('Шерсть снежного овцебыка','Powder muskox wool','Lana de buey almizclero nevado',22,'powder-muskox-wool'),
 obsidianCentipedePlate:material('Пластина обсидиановой сколопендры','Obsidian centipede plate','Placa de escolopendra de obsidiana',22,'obsidian-centipede-plate'),
 crystalJellyPearl:material('Жемчужина ледяной медузы','Crystal jelly pearl','Perla de medusa de cristal',22,'crystal-jelly-pearl'),
 porcelainBellShard:material('Осколок фарфорового колоколохода','Porcelain bell walker shard','Fragmento de caminante campana de porcelana',35,'porcelain-bell-shard'),
 mossAxolotlFrill:material('Жаберная веточка мохового аксолотля','Moss axolotl gill frill','Branquia de ajolote musgoso',35,'moss-axolotl-frill'),
 prismCuttleInk:material('Чернила призматической каракатицы','Prism cuttlefish ink','Tinta de sepia prismática',35,'prism-cuttle-ink'),
 scrollTripodParchment:material('Пергамент свиткоткача','Scroll weaver parchment','Pergamino de tejedor de rollos',35,'scroll-tripod-parchment'),
 sandstoneTrilobiteShell:material('Панцирь песчаникового трилобита','Sandstone trilobite shell','Caparazón de trilobites de arenisca',42,'sandstone-trilobite-shell'),
 glassJerboaWhisker:material('Ус стеклопарусного тушканчика','Glass-sail jerboa whisker','Bigote de jerbo de vela de cristal',42,'glass-jerboa-whisker'),
 pitcherCactusNeedle:material('Игла кувшиноцветного кактуса','Pitcher cactus needle','Espina de cactus jarra',42,'pitcher-cactus-needle'),
 duneSailrayFin:material('Плавник дюнного ската','Dune sailray fin','Aleta de raya de las dunas',42,'dune-sailray-fin')
});
export const AUR203_MATERIAL_BY_LOOT=Object.freeze({
 aur203ChestnutCrab:'chestnutCrabChitin',aur203ReedHeron:'reedHeronFeather',
 aur203LanternSnail:'lanternSnailMucus',aur203AcornHopper:'acornHopperAntenna',
 aur203Sundew:'sundewResin',aur203MossToad:'mossToadMembrane',
 aur203AmberDragonfly:'amberDragonflyWing',aur203FernNewt:'fernNewtScale',
 aur203RimeWalrus:'rimeWalrusTusk',aur203PowderMuskox:'powderMuskoxWool',
 aur203ObsidianCentipede:'obsidianCentipedePlate',aur203CrystalJelly:'crystalJellyPearl',
 aur203PorcelainBellWalker:'porcelainBellShard',aur203MossAxolotl:'mossAxolotlFrill',
 aur203PrismCuttlefish:'prismCuttleInk',aur203ScrollTripod:'scrollTripodParchment',
 aur203SandstoneTrilobite:'sandstoneTrilobiteShell',aur203GlassJerboa:'glassJerboaWhisker',
 aur203PitcherCactus:'pitcherCactusNeedle',aur203DuneSailray:'duneSailrayFin'
});
