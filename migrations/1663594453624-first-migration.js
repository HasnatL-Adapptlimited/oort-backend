const { startDatabase } = require('../src/server/database.ts')

module.exports.up = async function (next) {
  
  console.log(" =========>>>>>> UP <<<<<<<============ ");
  //next()
}

module.exports.down = function (next) {
  next()
}
