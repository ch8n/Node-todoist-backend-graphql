const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('todoIst.json')
const db = low(adapter)

db.defaults({projects:[]}).write()

module.exports = db.get("projects")
