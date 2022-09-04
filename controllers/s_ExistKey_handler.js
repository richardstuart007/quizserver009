//==================================================================================
//= Get a row from a table : table, keyName, keyValue are passed in Body
//==================================================================================
//
//  Global Variable - Define return object
//
const CatchFunction = 's_ExistKey_handler'
const SqlFunction = 's_ExistKey_handler'
var returnObject = {
  returnValue: '',
  returnMessage: '',
  returnCatchFunction: '',
  returnCatch: false,
  returnCatchMsg: '',
  returnRow: []
}
//==================================================================================
//= Main ASYNC Function
//==================================================================================
async function f_handleExistKey(db, table, keyName, keyValue) {
  try {
    //
    // Initialise Global Variables
    //
    returnObject.returnValue = false
    returnObject.returnMessage = ''
    returnObject.returnSqlFunction = SqlFunction
    returnObject.returnCatchFunction = ''
    returnObject.returnCatch = ''
    returnObject.returnCatchMsg = ''
    returnObject.returnRow = []
    //..................................................................................
    //. Parameter Validation
    //..................................................................................
    //
    // Check values sent
    //
    if (!table || !keyName || !keyValue) {
      returnObject.returnValue = false
      returnObject.returnMessage = `Not all the parameters received`
      return returnObject
    }
    //
    // Get Database record (ASYNC)
    //
    const responseSql = await f_handleExistKeyAwait(
      db,
      table,
      keyName,
      keyValue
    )
    //
    // Return Results
    //
    await responseSql
    //
    //  No Catch Errors
    //
    if (responseSql) {
      returnObject.returnValue = true
      returnObject.returnMessage = `Row FOUND: TABLE(${table}) with KEY(${keyName}) and VALUE(${keyValue})`
    } else {
      returnObject.returnValue = false
      returnObject.returnMessage = `Row NOT found: TABLE(${table}) with KEY(${keyName}) and VALUE(${keyValue})`
    }
    return returnObject
    //
    // Errors
    //
  } catch (err) {
    console.log(err.message)
    returnObject.returnCatch = true
    returnObject.returnCatchMsg = err.message
    returnObject.returnCatchFunction = CatchFunction
    return returnObject
  }
}
//==================================================================================
//= Main function - Await
//==================================================================================
async function f_handleExistKeyAwait(db, table, keyName, keyValue) {
  //
  // Define Return Variable
  //
  var ResultSql = false
  //
  // SQL Database
  //
  try {
    const sqlString = `EXISTS (SELECT 1 FROM ${table} WHERE ${keyName} = '${keyValue}')`
    const dbSql = await db.select(db.raw(sqlString))
    //
    // Result Row
    //
    await dbSql
    //
    // Row Found
    //
    const dbSqlObj = dbSql[0]
    if (dbSqlObj.exists) {
      ResultSql = true
    }
    return ResultSql
    //
    // Errors
    //
  } catch (err) {
    console.log(err.message)
    returnObject.returnCatch = true
    returnObject.returnCatchMsg = err.message
    returnObject.returnCatchFunction = CatchFunction
    return ResultSql
  }
}
//==================================================================================
// Exports
//==================================================================================
module.exports = {
  f_handleExistKey
}
