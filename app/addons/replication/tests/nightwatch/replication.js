// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.



const helpers = require('../../../../../test/nightwatch_tests/helpers/helpers.js');
const newDatabaseName1 = 'fauxton-selenium-tests-replication1';
const newDatabaseName2 = 'fauxton-selenium-tests-replication2';
const replicatedDBName = 'replicated-db';
const docName1 = 'doc-name1';
const docName2 = 'doc-name2';
const pwd = 'testerpass'; // pull from somewhere?

const destroyDBs = (client, done) => {
  var nano = helpers.getNanoInstance(client.globals.test_settings.db_url);
  nano.db.destroy(newDatabaseName1, () => {
    nano.db.destroy(newDatabaseName2, () => {
      nano.db.destroy(replicatedDBName, () => {
        done();
      });
    });
  });
};

module.exports = {
  before: destroyDBs, // just in case the test failed on prev execution
  after: destroyDBs,

  'Replicates existing local db to new local db' : function (client) {
    var waitTime = client.globals.maxWaitTime,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .createDatabase(newDatabaseName1)
      .createDocument(docName1, newDatabaseName1)
      .loginToGUI()
      .url(baseUrl + '/#replication')
      .waitForElementPresent('button#replicate', waitTime, true)
      .waitForElementPresent('#replication-source', waitTime, true)

      // select LOCAL as the source
      .click('#replication-source')
      .click('option[value="REPLICATION_SOURCE_LOCAL"]')
      .waitForElementPresent('.replication-source-name-row', waitTime, true)

      // enter our source DB
      .setValue('.replication-source-name-row .Select-input input', [newDatabaseName1])
      .keys(['\uE015', '\uE015', '\uE006'])

      // enter a new target name
      .click('#replication-target')
      .click('option[value="REPLICATION_TARGET_NEW_LOCAL_DATABASE"]')
      .setValue('.new-local-db', replicatedDBName)

      .click('#replicate')

      .waitForElementPresent('.enter-password-modal', waitTime, true)
      .setValue('.enter-password-modal input[type="password"]', pwd) // pull pwd from somewhere?
      .click('.enter-password-modal button.save')

      // now check the database was created
      .checkForDatabaseCreated(newDatabaseName1, waitTime, true)

      // lastly, check the doc was replicated as well
      .url(baseUrl + '/' + newDatabaseName1 + '/' + docName1)
      .waitForElementVisible('html', waitTime, false)
      .getText('html', function (result) {
        const data = result.value,
              createdDocIsPresent = data.indexOf(docName1);

        this.verify.ok(createdDocIsPresent > 0,  'Checking doc exists.');
      })
      .end();
  },


//  'Replicates existing local db to existing local db' : function (client) {
//    var waitTime = client.globals.maxWaitTime,
//      baseUrl = client.globals.test_settings.launch_url;
//
//    client
//
//      // create two databases with a single doc
//      .createDatabase(newDatabaseName1)
//      .createDocument(docName1, newDatabaseName1)
//      .createDatabase(newDatabaseName2)
//      .createDocument(docName2, newDatabaseName2)
//
//      // now login and fill in the replication form
//      .loginToGUI()
//      .url(baseUrl + '/#replication')
//      .waitForElementPresent('button#replicate', waitTime, true)
//      .waitForElementPresent('#replication-source', waitTime, true)
//
//      // select LOCAL as the source
//      .click('#replication-source')
//      .click('option[value="REPLICATION_SOURCE_LOCAL"]')
//      .waitForElementPresent('.replication-source-name-row', waitTime, true)
//
//      // enter our source DB
//      .setValue('.replication-source-name-row .Select-input input', [newDatabaseName1])
//      .keys(['\uE015', '\uE015', '\uE006'])
//
//      // select existing local as a the target
//      .click('#replication-target')
//      .click('option[value="REPLICATION_TARGET_EXISTING_LOCAL_DATABASE"]')
//      .setValue('.replication-target-name-row .Select-input input', [newDatabaseName2])
//
//      .click('#replicate')
//
//      .waitForElementPresent('.enter-password-modal', waitTime, true)
//      .setValue('.enter-password-modal input[type="password"]', pwd)
//      .click('.enter-password-modal button.save')
//
//      .waitForElementPresent('.global-notification.alert-success', waitTime, true)
//
//      // now check the target database contains 2 docs
//      .url(baseUrl + '/' + newDatabaseName2)
//      .waitForElementVisible('html', waitTime, false)
//      .getText('html', function (result) {
//        const data = result.value,
//          createdDocIsPresent = data.indexOf(docName);
//
//        console.log(data);
//        this.verify.ok(createdDocIsPresent > 0,  'Checking 2 docs exists.');
//      })
//      .end();
//  }
};