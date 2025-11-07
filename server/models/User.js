// User model using standard MongoDB driver
function getUserCollection(db) {
  return db.collection('users');
}

module.exports = { getUserCollection }; 