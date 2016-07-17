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

import app from '../../../app';
import FauxtonAPI from '../../../core/api';
import ActionTypes from './actiontypes';

function getLocalDatabases () {

  $.ajax({
    url: '/_all_dbs',
    contentType: 'applicaiton/json',
    dataType: 'json'
  }).then(function (databases) {
    FauxtonAPI.dispatch({
      type: ActionTypes.LOCAL_DATABASES_LOADED,
      options: {
        databases: databases
      }
    });
  });
};

/**
 * Fetches _design documents for the specified database
 * and extracts all provided filter functions.
 * If no database provided filters are set to an empty array
 */
function updateFilterFunctions(database) {
  if (database == undefined) {
    FauxtonAPI.dispatch({
      type: ActionTypes.FILTER_FUNCTIONS_UPDATED,
      options: {
        filters: []
      }
    });
    return;
  }

  $.ajax({
    url: '/' + database + '/_all_docs?startkey="_design/"&endkey="_design0"&include_docs=true',
    contentType: 'application/json',
    dataType: 'json'
  }).then(function (result) {
    const filters = [];
    const rows = result.rows;
    for (let i in rows) {
      const doc = rows[i].doc;
      if (doc.filters != undefined) {
        for (let filter in doc.filters) {
          filters.push(filter);
        }
      }
    }

    FauxtonAPI.dispatch({
      type: ActionTypes.FILTER_FUNCTIONS_UPDATED,
      options: {
        filters: filters
      }
    });
  });
}


export default {
  getLocalDatabases,
  updateFilterFunctions
};
