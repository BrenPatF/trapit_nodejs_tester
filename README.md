The Math Function Unit Testing design pattern, implemented in nodejs
====================================================================
On March 23, 2018 I made the following presentation at the Oracle User Group conference in Dublin:

<a href="https://www.slideshare.net/brendanfurey7/database-api-viewed-as-a-mathematical-function-insights-into-testing" target="_blank">Database API Viewed As A Mathematical Function: Insights into Testing</a>

The first section was summarised as:
<blockquote>Developing a universal design pattern for testing APIs using the concept of a 'pure' function as a wrapper to manage the 'impurity' inherent in database APIs</blockquote>

Although the presentation focussed on database testing the design pattern is clearly quite general. In this project I demonstrate the pattern in backend (nodejs) javascript using three examples of testing, and present a unit test assertion package, along with some helper modules, to support the pattern. I'll be writing an article on my blog about this, but for now I will summarise the main features of the design pattern:

- The unit under test is viewed from the perspective of a mathematical function having an 'extended signature', comprising any actual parameters and return value, together with other inputs and outputs of any kind
- A wrapper function is constructed based on this conceptual function, and the wrapper function is 'externally pure', while internally handling impurities such as file I/O
- A single unit testing program calls the wrapper function within a loop over scenario records
- The input records for the wrapper function are stored in a separate data file (in JSON format here), that also includes expected outputs and metada records describing the data structure
- The wrapper function returns an augmented scenario record that includes the actual as well as expected outputs, and is stored as a record in an array
- At the end a single call is made to an assertion function that returns an object containing the complete results
- The returned object is passed to one or more reporting functions to be formatted (here in plain text and in HTML)

Advantages include:

- Once the unit test program is written for one scenario (that includes all data groups), no further programming is required to handle additional scenarios
- The outputs from the unit testing program show exactly what the program actually does in terms of data inputs and outputs
- All unit test programs can follow a single, straightfoward pattern
- The nodejs assertion package can be used to process results files generated from any language as .json files, and four examples from Oracle PL/SQL are included

Folder structure:
- bat: Windows .bat files to execute the main/test programs and direct any error output to files in out root folder
- code: main .js programs
- inp: .json test data files
- lib: library helper modules
- out:
	- root holds .out and .err files from the .bat (usually empty)
	- *title* subfolders hold result files for test programs with a single *title*.txt...
	- ...and *title*.html as the root page with links for pages per scenario
	- external subfolder has externally-sourced JSON output files that are processed by test-externals.js
- test: test .js programs, including test-externals.js for the externally-sourced JSON files

I have included diagrams of the general data model followed by all examples, plus diagrams of the specific model in each case in the root folder.

Design pattern examples: There are three test programs, two with example main programs
```=================================================================================================
|  Main/Test         |  Unit Module |  Notes                                                       |
|====================|==============|===============================================================
|  main-hello-world  |              |  Simple Hello World program done as pure function to allow   |
|  test-hello-world  |  HelloWorld  |  for unit testing as a simple edge case                      |
----------------------------------------------------------------------------------------------------
|  main-col-group    |              |  A simple file-reading and group-counting module, with       |
|  test-col-group    |  ColGroup    |  logging. Example of testing impure units, and error display |
----------------------------------------------------------------------------------------------------
|  test-trapit       |  Trapit      |  The assertion module itself, written with core pure function|
|                    |              |  to enable unit testing, and make multiple reporters easy    |
====================================================================================================
```
Helper modules: There are two helper classes and three helper modules of pure functions
```====================================================================================================
|  Module    |  Notes                                                                              | 
|===================================================================================================
|  Utils     |  General utility functions, called mainly by the Text module below                  |
----------------------------------------------------------------------------------------------------
|  TimerSet  |  Code timing class, used here only by the main programs                             |
----------------------------------------------------------------------------------------------------
|  Pages     |  Class used to buffer pages of text ahead of writing to file, used by Text and HTML |
----------------------------------------------------------------------------------------------------
|  Text      |  Module of pure functions that format text report output and buffer using Pages     |
----------------------------------------------------------------------------------------------------
|  HTML      |  Module of pure functions that format HTML report output and buffer using Pages     |
====================================================================================================
```
Externally-sourced JSON files: The files are from an Oracle project, named {package}.{procedure}_OUT.json:

See https://github.com/BrenPatF/trapit_oracle_tester for the project that creates these files (the 
JSON version is not uploaded yet).

```================================================================================================================
|  File                                       |  Notes                                                         | 
|===============================================================================================================
|  tt_emp_batch.tt_aip_load_emps_out.json     |  Batch loading of employee data from file to table             |
----------------------------------------------------------------------------------------------------------------
|  tt_emp_ws.tt_aip_get_dept_emps_out.json    |  REF cursor getting department, employee data for web service  |
----------------------------------------------------------------------------------------------------------------
|  tt_emp_ws.tt_aip_save_emps_out.json        |  Web service procedure to save employee data                   |
----------------------------------------------------------------------------------------------------------------
|  tt_view_drivers.tt_hr_test_view_v_out.json |  Batch view getting department, employee data                  |
================================================================================================================
```
In the initial commit, I have only included a single scenario in testing the Trapit core function itself. I will add further scenarios in future - simply by adding metadata records in the .json file