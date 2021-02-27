"use strict";
/***************************************************************************************************
Name: text.js                          Author: Brendan Furey                       Date: 10-Jun-2018

Component module in: The Math Function Unit Testing design pattern, implemented in nodejs

GitHub: https://github.com/BrenPatF/trapit_nodejs_tester

See: 'Database API Viewed As A Mathematical Function: Insights into Testing'
   https://tinyurl.com/yaayvnhn
   Brendan Furey, March 2018

Modules: As well as the entry point module, Trapit, there are one helper class and three helper 
         modules of pure functions
====================================================================================================
|  Module  |  Notes                                                                                |
|===================================================================================================
|  Trapit  |  Entry point module, written with core pure functions to facilitate unit testing and  |
|          |  multiple reporters                                                                   |
----------------------------------------------------------------------------------------------------
|  Utils   |  General utility functions, called mainly by the Text module below                    |
----------------------------------------------------------------------------------------------------
|  Pages   |  Class used to buffer pages of text ahead of writing to file, used by Text and HTML   |
----------------------------------------------------------------------------------------------------
| *Text*   |  Module of pure functions that format text report output and buffer using Pages       |
----------------------------------------------------------------------------------------------------
|  HTML    |  Module of pure functions that format HTML report output and buffer using Pages       |
====================================================================================================

This file has a module of pure functions that format text report output and buffer using Pages.

***************************************************************************************************/
const Utils = require('./utils');
const Pgs = require('./pages');
var pg;

function prLine(line, ofile, indentLev = 0) { 
  pg.addLine(ofile, line, indentLev);
}
function lengthLis(maxSce) { 
  return [3, maxSce, 5, 6, 7];
}
function prListsAsLine(fields, lengths, ofile, indent) {

  const strings = [...fields.keys()].map( (j) => { return Utils.lJust(fields[j], lengths[j]) });
  prLine(strings.join('  '), ofile, indent);
  return strings;
}

const self = module.exports = {

  prHeading: (text, ofile, indent = 0) => {
    prLine(text, ofile, indent);
    prLine('='.repeat(text.length), ofile, indent);
  },
  prRepHdr: (text, root, ofile, fields, maxSce) => {
    pg = new Pgs(ofile, root);
    self.prHeading(text, ofile, 0);
    self.prColHdrs(fields, lengthLis(maxSce), ofile, 2)
  },
  prRepFtr: (text, ofile) => {
    prLine('', ofile);
    self.prHeading(text, ofile, 0);
    pg.printPagesRoot();
  },
  prRepLin: (sfile, sceLin, ofile, maxSce) => {
    const fields = [sceLin.sceNum, sceLin.sce, sceLin.nFail, sceLin.nTest, sceLin.status];
    self.prRec(fields, lengthLis(maxSce), ofile, 2);
  },
  prSceHdr: (text, ofile) => {
    prLine('', ofile);
    self.prHeading(text + ' {', ofile, 0);
  },
  prSceFtr: (text, ofile) => {
    prLine('', ofile);
    self.prHeading('} ' + text, ofile, 0);
  },
  prIOHdr: (text, ofile) => {
    prLine('', ofile);
    self.prHeading(text, ofile, 1);
  },
  prGrpHdr: (text, nonEmpty, ofile) => {
    const br = nonEmpty ? ' {' : '';
    prLine('', ofile);
    self.prHeading(text + br, ofile, 2);
  },
  prGrpFtr: (text, ofile) => {
    let br = '}';
    if (text != '') {
      br = br + ' ';
    }
    prLine('', ofile);
    self.prHeading(br + text, ofile, 2);
  },
  prColHdrs: (fields, lengths, ofile, indent = 4) => {
    prLine('', ofile);
    const strings = prListsAsLine(fields, lengths, ofile, indent);
    const unders = strings.map((s) => { return '-'.repeat(s.length) })
    prLine(unders.join('  '), ofile, indent);
  },
  prRec: (fields, lengths, ofile, indent = 4) => {
    prListsAsLine(fields, lengths, ofile, indent);
  }
}