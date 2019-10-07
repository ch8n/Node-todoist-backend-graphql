const { buildSchema } = require('graphql');

const schema = buildSchema(`
    schema {
        query : RootQuery
        mutation : RootMutation
    }
    type RootQuery {
        todos: [Todo!]!
        users:[User!]!
        projects:[Project]!
        user(id:String!): User!
    }
    type RootMutation {
        createTodo(createTodoInput:createTodoInput) : Todo!
        updateTodo(updateTodoInput:updateTodoInput) : Todo!
        createUser(userInput:createUserInput) : User!
        createProject(projectInput:createProjectInput) : Project!

    }

    type Todo{
        _id:String!
        projectId:String
        userId:String!
        title:String!
        desc:String!
        date:String!
        status:Boolean
    }

    input createTodoInput{
        userId:String!
        projectId:String
        title:String!
        desc:String!
        date:String!
        status:Boolean
    }
    
    input updateTodoInput{
        todoId:String!
        projectId:String
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
        projects:[Project!]
    }

    input createUserInput{
        userName:String!
        password:String!
        email:String!
    }

    type Project {
        _id:String!
        projectName:String!
        userId:String!
        todos:[Todo]!
    }


    input createProjectInput{
        projectName:String!
        userId:String!
        todos:[String]!
    }
   
`);

module.exports = schema