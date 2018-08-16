"use strict";
/***************************************************************************************************
Name: trapit.js                        Author: Brendan Furey                       Date: 10-Jun-2018

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
|  TestTrapit      | *Trapit*     |  The assertion module itself, written with core pure function  |
|                  |              |  to enable unit testing, and make multiple reporters easy      |
====================================================================================================

The assertion module itself, written with core pure function to enable unit testing, and make 
multiple reporters easy

***************************************************************************************************/
const Utils = require ('./utils');
const DELIM = '|';
const UNTESTED = 'UNTESTED';

const BOILER = {
        sceHdr         : 'SCENARIO $1: $2',
        sceFtr         : '$1 failed of $2: $3',
        inputs         : 'INPUTS',
        outputs        : 'OUTPUTS',
        grpHdr         : 'GROUP $1: $2',
        emptyInpGrpHdr : 'GROUP $1: $2: Empty',
        emptyOutGrpHdr : 'GROUP $1: $2: Empty as expected: SUCCESS',
        inpGrpFtr      : '',
        outGrpFtr      : '$1 failed of $2: $3',
        errFlag        : '*',
        recNo          : '#',
        success        : 'SUCCESS',
        failure        : 'FAILURE',
        repHdr         : 'Unit Test Report: $1',
        repFtr         : 'Test scenarios: $1 failed of $2: $3'
};
function csvToLis(csv) {return csv.split(DELIM)}
function expRepRegex(exp, act) {
  const [expLis, actLis] = [csvToLis(exp), csvToLis(act)];
  let [repExpLis, repActLis] = [[], []];
  for (const i in expLis) {
    repExpLis[i] =expLis[i];
    repActLis[i] =actLis[i];
    if (expLis[i].trim() === UNTESTED) { 
      repExpLis[i] = UNTESTED + ': ' + actLis[i];
      repActLis[i] = repExpLis[i];
    } else if (expLis[i].length > 7 && expLis[i].substring(0, 4) === 'IN [') {
      let rPair = expLis[i].substring(4, expLis[i].length - 1).split(',').map(s => s.trim());
      repExpLis[i] = repExpLis[i] + ': ' + actLis[i];
      if (actLis[i] < +rPair[0] || actLis[i] > +rPair[1]) {
        repActLis[i] = 'NOT ' + repExpLis[i];
      } else {
        repActLis[i] = repExpLis[i];
      }
    } else if (expLis[i].length > 8 && expLis[i].substring(0, 6).trim() === 'LIKE /') {
      let regex = new RegExp(expLis[i].substring(6, expLis[i].length - 1));
      repExpLis[i] = repExpLis[i] + ': ' + actLis[i];
      if (regex.test(actLis[i])) {
        repActLis[i] = repExpLis[i];
      } else {
        repActLis[i] =  'NOT ' + repExpLis[i];
      }
    }
  }
  return [repExpLis.join(DELIM), repActLis.join(DELIM)];
}
function mkInpObj(inp, groups) {
  let inpGroups = {};
  let i = 0;
  for (let g in groups)  {

    let fields = groups[g].slice(); 
    fields.unshift(BOILER.recNo);
    let val2Lis = Object.keys(inp[g]).map( (i) => {return (+ i + 1) + DELIM + inp[g][i]})
        .map(csvToLis);
    let lenLis = val2Lis.reduce( (a, b) => {
      return [...a.keys()].map(k => (a[k].length > b[k].length ? a[k] : b[k]));
    }, fields).map(s => s.length);
    val2Lis.unshift(fields);
    let grpHdr = (val2Lis.length === 1) ? BOILER.emptyInpGrpHdr : BOILER.grpHdr;
    inpGroups[g] = {
        grpHdr  : grpHdr.replace('$1', ++i).replace('$2', g),
        grpFtr  : BOILER.inpGrpFtr,
        val2Lis : val2Lis,
        lenLis  : lenLis
    };
  }
  return inpGroups;
}
function mkOutObj(out, groups) {

  let sceResult = {nTest : Object.keys(out).length, nFail : 0, status : BOILER.success};
  let outGroups = {};
  let i = 0;
  for (let g in groups)  {

    let fields = groups[g].slice(); 
    fields.unshift(BOILER.recNo);
    let [exp, act] = [out[g].exp.slice(), out[g].act.slice()];
    let [lenLis, val2Lis, valLis, result] = [[], [[]], [], {}];
    let [nFail, nTest] = [0, 0];
    let status = BOILER.success;
    if (exp.length > 0 || act.length > 0) {

      let lenDif = exp.length - act.length;
      if (lenDif != 0) {

        let exRec = exp.length > act.length ? exp[0] : act[0];
        let padRec = exRec.replace(new RegExp('[^\\' + DELIM + ']', 'g'), '');

        if (lenDif > 0) {
          for (let j = 0; j < lenDif; j++) {act.push(padRec)};
        } else {
          for (let j = 0; j < - lenDif; j++) {exp.push(padRec)};
        }
      }
      for (let j = 0; j < exp.length; j++) {
        const [expStr, actStr] = [...expRepRegex(exp[j], act[j])];
        valLis.push(expStr);
        if (actStr != expStr) {
          valLis.push(actStr);
          valLis[valLis.length - 2] = (j + 1) +  DELIM + valLis[valLis.length - 2];
          valLis[valLis.length - 1] = (j + 1) + BOILER.errFlag + DELIM + valLis[valLis.length - 1];
          nFail++;
          status = BOILER.failure;
        } else {
          valLis[valLis.length - 1] = (j + 1) + DELIM + valLis[valLis.length - 1];
        };
      }
      if (nFail > 0) {
        sceResult.status = BOILER.failure;
        sceResult.nFail++;
      };
      nTest = Math.max(exp.length, act.length);
      val2Lis = valLis.map(csvToLis);
      lenLis = val2Lis.reduce( (a, b) => {
        return [...a.keys()].map(k => (a[k].length > b[k].length ? a[k] : b[k]));
      }, fields).map(s => s.length);
    }
    let grpHdr = (nTest === 0) ? BOILER.emptyOutGrpHdr : BOILER.grpHdr;
    val2Lis.unshift(fields);
    outGroups[g] = {
        grpHdr  : grpHdr.replace('$1', ++i).replace('$2', g),
        grpFtr  : BOILER.outGrpFtr.replace('$1', nFail).replace('$2', nTest).replace('$3', status),
        val2Lis : val2Lis,
        lenLis  : lenLis,
        result  : {nTest : nTest, nFail : nFail, status : status}
    };
  }
  return {outGroups: outGroups, result: sceResult};
}

function chkRec(s, g, r, nFields, typ) {
  if (csvToLis(r).length != nFields) {
    throw new Error('Error, ' + typ + ' #fields ' + csvToLis(r).length + ', expected ' + nFields +
      ' [s: ' + s + ', g: ' + g + ', r: ' + r + ']');
  }
}
function getCallScenarios(scenarios) {
  let callScenarios = {};
  for (const s in scenarios) {
    callScenarios[s] = {inp: scenarios[s].inp, out: {}};
    for (const g in scenarios[s].out) {
      callScenarios[s].out[g] = scenarios[s].out[g].act.slice();
    }
  }
  return callScenarios;
}
function prInputs(meta, scenarios) {
  Utils.write('{ "meta": ' + JSON.stringify(meta, null, 4) + ',');
  const callScenarios = getCallScenarios(scenarios);
  Utils.write('"scenarios" : { ');
  const nSce = Object.keys(callScenarios).length;
  let n_s = 0;
  for (const s in callScenarios) {
    Utils.write('"' + s + '": ', 1);
    Utils.write(JSON.stringify(callScenarios[s], null, 4), 1);
    if (++n_s < nSce) {Utils.write(',')};
  }
  Utils.write('}}');
  Utils.write('"Full scenarios" : { ');
  n_s = 0;
  for (const s in scenarios) {
    let comma;
    Utils.write('"' + s + '": ' + JSON.stringify(scenarios[s], null, 4), 1);
    if (++n_s == nSce) {comma = '}'} else  {comma = ','};
    Utils.write('}}' + comma);
  }
  Utils.write('}}');
}
function chkGrpLen(expGrps, actGrps, s) {
  const [expLen, actLen] = [Object.keys(expGrps).length, Object.keys(actGrps).length];
  if (actLen != expLen) {
    throw new Error('Error, s: ' + s + ': expected #groups = ' + expLen + ', actual #groups = ' +
                    actLen);
  }
}
function chkOutGrp(out, s, g) {

  if (out === undefined) {
    throw new Error('Error, ' + '*** s: g: ' + s + ': ' + g + ': output group undefined');
  }
  if (out.exp === undefined) {
    throw new Error('Error, ' + '*** s: g: ' + s + ': ' + g + ': exp object undefined');
  }
  if (out.act === undefined) {
    throw new Error('Error, ' + '*** s: g: ' + s + ': ' + g + ': act object undefined');
  }
}
function chkInputs(meta, scenarios) {

//  prInputs(meta, scenarios);  uncomment to get meta + actuals in json fmt sent to stdout
  for (const s in scenarios) {
    chkGrpLen(meta.inp, scenarios[s].inp, 'Inp: ' + s);
    chkGrpLen(meta.out, scenarios[s].out, 'Out: ' + s);
  }
  for (const g in meta.inp) {
    const nFields = meta.inp[g].length;
    for (const s in scenarios) {
      for (const r of scenarios[s].inp[g]) {
        chkRec(s, g, r, nFields, 'inp');
      }
    }
  }
  for (const g in meta.out) {
    const nFields = meta.out[g].length;
    for (const s in scenarios) {
      chkOutGrp(scenarios[s].out[g], s, g);
      for (const r of scenarios[s].out[g].exp) {
        chkRec(s, g, r, nFields, 'exp');
      }
      for (const r of scenarios[s].out[g].act) {
        chkRec(s, g, r, nFields, 'act');
      }
    }
  }
}
function prUTResults(results, ext, p) {
  const root = Utils.repSpaces(results.title);
  const ifile = root + ext;

  p.prRepHdr(results.repHdr, '../out/' + root, ifile);
  for (const s in results.sceLis)  {
    const sfile = Utils.repSpaces(s) + ext;
    const sceLis = results.sceLis[s];
    const [inpGroups, outGroups] = [sceLis.inpGroups, sceLis.outGroups];
    p.prSceHdr(sceLis.sceHdr, sfile);
    p.prIOHdr(sceLis.inpHdr, sfile);
    for (const g in inpGroups)  {
      const [val2Lis, lenLis] = [inpGroups[g].val2Lis, inpGroups[g].lenLis]
      p.prGrpHdr(inpGroups[g].grpHdr, val2Lis.length > 1, sfile);
      if (val2Lis.length > 1) {
        p.prColHdrs(val2Lis[0], lenLis, sfile);
        for (let k = 1; k < val2Lis.length; k++) {
          p.prRec(val2Lis[k], lenLis, sfile);
        }
        p.prGrpFtr(inpGroups[g].grpFtr, sfile);
      }
    }
    p.prIOHdr (sceLis.outHdr, sfile);
    for (const g in outGroups)  {
      const [val2Lis, lenLis] = [outGroups[g].val2Lis, outGroups[g].lenLis]
      p.prGrpHdr(outGroups[g].grpHdr, outGroups[g].result.nTest > 0, sfile);
      if (outGroups[g].result.nTest > 0) {
        p.prColHdrs(val2Lis[0], lenLis, sfile);
        for (let k = 1; k < val2Lis.length; k++) {
          p.prRec(val2Lis[k], lenLis, sfile);
        }
        p.prGrpFtr(outGroups[g].grpFtr, sfile);
      }
    }
    p.prRepLin(sfile, sceLis.sceHdr, sceLis.sceFtr, ifile);
    p.prSceFtr(sceLis.sceFtr, sfile);
  }
  p.prRepFtr(results.repFtr, ifile);
}
module.exports = {
  getUTData: (dataFile) => {
    const fs = require('fs');
    const testData = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(testData);
  },
  getUTResults: (meta, scenarios) => {
    chkInputs(meta, scenarios);
    const result = {nTest : Object.keys(scenarios).length, nFail : 0, status : BOILER.success};
    let sceLis = [];
    let i = 0;
    for (const s in scenarios)  {
      sceLis[s] = {};
      sceLis[s].sceHdr = BOILER.sceHdr.replace('$1', ++i).replace('$2', s);
      sceLis[s].inpHdr = BOILER.inputs;
      sceLis[s].outHdr = BOILER.outputs;
      sceLis[s].inpGroups = mkInpObj(scenarios[s].inp, meta.inp);
      
      const outObj = mkOutObj(scenarios[s].out, meta.out);
      sceLis[s].outGroups = outObj.outGroups;
      sceLis[s].result = outObj.result;
      sceLis[s].sceFtr = BOILER.sceFtr.replace('$1', outObj.result.nFail)
                                      .replace('$2', outObj.result.nTest)
                                      .replace('$3', outObj.result.status);
      if (outObj.result.nFail > 0) {
        result.status = BOILER.failure;
        result.nFail++;
      };
    }
    return  {title  : meta.title,
         sceLis  : sceLis, 
         result : result,
         repHdr : BOILER.repHdr.replace('$1', meta.title),
         repFtr : BOILER.repFtr.replace('$1', result.nFail)
                               .replace('$2', result.nTest)
                               .replace('$3', result.status)};
  },
  prUTResultsText: (results) => {
    const t = require('./text');
    prUTResults(results, '.txt', t);
  },
  prUTResultsHTML: (results) => {
    const h = require('./html');
    prUTResults(results, '.html', h);
  }
}