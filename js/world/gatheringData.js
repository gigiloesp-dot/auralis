// Authored from actual walkable roadside approaches. Stable IDs/XY do not
// change any existing world object. Ten-minute regrowth is a provisional
// gathering-only parameter, independent of ordinary monster respawn.
export const GATHERING_RESPAWN_MS=600000;
export const GATHERING_RANGE=85;
export const GATHERING_FOOTLINES=Object.freeze({"forestMoonflower":219,"northFrostHerb":207,"ancientStarBloom":220,"desertSunleaf":209});
export const GATHERING_ART=Object.freeze({key:"gathering-plants",url:"assets/world/gathering/plants.png",atlasURL:"assets/world/gathering/plants.json",frameSize:256,footlines:GATHERING_FOOTLINES});
const freeze=value=>{if(value&&typeof value==="object"){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
export const GATHERING_NODES=freeze([
  {
    "id": "gather-forest-00",
    "region": "forest",
    "materialId": "forestMoonflower",
    "x": 1932,
    "y": 2245,
    "roadId": "forest-road-1",
    "approach": {
      "x": 2036,
      "y": 2144
    },
    "climate": "woodland"
  },
  {
    "id": "gather-forest-01",
    "region": "forest",
    "materialId": "forestMoonflower",
    "x": 2412,
    "y": 2302,
    "roadId": "forest-road-1",
    "approach": {
      "x": 2318,
      "y": 2413
    },
    "climate": "woodland"
  },
  {
    "id": "gather-forest-02",
    "region": "forest",
    "materialId": "forestMoonflower",
    "x": 2575,
    "y": 2731,
    "roadId": "forest-road-1",
    "approach": {
      "x": 2629,
      "y": 2653
    },
    "climate": "woodland"
  },
  {
    "id": "gather-forest-03",
    "region": "forest",
    "materialId": "forestMoonflower",
    "x": 3027,
    "y": 2764,
    "roadId": "forest-road-1",
    "approach": {
      "x": 2938,
      "y": 2879
    },
    "climate": "woodland"
  },
  {
    "id": "gather-forest-04",
    "region": "forest",
    "materialId": "forestMoonflower",
    "x": 3086,
    "y": 3225,
    "roadId": "forest-road-1",
    "approach": {
      "x": 3195,
      "y": 3129
    },
    "climate": "woodland"
  },
  {
    "id": "gather-forest-05",
    "region": "forest",
    "materialId": "forestMoonflower",
    "x": 3529,
    "y": 3305,
    "roadId": "forest-road-1",
    "approach": {
      "x": 3418,
      "y": 3397
    },
    "climate": "woodland"
  },
  {
    "id": "gather-forest-06",
    "region": "forest",
    "materialId": "forestMoonflower",
    "x": 3541,
    "y": 3758,
    "roadId": "forest-road-1",
    "approach": {
      "x": 3647,
      "y": 3660
    },
    "climate": "woodland"
  },
  {
    "id": "gather-forest-07",
    "region": "forest",
    "materialId": "forestMoonflower",
    "x": 3994,
    "y": 3800,
    "roadId": "forest-road-1",
    "approach": {
      "x": 3893,
      "y": 3904
    },
    "climate": "woodland"
  },
  {
    "id": "gather-north-00",
    "region": "north",
    "materialId": "northFrostHerb",
    "x": 1589,
    "y": 1991,
    "roadId": "north-road-1",
    "approach": {
      "x": 1641,
      "y": 1937
    },
    "climate": "snow"
  },
  {
    "id": "gather-north-01",
    "region": "north",
    "materialId": "northFrostHerb",
    "x": 2033,
    "y": 1916,
    "roadId": "north-road-3",
    "approach": {
      "x": 1932,
      "y": 2020
    },
    "climate": "snow"
  },
  {
    "id": "gather-north-02",
    "region": "north",
    "materialId": "northFrostHerb",
    "x": 2014,
    "y": 2495,
    "roadId": "north-road-1",
    "approach": {
      "x": 2114,
      "y": 2390
    },
    "climate": "snow"
  },
  {
    "id": "gather-north-03",
    "region": "north",
    "materialId": "northFrostHerb",
    "x": 2457,
    "y": 2361,
    "roadId": "north-road-3",
    "approach": {
      "x": 2373,
      "y": 2447
    },
    "climate": "snow"
  },
  {
    "id": "gather-north-04",
    "region": "north",
    "materialId": "northFrostHerb",
    "x": 2380,
    "y": 2818,
    "roadId": "north-road-1",
    "approach": {
      "x": 2465,
      "y": 2734
    },
    "climate": "snow"
  },
  {
    "id": "gather-north-05",
    "region": "north",
    "materialId": "northFrostHerb",
    "x": 2819,
    "y": 2683,
    "roadId": "north-road-3",
    "approach": {
      "x": 2716,
      "y": 2785
    },
    "climate": "snow"
  },
  {
    "id": "gather-north-06",
    "region": "north",
    "materialId": "northFrostHerb",
    "x": 2745,
    "y": 3130,
    "roadId": "north-road-1",
    "approach": {
      "x": 2800,
      "y": 3078
    },
    "climate": "snow"
  },
  {
    "id": "gather-north-07",
    "region": "north",
    "materialId": "northFrostHerb",
    "x": 3201,
    "y": 3110,
    "roadId": "north-road-3",
    "approach": {
      "x": 3114,
      "y": 3193
    },
    "climate": "snow"
  },
  {
    "id": "gather-ancient-00",
    "region": "ancient",
    "materialId": "ancientStarBloom",
    "x": 1693,
    "y": 1988,
    "roadId": "ancient-road-1",
    "approach": {
      "x": 1744,
      "y": 1933
    },
    "climate": "elder-forest"
  },
  {
    "id": "gather-ancient-01",
    "region": "ancient",
    "materialId": "ancientStarBloom",
    "x": 2151,
    "y": 1933,
    "roadId": "ancient-road-2",
    "approach": {
      "x": 2050,
      "y": 2036
    },
    "climate": "elder-forest"
  },
  {
    "id": "gather-ancient-02",
    "region": "ancient",
    "materialId": "ancientStarBloom",
    "x": 2128,
    "y": 2481,
    "roadId": "ancient-road-1",
    "approach": {
      "x": 2226,
      "y": 2374
    },
    "climate": "elder-forest"
  },
  {
    "id": "gather-ancient-03",
    "region": "ancient",
    "materialId": "ancientStarBloom",
    "x": 2557,
    "y": 2338,
    "roadId": "ancient-road-2",
    "approach": {
      "x": 2455,
      "y": 2440
    },
    "climate": "elder-forest"
  },
  {
    "id": "gather-ancient-04",
    "region": "ancient",
    "materialId": "ancientStarBloom",
    "x": 2503,
    "y": 2794,
    "roadId": "ancient-road-1",
    "approach": {
      "x": 2585,
      "y": 2707
    },
    "climate": "elder-forest"
  },
  {
    "id": "gather-ancient-05",
    "region": "ancient",
    "materialId": "ancientStarBloom",
    "x": 2969,
    "y": 2748,
    "roadId": "ancient-road-2",
    "approach": {
      "x": 2867,
      "y": 2852
    },
    "climate": "elder-forest"
  },
  {
    "id": "gather-ancient-06",
    "region": "ancient",
    "materialId": "ancientStarBloom",
    "x": 2893,
    "y": 3202,
    "roadId": "ancient-road-1",
    "approach": {
      "x": 2994,
      "y": 3098
    },
    "climate": "elder-forest"
  },
  {
    "id": "gather-ancient-07",
    "region": "ancient",
    "materialId": "ancientStarBloom",
    "x": 3337,
    "y": 3110,
    "roadId": "ancient-road-2",
    "approach": {
      "x": 3236,
      "y": 3214
    },
    "climate": "elder-forest"
  },
  {
    "id": "gather-desert-00",
    "region": "desert",
    "materialId": "desertSunleaf",
    "x": 1957,
    "y": 1966,
    "roadId": "desert-caravan-1",
    "approach": {
      "x": 1915,
      "y": 2025
    },
    "climate": "sand"
  },
  {
    "id": "gather-desert-01",
    "region": "desert",
    "materialId": "desertSunleaf",
    "x": 2377,
    "y": 2266,
    "roadId": "desert-caravan-1",
    "approach": {
      "x": 2335,
      "y": 2325
    },
    "climate": "sand"
  },
  {
    "id": "gather-desert-02",
    "region": "desert",
    "materialId": "desertSunleaf",
    "x": 2797,
    "y": 2566,
    "roadId": "desert-caravan-1",
    "approach": {
      "x": 2755,
      "y": 2625
    },
    "climate": "sand"
  },
  {
    "id": "gather-desert-03",
    "region": "desert",
    "materialId": "desertSunleaf",
    "x": 3217,
    "y": 2866,
    "roadId": "desert-caravan-1",
    "approach": {
      "x": 3175,
      "y": 2925
    },
    "climate": "sand"
  },
  {
    "id": "gather-desert-04",
    "region": "desert",
    "materialId": "desertSunleaf",
    "x": 2238,
    "y": 3698,
    "roadId": "desert-caravan-return",
    "approach": {
      "x": 2300,
      "y": 3675
    },
    "climate": "sand"
  },
  {
    "id": "gather-desert-05",
    "region": "desert",
    "materialId": "desertSunleaf",
    "x": 4057,
    "y": 3466,
    "roadId": "desert-caravan-1",
    "approach": {
      "x": 4015,
      "y": 3525
    },
    "climate": "sand"
  },
  {
    "id": "gather-desert-06",
    "region": "desert",
    "materialId": "desertSunleaf",
    "x": 4477,
    "y": 3766,
    "roadId": "desert-caravan-1",
    "approach": {
      "x": 4435,
      "y": 3825
    },
    "climate": "sand"
  },
  {
    "id": "gather-desert-07",
    "region": "desert",
    "materialId": "desertSunleaf",
    "x": 2798,
    "y": 5198,
    "roadId": "desert-caravan-return",
    "approach": {
      "x": 2860,
      "y": 5175
    },
    "climate": "sand"
  }
]);
export const regionGatheringNodes=region=>GATHERING_NODES.filter(n=>n.region===region);
