"use strict";
/***************************************************************************************************
Name: test-trapit.js                   Author: Brendan Furey                       Date: 10-Jun-2018

Component module in: The Math Function Unit Testing design pattern, implemented in nodejs

GitHub: https://github.com/BrenPatF/trapit_nodejs_tester

See: 'Database API Viewed As A Mathematical Function: Insights into Testing'
    https://www.slideshare.net/brendanfurey7/database-api-viewed-as-a-mathematical-function-insights-into-testing
    Brendan Furey, March 2018

Design pattern examples: There are three test programs, two with example main programs
====================================================================================================
|  Main/Test         |  Unit Module |  Notes                                                       |
|==================================================================================================|
|  main-hello-world  |              |  Simple Hello World program done as pure function to allow   |
|  test-hello-world  |  HelloWorld  |  for unit testing as a simple edge case                      |
|--------------------|--------------|--------------------------------------------------------------|
|  main-col-group    |              |  Simple file-reading and group-counting module, with logging |
|  test-col-group    |  ColGroup    |  to file. Example of testing impure units, and error display |
|--------------------|--------------|--------------------------------------------------------------|
|  format-externals  |              |                                                              |
|--------------------|  Trapit      |  Entry point module for the unit test formaatting functions  |
|                    |--------------|--------------------------------------------------------------|
| *test-trapit*      |  TrapitUtils |  Entry point module for testUnit, the main function called   |
|                    |              |  by unit test scripts                                        |
====================================================================================================
The trapit package can be used to facilitate unit testing in *any* language, so long as the same 
design pattern is followed, and the test driver program outputs a JSON file in the required format.
The separate externals example shows how to process externally generated files.

This file is a unit test program for the unit test results formaatting module.

To run from root (trapit) folder:

$ npm test

***************************************************************************************************/
const [Trapit,                   TrapitUtils                   ] =
      [require('../lib/trapit'), require('../lib/trapit-utils')];

const ROOT = 'test/',
      INPUT_JSON = ROOT + 'trapit.json';

const [DELIM, SUB_DELIM] = 
      ['|',   '~'      ];
const [INP_TITLE,           INP_FIELDS,      OUT_FIELDS,       INP_VALUES    ] = 
      ['Report',            'Input Fields',  'Output Fields',  'Input Values'],
      [EXP_VALUES,          ACT_VALUES,      OUT_VALUES,       SUMMARIES     ] = 
      ['Expected Values',   'Actual Values', 'Output Values',  'Summaries'   ],
      [EX_MESSAGE,          EX_STACK         ] = 
      ['Exception Message', 'Exception Stack'];

function lisToCsv(lis)       { return lis.join(DELIM) };
function lisToCsvSub(lis)    { return lis.join(SUB_DELIM) };
function csvToLis(csv)       { return csv.split(DELIM) };
function csvLisToLol(csvLis) { return csvLis.map((r) => csvToLis(r)) };

function setOut(utOutput) {

  let summaries = [];
  let [i_s, i_if, i_of, i_iv, i_ov] = [0, 0, 0, 0, 0];
  summaries[i_s++] = [
      'Report', '', '', 
      utOutput.repHdr, '', utOutput.repFtr,
      utOutput.result.nTest, utOutput.result.nFail, utOutput.result.status
  ].join(DELIM);
  let [actInpFlds, actOutFlds, actInpRows, actOutRows] = [[], [], [], []];

  for (const s in utOutput.sceLis) {
    const sce = utOutput.sceLis[s];
    summaries[i_s++] = [
        'Scenario', s, '',
        sce.sceHdr, sce.inpHdr + '-' + sce.outHdr, sce.sceFtr,
        sce.result.nTest, sce.result.nFail, sce.result.status
    ].join(DELIM);

    for (const g in sce.inpGroups) {
      const grp = sce.inpGroups[g];
      summaries[i_s++] = [
          'Input group', s, g,
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
      summaries[i_s++] = [
          'Output group', s, g,
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
      [SUMMARIES]  : summaries,
      [INP_FIELDS] : actInpFlds,
      [OUT_FIELDS] : actOutFlds,
      [INP_VALUES] : actInpRows,
      [OUT_VALUES] : actOutRows
  };
}
function setOutException(s, exceptions) {
  let actOutRows = [];
  actOutRows[0] = lisToCsv([s, EX_MESSAGE, exceptions[0]]);
  actOutRows[1] = lisToCsv([s, EX_STACK, exceptions[1]]);
  return {
      [SUMMARIES]  : [],
      [INP_FIELDS] : [],
      [OUT_FIELDS] : [],
      [INP_VALUES] : [],
      [OUT_VALUES] : actOutRows
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

  const [lolInp,                 lolExp,                 lolAct] =
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
    if (sce[s].out[g] == undefined) sce[s].out[g] = {exp: [], act: []};
    sce[s].out[g].exp.push(v.replace(SUB_DELIM, DELIM));
  }
  for (const r of lolAct) {
    const [s, g, v] = [r[0], r[1], r[2]];
    if (sce[s].out[g] == undefined) sce[s].out[g] = {exp: [], act: []};
    sce[s].out[g].act.push(v.replace(SUB_DELIM, DELIM));
  }
  return sce;
}
function purelyWrapUnit(inpGroups) {

  let inMeta = {};
  let exceptions = [];
  let utOutput = {};
  const inpFields = inpGroups[INP_FIELDS];
  const outFields = inpGroups[OUT_FIELDS];
  inMeta.title = inpGroups[INP_TITLE][0];
  inMeta.inp = getGroups(inpFields);
  inMeta.out = getGroups(outFields);

  const [inpValues,             expValues,             actValues] = 
        [inpGroups[INP_VALUES], inpGroups[EXP_VALUES], inpGroups[ACT_VALUES]];

  const inScenarios = getInScenarios(Object.keys(inMeta.inp), Object.keys(inMeta.out), 
                                     inpValues, expValues, actValues);
  try {
    utOutput = Trapit.getUTResults(inMeta, inScenarios);
  } catch(e) {
    exceptions[0] = e.message;
    exceptions[1] = e.stack;

    return setOutException(csvToLis(inpGroups[EXP_VALUES][0])[0], exceptions);
  }

  return setOut(utOutput);
}
TrapitUtils.testUnit(INPUT_JSON, ROOT, purelyWrapUnit);