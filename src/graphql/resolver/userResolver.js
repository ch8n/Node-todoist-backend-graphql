const uuid = require('uuid');
const todoDB = require("../../model/todoDb")
const userDB = require("../../model/userDb")
const projectDB = require("../../model/projectDB")
const bCrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const getUserTodo = async (userId) => {
    let user = await todoDB.filter({ userId: userId }).value()
    return user
}

const getUserProjects = async (userId) => {
    let projects = await projectDB.filter({ userId: userId }).value()

    let userTodo = await getUserTodo(userId)
    console.log(userTodo.length);

    let projectWithTodos = projects.map((currProject) => {
        let todos = []
        currProject.todos.forEach((todoId) => {
            let todo = userTodo.filter(todo => todo._id === todoId)[0]
            if (todo) {
                todos.push(todo)
                console.log(todos.length);
            }
        })
        return {
            ...currProject, todos: todos
        }
    })
    console.log(projectWithTodos);
    return projectWithTodos
}

const userResolver = {

    users: async () => await userDB.value().map(ele => {
        ele.password = "restricted"
        ele.todos = []
        ele.projects = []
        return ele
    }),
    user: async (args) => {
        let { id } = args
        let user = await userDB.find({ _id: id }).value()
        if (user) {
            return {
                ...user,
                password: "restricted",
                todos: async () => await getUserTodo(id),
                projects: async () => await getUserProjects(id)
            }
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

        let hashPassword = await bCrypt.hash(userInput.password, 12)
        const user = {
            _id: uuid(),
            userName: userInput.userName,
            password: hashPassword,
            email: userInput.email
        }
        await userDB.push(user).write()
        return {
            ...user,
            password: "restricted",
            todos: [],
            projects: []
        }
    },
    login: async (args) => {
        console.log(args);
        let { userId, password } = args.authInput
        let user = await userDB.find({ _id: userId }).value()
        if (user) {
            let isCorrect = await bCrypt.compare(password, user.password)
            if (!isCorrect) {
                throw new Error("Password invalid")
            }
            let token = await jwt.sign({
                userId: user._id,
                email: user.email
            }, "thisIsHashingKeyMustBeSecret", {
                expiresIn: "6h"
            })

            return {
                userId: user._id,
                token: token,
                tokenExpire: 6
            }

        } else {
            throw new Error("User not found")
        }
    }
}

module.exports = userResolver