"use strict";
/***************************************************************************************************
Name: pages.js                         Author: Brendan Furey                       Date: 10-Jun-2018

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
|  Utils   |  General utility functions, called mainly by the Text module below                    |
----------------------------------------------------------------------------------------------------
| *Pages*  |  Class used to buffer pages of text ahead of writing to file, used by Text and HTML   |
----------------------------------------------------------------------------------------------------
|  Text    |  Module of pure functions that format text report output and buffer using Pages       |
----------------------------------------------------------------------------------------------------
|  HTML    |  Module of pure functions that format HTML report output and buffer using Pages       |
====================================================================================================

Class used to buffer pages of text ahead of writing to file, used by Text and HTML.

***************************************************************************************************/
const fs = require('fs');
const Utils = require('./utils');

class Pages {

  /***************************************************************************************************

  constructor: Constructor 

  ***************************************************************************************************/
  constructor(indexPage, root) {
    this.root = root;
    this.indexPage = Utils.repSpaces(indexPage);
    this.pageLines = {};
  }
  /***************************************************************************************************

  addLine: Add a line to a page

  ***************************************************************************************************/
  addLine(page, line, indentLev) { //
  
    if (!this.pageLines.hasOwnProperty(page)) {
      this.pageLines[page] = [];
    }
    this.pageLines[page].push('   '.repeat(indentLev) + line);
  }
  /***************************************************************************************************

  printPages: Print all the pages to files

  ***************************************************************************************************/
  printPages() {
    fs.existsSync(this.root) || fs.mkdirSync(this.root);
    for (const page in this.pageLines) {
      fs.writeFileSync (this.root + '/' + page, this.pageLines[page].join('\n'));
    }
  }
  /***************************************************************************************************

  printPagesRoot: Print all the pages to single root file

  ***************************************************************************************************/
  printPagesRoot() {
    fs.existsSync(this.root) || fs.mkdirSync(this.root);
    const allPages = Object.values(this.pageLines).reduce( (p, c) => {return p.concat(c)})
    fs.writeFileSync (this.root + '/' + this.indexPage, allPages.join('\n'));
  }

}
module.exports = Pages;