"use strict";
/***************************************************************************************************
Name: format-externals.js              Author: Brendan Furey                       Date: 05-Jul-2018

Component module in: The Math Function Unit Testing design pattern, implemented in nodejs

GitHub: https://github.com/BrenPatF/trapit_nodejs_tester

See: 'Database API Viewed As A Mathematical Function: Insights into Testing'
    https://www.slideshare.net/brendanfurey7/database-api-viewed-as-a-mathematical-function-insights-into-testing
    Brendan Furey, March 2018


====================================================================================================
|  Main/Test         |  Unit Module |  Notes                                                       |
|==================================================================================================|
|  format-externals  |  Trapit      |  Simple Hello World program done as pure function to allow   |
|                    |  HelloWorld  |  for unit testing as a simple edge case                      |
|--------------------|--------------|--------------------------------------------------------------|
|  main-col-group    |              |  Simple file-reading and group-counting module, with logging |
|  test-col-group    |  ColGroup    |  to file. Example of testing impure units, and error display |
|--------------------|--------------|--------------------------------------------------------------|
|                    |              |                                                              |
|                    |              |  Entry point module for the unit test formaatting functions  |
| *test-trapit*      |--------------|--------------------------------------------------------------|
|                    |  TrapitUtils |  Entry point module for testUnit, the main function called   |
|                    |              |  by unit test scripts                                        |
====================================================================================================
Unit test formatting driver program for JSON output files that are externally sourced. The trapit
package can be used to facilitate unit testing in *any* language, so long as the same design pattern
is followed, and the test driver program outputs a JSON file in the required format.

This program loops over all .json files in a specified folder and creates results files formatted in
HTML and text in a subfolder named from the unit test title. The source JSON files contain a meta 
object and a scenarios object in a standard data model.

The example files come from an Oracle unit testing project, where all input test data are read from
JSON files, and output written to JSON files, to then be formatted here via the nodejs programs.

The files from the Oracle project, named {package}.{procedure}_out.json, are:

	tt_emp_batch.load_emps_out.json
	tt_emp_ws.get_dept_emps_out.json
	tt_emp_ws.save_emps_out.json
	tt_view_drivers.tt_hr_test_view_v_out.json

See https://github.com/BrenPatF/oracle_plsql_api_demos for the project that creates these files.

Example using text and HTML function prUTResultsTextAndHTML.

To run from root (trapit) folder:

$ node examples\externals\test-externals

***************************************************************************************************/
const [ROOT,          subFolder,       Trapit           ] =
      ['./externals', process.argv[2], require('../lib/trapit-utils')]; //require('trapit') -- npm install, using index.js
const DEFAULT_COLORS = {h1: '#FFFF00', h2: '#2AE6C1', h3: '#33F0FF', h4: '#7DFF33'};
let colors = DEFAULT_COLORS;
//colors.h2 = '#a232a8';

Trapit.tabMkUTExternalResultsFolders(ROOT + (subFolder === undefined ? '' : '/' + subFolder), 'B', colors); // H/T/B : Format in HTML/Text/Both