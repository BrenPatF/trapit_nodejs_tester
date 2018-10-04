"use strict";
/***************************************************************************************************
Name: main-hello-world.js              Author: Brendan Furey                       Date: 10-Jun-2018

Component module in: The Math Function Unit Testing design pattern, implemented in nodejs

GitHub: https://github.com/BrenPatF/trapit_nodejs_tester

See: 'Database API Viewed As A Mathematical Function: Insights into Testing'
     https://tinyurl.com/yaayvnhn
     Brendan Furey, March 2018

Design pattern examples: There are three test programs, two with example main programs
====================================================================================================
|  Main/Test         |  Unit Module |  Notes                                                       |
|====================|==============|===============================================================
| *main-hello-world* |              |  Simple Hello World program done as pure function to allow   |
|  test-hello-world  |  HelloWorld  |  for unit testing as a simple edge case                      |
----------------------------------------------------------------------------------------------------
|  main-col-group    |              |  Simple file-reading and group-counting module, with logging |
|  test-col-group    |  ColGroup    |  to file. Example of testing impure units, and error display |
----------------------------------------------------------------------------------------------------
|  test-trapit       |  Trapit      |  The assertion module itself written with core pure function |
|                    |              |  to enable unit testing, and make multiple reporters easy    |
====================================================================================================
The trapit package can be used to facilitate unit testing in *any* language, so long as the same 
design pattern is followed, and the test driver program outputs a JSON file in the required format.
The separate externals example shows how to process externally generated files.

This file has a main driver for simple Hello World program done as pure function to allow for unit
testing as a simple edge case.

To run from trapit folder:

$	node examples\hello-world\main-hello-world

***************************************************************************************************/
const Hw = require('./hello-world');
console.log(Hw.helloWorld());