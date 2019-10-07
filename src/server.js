const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const uuid = require('uuid');
const todoDB = require("./model/todoDb")



const schema = buildSchema(`
    schema {
        query : RootQuery
        mutation : RootMutation
    }
    type RootQuery {
        todos: [Todo!]!
    }
    type RootMutation {
        createTodo(createTodoInput:createTodoInput) : Todo!
    }

    type Todo{
        _id:String!
        title:String!
        desc:String!
        date:String!
        status:Boolean
    }

    input createTodoInput{
        title:String!
        desc:String!
        date:String!
        status:Boolean
    }

`);

const rootResolver = {
    todos: async () => await todoDB.value(),
    createTodo: async (args) => {
        console.log(args);
        const { createTodoInput } = args
        const todo = {
            _id: uuid(),
            title: createTodoInput.title,
            desc: createTodoInput.desc,
            date: createTodoInput.date,
            status: createTodoInput.status
        }
        await todoDB.push(todo).write()
        return todo
    }
}

app.use(bodyParser.json())

app.get("/", (req, res, next) => {
    res.send("hellow world!")
})

app.use("/graphql", graphqlHttp({
    schema: schema,
    rootValue: rootResolver,
    graphiql: true
}))

app.listen(4000, () => {
    console.log(`running @ 4000`);
})