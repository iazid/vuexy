export const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Remplace les espaces par des tirets
      .replace(/[^\w\-]+/g, '') // Enlève les caractères non alphanumériques
      .replace(/\-\-+/g, '-') // Remplace les tirets multiples par un seul tiret
      .replace(/^-+/, '') // Enlève les tirets au début
      .replace(/-+$/, ''); // Enlève les tirets à la fin
  };
  