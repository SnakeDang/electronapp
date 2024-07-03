const sql = require("mssql");
const logToFile = require("./writelog");
const { CONFIG_SQL_SERVER } = require("./constant");
// Configuration object for the database connection
const config = { ...CONFIG_SQL_SERVER };

async function executeProcedure(procedureName, inputParams) {
  let pool = await sql.connect(config);
  try {
    let request = pool.request();

    // Add input parameters
    // console.log(inputParams);
    inputParams?.forEach((param) => {
      request.input(param.name, param.type, param.value);
    });
    // Execute the stored procedure
    let result = await request.execute(procedureName);

    const { recordsets, recordset, output, rowsAffected, returnValue } = result;
    return { recordset, recordsets, output, rowsAffected, returnValue };
    // Close the connection pool
  } catch (err) {
    // Handle errors
    logToFile(
      `Execute procedure --${procedureName} with parameters : ${inputParams} --- error` +
        err?.message
        ? err.message
        : err
    );
    console.error("SQL error", err);
  } finally {
    await pool.close();
  }
}
async function getListVideoFromMqtt(value) {
  const param = [
    {
      name: "_value",
      type: sql.Int,
      value: value,
    },
  ];
  const nameProcedure = "PR_GET_VIDEO_FROM_MQTT";
  const { recordset } = await executeProcedure(nameProcedure, param);
  return recordset;
}

module.exports = {
  executeProcedure,
  getListVideoFromMqtt,
};
