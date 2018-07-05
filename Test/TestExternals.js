"use strict";
/***************************************************************************************************
Name: TestExternals.js                 Author: Brendan Furey                       Date: 05-Jul-2018

Component module in: The Math Function Unit Testing design pattern, implemented in nodejs

GitHub: https://github.com/BrenPatF/trapit_nodejs_tester

See: 'Database API Viewed As A Mathematical Function: Insights into Testing'
     https://tinyurl.com/yaayvnhn
     Brendan Furey, March 2018

Unit test assertion driver program for JSON output files that are externally sourced. Loops over all
files in folder ../Out/external and creates results files formatted in HTML and text in a ../Out
subfolder named as the file name. The source JSON files contain a meta object and a scenarios
object in my standard data model.

The example files come from my Oracle unit testing project, where I have converted the current
version to read all input test data from JSON files, and to write output to JSON, to then be
formatted here via the Nodejs programs.

The files from the Oracle project, named {package}.{procedure}_OUT.json, are:

	TT_EMP_BATCH.tt_AIP_Load_Emps_OUT.json
	TT_EMP_WS.tt_AIP_Get_Dept_Emps_OUT.json
	TT_EMP_WS.tt_AIP_Save_Emps_OUT.json
	TT_VIEW_DRIVERS.tt_HR_Test_View_V_OUT.json

See https://github.com/BrenPatF/trapit_oracle_tester for the project that creates these files (the 
JSON version is not uploaded yet).
***************************************************************************************************/
const Trapit = require('../Lib/Trapit.js');
function testExternal(fileName) {

	const testData = Trapit.getUTData(fileName);
	const [meta, scenarios] = [testData.meta, testData.scenarios];

	const utOutput = Trapit.getUTResults(meta, scenarios);
	Trapit.prUTResultsHTML(utOutput);
	Trapit.prUTResultsText(utOutput);
}

const extFolder = '../Out/external';
const fs = require('fs');

fs.readdirSync(extFolder).forEach(file => {
    console.log(extFolder + '/' + file);
    testExternal(extFolder + '/' + file)
  });
