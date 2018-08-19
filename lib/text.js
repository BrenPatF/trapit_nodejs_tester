"use strict";
/***************************************************************************************************
Name: text.js                          Author: Brendan Furey                       Date: 10-Jun-2018

Component module in: The Math Function Unit Testing design pattern, implemented in nodejs

GitHub: https://github.com/BrenPatF/trapit_nodejs_tester

See: 'Database API Viewed As A Mathematical Function: Insights into Testing'
   https://tinyurl.com/yaayvnhn
   Brendan Furey, March 2018

Helper modules: There are two helper classes and three helper modules of pure functions
====================================================================================================
|  Module   |  Notes                                                                               | 
|===================================================================================================
|  Utils    |  General utility functions, called mainly by the Text module below                   |
----------------------------------------------------------------------------------------------------
|  TimerSet |  Code timing class, used here only by the main programs                              |
----------------------------------------------------------------------------------------------------
|  Pages    |  Class used to buffer pages of text ahead of writing to file, used by Text and HTML  |
----------------------------------------------------------------------------------------------------
| *Text*    |  Module of pure functions that format text report output and buffer using Pages      |
----------------------------------------------------------------------------------------------------
|  HTML     |  Module of pure functions that format HTML report output and buffer using Pages      |
====================================================================================================

Module of pure functions that format text report output and buffer using Pages

***************************************************************************************************/
const Utils = require('./utils.js');
const Pgs = require('./pages');
var pg;

function prLine(line, ofile, indentLev = 0) { 
  pg.addLine(ofile, line, indentLev);
}
function prListsAsLine(fields, lengths, ofile) {

  const strings = [...fields.keys()].map( (j) => { return Utils.lJust(fields[j], lengths[j]) });
  prLine(strings.join('  '), ofile, 4);
  return strings;
}

var self = module.exports = {

  prHeading: (text, ofile, indent = 0) => {
    prLine(text, ofile, indent);
    prLine('='.repeat(text.length), ofile, indent);
  },
  prRepHdr: (text, root, ofile) => {
    pg = new Pgs(ofile, root);
    self.prHeading(text, ofile, 0);
    prLine ('', ofile);
  },
  prRepFtr: (text, ofile) => {
    prLine('', ofile);
    self.prHeading(text, ofile, 0);
    pg.printPagesRoot();
  },
  prRepLin: (sfile, hdr, ftr, ofile) => {
    prLine(hdr + ' : ' + ftr, ofile, 1);
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
  prColHdrs: (fields, lengths, ofile) => {
    prLine('', ofile);
    const strings = prListsAsLine(fields, lengths, ofile);
    const unders = strings.map((s) => { return '-'.repeat(s.length) })
    prLine(unders.join('  '), ofile, 4);
  },
  prRec: (fields, lengths, ofile) => {
    prListsAsLine(fields, lengths, ofile);
  }
}