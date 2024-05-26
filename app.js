const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const format = require('date-fns/format')
const isMatch = require('date-fns/isMatch')
const isValid = require('date-fns/isValid')

const dbPath = path.join(__dirname, 'todoApplication.db')
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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
const app = express()
app.use(express.json())

let db = null

const initializeServerAndData = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => console.log('Server is Starting at 3000'))
  } catch (e) {
    console.log(`Db Error ${e.message}`)
    process.exit(1)
  }
}

initializeServerAndData()

const priorityAndStatus = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const categoryAndStatus = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  )
}

const categoryAndPriority = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  )
}

const priorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const categoryProperty = requestQuery => {
  return requestQuery.category !== undefined
}

const statusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

const searchProperty = requestQuery => {
  return requestQuery.search_q !== undefined
}

const outputResult = dbObject => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  }
}

app.get('/todos/', async (request, response) => {
  let data = null
  let getTodos = ''
  const {search_q = '', priority, status, category} = request.query

  switch (true) {
    case priorityAndStatus(request.query):
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status === 'DONE'
        ) {
          getTodos = `SELECT * FROM todo WHERE priority = '${priority}' AND status = '${status}';`

          data = await db.all(getTodos)
          response.send(data.map(each => outputResult(each)))
        } else {
          response.status(400)
          response.send('Invalid Todo Status')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break

    case categoryAndStatus(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status === 'DONE'
        ) {
          getTodos = `SELECT * FROM todo WHERE status = '${status}' AND category = '${category}'`
          data = await db.all(getTodos)
          response.send(data.map(each => outputResult(each)))
        } else {
          response.status(400)
          response.send('Invalid Todo Status')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }

      break

    case categoryAndPriority(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (
          priority === 'HIGH' ||
          priority === 'MEDIUM' ||
          priority === 'LOW'
        ) {
          getTodos = `SELECT * FROM todo WHERE priority = '${priority}' AND category = '${category}';`
          data = await db.all(getTodos)
          response.send(data.map(each => outputResult(each)))
        } else {
          response.status(400)
          response.send('Invalid Todo Priority')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }

      break

    case priorityProperty(request.query):
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        getTodos = `SELECT * FROM todo WHERE priority = '${priority}';`
        data = await db.all(getTodos)
        response.send(data.map(each => outputResult(each)))
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break

    case statusProperty(request.query):
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        getTodos = `SELECT * FROM todo WHERE status = '${status}';`
        data = await db.all(getTodos)
        response.send(data.map(each => outputResult(each)))
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break

    case searchProperty(request.query):
      getTodos = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'`
      data = await db.all(getTodos)
      response.send(data.map(each => outputResult(each)))
      break

    case categoryProperty(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        getTodos = `SELECT * FROM todo WHERE category = '${category}';`
        data = await db.all(getTodos)
        response.send(data.map(each => outputResult(each)))
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break

    default:
      getTodos = `SELECT * FROM todo`
      data = await db.all(getTodos)
      response.send(data.map(each => outputResult(each)))
      break
  }
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodoQuery = `SELECT * FROM todo WHERE id = '${todoId}';`

  const responseResult = await db.get(getTodoQuery)
  response.send(outputResult(responseResult))
})

app.get('/agenda/', async (request, response) => {
  const {date} = request.query

  if (isMatch(date, 'yyyy-MM-dd')) {
    const newDate = format(new Date(date), 'yyyy-MM-dd')
    const getDataQuery = `SELECT * FROM todo WHERE due_date = '${newDate}'`
    const responseResult = await db.all(getDataQuery)
    response.send(responseResult.map(each => outputResult(each)))
  } else {
    response.status(400)
    response.send('Invalid Due Date')
  }
})

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body
  if (priority === 'HIGH' || priority === 'LOW' || priority === 'MEDIUM') {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (isMatch(dueDate, 'yyyy-MM-dd')) {
          const postNewDueDate = format(new Date(dueDate), 'yyyy-MM-dd')
          const getDateQuery = `
INSERT INTO 
  todo (id, todo, category, priority, status, due_date)
VALUES
('${id}', '${todo}', '${category}', '${priority}', '${status}', '${postNewDueDate}')`
          await db.run(getDateQuery)
          response.send('Todo Successfully Added')
        } else {
          response.status(400)
          response.send('Invalid Due Date')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  } else {
    response.status(400)
    response.send('Invalid Todo Priority')
  }
})

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const requestBody = request.body
  const getQuery = `SELECT * FROM todo WHERE id = '${todoId}';`
  const previousTodo = await db.get(getQuery)

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body
  let updateTodoQuery
  switch (true) {
    case requestBody.status !== undefined:
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        updateTodoQuery = `
      UPDATE todo SET todo = '${todo}', priority = '${priority}', status = '${status}', category = '${category}',
      due_date = '${dueDate}' WHERE id = '${todoId}';`
        await db.run(updateTodoQuery)
        response.send('Status Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break

    case requestBody.priority !== undefined:
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        updateTodoQuery = `
    UPDATE todo SET todo = '${todo}', priority = '${priority}', status = '${status}', category = '${category}',
      due_date = '${dueDate}' WHERE id = '${todoId}';`
        await db.run(updateTodoQuery)
        response.send('Priority Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break

    case requestBody.todo !== undefined:
      updateTodoQuery = `
    UPDATE todo SET todo = '${todo}', priority = '${priority}', status = '${status}', category = '${category}',
      due_date = '${dueDate}' WHERE id = '${todoId}';`
      await db.run(updateTodoQuery)
      response.send('Todo Updated')
      break

    case requestBody.category !== undefined:
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        updateTodoQuery = `
UPDATE todo SET todo = '${todo}', priority = '${priority}', status = '${status}', category = '${category}',
 due_date = '${dueDate}' WHERE id = '${todoId}';`
        await db.run(updateTodoQuery)
        response.send('Category Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break

    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, 'yyyy-MM-dd')) {
        const newDueDate = format(new Date(dueDate), 'yyyy-MM-dd')

        updateTodoQuery = `
UPDATE todo SET todo = '${todo}', priority = '${priority}', status = '${status}', category = '${category}',
 due_date = '${newDueDate}' WHERE id = '${todoId}';`
        await db.run(updateTodoQuery)
        response.send('Due Date Updated')
      } else {
        response.status(400)
        response.send('Invalid Due Date')
      }
      break
  }
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteQuery = `DELETE FROM todo WHERE id = '${todoId}';`
  await db.run(deleteQuery)
  response.send('Todo Deleted')
})

module.exports = app
