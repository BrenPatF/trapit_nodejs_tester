"use strict";
/***************************************************************************************************
Name: TestHelloWorld.js                Author: Brendan Furey                       Date: 10-Jun-2018

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
| *TestHelloWorld* |  HelloWorld  |  unit testing as a simple edge case                            |
----------------------------------------------------------------------------------------------------
|  MainColGroup    |              |  A simple file-reading and group-counting module, with logging |
|  TestColGroup    |  ColGroup    |  to file. Example of testing impure units, and error display   |
----------------------------------------------------------------------------------------------------
|  TestTrapit      |  Trapit      |  The assertion module itself, written with core pure function  |
|                  |              |  to enable unit testing, and make multiple reporters easy      |
====================================================================================================

Unit test program for simple Hello World program done as pure function to allow for unit testing as
a simple edge case  

***************************************************************************************************/
const Trapit = require('../Lib/Trapit.js');
const Hw = require('../Lib/HelloWorld');
const fs = require('fs');
const GROUP = 'Group';
function purelyWrapUnit(callScenario) {
	return {
		inp : {},
		out : {
				[GROUP] : {
					exp: callScenario.out[GROUP], act : [Hw.helloWorld()]
			    }
		}
	};
}
const testData = Trapit.getUTData('../inp/helloWorld.json');
const [meta, callScenarios] = [testData.meta, testData.scenarios];

let scenarios = [];
for (const s in callScenarios) {
	scenarios[s] = purelyWrapUnit(callScenarios[s]);
};
const utOutput = Trapit.getUTResults(meta, scenarios);
Trapit.prUTResultsHTML(utOutput);
Trapit.prUTResultsText(utOutput);
