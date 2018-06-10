"use strict";
/***************************************************************************************************
Name: TestTrapit.js                    Author: Brendan Furey                       Date: 10-Jun-2018

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
|  TestColGroup    |  ColGroup    |  to file. Example of testing impure units, and error display   |
----------------------------------------------------------------------------------------------------
| *TestTrapit*     |  Trapit      |  The assertion module itself, written with core pure function  |
|                  |              |  to enable unit testing, and make multiple reporters easy      |
====================================================================================================

Unit test program for the assertion module itself, written with core pure function to enable unit
testing, and make multiple reporters easy  

***************************************************************************************************/
const Utils = require('../Lib/Utils.js');
const Trapit = require('../Lib/Trapit.js');

const [DELIM, SUB_DELIM] = ['|', '~'];
const [INP_TITLE,	INP_FIELDS,    	OUT_FIELDS,			INP_VALUES,		EXP_VALUES,			ACT_VALUES,		 OUT_VALUES,	  SUMMARIES] = 
      ['Report', 	'Input Fields',	'Output Fields',	'Input Values',	'Expected Values',	'Actual Values', 'Output Values', 'Summaries'];

function lisToCsv(lis) { return lis.join(DELIM) };
function lisToCsvSub(lis) { return lis.join(SUB_DELIM) };
function csvToLis(csv) { return csv.split(DELIM) }
function csvLisToLol(csvLis) { return csvLis.map((r) => csvToLis(r)) }

function setOut(exp, utOutput) {

	let summaries = [];
	let [i_s, i_if, i_of, i_iv, i_ov] = [0, 0, 0, 0, 0];
	summaries[i_s++] = [   'Report', '', '', 
					       utOutput.repHdr, '', utOutput.repFtr,
					       utOutput.result.nTest, utOutput.result.nFail, utOutput.result.status
				       ].join(DELIM);
	let [actInpFlds, actOutFlds, actInpRows, actOutRows] = [[], [], [], []];
	for (const s in utOutput.sceLis) {
		const sce = utOutput.sceLis[s];
		summaries[i_s++] = [  'Scenario', s, '',
						      sce.sceHdr, sce.inpHdr + '-' + sce.outHdr, sce.sceFtr,
						      sce.result.nTest, sce.result.nFail, sce.result.status
				   		   ].join(DELIM);
		for (const g in sce.inpGroups) {
			const grp = sce.inpGroups[g];
			summaries[i_s++] = [  'Input group', s, g,
						  	       grp.grpHdr, '', grp.grpFtr,
						  	       '', '', ''
				   		 	   ].join(DELIM);
			for (const k in grp.val2Lis[0]) {
				actInpFlds[i_if++] = [s, g, grp.val2Lis[0][k], grp.lenLis[k]].join(DELIM);
			}
			for (let k = 1; k < grp.val2Lis.length; k++) {
				actInpRows[i_iv++] = [s, g, lisToCsvSub(grp.val2Lis[k])].join(DELIM);
			}
		}
		for (const g in sce.outGroups) {
			const grp = sce.outGroups[g];
			summaries[i_s++] = ['Output group', s, g,
						  	  	grp.grpHdr, '', grp.grpFtr,
						  	  	grp.result.nTest, grp.result.nFail, grp.result.status
				   		 	   ].join(DELIM);
			for (const k in grp.val2Lis[0]) {
				actOutFlds[i_of++] = [s, g, grp.val2Lis[0][k], grp.lenLis[k]].join(DELIM);
			}
			for (let k = 1; k < grp.val2Lis.length; k++) {
				actOutRows[i_ov++] = [s, g, lisToCsvSub(grp.val2Lis[k])].join(DELIM);
			}
		}
	}
	return {
			[SUMMARIES]  : {exp: exp[SUMMARIES],  act: summaries},
			[INP_FIELDS] : {exp: exp[INP_FIELDS], act: actInpFlds},
			[OUT_FIELDS] : {exp: exp[OUT_FIELDS], act: actOutFlds},
			[INP_VALUES] : {exp: exp[INP_VALUES], act: actInpRows},
			[OUT_VALUES] : {exp: exp[OUT_VALUES], act: actOutRows}
	};
}
function getGroups(fields) {

	const lol = fields.map((r) => csvToLis(r));
	let ret = {};
	for (const r of lol) {
		const [g, f] = [r[0], r.slice(1)];
		if (g in ret) {
			ret[g] = ret[g].concat(f);
		} else {
			ret[g] = f;
		}
	}
	return ret;
}
function addSce(inpGroups, outGroups, sce, lol) {
	let ret = sce;

	for (const l of lol) {
		const s = l[0];
		if (!(s in ret)) {
			ret[s] = {inp: {}, out: {}};

			for (const g of inpGroups) {
				ret[s].inp[g] = [];
			}
			for (const g of outGroups) {
				ret[s].out[g] = {exp: [], act: []};
			}
		}
	}
	return ret;
}
function getInScenarios(inpGroups, outGroups, inpValues, expValues, actValues) {

	const [lolInp,				   lolExp,                 lolAct] =
		  [csvLisToLol(inpValues), csvLisToLol(expValues), csvLisToLol(actValues)];

	let sce = {};
	sce = addSce(inpGroups, outGroups, sce, lolInp);
	sce = addSce(inpGroups, outGroups, sce, lolExp);
	sce = addSce(inpGroups, outGroups, sce, lolAct);

	for (const r of lolInp) {
		const [s, g, v] = [r[0], r[1], r[2]];
		sce[s].inp[g].push(v.replace(SUB_DELIM, DELIM));
	}
	for (const r of lolExp) {
		const [s, g, v] = [r[0], r[1], r[2]];
		sce[s].out[g].exp.push(v.replace(SUB_DELIM, DELIM));
	}
	for (const r of lolAct) {
		const [s, g, v] = [r[0], r[1], r[2]];
		sce[s].out[g].act.push(v.replace(SUB_DELIM, DELIM));
	}
	return sce;
}
function purelyWrapUnit (callScenario) {

	let inMeta = {};
	const inpFields = callScenario.inp[INP_FIELDS];
	const outFields = callScenario.inp[OUT_FIELDS];
	inMeta.title = callScenario.inp[INP_TITLE][0];
	inMeta.inp = getGroups(inpFields);
	inMeta.out = getGroups(outFields);

	const [inpValues, 					 expValues, 				   actValues] = 
		  [callScenario.inp[INP_VALUES], callScenario.inp[EXP_VALUES], callScenario.inp[ACT_VALUES]];

	const inScenarios = getInScenarios(Object.keys(inMeta.inp), Object.keys(inMeta.out), inpValues, expValues, actValues);
    const utOutput = Trapit.getUTResults(inMeta, inScenarios);
//    Trapit.prUTResultsText(utOutput); debugging

	return {inp: callScenario.inp, out: setOut(callScenario.out, utOutput)};
};
const testData = Trapit.getUTData('../inp/Trapit.json');
const [meta, callScenarios] = [testData.meta, testData.scenarios];

let scenarios = {};
for (let s in callScenarios) {
	scenarios[s] = purelyWrapUnit(callScenarios[s]);
};

const utOutput = Trapit.getUTResults(meta, scenarios);
Trapit.prUTResultsText(utOutput);
Trapit.prUTResultsHTML(utOutput);