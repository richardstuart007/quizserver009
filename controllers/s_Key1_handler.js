const f_ExistKey = require('./s_ExistKey')
//==================================================================================
//= Update a row into a table : table, keyName, keyValue, Data are passed in Body
//==================================================================================
//
//  Global Variable - Define return object
//
const CatchFunction = 's_Key1_handler'
const SqlFunction = 's_Key1_handler'
var returnObject = {
  returnValue: '',
  returnMessage: '',
  returnSqlFunction: '',
  returnCatchFunction: '',
  returnCatch: false,
  returnCatchMsg: '',
  returnRow: []
}
var dataRow = []
//==================================================================================
//= Main ASYNC Function
//==================================================================================
async function f_handleKey1(db, action, table, keyName, keyValue, dataValues) {
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
    //  Validate action type
    //
    if (
      action !== 'DELETE' &&
      action !== 'EXIST' &&
      action !== 'SELECT' &&
      action !== 'INSERT' &&
      action !== 'UPDATE' &&
      action !== 'UPSERT'
    ) {
      returnObject.returnValue = false
      returnObject.returnMessage = `Action ${action}: Action not valid`
      return returnObject
    }
    //
    // Check values sent
    //
    if (!table || !keyName || !keyValue) {
      returnObject.returnValue = false
      returnObject.returnMessage = `Action ${action}: Not all the parameters received`
      return returnObject
    }
    //
    // Actions which require dataValues
    //
    if (action === 'INSERT' || action === 'UPDATE' || action === 'UPSERT') {
      if (!dataValues) {
        returnObject.returnValue = false
        returnObject.returnMessage = `Action ${action}: dataValues required for method)`
        return returnObject
      }
    }
    //
    //  dataRow
    //
    if (dataValues) {
      dataRow = dataValues[0]
      const dataRowKeys = Object.keys(dataRow)
      const dataRowValues = Object.values(dataRow)
      //
      //  Key sent must be the same as the data value
      //
      const index = dataRowKeys.indexOf(keyName)
      if (index !== -1) {
        const dataKeyValue = dataRowValues[index]
        if (dataKeyValue !== keyValue) {
          returnObject.returnValue = false
          returnObject.returnMessage = `Action ${action}: Non matching Key: TABLE(${table}) with KEY(${keyName}) and VALUE(${keyValue}) but row ${keyName}(${dataKeyValue})`
          return returnObject
        }
      }
    }
    //..................................................................................
    //. Check if Key exists
    //..................................................................................
    const returnData = await Promise.all([
      f_ExistKey.f_handleExistKey(db, table, keyName, keyValue)
    ])
    //
    // Parse Results
    //
    const returnDataObject = returnData[0]
    returnObject = Object.assign({}, returnObject, returnDataObject)
    //
    //  Populate rowExists
    //
    const rowExists = returnObject.returnValue
    //
    //  Exist action
    //
    if (action === 'EXIST') {
      if (rowExists) {
        returnObject.returnValue = true
        returnObject.returnMessage = `Action ${action}: Key EXISTS: TABLE(${table}) with KEY(${keyName}) and VALUE(${keyValue})`
      } else {
        returnObject.returnValue = false
        returnObject.returnMessage = `Action ${action}: Key does NOT exist: TABLE(${table}) with KEY(${keyName}) and VALUE(${keyValue})`
      }
      return returnObject
    }
    //
    //  Row must exist
    //
    if (action === 'DELETE' || action === 'SELECT' || action === 'UPDATE') {
      if (!rowExists) {
        returnObject.returnValue = false
        returnObject.returnMessage = `Action ${action}: Key does NOT Exists: TABLE(${table}) with KEY(${keyName}) and VALUE(${keyValue})`
        return returnObject
      }
    }
    //
    //  Row must NOT exist
    //
    if (action === 'INSERT') {
      if (rowExists) {
        returnObject.returnValue = false
        returnObject.returnMessage = `Action ${action}: Key already EXISTS: TABLE(${table}) with KEY(${keyName}) and VALUE(${keyValue})`
        return returnObject
      }
    }
    //..................................................................................
    //. Database record (ASYNC)
    //..................................................................................
    const responseSql = await f_handleAwait(
      db,
      action,
      table,
      keyName,
      keyValue,
      dataRow
    )
    //
    // Await Results
    //
    await responseSql
    //
    // Update Return Values
    //
    if (responseSql) {
      returnObject.returnValue = true
      returnObject.returnMessage = `Action ${action} SUCCESSFUL: TABLE(${table}) with KEY(${keyName}) and VALUE(${keyValue})`
      returnObject.returnRow = responseSql
    } else {
      returnObject.returnValue = false
      returnObject.returnMessage = `Action ${action} FAILED: TABLE(${table}) with KEY(${keyName}) and VALUE(${keyValue})`
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
async function f_handleAwait(db, action, table, keyName, keyValue, dataRow) {
  //
  // Define Return Variable
  //
  var ResultSql = false
  //
  // SQL Database
  //
  try {
    switch (action) {
      case 'UPDATE':
        ResultSql = await db
          .update(dataRow)
          .from(table)
          .where(keyName, '=', keyValue)
          .returning(['*'])
        break
      case 'DELETE':
        ResultSql = await db
          .del(['*'])
          .from(table)
          .where(keyName, '=', keyValue)
          .returning(['*'])
        break
      case 'SELECT':
        ResultSql = await db
          .select('*')
          .from(table)
          .where(keyName, '=', keyValue)
        break
      case 'INSERT':
        ResultSql = await db.insert(dataRow).into(table).returning(['*'])
        break
      case 'UPSERT':
        ResultSql = await db
          .insert(dataRow)
          .into(table)
          .returning(['*'])
          .onConflict(keyName)
          .merge()
        break
    }
    //
    // Result Row
    //
    await ResultSql
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
//= Exports
//==================================================================================
module.exports = {
  f_handleKey1
}
