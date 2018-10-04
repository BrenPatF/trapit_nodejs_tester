"use strict";
/***************************************************************************************************
Name: col-group.js                     Author: Brendan Furey                       Date: 10-Jun-2018

Component module in: The Math Function Unit Testing design pattern, implemented in nodejs

GitHub: https://github.com/BrenPatF/trapit_nodejs_tester

See: 'Database API Viewed As A Mathematical Function: Insights into Testing'
   https://tinyurl.com/yaayvnhn
   Brendan Furey, March 2018

Design pattern examples: There are three test programs, two with example main programs
====================================================================================================
|  Main/Test         |  Unit Module |  Notes                                                       |
|====================|==============|===============================================================
|  main-hello-world  |              |  Simple Hello World program done as pure function to allow   |
|  test-hello-world  |  HelloWorld  |  for unit testing as a simple edge case                      |
----------------------------------------------------------------------------------------------------
|  main-col-group    |              |  Simple file-reading and group-counting module, with logging |
|  test-col-group    | *ColGroup*   |  to file. Example of testing impure units, and error display |
----------------------------------------------------------------------------------------------------
|  test-trapit       |  Trapit      |  The assertion module itself written with core pure function |
|                    |              |  to enable unit testing, and make multiple reporters easy    |
====================================================================================================
The trapit package can be used to facilitate unit testing in *any* language, so long as the same 
design pattern is followed, and the test driver program outputs a JSON file in the required format.
The separate externals example shows how to process externally generated files.

This file has a simple file-reading and group-counting module, with logging to file. Example of 
testing impure units, and error display.

***************************************************************************************************/
const Utils = require ('../../lib/utils');
const fs = require('fs');
/***************************************************************************************************

_readList: Private function returns the key-value map of (string, count)

***************************************************************************************************/
function readList(file, delim, col) { // input file, field delimiter, 0-based column index
  const lines=fs.readFileSync(file).toString().trim().split("\n");
  fs.appendFileSync(file + '.log', Date().substring(0, 24) + ": File " + file + ', delimiter \'' +
       delim + '\', column ' + col + "\n");
  var counter = new Map();
  for (const line of lines) {
    let val = line.split(delim)[col];
    let newVal = counter.get(val) + 1 || 1;
    counter.set(val, newVal);
  }
  return counter;
}
class ColGroup {

  /***************************************************************************************************

  ColGroup: Constructor sets the key-value map of (string, count), and the maximum key length

  ***************************************************************************************************/
  constructor(file, delim, col) {
    this.file = file;
    this.delim = delim;
    this.col = col;
    this.counter = readList(file, delim, col);
    this.maxLen = Utils.maxLen (this.counter);
  }
  /***************************************************************************************************

  prList: Prints the key-value list of (string, count) sorted as specified

  ***************************************************************************************************/
  prList(sortBy, keyValues) { // sort by label, key-value list of (string, count)
  
    console.log(Utils.heading ('Counts sorted by '+sortBy));
    Utils.colHeaders([{name: 'Team', len : -this.maxLen}, {name : '#apps', len : 5}]).map(l => {console.log(l)});
    for (const kv of keyValues) {
      console.log((Utils.lJust(kv[0], this.maxLen) + '  ' + Utils.rJust(kv[1], 5))); 
    }
  };
  /***************************************************************************************************

  listAsIs: Returns the key-value list of (string, count) unsorted

  ***************************************************************************************************/
  listAsIs() {
    return [...this.counter];
  };
  /***************************************************************************************************

  sortByKey, sortByValue: Returns the key-value list of (string, count) sorted by key or value

  ***************************************************************************************************/
  sortByKey() {
    return Array.from(this.counter.entries()).sort(function(a, b) { return a[0] > b[0] ? 1 : -1; });
  };

  sortByValue() {
    return [...this.counter].sort(function(a, b) { return (a[1] - b[1]) || (a[0] > b[0] ? 1 : -1); });
  };
}
module.exports = ColGroup;