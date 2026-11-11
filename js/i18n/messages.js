const messages={
 ru:{hpPotion:'Зелье здоровья',mpPotion:'Зелье маны',emptySkill:'Пустой слот',saved:'Персонаж сохранён',saveFailed:'Не удалось сохранить: проверь доступ к хранилищу',respawn:'Ты возродился в деревне',noTarget:'Нет цели в пределах атаки',mana:'Недостаточно маны',minimap:'Карта окрестностей'},
 en:{hpPotion:'Health potion',mpPotion:'Mana potion',emptySkill:'Empty slot',saved:'Character saved',saveFailed:'Save failed: check storage access',respawn:'You have respawned in the village',noTarget:'No target within range',mana:'Not enough mana',minimap:'Local map'},
 es:{hpPotion:'Poción de salud',mpPotion:'Poción de maná',emptySkill:'Ranura vacía',saved:'Personaje guardado',saveFailed:'No se pudo guardar: comprueba el almacenamiento',respawn:'Has reaparecido en el pueblo',noTarget:'No hay objetivo al alcance',mana:'Maná insuficiente',minimap:'Mapa local'}
};
export const text=(key,language='ru')=>messages[language]?.[key]||messages.ru[key]||key;
