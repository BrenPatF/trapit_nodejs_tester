"use strict";
/***************************************************************************************************
Name: test-externals.js                Author: Brendan Furey                       Date: 05-Jul-2018

Component module in: The Math Function Unit Testing design pattern, implemented in nodejs

GitHub: https://github.com/BrenPatF/trapit_nodejs_tester

See: 'Database API Viewed As A Mathematical Function: Insights into Testing'
     https://tinyurl.com/yaayvnhn
     Brendan Furey, March 2018

Unit test assertion driver program for JSON output files that are externally sourced. The trapit
package can be used to facilitate unit testing in *any* language, so long as the same design pattern
is followed, and the test driver program outputs a JSON file in the required format.

This program loops over all .json files in a specified folder and creates results files formatted in
HTML and text in a subfolder named as the unit test title. The source JSON files contain a meta 
object and a scenarios object in my standard data model.

The example files come from my Oracle unit testing project, where all input test data are read from
JSON files, and output written to JSON files, to then be formatted here via the Nodejs programs.

The files from the Oracle project, named {package}.{procedure}_OUT.json, are:

	tt_emp_batch.tt_aip_load_emps_out.json
	tt_emp_ws.tt_aip_get_dept_emps_out.json
	tt_emp_ws.tt_aip_save_emps_out.json
	tt_view_drivers.tt_hr_test_view_v_out.json

See https://github.com/BrenPatF/trapit_oracle_tester for the project that creates these files.

Example using text and HTML function prUTResultsTextAndHTML.

To run from root (trapit) folder:

$ node examples\externals\test-externals

***************************************************************************************************/
const Trapit = require('trapit');
const ROOT = './examples/externals/';

function testExternal(fileName) {

	const testData = Trapit.getUTData(fileName);
	const [meta, scenarios] = [testData.meta, testData.scenarios];
	console.log(fileName + ': ' + Trapit.prUTResultsTextAndHTML(meta, scenarios, ROOT).nFail);
	return Trapit.prUTResultsTextAndHTML(meta, scenarios, ROOT).nFail;
}

const fs = require('fs');
let failFiles = [];
fs.readdirSync(ROOT).forEach(file => {
	if ( /.*\.json$/.test(file) && testExternal(ROOT + file) ) failFiles.push(file);
});
console.log(failFiles.length + ' externals failed, see ' + ROOT + ' for scenario listings');
failFiles.map(file => console.log(file));