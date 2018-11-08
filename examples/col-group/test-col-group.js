'use strict';
/***************************************************************************************************
Name: test-col-group.js                Author: Brendan Furey                       Date: 10-Jun-2018

Component module in: The Math Function Unit Testing design pattern, implemented in nodejs

GitHub: https://github.com/BrenPatF/trapit_nodejs_tester

See: 'Database API Viewed As A Mathematical Function: Insights into Testing'
     https://tinyurl.com/yaayvnhn
     Brendan Furey, March 2018

Design pattern examples: There are three test programs, two with example main programs
====================================================================================================
|  Main/Test         |  Unit Module |  Notes                                                       |
|====================|==============|===============================================================
|  main-hello-world  |              |  Simple Hello World program done as pure function to allow   |
|  test-hello-world  |  HelloWorld  |  for unit testing as a simple edge case                      |
----------------------------------------------------------------------------------------------------
|  main-col-group    |              |  Simple file-reading and group-counting module, with logging |
| *test-col-group*   |  ColGroup    |  to file. Example of testing impure units, and error display |
----------------------------------------------------------------------------------------------------
|  test-trapit       |  Trapit      |  The assertion module itself written with core pure function |
|                    |              |  to enable unit testing, and make multiple reporters easy    |
====================================================================================================
The trapit package can be used to facilitate unit testing in *any* language, so long as the same 
design pattern is followed, and the test driver program outputs a JSON file in the required format.
The separate externals example shows how to process externally generated files.

This file is a unit test program for simple file-reading and group-counting module, with logging to 
file. Note that this example has two deliberate errors to show how these are displayed.  Example
using HTML-only function prUTResultsHTML.

To run from root (trapit) folder:

$ node examples\col-group\test-col-group

***************************************************************************************************/
const ColGroup = require('./col-group');
const Utils = require('../../lib/utils');
const Trapit = require('trapit');
const fs = require('fs');
const ROOT = './examples/col-group/';
const INPUT_JSON = ROOT + 'col-group.json';
const INPUT_FILE = ROOT + 'ut_group.csv';
const LOG_FILE = ROOT + 'ut_group.csv.log';
const DELIM = '|';
const [MIN_MSDIFF, MAX_MSDIFF] = [0, 2000];
const [GRP_LOG,	GRP_SCA,   GRP_LIN, GRP_LAI,    GRP_SBK,     GRP_SBV]  =
      ['Log',	  'Scalars', 'Lines', 'listAsIs', 'sortByKey', 'sortByValue'];

function fromCSV(csv, col) {return csv.split(DELIM)[col]};
function joinTuple(t) {return t.join(DELIM)}

function setup(inp) {
  fs.writeFileSync(INPUT_FILE, inp[GRP_LIN].join('\n'));
  if (inp[GRP_LOG].length > 0) {
    fs.writeFileSync(LOG_FILE, inp[GRP_LOG].join('\n') + '\n');
  }
  return new ColGroup(INPUT_FILE, fromCSV(inp[GRP_SCA][0], 0), fromCSV(inp[GRP_SCA][0], 1));
};
function teardown() {
	fs.unlinkSync(INPUT_FILE);
	fs.unlinkSync(LOG_FILE);
}
function purelyWrapUnit(callScenario) {
	const colGroup = setup(callScenario.inp);

	const linesArray = String(fs.readFileSync(LOG_FILE)).split('\n');
	const lastLine = linesArray[linesArray.length - 2];
	const text = lastLine.substring(26);
	const date = lastLine.substring(0, 24);
	const logDate = new Date(date);
	const now = new Date();
	const diffDate = now.getTime() - logDate.getTime();

  teardown();
	return {
		inp: callScenario.inp,
		out: {
			[GRP_LOG]: {exp: callScenario.out[GRP_LOG], act: [(linesArray.length - 1) + DELIM + 
                                                        diffDate + DELIM + text]},
			[GRP_LAI]: {exp: callScenario.out[GRP_LAI], act: [colGroup[GRP_LAI]().length.toString()]},
			[GRP_SBK]: {exp: callScenario.out[GRP_SBK], act: colGroup[GRP_SBK]().map(joinTuple)},
			[GRP_SBV]: {exp: callScenario.out[GRP_SBV], act: colGroup[GRP_SBV]().map(joinTuple)}
		}
	};
};
const testData = Trapit.getUTData(INPUT_JSON);
const [meta, callScenarios] = [testData.meta, testData.scenarios];

let scenarios = [];
for (const s in callScenarios) {
	scenarios[s] = purelyWrapUnit(callScenarios[s]);
};
const result = Trapit.prUTResultsHTML(meta, scenarios, ROOT)
console.log(Utils.heading(result.nFail + ' of ' + result.nTest + ' scenarios failed, see ' +
   ROOT + result.resFolder + ' for scenario listings'));