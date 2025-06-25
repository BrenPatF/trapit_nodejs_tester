"use strict";
/***************************************************************************************************
Name: text.js                          Author: Brendan Furey                       Date: 10-Jun-2018

Component package in the 'Trapit - JavaScript Unit Testing/Formatting Utilities' module, which 
facilitates unit testing in Oracle PL/SQL following 'The Math Function Unit Testing design pattern',
as described here: 

    https://brenpatf.github.io/2023/06/05/the-math-function-unit-testing-design-pattern.html

GitHub project for JavaScript:

    https://github.com/BrenPatF/trapit_nodejs_tester

At the heart of the design pattern there is a language-specific unit testing driver function. This
function reads an input JSON scenarios file, then loops over the scenarios making calls to a
function passed in as a parameter from the calling script. The passed function acts as a 'pure'
wrapper around calls to the unit under test. It is 'externally pure' in the sense that it is
deterministic, and interacts externally only via parameters and return value. Where the unit under
test reads inputs from file the wrapper writes them based on its parameters, and where the unit
under test writes outputs to file the wrapper reads them and passes them out in its return value.
Any file writing is reverted before exit.

The driver function accumulates the output scenarios containing both expected and actual results
in an object, from which a function writes the results in HTML and text formats.

In JavaScript, the entry-point API, fmtTestUnit, calls testUnit to write the formatted results
files, then output a summary.

There is an entry point package, TrapitUtils, with three functions for JavaScript unit testing and
three for formatting externally-sourced results read from JSON files. This package calls the Trapit
package to handle the results formatting.

There are also a helper class and three helper packages of pure functions, called by the Trapit
package.
====================================================================================================
|  Module       |  Notes                                                                           |
|==================================================================================================|
|  TrapitUtils  |  Entry point module for JavaScript unit testing and drivers for formatting the   |
|               |  externally-sourced results read from JSON files                                 |
|---------------|----------------------------------------------------------------------------------|
|  Trapit       |  Module for the unit test formaatting functions, written with core pure          |
|               |  functions to facilitate unit testing and multiple reporters; called from        |
|               |  TrapitUtils                                                                     |
|---------------|----------------------------------------------------------------------------------|
|  Utils        |  General utility functions, called mainly by the Text module below               |
|---------------|----------------------------------------------------------------------------------|
|  Pages        |  Class used to buffer pages of text ahead of writing to file; used by Text, HTML |
|---------------|----------------------------------------------------------------------------------|
| *Text*        |  Module of pure functions that format text report output and buffer using Pages  |
|---------------|----------------------------------------------------------------------------------|
|  HTML         |  Module of pure functions that format HTML report output and buffer using Pages  |
====================================================================================================

This file has a module of pure functions that format text report output, and buffer using Pages

***************************************************************************************************/
const [Utils,              Pgs] =
      [require('./utils'), require('./pages')];
var pg;

function prLine(line, ofile, indentLev = 0) { 
  pg.addLine(ofile, line, indentLev);
}
function lengthLis(nOutGroups, maxSce, maxCatSet) { 
  return (maxCatSet == 0) ? [3, maxSce, 11 + nOutGroups.toString().length, 7] :
                            [3, maxCatSet, maxSce, 11 + nOutGroups.toString().length, 7];
}
function hdrLis(nOutGroups, fields, maxCatSet) { 
  return (maxCatSet == 0) ? [fields[0], fields[2], fields[3].replace('X', nOutGroups.toString()), fields[4]] :
                            [fields[0], fields[1], fields[2], fields[3].replace('X', nOutGroups.toString()), fields[4]];
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
  prRepHdr: (text, root, ofile, fields, nGroups, maxSce, maxCatSet) => {
    pg = new Pgs(ofile, root);
    self.prHeading(text, ofile, 0);
    self.prColHdrs(hdrLis(nGroups, fields, maxCatSet), lengthLis(nGroups, maxSce, maxCatSet), ofile, 2)
  },
  prRepFtr: (text, dates, ofile) => {
    prLine('', ofile);
    self.prHeading(text, ofile, 0);
    prLine(dates, ofile, 0);
    pg.printPagesRoot();
  },
  prRepLin: (sfile, sceLin, ofile, nGroups, maxSce, maxCatSet) => {
    const fields = (maxCatSet == 0) ? [sceLin.sceNum, sceLin.sce, sceLin.nFail, sceLin.status] :
                                      [sceLin.sceNum, sceLin.sceCatSet, sceLin.sce, sceLin.nFail, sceLin.status];
    self.prRec(fields, lengthLis(nGroups, maxSce, maxCatSet), ofile, 2);
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