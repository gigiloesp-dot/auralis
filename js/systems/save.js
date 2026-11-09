const KEY='auralis_save_v1';
export const Save={
  load(){try{const raw=localStorage.getItem(KEY);if(!raw)return null;const s=JSON.parse(raw);return s.version===1&&Number.isFinite(s.x)&&Number.isFinite(s.y)?s:null;}catch{return null;}},
  write(data){try{localStorage.setItem(KEY,JSON.stringify({version:1,updatedAt:Date.now(),...data}));return true;}catch{return false;}}
};