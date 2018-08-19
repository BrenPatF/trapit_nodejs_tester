"use strict";
/***************************************************************************************************
Name: test-externals.js                Author: Brendan Furey                       Date: 05-Jul-2018

Component module in: The Math Function Unit Testing design pattern, implemented in nodejs

GitHub: https://github.com/BrenPatF/trapit_nodejs_tester

See: 'Database API Viewed As A Mathematical Function: Insights into Testing'
     https://tinyurl.com/yaayvnhn
     Brendan Furey, March 2018

Unit test assertion driver program for JSON output files that are externally sourced. Loops over all
files in folder ../out/external and creates results files formatted in HTML and text in a ../out
subfolder named as the file name. The source JSON files contain a meta object and a scenarios
object in my standard data model.

The example files come from my Oracle unit testing project, where I have converted the current
version to read all input test data from JSON files, and to write output to JSON, to then be
formatted here via the Nodejs programs.

The files from the Oracle project, named {package}.{procedure}_OUT.json, are:

	tt_emp_batch.tt_aip_load_emps_out.json
	tt_emp_ws.tt_aip_get_dept_emps_out.json
	tt_emp_ws.tt_aip_save_emps_out.json
	tt_view_drivers.tt_hr_test_view_v_out.json

See https://github.com/BrenPatF/trapit_oracle_tester for the project that creates these files
***************************************************************************************************/
const Trapit = require('../lib/trapit');
function testExternal(fileName) {

	const testData = Trapit.getUTData(fileName);
	const [meta, scenarios] = [testData.meta, testData.scenarios];

	Trapit.prUTResultsTextAndHTML(meta, scenarios);}

const extFolder = '../out/external';
const fs = require('fs');

fs.readdirSync(extFolder).forEach(file => {
  	console.log(extFolder + '/' + file);
  	testExternal(extFolder + '/' + file)
});