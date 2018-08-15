"use strict";
/***************************************************************************************************
Name: html.js                       Author: Brendan Furey                          Date: 10-Jun-2018

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
|  Text     |  Module of pure functions that format text report output and buffer using Pages      |
----------------------------------------------------------------------------------------------------
| *HTML*    |  Module of pure functions that format HTML report output and buffer using Pages      |
====================================================================================================

Module of pure functions that format HTML report output and buffer using Pages

***************************************************************************************************/
const pgs = require('./pages');
const utils = require('./utils');
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
function prHTMLHeader(ofile) {

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
}
td {
  border: 1px solid #030303;
  text-align: left;
  padding: 8px;
}

h1 {margin-top: 0em; margin-bottom: 0em;
  font-family: arial, sans-serif;
  width: 100%;
  font-size: 300%;
  background-color: #FF8033;
}
h2 {margin-top: 0em; margin-bottom: 0em;
  font-family: arial, sans-serif;
  width: 100%;
  font-size: 200%;
  background-color: #2AE6C1; //#7DFF33;
}
h3 {margin-top: 0em; margin-bottom: 0em;
  font-family: arial, sans-serif;
  width: 100%;
  font-size: 150%;
  background-color: #33F0FF;
}
h4 {margin-top: 0em; margin-bottom: 0em;
  font-family: arial, sans-serif;
  width: 100%;
  font-size: 125%;
  background-color: #7DFF33;//#F933FF;
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

var self = module.exports = {

  prRepHdr: (text, root, ofile) => {
    pg = new pgs(ofile, root);
    prHTMLHeader(ofile);
    prField(text, ofile, 1);
  },
  prRepFtr: (text, ofile) => {
    prField(text, ofile, 1);
    prHTMLFooter(ofile);
    pg.printPages();
  },
  prRepLin: (sfile, hdr, ftr, ofile) => {
    prField('<a href="' + utils.repSpaces(sfile) + '" target="_blank">' + hdr + '</a> : ' + ftr, 
            ofile, 2);
  },
  prSceHdr: (text, ofile) => {
    prHTMLHeader(ofile);
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
  prRec: (fields, lengths, ofile,) => {
    prListsAsLine(fields, lengths, ofile, 'td')
  }
}