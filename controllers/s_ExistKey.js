const f_ExistKey = require('./s_ExistKey_handler')
//
//  Global Variable - Define return object
//
const CatchFunction = 's_ExistKey'
var returnObject = {
  returnValue: '',
  returnMessage: '',
  returnSqlFunction: '',
  returnCatchFunction: '',
  returnCatch: false,
  returnCatchMsg: '',
  returnRow: []
}
//==================================================================================
// Get a row from a table : table, keyName, keyValue are passed in Body
//==================================================================================
async function handleExistKey(req, res, db) {
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
    returnObject.returnRow = []
    //..................................................................................
    // Check values sent
    //..................................................................................
    const { table, keyName, keyValue } = req.body
    if (!table || !keyName || !keyValue) {
      return res
        .status(400)
        .json(`Table/KeyName/KeyValue not sent as Body Parameters`)
    }
    //..................................................................................
    // Process Request Promises(ALL)
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
    //  Return values
    //
    const RowUpdate = returnObject.returnValue
    if (RowUpdate) {
      return res.status(200).json(returnObject)
    } else {
      return res.status(400).json(returnObject)
    }
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

//==================================================================================
// Exports
//==================================================================================
module.exports = {
  handleExistKey
}
