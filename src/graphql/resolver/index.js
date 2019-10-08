const projectResolver = require("./projectResolver")
const todoResolver = require("./todoResolver")
const userResolver = require("./userResolver")

const rootResolver = {
    ...userResolver,
    ...todoResolver,
    ...projectResolver
}

module.exports = rootResolver