const express = require("express")
const express_graphql = require("express-graphql")
const { buildSchema } = require("graphql")

//graphql schema
const appSchema = buildSchema(`
    type Query {
        todo(id:String!):Todo
        todos:[Todo]
    }

    type Todo {
        id : String
        title : String
        desc : String
        status : Boolean
    }
`)

//dummy data 
var todos = [
    {
        id: 1,
        title: "pokemon",
        desc: "watch pokemon",
        status: false
    },
    {
        id: 2,
        title: "pokemon2",
        desc: "watch pokemon2",
        status: false
    },
    {
        id: 3,
        title: "pokemon3",
        desc: "watch pokemon3",
        status: false
    },
    {
        id: 4,
        title: "pokemon4",
        desc: "watch pokemon4",
        status: false
    },
    {
        id: 5,
        title: "pokemon5",
        desc: "watch pokemon5",
        status: false
    }]


//resolver
const root = {
    todo: (args) => {
        return todos.filter(ele => { return ele.id == args.id })[0]
    },
    todos: () => todos
}

//server

const app = express()
app.use("/graphql", express_graphql({
    schema: appSchema,
    rootValue: root,
    graphiql: true
}))

app.listen(4000, () => {
    console.log("grapghl on port 4000");

})