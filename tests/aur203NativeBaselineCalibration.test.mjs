import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {MONSTER_TYPES,monsterKind} from '../js/monsters/monsters.js';
import {AUR203_SPECIES} from '../js/monsters/aur203Species.js';
import {getRegionContent} from '../js/world/regionContent.js';
// Captured from the real runtime BEFORE the four-instance factory correction.
// Native combat values must remain exact, including fractional defense.
const before={
  "species": {
    "north-species-091": {
      "type": "aur203North091",
      "nativeLevel": 25,
      "baseLevel": 29,
      "stats": {
        "hp": 284,
        "attack": 41,
        "xp": 216,
        "gold": 29,
        "defense": 9.705882352941176,
        "magicDefense": 20,
        "speed": 68
      },
      "kind": {
        "family": "construct",
        "movementProfile": "skirmisher",
        "name": "Ледострунный ходульник",
        "names": {
          "ru": "Ледострунный ходульник",
          "en": "Ice-harp strider",
          "es": "Zancudo arpa de hielo"
        },
        "level": 25,
        "hp": 284,
        "attack": 41,
        "xp": 216,
        "gold": 29,
        "speed": 68,
        "loot": "aur203North091",
        "defense": 9.705882352941176,
        "magicDefense": 20,
        "magic": true,
        "sourceArchetype": "iceElemental",
        "speciesId": "north-species-091",
        "aur203Revision": 1,
        "abilityConfig": {
          "abilityPattern": [
            "blink",
            "frost"
          ],
          "collisionRadius": 16,
          "range": 285,
          "radius": 60,
          "cooldown": 6580,
          "windup": 825,
          "preferredDistance": 175
        },
        "behaviorConfig": {
          "retreat": {
            "triggerRatio": 0.32999999999999996,
            "distance": 100,
            "durationMs": 1350
          }
        },
        "respawnMs": 30000,
        "boss": false,
        "assetSize": 220,
        "visualScale": 1,
        "bossTheme": null,
        "bossType": null
      }
    },
    "ancient-species-056": {
      "type": "aur203Ancient056",
      "nativeLevel": 39,
      "baseLevel": 40,
      "stats": {
        "hp": 420,
        "attack": 65,
        "xp": 352,
        "gold": 45,
        "defense": 13.688888888888888,
        "magicDefense": 31,
        "speed": 63
      },
      "kind": {
        "family": "echinoderm",
        "movementProfile": "elemental",
        "name": "Фумарольный ежовик",
        "names": {
          "ru": "Фумарольный ежовик",
          "en": "Fumarole Urchin",
          "es": "Erizo de fumarola"
        },
        "level": 39,
        "hp": 420,
        "attack": 65,
        "xp": 352,
        "gold": 45,
        "speed": 63,
        "loot": "aur203Ancient056",
        "defense": 13.688888888888888,
        "magicDefense": 31,
        "magic": true,
        "sourceArchetype": "voidElemental",
        "speciesId": "ancient-species-056",
        "aur203Revision": 1,
        "abilityConfig": {
          "abilityPattern": [
            "blink",
            "shot"
          ],
          "collisionRadius": 16,
          "range": 285,
          "radius": 60,
          "cooldown": 6580,
          "windup": 600,
          "preferredDistance": 145,
          "elevation": 34,
          "projectileMagic": true
        },
        "behaviorConfig": {
          "retreat": {
            "triggerRatio": 0.24,
            "distance": 100,
            "durationMs": 1450
          }
        },
        "respawnMs": 30000,
        "boss": false,
        "assetSize": 220,
        "visualScale": 1,
        "bossTheme": null,
        "bossType": null
      }
    },
    "ancient-species-060": {
      "type": "aur203Ancient060",
      "nativeLevel": 36,
      "baseLevel": 37,
      "stats": {
        "hp": 335,
        "attack": 55,
        "xp": 303,
        "gold": 41,
        "defense": 9.761904761904761,
        "magicDefense": 6,
        "speed": 112
      },
      "kind": {
        "family": "reptile",
        "movementProfile": "skirmisher",
        "name": "Семяфонарный геккон",
        "names": {
          "ru": "Семяфонарный геккон",
          "en": "Seedlantern Gecko",
          "es": "Geco de farol semilla"
        },
        "level": 36,
        "hp": 335,
        "attack": 55,
        "xp": 303,
        "gold": 41,
        "speed": 112,
        "loot": "aur203Ancient060",
        "defense": 9.761904761904761,
        "magic": true,
        "sourceArchetype": "arcaneWisp",
        "speciesId": "ancient-species-060",
        "aur203Revision": 1,
        "magicDefense": 6,
        "abilityConfig": {
          "abilityPattern": [
            "shot",
            "roots"
          ],
          "collisionRadius": 12,
          "range": 285,
          "radius": 60,
          "cooldown": 6400,
          "windup": 600,
          "preferredDistance": 145,
          "projectileMagic": false
        },
        "behaviorConfig": {
          "retreat": {
            "triggerRatio": 0.24,
            "distance": 90,
            "durationMs": 1250
          },
          "pack": {
            "radius": 150,
            "maxAllies": 3
          }
        },
        "respawnMs": 30000,
        "boss": false,
        "assetSize": 220,
        "visualScale": 1,
        "bossTheme": null,
        "bossType": null
      }
    },
    "ancient-species-061": {
      "type": "aur203Ancient061",
      "nativeLevel": 37,
      "baseLevel": 38,
      "stats": {
        "hp": 467,
        "attack": 59,
        "xp": 322,
        "gold": 42,
        "defense": 21.488372093023255,
        "magicDefense": 13,
        "speed": 111
      },
      "kind": {
        "family": "bird",
        "movementProfile": "gargoyle",
        "name": "Рогокрылый сыч",
        "names": {
          "ru": "Рогокрылый сыч",
          "en": "Antlerwing Owl",
          "es": "Mochuelo alicornio"
        },
        "level": 37,
        "hp": 467,
        "attack": 59,
        "xp": 322,
        "gold": 42,
        "speed": 111,
        "loot": "aur203Ancient061",
        "defense": 21.488372093023255,
        "sourceArchetype": "ancientGargoyle",
        "speciesId": "ancient-species-061",
        "aur203Revision": 1,
        "magicDefense": 13,
        "abilityConfig": {
          "abilityPattern": [
            "dive",
            "haunt"
          ],
          "collisionRadius": 18,
          "range": 250,
          "radius": 60,
          "cooldown": 6580,
          "windup": 675,
          "elevation": 45
        },
        "behaviorConfig": {
          "retreat": {
            "triggerRatio": 0.27,
            "distance": 100,
            "durationMs": 1350
          }
        },
        "respawnMs": 30000,
        "boss": false,
        "assetSize": 220,
        "visualScale": 1,
        "bossTheme": null,
        "bossType": null
      }
    }
  },
  "unaffectedTypesSHA256": "e77edc83d3a253cf819a58f1140a6cbaf63fec9adfd5e664e7ad45e3cf91b924"
};
const corrected=new Set(Object.values(before.species).map(row=>row.type));

test('four lower-native-level expansion kinds keep exact pre-calibration native stats and identity',()=>{
 for(const [id,saved]of Object.entries(before.species)){
  const row=AUR203_SPECIES[id],base=MONSTER_TYPES[row.type],actual=monsterKind({type:row.type,speciesId:id,level:row.nativeLevel});
  assert.equal(row.nativeLevel,saved.nativeLevel);assert.equal(base.level,saved.nativeLevel);assert.equal(base.sourceArchetype,saved.kind.sourceArchetype);
  assert.deepEqual(Object.fromEntries(Object.keys(saved.stats).map(field=>[field,actual[field]])),saved.stats,id+' native combat values');
  for(const field of ['names','family','loot','movementProfile','abilityConfig','behaviorConfig','respawnMs','boss'])assert.deepEqual(actual[field],saved.kind[field],id+'/'+field);
  assert.deepEqual(actual,saved.kind,id+' complete native kind remains exact');
 }
});

test('all original archetypes, first20 and other60 expansion base types stay byteexact',()=>{
 const unaffected=Object.fromEntries(Object.entries(MONSTER_TYPES).filter(([id])=>!corrected.has(id)));
 assert.equal(createHash('sha256').update(JSON.stringify(unaffected)).digest('hex'),before.unaffectedTypesSHA256);
});

test('every actual outdoor resident is at or above its calibrated ordinary base level',()=>{
 let count=0;
 for(const region of ['forest','north','ancient','desert'])for(const camp of getRegionContent(region).camps)for(const spawn of camp.spawns){
  const base=MONSTER_TYPES[spawn.type];assert.ok(base&&!base.boss);assert.ok(spawn.level>=base.level,spawn.id+' below '+spawn.type+' base');count++;
 }
 assert.equal(count,3751);
});

test('four calibrated baselines use unchanged finite higher-level formulas through56',()=>{
 let cases=0;
 for(const [id,saved]of Object.entries(before.species)){
  const base=MONSTER_TYPES[saved.type];let previousHP=0;
  for(let level=saved.nativeLevel;level<=56;level++){
   const delta=level-base.level,actual=monsterKind({type:saved.type,speciesId:id,level});assert.ok(delta>=0);
   assert.equal(actual.hp,Math.round(base.hp+delta*16+delta*delta*.55));assert.equal(actual.attack,Math.round(base.attack+delta*2));
   assert.equal(actual.xp,Math.round(base.xp+delta*12));assert.equal(actual.gold,Math.round(base.gold+delta));
   assert.equal(actual.defense,base.defense+delta*.8);assert.equal(actual.magicDefense,Math.round(base.magicDefense+delta*.65));
   for(const field of ['hp','attack','xp','gold','speed'])assert.ok(Number.isFinite(actual[field])&&actual[field]>0);
   assert.ok(actual.hp>previousHP);previousHP=actual.hp;cases++;
  }
 }
 assert.equal(cases,91);
});
