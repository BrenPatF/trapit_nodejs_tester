'use strict';
/***************************************************************************************************
Name: MainColGroup.js                  Author: Brendan Furey                       Date: 10-Jun-2018

Component module in: The Math Function Unit Testing design pattern, implemented in nodejs

GitHub: https://github.com/BrenPatF/trapit_nodejs_tester

See: 'Database API Viewed As A Mathematical Function: Insights into Testing'
     https://tinyurl.com/yaayvnhn
     Brendan Furey, March 2018

Design pattern examples: There are three test programs, two with example main programs
====================================================================================================
|  Main/Test       |  Unit Module |  Notes                                                         |
|==================|==============|=================================================================
|  MainHelloWorld  |              |  Simple Hello World program done as pure function to allow for |
|  TestHelloWorld  |  HelloWorld  |  unit testing as a simple edge case                            |
----------------------------------------------------------------------------------------------------
|  MainColGroup    |              |  A simple file-reading and group-counting module, with logging |
| *TestColGroup*   |  ColGroup    |  to file. Example of testing impure units, and error display   |
----------------------------------------------------------------------------------------------------
|  TestTrapit      |  Trapit      |  The assertion module itself, written with core pure function  |
|                  |              |  to enable unit testing, and make multiple reporters easy      |
====================================================================================================

Unit test program for simple file-reading and group-counting module, with logging to file. Note that
this example has two deliberate errors to show how these are displayed

***************************************************************************************************/
const Utils = require('../Lib/Utils.js');
const ColGroup = require('../Lib/ColGroup.js');
const Trapit = require('../Lib/Trapit.js');
const fs = require('fs');

const INPUT_FILE = '../Inp/ut_group.csv'
const LOG_FILE = '../Inp/ut_group.csv.log'
const DELIM = '|';
const [MIN_MSDIFF, MAX_MSDIFF] = [0, 2000];
const [GRP_LOG,	GRP_SCA,   GRP_LIN, GRP_LAI,    GRP_SBK,     GRP_SBV]  =
      ['Log',	'Scalars', 'Lines', 'listAsIs', 'sortByKey', 'sortByValue'];

function fromCSV(csv, col) {return csv.split(DELIM)[col]};
function joinTuple(t) {return t.join(DELIM)}

function setup(inp) {
    fs.writeFileSync(INPUT_FILE, inp[GRP_LIN].join('\n'));
    if (inp[GRP_LOG].length > 0) {
    	fs.writeFileSync(LOG_FILE, inp[GRP_LOG].join('\n') + '\n');
    }
    return new ColGroup(INPUT_FILE, fromCSV(inp[GRP_SCA][0], 0), fromCSV(inp[GRP_SCA][0], 1));
};
function getActDurationMsg(diffDate) {
	let actDurationMsg;
	if (diffDate < MIN_MSDIFF) {
		actDurationMsg = 'Log time too early by ' + (MIN_MSDIFF - diffDate) + 'ms';
	} else if (diffDate > MAX_MSDIFF) {
		actDurationMsg = 'Log time too late by ' + (diffDate - MAX_MSDIFF) + 'ms';
	} else if (diffDate <= MAX_MSDIFF && diffDate >= MIN_MSDIFF) {
		actDurationMsg = 'Log time within range [' + MIN_MSDIFF + ', ' + MAX_MSDIFF + ']ms of start';
	} else {
		actDurationMsg = 'Invalid log date ' + date;
	}
	return actDurationMsg;
}
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
//	Utils.sleep(2550); // for debugging
	const now = new Date();
	const diffDate = now.getTime() - logDate.getTime();
	const actDurationMsg = getActDurationMsg(diffDate);

    teardown();
	return {
		inp: callScenario.inp,
		out: {
				[GRP_LOG] : {exp: callScenario.out[GRP_LOG], act: [(linesArray.length - 1) + DELIM + actDurationMsg + DELIM + text]},
				[GRP_LAI] : {exp: callScenario.out[GRP_LAI], act: [colGroup[GRP_LAI]().length.toString()]},
				[GRP_SBK] : {exp: callScenario.out[GRP_SBK], act: colGroup[GRP_SBK]().map(joinTuple)},
				[GRP_SBV] : {exp: callScenario.out[GRP_SBV], act: colGroup[GRP_SBV]().map(joinTuple)}
		}
	};
};
const testData = Trapit.getUTData('../inp/colGroup.json');
const [meta, callScenarios] = [testData.meta, testData.scenarios];

let scenarios = [];
for (const s in callScenarios) {
	scenarios[s] = purelyWrapUnit(callScenarios[s]);
};
const utOutput = Trapit.getUTResults(meta, scenarios);
Trapit.prUTResultsText(utOutput);
Trapit.prUTResultsHTML(utOutput);