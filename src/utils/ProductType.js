// src/models/ProductType.js

/**
 * @enum {number}
 */
const PRODUCT_TYPE = {
    LOCKER: 0,
    BOOK_REGULAR: 1,
    BOOK_TABLE: 2,
    CONSUMABLE: 3,
    STUFF: 4 // Ajout de "Stuff" ou "Matériel"
  };
  
  /**
   * @enum {number}
   */
  const CATEGORY = {
    DRINK: 0,
    SOFT: 1,
    FOOD: 2,
    GOODIES: 3,
    STUFF: 4,
    NONE: 5 
  };
  
  /**
   * @typedef {Object} ProductType
   * @property {firebase.firestore.DocumentReference} productTypeRef
   * @property {string} name
   * @property {Array} products
   * @property {PRODUCT_TYPE} productType
   * @property {CATEGORY} category
   * @property {boolean} visible
   */
  
  export { PRODUCT_TYPE, CATEGORY };
  