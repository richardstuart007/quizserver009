const s_Key1_handler = require('./s_Key1_handler')
//
//  Global Variable - Define return object
//
const CatchFunction = 'AllKey'
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
// Update a row into a table : table, keyName, keyValue are passed in Body
//==================================================================================
async function handleKey1(req, res, db) {
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
    //
    // All methods require these parameters
    //
    const { action, table, keyName, keyValue, dataValues } = req.body
    if (!action || !table || !keyName || !keyValue) {
      return res
        .status(400)
        .json(`Action/Table/KeyName/KeyValue not sent as Body Parameters`)
    }
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
      return res.status(400).json(`Action ${action} is invalid`)
    }
    //
    // Actions which require dataValues
    //
    if (action === 'INSERT' || action === 'UPDATE' || action === 'UPSERT') {
      if (!dataValues) {
        return res.status(400).json(`Action ${action} is invalid`)
      }
    }
    //..................................................................................
    // Process Request Promises(ALL)
    //..................................................................................
    const returnData = await Promise.all([
      s_Key1_handler.f_handleKey1(
        db,
        action,
        table,
        keyName,
        keyValue,
        dataValues
      )
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
  handleKey1
}
