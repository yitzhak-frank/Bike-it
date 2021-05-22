export const toTitleCase = (str) => str[0].toUpperCase() + str.substring(1, str.length);

export const orderCoords = (coords) => !Object.keys(coords)[0].startsWith('lat') ? Object.values(coords).reverse().join() : Object.values(coords).join();
