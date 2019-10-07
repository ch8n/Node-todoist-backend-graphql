const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('userDB.json')
const db = low(adapter)

db.defaults({users:[]}).write()

module.exports = db.get("users")
