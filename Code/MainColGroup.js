"use strict";
/***************************************************************************************************
Name: MainColGroup.js                  Author: Brendan Furey                       Date: 10-Jun-2018

Component module in: The Math Function Unit Testing design pattern, implemented in nodejs

GitHub: https://github.com/BrenPatF/trapit_nodejs_tester

See: 'Database API Viewed As A Mathematical Function: Insights into Testing'
     https://tinyurl.com/yaayvnhn
     Brendan Furey, March 2018

Design pattern examples: There are three test programs, two with example main programs
====================================================================================================
|  Main/Test       |  Unit Module |  Notes                                                         |
|==================|==============|=================================================================
|  MainHelloWorld  |              |  Simple Hello World program done as pure function to allow for |
|  TestHelloWorld  |  HelloWorld  |  unit testing as a simple edge case                            |
----------------------------------------------------------------------------------------------------
| *MainColGroup*   |              |  A simple file-reading and group-counting module, with logging |
|  TestColGroup    |  ColGroup    |  to file. Example of testing impure units, and error display   |
----------------------------------------------------------------------------------------------------
|  TestTrapit      |  Trapit      |  The assertion module itself, written with core pure function  |
|                  |              |  to enable unit testing, and make multiple reporters easy      |
====================================================================================================

Main driver for simple file-reading and group-counting module, with logging to file

***************************************************************************************************/
const Utils = require('../Lib/Utils.js');
const ColGroup = require('../Lib/ColGroup.js');
const TimerSet = require('../Lib/TimerSet.js');
const INPUT_FILE = '../Inp/fantasy_premier_league_player_stats.csv', DELIM =',', COL = 6;
Utils.heading('input file is ' + INPUT_FILE);

let x = new TimerSet('Timer_x');
let grp = new ColGroup(INPUT_FILE, DELIM, COL);
x.incrementTime('ColGroup');

grp.prList('(as is)', grp.listAsIs());
x.incrementTime('listAsIs');

grp.prList('key', grp.sortByKey());
x.incrementTime('sortByKey');

grp.prList('value', grp.sortByValue());
x.incrementTime('sortByValue');

x.writeTimes();