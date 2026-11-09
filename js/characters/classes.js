export const CLASSES=Object.freeze({
 warrior:{name:'Воин',weapon:'sword',speed:1},
 archer:{name:'Лучник',weapon:'bow',speed:1.07},
 mage:{name:'Маг',weapon:'staff',speed:1},
 paladin:{name:'Паладин',weapon:'sword_shield',speed:.94},
 assassin:{name:'Ассасин',weapon:'daggers',speed:1.16},
 cannoneer:{name:'Гном-канонир',weapon:'cannon',speed:.92}
});
export const getClass=id=>CLASSES[id]??CLASSES.warrior;
