const TARGET_TEXT={
 ru:{selected:'Выбранный противник',health:'Здоровье цели',level:'Lv',recovering:'Восстановление здоровья'},
 en:{selected:'Selected enemy',health:'Target health',level:'Lv',recovering:'Health recovery'},
 es:{selected:'Enemigo seleccionado',health:'Salud del objetivo',level:'Lv',recovering:'Recuperación de salud'}
};
export const targetText=(key,language='ru')=>TARGET_TEXT[language]?.[key]||TARGET_TEXT.ru[key]||key;
