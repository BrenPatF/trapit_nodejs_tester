"use strict";
/***************************************************************************************************
Name: test-hello-world.js              Author: Brendan Furey                       Date: 10-Jun-2018

Component module in: The Math Function Unit Testing design pattern, implemented in nodejs

GitHub: https://github.com/BrenPatF/trapit_nodejs_tester

See: 'Database API Viewed As A Mathematical Function: Insights into Testing'
    https://www.slideshare.net/brendanfurey7/database-api-viewed-as-a-mathematical-function-insights-into-testing
    Brendan Furey, March 2018

Design pattern examples: There are three test programs, two with example main programs
====================================================================================================
|  Main/Test         |  Unit Module |  Notes                                                       |
|==================================================================================================|
|  main-hello-world  |              |  Simple Hello World program done as pure function to allow   |
| *test-hello-world* |  HelloWorld  |  for unit testing as a simple edge case                      |
|--------------------|--------------|--------------------------------------------------------------|
|  main-col-group    |              |  Simple file-reading and group-counting module, with logging |
|  test-col-group    |  ColGroup    |  to file. Example of testing impure units, and error display |
|--------------------|--------------|--------------------------------------------------------------|
|  test-trapit       |  Trapit      |  The assertion module itself written with core pure          |
|                    |              |  functions to facilitate unit testing and multiple reporters |
====================================================================================================
The trapit package can be used to facilitate unit testing in *any* language, so long as the same 
design pattern is followed, and the test driver program outputs a JSON file in the required format.
The separate externals example shows how to process externally generated files.

This file is a unit test program for a simple Hello World program done as pure function to allow
for unit testing as a simple edge case. Example with the purelyWrapUnit function parameter passed as
a lambda expression.

To run from root (trapit) folder:

$ node examples\hello-world\test-hello-world

***************************************************************************************************/
const [Trapit,                            Hw                      ] = 
      [require('../../lib/trapit-utils'), require('./hello-world')],    //require('trapit') -- npm install, using index.js
      [ROOT,                              GROUP                   ] =
      ['./examples/hello-world/',        'Group'                  ];

const INPUT_JSON = ROOT + 'hello-world.json';

Trapit.fmtTestUnit(INPUT_JSON, ROOT, (inpGroups) => { return {[GROUP] : [Hw.helloWorld()]} });