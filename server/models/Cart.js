// Cart model using standard MongoDB driver
function getCartCollection(db) {
  return db.collection('carts');
}

module.exports = { getCartCollection }; 