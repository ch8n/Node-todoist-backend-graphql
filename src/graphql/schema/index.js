const { buildSchema } = require('graphql');

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

module.exports = schema