/***************************************************************************************************
Name: timer-set.js                     Author: Brendan Furey                       Date: 10-Jun-2018

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

Code timing class, used here only by the main programs. This will have its own project with ut

***************************************************************************************************/
"use strict";
const os = require('os');
const utils = require('./utils');
const [CALLS_WIDTH, TIME_WIDTH, TIME_DP, TIME_RATIO_DP] = 
      [10,          8,          2,       5];
const [TOT_TIMER, OTH_TIMER, SELF_RANGE, TIME_FACTOR] = 
      ['Total',   '(Other)', 10000,      1000];
/***************************************************************************************************

getTimes: Gets CPU and elapsed times using system calls and return in object

***************************************************************************************************/
function getTimes(now, cpus) {
  let usr = 0, sys = 0;
  const ela = now();//Date.now();
  const cpuLis = cpus();

  for (const cpu of cpuLis) {
    usr += +cpu.times.user;
    sys += +cpu.times.sys;
  }
  return {ela : ela, usr : usr / cpuLis.length, sys : sys / cpuLis.length};
}
function valWidths(time_width, time_dp, time_ratio_dp, calls_width = 5) {
  if (calls_width < 5) 
    throw new Error('Error, ' + 'calls_width must be > 4, actual: ' + calls_width);
  else if (time_width < 0 || time_dp < 0 || time_ratio_dp < 0) 
    throw new Error('Error, ' + 'time_width, time_dp, time_ratio_dp must be > 0, actual: ' + 
                            time_width + ', ' + time_dp + ', ' + time_ratio_dp);
  else if (+time_width + +time_dp < 7)
    throw new Error('Error, ' + 'time_width + time_dp must be > 6, actual: ' + time_width + ' + ' +
                            time_dp);
  else if (+time_width + +time_ratio_dp < 8)
    throw new Error('Error, ' + 'time_width + time_ratio_dp must be > 7, actual: ' + time_width + 
                    ' + ' + time_ratio_dp);
}
/***************************************************************************************************

form*: Formatting methods that return formatted times and other values as strings

***************************************************************************************************/
function formTime(t, dp, time_width) { // time, decimal places to print
  return utils.rJust((t / TIME_FACTOR).toFixed (dp), time_width + dp);
};
function formTimeTrim(t, dp, time_width) { // time, decimal places to print
  return formTime(t, dp, time_width).trim();
};
function formName(name, maxName) { // timer name, maximum timer name length
  return utils.lJust(name, maxName);
};
function formCalls(calls, calls_width) { // timer name, maximum timer name length
  return utils.rJust(calls.toString(), calls_width);
};
/***************************************************************************************************

writeTimeLine: Writes a formatted timing line
  Parameters: timer name, maximum timer name length, elapsed, cpu times, number of calls to timer

***************************************************************************************************/
function timerLine(timer, maxName, ela, usr, sys, calls, time_width, time_dp, time_ratio_dp, 
                   calls_width) {
   return utils.prListAsLine([formName(timer,   maxName),     
                formTime(ela,     time_dp, time_width),
                formTime(usr,     time_dp, time_width),
                formTime(sys,     time_dp, time_width),
                formCalls(calls,  calls_width),
                formTime(ela/calls, time_ratio_dp, time_width),
                formTime(usr/calls, time_ratio_dp, time_width),
                formTime(sys/calls, time_ratio_dp, time_width)]);
};
class TimerSet {

  /*************************************************************************************************

  TimerSet: Constructor sets the timer set name and initialises the instance timing arrays

  *************************************************************************************************/
  constructor(timerSetName, p_now = Date.now, p_cpus = os.cpus) { // timer set name
    this.now = p_now;
    this.cpus = p_cpus;
    this.timerSetName = timerSetName;
    this.timBeg = getTimes(this.now, this.cpus);
    this.timPri = this.timBeg;
    this.timerHash = new Map();
    this.stime = Date().substring(0,24);
    this.results = [];
  }

  /*************************************************************************************************

  initTime: Initialises (or resets) the instance timing array

  *************************************************************************************************/
  initTime() {
    if (this.results.length != 0) {
      throw new Error('Timer set complete: Exiting ');
    }
    this.timPri = getTimes(this.now, this.cpus);
  };

  /*************************************************************************************************

  incrementTime: Increments the timing accumulators for a timer set and timer

  *************************************************************************************************/
  incrementTime(timerName) { // timer name

    if (this.results.length != 0) {
      throw new Error('Timer set complete: Exiting ');
    }
    const initHashVal = {ela : 0, usr : 0, sys : 0, calls : 0};
    const curTim = getTimes(this.now, this.cpus);
    const curHashVal = this.timerHash.get(timerName) || initHashVal;
    this.timerHash.set(timerName, { ela:   +curHashVal.ela + +curTim.ela - this.timPri.ela,
                                    usr:   +curHashVal.usr + +curTim.usr - this.timPri.usr,
                                    sys:   +curHashVal.sys + +curTim.sys - this.timPri.sys,
                                    calls: curHashVal.calls + 1
                    });
    this.timPri = curTim;//this.initTime();
  };

  /*************************************************************************************************

  writeTimes: Writes a report of the timings for the timer set

  *************************************************************************************************/
  getTimers() {
    if (this.results.length === 0) {
      const tim = getTimes(this.now, this.cpus);
      const totTim = {ela : tim.ela - this.timBeg.ela, usr : tim.usr - this.timBeg.usr, 
                      sys : tim.sys - this.timBeg.sys};
      const sumTim = Array.from(this.timerHash.values()).reduce (function(t, s) {
        return {ela : t.ela + s.ela, usr : t.usr + s.usr, sys : t.sys + s.sys, 
                calls : t.calls + s.calls}; });

      this.results = Array.from(this.timerHash.entries()).map(
        e => {return {timer: e[0], ela: e[1].ela, usr: e[1].usr, sys: e[1].sys, 
                      calls: e[1].calls};});
      this.results.push({timer: OTH_TIMER, ela: totTim.ela - sumTim.ela, 
                                           usr: totTim.usr - sumTim.usr, 
                                           sys: totTim.sys - sumTim.sys, calls: 1});
      this.results.push({timer: TOT_TIMER, ela: totTim.ela, usr: totTim.usr, sys: totTim.sys, 
                         calls: sumTim.calls + 1});
    }
    return this.results;
  }
  /*************************************************************************************************

  formatTimers: Writes the timers to an array of formatted strings for the timer set

  *************************************************************************************************/
  formatTimers(time_width = TIME_WIDTH, time_dp = TIME_DP, time_ratio_dp = TIME_RATIO_DP, 
               calls_width = CALLS_WIDTH) {
    valWidths(time_width, time_dp, time_ratio_dp, calls_width);
    const timerArr = this.getTimers();
    const maxName = utils.maxLen(this.timerHash);
    const [lenTime, lenTimeRatio] = [+time_width + +time_dp, +time_width + +time_ratio_dp];

    let fmtArr =  utils.colHeaders( [{name: 'Timer',  len: -maxName},
                     {name: 'Elapsed',  len: lenTime},
                     {name: 'USR',    len: lenTime},
                     {name: 'SYS',    len: lenTime},
                     {name: 'Calls',  len: calls_width},
                     {name: 'Ela/Call', len: lenTimeRatio},
                     {name: 'USR/Call', len: lenTimeRatio},
                     {name: 'SYS/Call', len: lenTimeRatio}]);

    for (const i in timerArr) {
      const t = timerArr[i];
      fmtArr.push(timerLine(t.timer, maxName, t.ela, t.usr, t.sys, t.calls, +time_width, +time_dp,
                            +time_ratio_dp, +calls_width));
      if (i == timerArr.length - 2) {fmtArr.push(fmtArr[1])};
      if (i == timerArr.length - 1) {fmtArr.push(fmtArr[1])};
    };
    return fmtArr;
  };
  /*************************************************************************************************

  getSelfTimer: Static function returns object with timings per call for calling incrementTime

  *************************************************************************************************/
  static getSelfTimer(self_range = SELF_RANGE) {
    const timerTimer = new TimerSet ('timer');
    for (let i = 0; i < self_range; i++) { timerTimer.incrementTime('x'); };
    const timerTimes = timerTimer.timerHash.get('x');
    return {ela: timerTimes.ela/self_range, usr: timerTimes.usr/self_range, 
            sys: timerTimes.sys/self_range};
  }
  /*************************************************************************************************

  formatSelfTimer: Returns formatted string with the results of getSelfTimer

  *************************************************************************************************/
  static formatSelfTimer(self_range = SELF_RANGE, time_width = TIME_WIDTH, time_dp = TIME_DP, 
                         time_ratio_dp = TIME_RATIO_DP) {
    valWidths(time_width, time_dp, time_ratio_dp);
    const t = this.getSelfTimer();
    return '[Timer timed (per call in ms): Elapsed: ' + formTimeTrim(TIME_FACTOR*t.ela, 
      time_ratio_dp, time_width) + ', USR: ' + formTimeTrim(TIME_FACTOR*t.usr, time_ratio_dp, 
      time_width) + ', SYS: ' +  formTimeTrim(TIME_FACTOR*t.sys, time_ratio_dp, time_width) + ']';
  }
  /*************************************************************************************************

  formatResults: Returns formatted string with the complete results, using formatTimers; includes
                 self timing results

  ***************************************************************************************************/
  formatResults(time_width = TIME_WIDTH, time_dp = TIME_DP, time_ratio_dp = TIME_RATIO_DP, 
                calls_width = CALLS_WIDTH, self_range = SELF_RANGE) {
    valWidths(time_width, time_dp, time_ratio_dp, calls_width);
    let timeLines = (this.formatTimers()).reduce(function(s, l) {return s + '\n' + l});
    return timeLines + '\n' + TimerSet.formatSelfTimer(self_range, time_width, time_dp, time_ratio_dp);
  }
};
module.exports = TimerSet;