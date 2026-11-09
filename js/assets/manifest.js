// A single source of truth for optional visual assets.
// Add an entry when a real image is committed. Missing assets are not loaded.
export const ASSET_MANIFEST=Object.freeze({
 characters:{},equipment:{},world:{},effects:{}
});
export function getAsset(category,id){return ASSET_MANIFEST[category]?.[id]??null;}
