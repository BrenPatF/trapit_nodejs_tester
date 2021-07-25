"use strict";
/***************************************************************************************************
Name: trapit-utils.js                  Author: Brendan Furey                       Date: 18-Apr-2021

Component module in: The Math Function Unit Testing design pattern, implemented in nodejs.

GitHub: https://github.com/BrenPatF/trapit_nodejs_tester

See: 'Database API Viewed As A Mathematical Function: Insights into Testing'
    https://www.slideshare.net/brendanfurey7/database-api-viewed-as-a-mathematical-function-insights-into-testing
    Brendan Furey, March 2018

There is an entry point module, TrapitUtils, with two functions for JavaScript unit testing and two
driver functionss for formatting externally-sourced results read from JSON files. This module calls
the Trapit module to handle the results formatting.

There are also a helper class and three helper modules of pure functions, called by the Trapit
module
====================================================================================================
|  Module       |  Notes                                                                           |
|==================================================================================================|
| *TrapitUtils* |  Entry point module for JavaScript unit testing and drivers for formatting the   |
|               |  externally-sourced results read from JSON files                                 |
|---------------|----------------------------------------------------------------------------------|
|  Trapit       |  Module for the unit test formaatting functions, written with core pure          |
|               |  functions to facilitate unit testing and multiple reporters; called from        |
|               |  TrapitUtils                                                                     |
|---------------|----------------------------------------------------------------------------------|
|  Utils        |  General utility functions, called mainly by the Text module below               |
|---------------|----------------------------------------------------------------------------------|
|  Pages        |  Class used to buffer pages of text ahead of writing to file; used by Text, HTML |
|---------------|----------------------------------------------------------------------------------|
|  Text         |  Module of pure functions that format text report output and buffer using Pages  |
|---------------|----------------------------------------------------------------------------------|
|  HTML         |  Module of pure functions that format HTML report output and buffer using Pages  |
====================================================================================================

This file has the entry point module for testUnit, the main functipn called by unit test scripts

***************************************************************************************************/
const [Utils,              Trapit,              fs           ] =
      [require('./utils'), require('./trapit'), require('fs')];

  /***************************************************************************************************
  
  getUTOutGroups: Takes input expected and actual objects and returns the out property of the  
                  scenario with groups containing both expected and actual result lists
  
  ***************************************************************************************************/
function getUTOutGroups(expObj, actObj) {

  let retObj = {};
  for (let o in expObj) {
    retObj[o] = {
      exp : expObj[o],
      act : actObj[o]
    }
  }
  return retObj;
}
/***************************************************************************************************
  
getUTData: Read the input test data from JSON file, returning as object
  
***************************************************************************************************/
function getUTData(dataFile) {

  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}
/***************************************************************************************************
  
mkUTResultsFolder: Format unit test results JSON file via call to Trapit.mkUTResultsFolder
  
***************************************************************************************************/
function mkUTResultsFolder(fileName, extFolder, formatType) {

  const testData = getUTData(fileName),
        [meta,          scenarios         ] = 
        [testData.meta, testData.scenarios];

  return Trapit.mkUTResultsFolder(meta, scenarios, formatType, extFolder);
}

const self = module.exports = {
  /***************************************************************************************************
  
  mkUTExternalResultsFolders:  Format unit test results .json files in a folder
  
  ***************************************************************************************************/
  mkUTExternalResultsFolders: (extFolder, formatType = 'B') => {

    let fileResults = [];

    fs.readdirSync(extFolder).forEach(file => {

      if ( /.*\.json$/.test(file) ) {
        fileResults.push({file: file, ...mkUTResultsFolder(extFolder + file, extFolder, formatType)});
      }

    });
    
    return fileResults;

  },
  /***************************************************************************************************
  
  tabMkUTExternalResultsFolders:  Format unit test results .json files in a folder
  
  ***************************************************************************************************/
  tabMkUTExternalResultsFolders: (extFolder, formatType = 'B') => {

    let failFiles = [],
        fileResults = self.mkUTExternalResultsFolders(extFolder + '/', formatType);
    let [fileLen, titleLen, resFolderLen] = [4, 5, 6];

    console.log(Utils.heading('Unit Test Results Summary for Folder ' + extFolder));
    for (let r of fileResults) {
      if ( r.nFail ) {
        failFiles.push(r.file);
      }
      if(r.file.length > fileLen) {fileLen = r.file.length}
      if(r.resFolder.length > resFolderLen) {resFolderLen = r.resFolder.length}
      if(r.title.length > titleLen) {titleLen = r.title.length}
    }
    Utils.colHeaders( [
                       {name: ' File',  len: -(fileLen+1)},
                       {name: 'Title',  len: -titleLen},
                       {name: 'Inp Groups', len: 10},
                       {name: 'Out Groups', len: 10},
                       {name: 'Tests',  len: 5},
                       {name: 'Fails',  len: 5},
                       {name: 'Folder', len: -resFolderLen}
                ]).map(s => console.log(s));

    fileResults.map(r => [(r.nFail > 0 ? '*' : ' ') + Utils.lJust(r.file,    fileLen), 
                                                      Utils.lJust(r.title,   titleLen),
                                                      Utils.rJust(r.nInpGroups, 10),
                                                      Utils.rJust(r.nOutGroups, 10),
                                                      Utils.rJust(r.nTest,   5),
                                                      Utils.rJust(r.nFail,   5),
                                                      Utils.lJust(r.resFolder, resFolderLen)
                         ].join('  ')).map(s => console.log(s));
    console.log('\n' + failFiles.length + ' externals failed, see ' + extFolder + ' for scenario listings');
    failFiles.map(file => console.log(file));
    

  },
  /***************************************************************************************************
  
  testUnit: Main unit testing function, called like this:

                Trapit.testUnit('.\utils.json', '.\utils_out.json', purelyWrapUnit}

            This function creates the output JSON file with the help of two functions:
 
            - purelyWrapUnit is a function passed in from the client unit tester that returns an 
            object with result output groups consisting of lists of delimited strings
            - getUTOutGroups is a local private function that takes input expected and actual objects
            and returns the out property of the scenario with groups containing both expected and 
            actual result lists
   
  ***************************************************************************************************/
  testUnit: (inpFile, root, purelyWrapUnit, formatType = 'B') => {

    const testData = getUTData(inpFile),
          [meta,          callScenarios] =
          [testData.meta, testData.scenarios];

    let scenarios = {};
    for (let s in callScenarios) {

      if (callScenarios[s].active_yn != 'N') { // optional in input json
        scenarios[s] = {
                          inp : callScenarios[s].inp,
                          out : getUTOutGroups(callScenarios[s].out, purelyWrapUnit(callScenarios[s].inp))
                       }
      }
    }
    return Trapit.mkUTResultsFolder(meta, scenarios, formatType, root);
  },
  fmtTestUnit: (inpFile, root, purelyWrapUnit, formatType = 'B') => {

    console.log(Utils.heading('Unit Test Results Summary for Folder ' + root));
    const r = self.testUnit(inpFile, root, purelyWrapUnit, formatType);
    let width = 30;

    [
      ['File',       inpFile.substring(inpFile.lastIndexOf('/') + 1)],
      ['Title',      r.title],
      ['Inp Groups', r.nInpGroups],
      ['Out Groups', r.nOutGroups],
      ['Tests',      r.nTest],
      ['Fails',      r.nFail],
      ['Folder',     r.resFolder]
    ].map(t => console.log(Utils.lJust(t[0] + ':', 15) + t[1]));

  }
}
