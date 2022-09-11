//
//  Libraries
//
const express = require('express')
const bcrypt = require('bcrypt')
const cors = require('cors')
const knex = require('knex')
const { format } = require('date-fns')
//
//  Sub components
//
const s_Raw = require('./controllers/s_Raw')
const s_Register = require('./controllers/s_Register')
const s_Signin = require('./controllers/s_Signin')
const s_Profile = require('./controllers/s_Profile')
//..............................................................................
//.  Initialisation
//.............................................................................
//
//  Counter
//
let logCounter = 0
const quizserver = 'quizServerRemote'
//
// Constants
//
const {
  // REMOTE_KNEX_PORT,
  REMOTE_KNEX_CLIENT,
  REMOTE_KNEX_HOST,
  REMOTE_KNEX_USER,
  REMOTE_KNEX_PWD,
  REMOTE_KNEX_DATABASE,
  REMOTE_URL_PORT,
  URL_SIGNIN,
  URL_TABLES,
  URL_REGISTER,
  URL_PROFILE
} = require('./quizServerConstants.js')
//
// Knex
//
const db = knex({
  client: REMOTE_KNEX_CLIENT,
  connection: {
    host: REMOTE_KNEX_HOST,
    // port: REMOTE_KNEX_PORT,
    user: REMOTE_KNEX_USER,
    password: REMOTE_KNEX_PWD,
    database: REMOTE_KNEX_DATABASE
  }
})
//
//
//
// console.log(
//   `Database Connection==> Client(${REMOTE_KNEX_CLIENT}) host(${REMOTE_KNEX_HOST}) port(${REMOTE_KNEX_PORT}) user(${REMOTE_KNEX_USER}) database(${REMOTE_KNEX_DATABASE})`
// )
console.log(
  `Database Connection==> Client(${REMOTE_KNEX_CLIENT}) host(${REMOTE_KNEX_HOST}) user(${REMOTE_KNEX_USER}) database(${REMOTE_KNEX_DATABASE})`
)
//
// Express & Cors
//
const app = express()
app.use(express.json())
app.use(cors())
//.............................................................................
//.  Routes - Tables
//.............................................................................
app.post(URL_TABLES, (req, res) => {
  logRawTables(req, 'POST', 'RAW', 's_RAW')
  s_Raw.handleRaw(req, res, db, logCounter)
})

app.delete(URL_TABLES, (req, res) => {
  logRawTables(req, 'DELETE', 'RAW', 's_RAW')
  s_Raw.handleRaw(req, res, db, logCounter)
})
//.............................................................................
//.  Routes - Register/SignIn
//.............................................................................
app.get(`${URL_PROFILE}/:id`, (req, res) => {
  logRawSignIn(req, 'GET Profile')
  s_Profile.handleProfileGet(req, res, db)
})

app.post(URL_SIGNIN, (req, res) => {
  logRawSignIn(req, 'POST Signin')
  s_Signin.handleSignin(req, res, db, bcrypt)
})

app.post(URL_REGISTER, (req, res) => {
  logRawSignIn(req, 'POST Register')
  s_Register.handleRegister(req, res, db, bcrypt)
})
//..............................................................................
//.  Start Server
//.............................................................................
const TimeStamp = format(new Date(), 'yyLLddHHmmss')
let logMessage = `SERVER.. ${logCounter} Time:${TimeStamp} QuizServer(${quizserver}) running on PORT(${REMOTE_URL_PORT})`
app.listen(REMOTE_URL_PORT, () => {
  console.log(logMessage)
})
//.............................................................................
//.  Log the Body to the console
//.............................................................................
function logRawTables(req, fetchAction, fetchRoute, handler) {
  //
  //  Destructure Parameters
  //
  const {
    sqlClient,
    sqlAction,
    sqlString,
    sqlTable,
    sqlWhere,
    sqlOrderByRaw,
    sqlRow,
    sqlKeyName
  } = req.body
  //
  //  Timestamp and Counter
  //
  const TimeStamp = format(new Date(), 'yyLLddHHmmss')
  logCounter = logCounter + 1
  //
  //  Format Message & Log
  //
  let logMessage = `Server.. ${logCounter} Time:${TimeStamp}`
  if (sqlTable) logMessage = logMessage + ` Table(${sqlTable})`
  logMessage =
    logMessage +
    ` Handler(${handler}) Client(${sqlClient}) Action(${fetchAction}) Route(${fetchRoute}) Sql(${sqlAction})`

  if (sqlString) logMessage = logMessage + ` String(${sqlString})`
  if (sqlWhere) logMessage = logMessage + ` Where(${sqlWhere})`
  if (sqlOrderByRaw) logMessage = logMessage + ` OrderByRaw(${sqlOrderByRaw})`
  if (sqlRow) logMessage = logMessage + ` Row(Data)`
  if (sqlKeyName) logMessage = logMessage + ` KeyName(${sqlKeyName})`

  console.log(logMessage)
}
//.............................................................................
//.  Log the Body to the console
//.............................................................................
function logRawSignIn(req, fetchAction) {
  //
  //  Destructure Parameters
  //
  const { email, name, sqlClient } = req.body
  const { id } = req.params
  //
  //  Counter
  //
  const TimeStamp = format(new Date(), 'yyLLddHHmmss')
  logCounter = logCounter + 1
  //
  // Format message & Log
  //
  let logMessage = `SERVER.. ${logCounter} Time:${TimeStamp} sqlClient(${sqlClient}) fetchAction(${fetchAction}) Email(${email}) `
  if (name) logMessage.concat(` Name(${name})`)
  if (id) logMessage.concat(` ID(${id})`)
  console.log(logMessage)
}
