import {CLIMATE_ART} from './climateArt.js';
import {DESERT_ART} from './desertArt.js';
import {ENVIRONMENT_ART} from './environmentArt.js';
// A single source of truth for optional visual assets.
// Add an entry when a real image is committed. Missing assets are not loaded.
export const ASSET_MANIFEST=Object.freeze({
 characters:{},equipment:{},world:{[CLIMATE_ART.key]:CLIMATE_ART.entry,[ENVIRONMENT_ART.key]:ENVIRONMENT_ART.entry,[DESERT_ART.key]:DESERT_ART.entry},effects:{}
});
export function getAsset(category,id){return ASSET_MANIFEST[category]?.[id]??null;}
