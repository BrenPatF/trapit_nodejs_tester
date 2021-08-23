'use strict';
/***************************************************************************************************
Name: test-col-group.js                Author: Brendan Furey                       Date: 10-Jun-2018

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
|  test-hello-world  |  HelloWorld  |  for unit testing as a simple edge case                      |
|--------------------|--------------|--------------------------------------------------------------|
|  main-col-group    |              |  Simple file-reading and group-counting module, with logging |
| *test-col-group*   |  ColGroup    |  to file. Example of testing impure units, and error display |
|--------------------|--------------|--------------------------------------------------------------|
|  test-trapit       |  Trapit      |  The assertion module itself written with core pure          |
|                    |              |  functions to facilitate unit testing and multiple reporters |
====================================================================================================
The trapit package can be used to facilitate unit testing in *any* language, so long as the same 
design pattern is followed, and the test driver program outputs a JSON file in the required format.
The separate externals example shows how to process externally generated files.

This file is a unit test program for a simple file-reading and group-counting module, with logging to 
file. Note that this example has two deliberate errors to show how these are displayed.

To run from root (trapit) folder:

$ node examples\col-group\test-col-group

***************************************************************************************************/
const [ColGroup,                Trapit,                            fs           ] =
      [require('./col-group'),  require('../../lib/trapit-utils'), require('fs')],    //require('trapit') -- npm install, using index.js
      [DELIM,                   ROOT,                  ] = 
      ['|',                     './examples/col-group/'];

const [INPUT_JSON,              INPUT_FILE,            LOG_FILE                 ] =
      [ROOT + 'col-group.json', ROOT + 'ut_group.csv', ROOT + 'ut_group.csv.log'];

const [GRP_LOG,   GRP_SCA,   GRP_LIN, GRP_LAI,    GRP_SBK,     GRP_SBV      ]  =
      ['Log',     'Scalars', 'Lines', 'listAsIs', 'sortByKey', 'sortByValue'];

function fromCSV(csv, col) {return csv.split(DELIM)[col]};
function joinTuple(t) {return t.join(DELIM)}

function setup(inp) {
  fs.writeFileSync(INPUT_FILE, inp[GRP_LIN].join('\n'));
  if (inp[GRP_LOG].length > 0) {
    fs.writeFileSync(LOG_FILE, inp[GRP_LOG].join('\n') + '\n');
  }
  return new ColGroup(INPUT_FILE, fromCSV(inp[GRP_SCA][0], 0), fromCSV(inp[GRP_SCA][0], 1));
}
function teardown() {
  fs.unlinkSync(INPUT_FILE);
  fs.unlinkSync(LOG_FILE);
}
function purelyWrapUnit(inpGroups) {
  const colGroup = setup(inpGroups);

  const linesArray = String(fs.readFileSync(LOG_FILE)).split('\n'),
        lastLine   = linesArray[linesArray.length - 2],
        text       = lastLine, //lastLine.substring(26),
        date       = lastLine.substring(0, 24),
        logDate    = new Date(date),
        now        = new Date(),
        diffDate   = now.getTime() - logDate.getTime();

  teardown();
  return {
    [GRP_LOG] : [(linesArray.length - 1) + DELIM + diffDate + DELIM + text],
    [GRP_LAI] : [colGroup[GRP_LAI]().length.toString()],
    [GRP_SBK] : colGroup[GRP_SBK]().map(joinTuple),
    [GRP_SBV] : colGroup[GRP_SBV]().map(joinTuple)
  };
}
Trapit.fmtTestUnit(INPUT_JSON, ROOT, purelyWrapUnit);