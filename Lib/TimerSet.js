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
|  Utils     |  General utility functions, called mainly by the Text module below                  |
----------------------------------------------------------------------------------------------------
| *TimerSet* |  Code timing class, used here only by the main programs                             |
----------------------------------------------------------------------------------------------------
|  Pages     |  Class used to buffer pages of text ahead of writing to file, used by Text and HTML |
----------------------------------------------------------------------------------------------------
|  Text      |  Module of pure functions that format text report output and buffer using Pages     |
----------------------------------------------------------------------------------------------------
|  HTML      |  Module of pure functions that format HTML report output and buffer using Pages     |
====================================================================================================

Code timing class, used here only by the main programs 

***************************************************************************************************/
const os = require('os');
const Utils = require('./Utils.js');
const [CALLS_WIDTH, TIME_WIDTH, TIME_DP, TIME_RATIO_DP, TOT_TIMER, OTH_TIMER, SELF_RANGE, TIME_FACTOR] = 
      [10,          8,          2,       5,             'Total',   '(Other)', 10000,      1000];
var timerTimes;

/***************************************************************************************************

getTimes: Gets CPU and elapsed times using system calls and return in object

***************************************************************************************************/
function getTimes() {
    let usr = 0, sys = 0;
    const ela = +new Date();
    const cpus = os.cpus();

    for (var cpu of cpus) {
        usr += cpu.times.user;
        sys += cpu.times.sys;
    }
    return {ela : ela, usr : usr / cpus.length, sys : sys / cpus.length};
}
/***************************************************************************************************

form*: Formatting methods that return formatted times and other values as strings

***************************************************************************************************/
function formTime(t, dp) { // time, decimal places to print
    return Utils.rJust((t / TIME_FACTOR).toFixed (dp), TIME_WIDTH + dp);
};
function formTimeTrim(t, dp) { // time, decimal places to print
    return formTime(t, dp).trim();
};
function formName(name, maxName) { // timer name, maximum timer name length
    return Utils.lJust(name, maxName);
};
function formCalls(calls) { // timer name, maximum timer name length
    return Utils.rJust(calls.toString(), CALLS_WIDTH);
};
/***************************************************************************************************

writeTimeLine: Writes a formatted timing line
  Parameters: timer name, maximum timer name length, elapsed, cpu times, number of calls to timer

***************************************************************************************************/
function writeTimeLine(timer, maxName, ela, usr, sys, calls) {
    Utils.prListAsLine([formName(timer,     maxName),         
                        formTime(ela,       TIME_DP),
                        formTime(usr,       TIME_DP),
                        formTime(sys,       TIME_DP),
                        formCalls(calls),
                        formTime(ela/calls, TIME_RATIO_DP),
                        formTime(usr/calls, TIME_RATIO_DP),
                        formTime(sys/calls, TIME_RATIO_DP)]);
    const cpu = usr + sys;
    if (timer != "***" && cpu/calls < 10 * (timerTimes.usr + timerTimes.sys) && cpu > 0.1) {
        writeTimeLine ("***", maxName, ela - calls*timerTimes.ela, usr - calls*timerTimes.usr , sys - calls*timerTimes.sys, calls);
    };
};

class TimerSet {

    /***************************************************************************************************

    TimerSet: Constructor sets the timer set name and initialises the instance timing arrays

    ***************************************************************************************************/
    constructor(timerSetName) { // timer set name
        this.timerSetName = timerSetName;
        this.timBeg = getTimes();
        this.timPri = this.timBeg;
        this.timerHash = new Map();
        this.stime = Date().substring(0,24);
    }

    /***************************************************************************************************

    initTime: Initialises (or resets) the instance timing array

    ***************************************************************************************************/
    initTime() {
        this.timPri = getTimes();
    };

    /***************************************************************************************************

    incrementTime: Increments the timing accumulators for a timer set and timer

    ***************************************************************************************************/
    incrementTime(timerName) { // timer name

        const initHashVal = {ela : 0, usr : 0, sys : 0, calls : 0};
        const curTim = getTimes();
        const curHashVal = this.timerHash.get(timerName) || initHashVal;
        this.timerHash.set(timerName, { ela:   curHashVal.ela + curTim.ela - this.timPri.ela,
                                        usr:   curHashVal.usr + curTim.usr - this.timPri.usr,
                                        sys:   curHashVal.sys + curTim.sys - this.timPri.sys,
                                        calls: curHashVal.calls + 1
                                      });
        this.initTime();
    };

    /***************************************************************************************************

    writeTimes: Writes a report of the timings for the timer set

    ***************************************************************************************************/
    writeTimes() {
        const tim = getTimes();
        const totTim = {ela : tim.ela - this.timBeg.ela, usr : tim.usr - this.timBeg.usr, sys : tim.sys - this.timBeg.sys};

        const timerTimer = new TimerSet('timer');
        for (let i = 0; i < SELF_RANGE; i++) { timerTimer.incrementTime('x'); };
        timerTimes = timerTimer.timerHash.get('x');

        const maxName = Utils.maxLen(this.timerHash);
        Utils.heading("Timer set: " + this.timerSetName + ", constructed at " + this.stime + ", written at " + Date().substring(0,24));

        console.log('[Timer timed: Elapsed (per call): ' + formTimeTrim(timerTimes.ela, TIME_DP) + ' (' + formTimeTrim(timerTimes.ela/timerTimes.calls, TIME_RATIO_DP) +
        '), USR (per call): ' + formTimeTrim(timerTimes.usr, TIME_DP) + ' (' + formTimeTrim(timerTimes.usr/timerTimes.calls, TIME_RATIO_DP) +
        '), SYS (per call): ' + formTimeTrim(timerTimes.sys, TIME_DP) + ' (' + formTimeTrim(timerTimes.sys/timerTimes.calls, TIME_RATIO_DP) +
        '), calls: ' + timerTimes.calls + ', "***" denotes corrected line below]', "\n");
        timerTimes.ela /= timerTimes.calls;
        timerTimes.usr /= timerTimes.calls;
        timerTimes.sys /= timerTimes.calls;

        const unders = Utils.colHeaders( [{name: 'Timer',    len: -maxName},
                                          {name: 'Elapsed',  len: TIME_WIDTH+TIME_DP},
                                          {name: 'USR',      len: TIME_WIDTH+TIME_DP},
                                          {name: 'SYS',      len: TIME_WIDTH+TIME_DP},
                                          {name: 'Calls',    len: CALLS_WIDTH},
                                          {name: 'Ela/Call', len: TIME_WIDTH+TIME_RATIO_DP},
                                          {name: 'USR/Call', len: TIME_WIDTH+TIME_RATIO_DP},
                                          {name: 'SYS/Call', len: TIME_WIDTH+TIME_RATIO_DP}]);

        const sumTim = Array.from(this.timerHash.values()).reduce (function(t, s) { return {ela : t.ela + s.ela, usr : t.usr + s.usr, sys : t.sys + s.sys, calls : t.calls + s.calls}; });

        for (let e of this.timerHash.entries()) {
            writeTimeLine(e[0], maxName, e[1].ela, e[1].usr, e[1].sys, e[1].calls);
        };
        writeTimeLine(OTH_TIMER, maxName, totTim.ela - sumTim.ela, totTim.usr - sumTim.usr, totTim.sys - sumTim.sys, 1);
        console.log(unders);
        writeTimeLine(TOT_TIMER, maxName, totTim.ela, totTim.usr, totTim.sys, sumTim.calls + 1);
        console.log(unders);
    };
};

module.exports = TimerSet;