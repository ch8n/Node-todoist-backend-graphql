const uuid = require('uuid');
const todoDB = require("../../model/todoDb")
const userDB = require("../../model/userDb")
const projectDB = require("../../model/projectDB")
const bCrypt = require('bcryptjs')


const getUserTodo = async (userId) => {
    let user = await todoDB.filter({ userId: userId }).value()
    return user
}

const getUserProjects = async (userId) => {
    let userTodos = await getUserTodo(userId);
    let projects = await projectDB.filter({ userId: id }).value()
    let projectWithTodos = await projects.map(current => {
        let todos = userTodos.filter(ele => ele.projectId === current.projectId)
        current.todos = todos
        return current
    })
    return projectWithTodos
}

const rootResolver = {
    todos: async () => await todoDB.value(),

    users: async () => await userDB.value().map(ele => {
        ele.password = "restricted"
        ele.todos = []
        ele.projects = []
        return ele
    }),

    projects: async () => {
        let projects = await projectDB.value()
        let todos = await rootResolver.todos()
        let projectWithTodos = await projects.map(current => {
            let tasks = todos.filter(ele => ele.projectId === current.projectId)
            current.todos = tasks
            return current
        })
        return projectWithTodos
    },

    user: async (args) => {
        let { id } = args
        let user = await userDB.find({ _id: id }).value()
        if (user) {
            return {
                ...user,
                todos: getUserProjects,
                projects: getUserProjects
            }
        } else {
            throw new Error("User not found")
        }
    },

    createProject: async (args) => {
        console.log(args);
        const { projectInput } = args
        let userTodo = await getUserTodo(projectInput.userId)
        console.log(userTodo.length);
        if (userTodo.length > 0) {

            let project = {
                _id: uuid(),
                projectName: projectInput.projectName,
                userId: projectInput.userId,
                todos: projectInput.todos
            }

            projectInput.todos.forEach(async (todoId) => {
                let projectTodo = userTodo.filter(ele => ele._id === todoId)
                if (projectTodo) {
                    let projectIdTodo = { ...projectTodo, projectId: project._id }
                    await todoDB.find({ _id: todoId }).assign(projectIdTodo).write()
                }
            });

            await projectDB.push(project).write()
            return {
                ...project, todos: []
            }
        } else {
            throw new Error("todos not found")
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
            password: "restricted"
        }
    },

    createTodo: async (args) => {
        console.log(args);
        const { createTodoInput } = args
        let user = await userDB.find({ _id: createTodoInput.userId }).value()
        if (user) {
            let todo = {
                _id: uuid(),
                userId: createTodoInput.userId,
                projectId: createTodoInput.projectId,
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
    },

    updateTodo: async (args) => {
        console.log(args);
        const { updateTodoInput } = args
        let todo = await todoDB.find({ _id: updateTodoInput.todoId }).value()
        if (todo) {
            let updatedTodo = {
                ...todo,
                projectId: updateTodoInput.projectId ? updateTodoInput.projectId : todo.projectId,
                title: updateTodoInput.title ? updateTodoInput.title : todo.title,
                desc: updateTodoInput.desc ? updateTodoInput.desc : todo.desc,
                date: updateTodoInput.date ? updateTodoInput.date : todo.date,
                status: updateTodoInput.status ? updateTodoInput.status : todo.status
            }
            let found = await todoDB.find({ _id: updateTodoInput.todoId }).assign(updatedTodo).write()
            return found
        } else {
            return new Error("User not found")
        }
    }
}

module.exports = rootResolver