const uuid = require('uuid');
const todoDB = require("../../model/todoDb")
const userDB = require("../../model/userDb")

const todoResolver = {
    todos: async () => await todoDB.value(),
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

module.exports = todoResolver