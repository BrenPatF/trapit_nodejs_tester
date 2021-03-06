"use strict";
/***************************************************************************************************
Name: html.js                          Author: Brendan Furey                       Date: 10-Jun-2018

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
|  Text    |  Module of pure functions that format text report output and buffer using Pages       |
----------------------------------------------------------------------------------------------------
| *HTML*   |  Module of pure functions that format HTML report output and buffer using Pages       |
====================================================================================================

This file has a module of pure functions that format HTML report output, and buffer using Pages
class.

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
function prHTMLHeader(ofile, isRoot = false) {

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
  background-color: #FFFF00;
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
function hdrLis(nGroups, fields) { 
  return [fields[0], fields[1], fields[2].replace('X', nGroups.toString()), fields[3]];
}

const self = module.exports = {

  prRepHdr: (text, root, ofile, fields, nGroups, maxSce) => {
    pg = new pgs(ofile, root);
    prHTMLHeader(ofile, true);
    prField(text, ofile, 1);
    self.prColHdrs(hdrLis(nGroups, fields), [], ofile)
  },
  prRepFtr: (text, ofile) => {
    prLine('</table>', ofile);
    prField(text, ofile, 1);
    prHTMLFooter(ofile);
    pg.printPages();
  },
  prRepLin: (sfile, sceLin, ofile, maxSce) => {
    const hLink = '<a href="' + sfile + '" target="_blank">' + sceLin.sce + '</a>';
    const fields = [sceLin.sceNum, hLink, sceLin.nFail, sceLin.status];
    self.prRec(fields, [], ofile);
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
  prRec: (fields, lengths, ofile) => {
    prListsAsLine(fields, lengths, ofile, 'td')
  }
}