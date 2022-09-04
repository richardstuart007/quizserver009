//==================================================================================
//= Process a RAW fetch request from server route
//==================================================================================
const s_Raw_handler = require('./s_Raw_handler')
//
// Constants
//
const log = false
const reference = 'Raw'
//
//  Global Variable - Define return object
//
const CatchFunction = 'Raw'
var returnObject = {
  returnValue: '',
  returnMessage: '',
  returnSqlFunction: '',
  returnCatchFunction: '',
  returnCatch: false,
  returnCatchMsg: '',
  returnRows: []
}
//==================================================================================
//= Get a row from a table : table, keyName, keyValue are passed in Body
//==================================================================================
async function handleRaw(req, res, db) {
  try {
    //
    // Initialise Global Variables
    //
    returnObject.returnValue = false
    returnObject.returnMessage = ''
    returnObject.returnSqlFunction = ''
    returnObject.returnCatchFunction = ''
    returnObject.returnCatch = ''
    returnObject.returnCatchMsg = ''
    returnObject.returnRows = []
    //..................................................................................
    //. Check values sent in Body
    //..................................................................................
    const bodyParms = req.body
    //
    //  Action type not sent
    //
    const { sqlAction } = bodyParms
    if (!sqlAction) {
      returnObject.returnMessage = `sqlAction not sent as Body Parameters`
      returnObject.returnCatchFunction = CatchFunction
      return res.status(400).json(returnObject)
    }
    //
    //  Validate sqlAction type
    //
    if (
      sqlAction !== 'DELETE' &&
      sqlAction !== 'EXIST' &&
      sqlAction !== 'SELECTSQL' &&
      sqlAction !== 'SELECT' &&
      sqlAction !== 'INSERT' &&
      sqlAction !== 'UPDATE' &&
      sqlAction !== 'UPSERT'
    ) {
      returnObject.returnMessage = `sqlAction ${sqlAction}: sqlAction not valid`
      return res.status(400).json(returnObject)
    }
    //
    // Process Request Promises(ALL)
    //
    const returnData = await Promise.all([
      s_Raw_handler.f_handleRaw(db, bodyParms)
    ])
    //
    // Parse Results
    //
    const returnDataObject = returnData[0]
    returnObject = Object.assign({}, returnObject, returnDataObject)
    //
    //  Return values
    //
    if (log) {
      console.log(returnObject)
    }
    const RowUpdate = returnObject.returnValue
    if (!RowUpdate) {
      if (log) console.log(`Module ${reference} received No Data`)
    }
    return res.status(200).json(returnObject.returnRows)
    //
    // Errors
    //
  } catch (err) {
    console.log(err.message)
    returnObject.returnCatch = true
    returnObject.returnCatchMsg = err.message
    returnObject.returnCatchFunction = CatchFunction
    return res.status(400).send(returnObject)
  }
}

//!==================================================================================
//! Exports
//!==================================================================================
module.exports = {
  handleRaw
}
