const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const uuid = require('uuid');
const todoDB = require("./model/todoDb")
const userDB = require("./model/userDb")
const bCrypt = require('bcryptjs')

const schema = buildSchema(`
    schema {
        query : RootQuery
        mutation : RootMutation
    }
    type RootQuery {
        todos: [Todo!]!
        users:[User!]!
        userTodo(id:String!): [Todo!]!
        user(id:String!): User!
    }
    type RootMutation {
        createTodo(createTodoInput:createTodoInput) : Todo!
        createUser(userInput:createUserInput) : User!
    }

    type Todo{
        _id:String!
        title:String!
        desc:String!
        date:String!
        status:Boolean
    }

    type User{
        _id:String!
        userName:String!
        password:String
        email:String!
        todos:[Todo!]
    }

    input createTodoInput{
        userId:String!
        title:String!
        desc:String!
        date:String!
        status:Boolean
    }

    input createUserInput{
        userName:String!
        password:String!
        email:String!
    }

`);

const rootResolver = {
    todos: async () => await todoDB.value(),
    users: async () => await userDB.value().map(ele => {
        ele.password = "restricted"
        ele.todos = []
        return ele
    }),
    user: async(args)=>{
        let {id} = args
        let user = await userDB.find({ _id: id }).value()
        if (user) {
            let todos = await todoDB.filter({ userId: id }).value()
            return {
                ...user,
                todos
            }
        } else {
            throw new Error("User not found")
        }
    },

    userTodo: async (args) => {
        let { id } = args
        let user = await userDB.find({ _id: id }).value()
        console.log(user);

        if (user) {
            let todos = await todoDB.filter({ userId: id }).value()
            console.log(todos);
            return todos
        } else {
            throw new Error("User not found")
        }
    },


    createUser: async (args) => {
        console.log(args);
        const { userInput } = args
        let result = await userDB.find({ email: userInput.email }).value()
        console.log(result);
        if (result) {
            throw new Error("user already exist")
        }

        let user = await bCrypt.hash(userInput.password, 12)
            .then(hashPassword => {
                const user = {
                    _id: uuid(),
                    userName: userInput.userName,
                    password: hashPassword,
                    email: userInput.email
                }
                return user
            }).catch(error => {
                throw error;
            })

        await userDB.push(user).write()
        return user
    },

    createTodo: async (args) => {
        console.log(args);
        const { createTodoInput } = args
        let user = await userDB.find({ _id: createTodoInput.userId }).value()
        if (user) {
            let todo = {
                _id: uuid(),
                userId: createTodoInput.userId,
                title: createTodoInput.title,
                desc: createTodoInput.desc,
                date: createTodoInput.date,
                status: createTodoInput.status
            }
            await todoDB.push(todo).write()
            return todo
        } else {
            return new Error("User not found")
        }
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