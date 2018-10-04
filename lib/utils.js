"use strict";
/***************************************************************************************************
Name: utils.js                         Author: Brendan Furey                       Date: 10-Jun-2018

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
| *Utils*  |  General utility functions, called mainly by the Text module below                    |
----------------------------------------------------------------------------------------------------
|  Pages   |  Class used to buffer pages of text ahead of writing to file, used by Text and HTML   |
----------------------------------------------------------------------------------------------------
|  Text    |  Module of pure functions that format text report output and buffer using Pages       |
----------------------------------------------------------------------------------------------------
|  HTML    |  Module of pure functions that format HTML report output and buffer using Pages       |
====================================================================================================

This file has general utility functions, called mainly by the Text module.

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
                           .replace(/\//g, '_').replace(/:/g, '_').substring(0,60);
}
}