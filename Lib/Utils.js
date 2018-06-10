"use strict";
/***************************************************************************************************
Name: Utils.js                         Author: Brendan Furey                       Date: 10-Jun-2018

Component module in: The Math Function Unit Testing design pattern, implemented in nodejs

GitHub: https://github.com/BrenPatF/trapit_nodejs_tester

See: 'Database API Viewed As A Mathematical Function: Insights into Testing'
     https://tinyurl.com/yaayvnhn
     Brendan Furey, March 2018

Helper modules: There are two helper classes and three helper modules of pure functions
====================================================================================================
|  Module    |  Notes                                                                              | 
|===================================================================================================
| *Utils*    |  General utility functions, called mainly by the Text module below                  |
----------------------------------------------------------------------------------------------------
|  TimerSet  |  Code timing class, used here only by the main programs                             |
----------------------------------------------------------------------------------------------------
|  Pages     |  Class used to buffer pages of text ahead of writing to file, used by Text and HTML |
----------------------------------------------------------------------------------------------------
|  Text      |  Module of pure functions that format text report output and buffer using Pages     |
----------------------------------------------------------------------------------------------------
|  HTML      |  Module of pure functions that format HTML report output and buffer using Pages     |
====================================================================================================

General utility functions, called mainly by the Text module

***************************************************************************************************/
var self = module.exports = {

write: (line, indentLev = 0) => { console.log ('   '.repeat(indentLev) + line) },

/***************************************************************************************************

heading: Prints a title with "=" underlining to its length, preceded by a blank line

***************************************************************************************************/
heading: (title, indentLev = 0) => { self.write ('');
                                     self.write (title, indentLev);
                                     self.write ('='.repeat(title.length), indentLev);
                                    }, // heading string

/***************************************************************************************************

prListAsLine: Prints an array of strings as one line, separating fields by a 2-space delimiter

***************************************************************************************************/
prListAsLine : (items, indentLev = 0) => {self.write (items.join ('  '), indentLev)}, // array of strings to print as line

/***************************************************************************************************

rJust, lJust: Right/left-justify a string

***************************************************************************************************/
rJust: (name, len) => {return ' '.repeat(len - name.length) + name}, // string to print, width
lJust: (name, len) => {return name + ' '.repeat(len - name.length)}, // string to print, width

/***************************************************************************************************

colHeaders: Prints a set of column headers, input as arrays of values and length/justification's

***************************************************************************************************/
colHeaders: (items, indentLev = 0) => { // array of {name, length} objects, length < 0 -> left-justify

    let strings = items.map( (j) => {return j.len < 0 ? self.lJust(j.name, -j.len) : self.rJust(j.name, j.len)});
    self.write ('');
    self.write(strings.join ('  '), indentLev);
    let unders = strings.map( (j) => {return '-'.repeat(j.length)})
    self.write(unders.join ('  '), indentLev);
    return unders.join ('  ');
},

/***************************************************************************************************

prTuplesAsLine: Prints a set of tuples, input as arrays of values and length/justification's

***************************************************************************************************/
prTuplesAsLine: (items, indentLev = 0) => { // array of {name, length} objects, length < 0 -> left-justify

    let strings = items.map( (j) => {return j.len < 0 ? self.lJust(j.name, -j.len) : self.rJust(j.name, j.len)});
    self.write(strings.join ('  '), indentLev);

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
    const stop = new Date().getTime();
    while (new Date().getTime() < stop + time) {
        ;
    }
}
}