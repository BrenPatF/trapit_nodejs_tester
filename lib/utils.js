"use strict";
/***************************************************************************************************
Name: utils.js                         Author: Brendan Furey                       Date: 10-Jun-2018

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
| *Utils*       |  General utility functions, called mainly by the Text module below               |
|---------------|----------------------------------------------------------------------------------|
|  Pages        |  Class used to buffer pages of text ahead of writing to file; used by Text, HTML |
|---------------|----------------------------------------------------------------------------------|
|  Text         |  Module of pure functions that format text report output and buffer using Pages  |
|---------------|----------------------------------------------------------------------------------|
|  HTML         |  Module of pure functions that format HTML report output and buffer using Pages  |
====================================================================================================

This file has general utility functions, called mainly by the Text module

***************************************************************************************************/
const DELIM = '|';
var self = module.exports = {

/***************************************************************************************************

heading: Retirns a title with "=" underlining to its length, preceded by a blank line

***************************************************************************************************/
heading: (title) => {
  return '\n' + title + '\n' + '='.repeat(title.length);
}, // heading string
/***************************************************************************************************

rJust, lJust: Right/left-justify a string or number

***************************************************************************************************/
rJust: (name, len) => {
  const sname = String(name);
  if (len < sname.length) throw new Error("rJust passed invalid parameters: " + sname + ", " + len);
  return ' '.repeat(len - sname.length) + sname
}, // string to print, width
lJust: (name, len) => {
  const sname = String(name);
  if (len < sname.length) throw new Error("lJust passed invalid parameters: " + sname + ", " + len);
  return sname + ' '.repeat(len - sname.length)
}, // string to print, width
/***************************************************************************************************

colHeaders: Prints a set of column headers, input as arrays of values and length/justification's

***************************************************************************************************/
colHeaders: (items) => { // array of {name, length} objects, length < 0 -> left-justify
  let strings = items.map( (j) => {
      return j.len < 0 ? self.lJust(j.name, -j.len) : self.rJust(j.name, j.len)});
  let lines = [strings.join ('  ')];
  let unders = strings.map( (j) => {return '-'.repeat(j.length)})
  lines.push(unders.join ('  '));
  return lines;
},
/***************************************************************************************************

maxLen: Returns maximum length of string in a list of strings

***************************************************************************************************/
maxLen: (items) => { // list of strings
  return Array.from(items.keys()).reduce( (a, b) => { return a.length > b.length ? a : b; }).length;
},
/***************************************************************************************************

sleep: 'Proper' synchronous sleep for debugging

***************************************************************************************************/
sleep: (time) => { // sleep time in ms
  const stop = Date.now();
  while (Date.now() < stop + +time) {
    ;
  }
},
/***************************************************************************************************

repSpaces: Removes spaces and os-unfriendly characters, and substring, to be usable as file stem

***************************************************************************************************/
repSpaces: (page) => {
  
  return page.toLowerCase().replace(/ /g, '-').replace(/</g, 'lt').replace(/>/g, 'gt')
                           .replace(/\//g, '_').replace(/:/g, '_').substring(0, 100);
}
}