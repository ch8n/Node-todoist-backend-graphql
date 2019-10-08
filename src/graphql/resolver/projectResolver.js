const uuid = require('uuid');
const todoDB = require("../../model/todoDb")
const projectDB = require("../../model/projectDB")


const getUserTodo = async (userId) => {
    let user = await todoDB.filter({ userId: userId }).value()
    return user
}


const projectResolver = {
    projects: async () => {
        let projects = await projectDB.value()
        let projectWithTodos = await projects.map(async (currProject) => {
            let todos = []
            await currProject.todos.forEach(async (todoId) => {
                let todo = await todoDB.find({ _id: todoId }).value()
                if (todo) {
                    todos.push(todo)
                }
            })
            console.log(todos.length);
            currProject.todos = todos
            return currProject
        })

        return projectWithTodos
    },
    createProject: async (args,req) => {
        if (!req.isAuth) {
            throw new Error("not authorized")
        }
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
    }
}

module.exports = projectResolver