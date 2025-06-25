"use strict";
/***************************************************************************************************
Name: html.js                          Author: Brendan Furey                       Date: 10-Jun-2018

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
|  Text         |  Module of pure functions that format text report output and buffer using Pages  |
|---------------|----------------------------------------------------------------------------------|
| *HTML*        |  Module of pure functions that format HTML report output and buffer using Pages  |
====================================================================================================

This file has a module of pure functions that format HTML report output, and buffer using Pages
class

***************************************************************************************************/
const pgs = require('./pages');
var pg;

function prLine(line, ofile) { 
  pg.addLine(ofile, line);
}
function prField(line, ofile, indentLev = 0) { 
  pg.addLine(ofile, '<h' + indentLev + '>' + line + '</h' + indentLev + '>');
}
function prListsAsLine(fields, lengths, ofile, tag = 'td') {

  const [op, cl] = ['<' + tag + '>', '</' + tag + '>'];
  const strings = fields.map( (f) => {return op + f + cl});
  let addStyle = '';
  if (fields[0].includes('*')) {
    addStyle = ' style="background-color: #E62A3E"';
  }
  prLine('<tr' + addStyle + '>' + strings.join ('') + '</tr>', ofile);
}
function prHTMLHeader(ofile, colors, isRoot = false) {

  let td = `
    td {
      font-weight: bold;
      border: 1px solid #030303;
      text-align: left;
      padding: 8px;
      white-space: pre;
      font-family: "Courier New", Courier, monospace
    }`;
  if (isRoot) {
    td = `
          td {
            font-weight: bold;
            border: 1px solid #030303;
            text-align: left;
            padding: 8px;
            white-space: pre;
            font-family: arial, sans-serif;
            font-size: 100%;
          }`;
  }

  prLine (
`<html>
<head>
<style>
table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

th {
  background-color: #dddddd;
  border: 1px solid #030303;
  text-align: left;
  padding: 8px;
}` + td + 
`
h1 {margin-top: 0em; margin-bottom: 0em;
  font-family: arial, sans-serif;
  width: 100%;
  font-size: 300%;
  background-color: ` + colors.h1 + `;
}
h2 {margin-top: 0em; margin-bottom: 0em;
  font-family: arial, sans-serif;
  width: 100%;
  font-size: 200%;
  background-color: ` + colors.h2 + `;
}
h3 {margin-top: 0em; margin-bottom: 0em;
  font-family: arial, sans-serif;
  width: 100%;
  font-size: 150%;
  background-color: ` + colors.h3 + `;
}
h4 {margin-top: 0em; margin-bottom: 0em;
  font-family: arial, sans-serif;
  width: 100%;
  font-size: 125%;
  background-color: ` + colors.h4 + `;
}
</style>
</head>
<body>`,
ofile
);
}
function prHTMLFooter(ofile) {
  prLine('</body></html>', ofile);
}
function hdrLis(nOutGroups, fields, maxCatSet) { 
  return (maxCatSet == 0) ? [fields[0], fields[2], fields[3].replace('X', nOutGroups.toString()), fields[4]] :
                            [fields[0], fields[1], fields[2], fields[3].replace('X', nOutGroups.toString()), fields[4]];
}

const self = module.exports = {

  prRepHdr: (text, root, ofile, fields, nOutGroups, maxSce, maxCatSet, colors) => {
    pg = new pgs(ofile, root);
    prHTMLHeader(ofile, colors, true);
    prField(text, ofile, 1);
    self.prColHdrs(hdrLis(nOutGroups, fields, maxCatSet), [], ofile)
  },
  prRepFtr: (text, dates, ofile) => {
    prLine('</table>', ofile);
    prField(text, ofile, 1);
    prField(dates, ofile, 4);
    prHTMLFooter(ofile);
    pg.printPages();
  },
  prRepLin: (sfile, sceLin, ofile, nGroups, maxSce, maxCatSet) => {
    const hLink = '<a href="' + sfile + '" target="_blank">' + sceLin.sce + '</a>';
    const fields = (maxCatSet == 0) ? [sceLin.sceNum, hLink, sceLin.nFail, sceLin.status] :
                                      [sceLin.sceNum, sceLin.sceCatSet, hLink, sceLin.nFail, sceLin.status];
    self.prRec(fields, [], ofile);
  },
  prSceHdr: (text, ofile, colors) => {
    prHTMLHeader(ofile, colors);
    prField(text, ofile, 2);
  },
  prSceFtr: (text, ofile) => {
    prField(text, ofile, 2);
    prHTMLFooter(ofile);
  },
  prIOHdr: (text, ofile) => {
    prField(text, ofile, 3);
  },
  prGrpHdr: (text, grpIsEmpty, ofile) => {
    prField(text, ofile, 4);
  },
  prGrpFtr: (text, ofile) => {
    prLine('</table>', ofile);
    prField(text, ofile, 4);
  },
  prColHdrs: (fields, lengths, ofile) => {
    prLine('<table>', ofile);
    prListsAsLine(fields, lengths, ofile, 'th');
  },
  prRec: (fields, lengths, ofile) => {
    prListsAsLine(fields, lengths, ofile, 'td')
  }
}