
const APIs = (() => {
    // init = { method: "GET", body: {} }
    function myFetch (url, init) {
        return new Promise((res, rej) => {
            const xhr = new XMLHttpRequest()
            xhr.open(init?.method || "GET", url)
            xhr.setRequestHeader("Content-Type", "application/json")
            xhr.responseType = "json"
            xhr.onload = function () {
                res(xhr.response)
            }
            xhr.onerror = function () {
                rej("error")
            }
            xhr.send(JSON.stringify(init?.body))

            // xhr.onreadystatechange = function () { 
            //     if (xhr.readyState === 4) {
            //       console.log('inside readystate', xhr.status)
            //       if (xhr.status >= 200 && xhr.status < 300) // || xhr.status === 304)//Cache
            //       {
            //         console.log('in if, 200+')
            //         resovle(xhr.response)//xhr.response
            //       } else {
            //         console.log('inside else', xhr.status)
            //         reject(new Error(this.statusText))

            //       }
            //     }
            //   }
        })
    }
    const createTodo = (newTodo) => {
        const init = { method: 'POST', body: newTodo }
        return myFetch("http://localhost:3000/todos/", init)
        // return fetch("http://localhost:3000/todos", {
        //     method: "POST",
        //     body: JSON.stringify(newTodo),
        //     headers: { "Content-Type": "application/json" },
        // }).then((res) => res.json())
    }
    const deleteTodo = (id) => {
        return myFetch("http://localhost:3000/todos/" + id, { method: "DELETE" })
        // return fetch("http://localhost:3000/todos/" + id, {
        //     method: "DELETE",
        // }).then((res) => res.json())
    }
    const getTodos = () => {
        return myFetch("http://localhost:3000/todos/")

    }
    const updateIsDone = (id, updateTodo) => {
        const init = { method: "PATCH", body: updateTodo }
        return myFetch("http://localhost:3000/todos/" + id, init)
        // return fetch("http://localhost:3000/todos/" + id, {
        //     method: "PATCH",
        //     body: JSON.stringify(updateTodo),
        //     headers: { "Content-Type": "application/json" },
        // }).then((res) => res.json()) 
    }
    const updateContent = (id, updateTodo) => {
        const init = { method: "PATCH", body: updateTodo }
        return myFetch("http://localhost:3000/todos/" + id, init)
        // return fetch("http://localhost:3000/todos/" + id, {
        //     method: "PATCH",
        //     body: JSON.stringify(updateTodo),
        //     headers: { "Content-Type": "application/json" },
        // }).then((res) => res.json()) //return 'Patched' Object
    }
    return { createTodo, deleteTodo, getTodos, updateIsDone, updateContent }
})()
const Model = (() => {
    class State {
        #todos //private field
        #onChange //function, will be called when setter function todos is called
        constructor() {
            this.#todos = []
        }
        get todos () {
            return this.#todos
        }
        set todos (newTodos) {
            // reassign value            console.log('in side setter', newTodos)
            this.#todos = newTodos
            this.#onChange?.() // rendering
        }

        subscribe (callback) {
            //subscribe to the change of the state todos
            this.#onChange = callback
        }
    }
    const { getTodos, createTodo, deleteTodo, updateIsDone, updateContent } = APIs
    return {
        State,
        getTodos,
        createTodo,
        deleteTodo,
        updateIsDone,
        updateContent
    }
})()
const View = (() => {
    const todolistEl = document.querySelector(".todo-list")
    const submitBtnEl = document.querySelector(".submit-btn")
    const inputEl = document.querySelector(".input")
    const donelistEl = document.querySelector('.done-list')
    const listsEl = document.querySelector('.lists')
    const renderTodos = (todos) => {
        let todosTemplate = ""
        let donesTemplate = ''
        // console.log('inside render', todos)
        const leftArrowStr = `<div class="move-btn done"><svg class="move-btn done" focusable="false" aria-hidden="true" viewBox="0 0 24 24" aria-label="fontSize small">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path>
            </svg></div>`
        const rightArrowStr = `<div class="move-btn"><svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowForwardIcon" aria-label="fontSize small">
            <path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path>
            </svg></div>`
        const updateStr = `<div class="update-btn"><svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" aria-label="fontSize small">
             <path  d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z">
             </path></svg></div>`
        const deleteStr = `<div class="delete-btn"><svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" aria-label="fontSize small">
             <path class="delete" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z">
             </path></svg></div>`
        todos.forEach((todo) => { //strings outside the loop
            if (todo.isDone) { //<div><svg><div> + svg{ pointer-events: none;}
                const doneLiTemplate = `<li id="${todo.id}">
                 ${leftArrowStr}                
                 <input type="text" />
                 <span class='${todo.id}'>${todo.content}</span> 
                 ${updateStr + deleteStr}
                </li>`
                donesTemplate += doneLiTemplate //class='${todo.id}' might delete
            } else {
                const liTemplate = `<li id="${todo.id}">
                 <span class='${todo.id}'>${todo.content}</span><input type="text" />
                 ${updateStr + deleteStr + rightArrowStr}
                </li>`
                todosTemplate += liTemplate
            }
        })
        if (!todos.some(todo => todo.isDone)) { donesTemplate = "<h4>no task to display!</h4>" } //DoneList
        if (!todos.some(todo => !todo.isDone)) { todosTemplate = "<h4>no task to display!</h4>" }
        // if (todos.length === 0) {
        //     todosTemplate = donesTemplate = "<h4>no task to display!</h4>"
        // }
        todolistEl.innerHTML = todosTemplate
        donelistEl.innerHTML = donesTemplate
    }
    const clearInput = () => {
        inputEl.value = ""
    }
    // const liEl = (id) => {
    //     return document.getElementById(id)
    // }
    return { renderTodos, submitBtnEl, inputEl, listsEl, clearInput, todolistEl, donelistEl }
})()

const Controller = ((view, model) => {
    const state = new model.State()
    const init = () => {
        model.getTodos().then((todos) => {
            // todos.reverse()
            state.todos = todos.reverse()
        })
    }
    const handleUpdate = () => {
        view.listsEl.addEventListener('click', (event) => {
            if (event.target.className === "update-btn") {
                const liEl = event.target.parentNode //parentElement
                const id = liEl.id
                const spanEl = liEl.getElementsByTagName('span')[0]
                const inputEl = liEl.getElementsByTagName('input')[0] //querySelector('input[type=text]')
                const isEditMode = liEl.classList.contains('editMode')
                // console.log(spanEl.innerHTML)
                if (isEditMode) {
                    if (inputEl.value !== spanEl.innerHTML) {// 减少更新次数
                        console.log(spanEl.innerHTML)
                        const updateTodo = { content: inputEl.value }
                        model.updateContent(+id, updateTodo).then(data => {
                            state.todos = state.todos.map(todo => {
                                if (todo.id === + id) {
                                    todo.content = inputEl.value
                                }
                                return todo
                            })
                            // console.log('inside undateContent', state.todos)
                        })
                    }
                } else {
                    inputEl.value = spanEl.innerHTML
                }
                liEl.classList.toggle('editMode')
                // if (spanEl) {
                //     const input = document.createElement('input')
                //     input.value = spanEl.innerHTML
                //     // liEl.appendChild(input)
                //     // liEl.children[0].remove() 
                //     spanEl.replaceWith(input)
                // } else {// 2 clicks?
                //     event.target.addEventListener('click', (event) => {
                //         const input = liEl.getElementsByTagName('input')[0]
                //         const updateTodo = { content: input.value }
                // model.updateContent(+id, updateTodo).then(data => {
                //     state.todos = state.todos.map(todo => {
                //         if (todo.id === + id) {
                //             todo.content = input.value// New input.value
                //         }
                //         return todo
                //     })
                //     // console.log('inside undateContent', state.todos)
                // })
                //     })
                // }
            }
        })
    }

    const handleMove = () => {
        view.listsEl.addEventListener('click', (event) => {
            const isContainsMove = event.target.classList.contains("move-btn")
            if (isContainsMove) {
                const id = event.target.parentElement.id //parentNode
                const updateTodo = { isDone: event.target.classList.contains('done') ? false : true }
                //console.log('updateTodo', updateTodo, +id)
                model.updateIsDone(+id, updateTodo).then(data => {
                    state.todos = state.todos.map(todo => {
                        if (todo.id === + id) {
                            todo.isDone = !todo.isDone
                        }
                        return todo
                    })
                    // console.log('inside undateISDONE', state.todos)
                    event.target.classList.toggle("done")
                })

            }
        })
    }
    const handleSubmit = () => {
        view.submitBtnEl.addEventListener("click", (event) => {
            /* 
                1. read the value from input
                2. post request
                3. update view
            */
            const inputValue = view.inputEl.value
            const newTodo = { content: inputValue, isDone: false }
            model.createTodo(newTodo).then((data) => {
                state.todos = [data, ...state.todos]
                view.clearInput()
            })
        })
    }

    const handleDelete = () => {
        /* 
           1. get id
           2. make delete request
           3. update view, remove
       */
        view.listsEl.addEventListener("click", (event) => {
            if (event.target.className === "delete-btn") {
                const id = event.target.parentNode.id
                //console.log('id ', id)
                model.deleteTodo(+id).then((data) => {
                    state.todos = state.todos.filter((todo) => todo.id !== +id)
                    //console.log('in the delete', state.todos)
                })
            }
        })

    }

    const bootstrap = () => {
        init()
        handleSubmit()
        handleDelete()
        handleMove()
        handleUpdate()
        state.subscribe(() => {
            view.renderTodos(state.todos)
        })
    }
    return {
        bootstrap,
    }
})(View, Model)

Controller.bootstrap()

// setTimeout(() => {
//     console.log(document.getElementById('4'))
// }, 2000)

