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

define([], function () {
  return {

    // dispatched when the local databases are loaded via ajax
    LOCAL_DATABASES_LOADED: 'LOCAL_DATABASES_LOADED',

    // dispatched when the filter functions for the selected database are loaded
    FILTER_FUNCTIONS_UPDATED: 'FILTER_FUNCTIONS_UPDATED',

    // dispatched when the user starts the replication
    REPLICATION_START_REPLICATION: 'REPLICATION_START_REPLICATION',

    // dispatched when the user changes the source type of the database
    REPLICATION_SET_SOURCE_TYPE: 'REPLICATION_SET_SOURCE_TYPE',

    // dispatched when the user changes the target type of the database
    REPLICATION_SET_TARGET_TYPE: 'REPLICATION_SET_TARGET_TYPE',

    // dispatched when the user changes the source database
    REPLICATION_SET_SOURCE_DB: 'REPLICATION_SET_SOURCE_DB',

    // dispatched when the user changes the target database
    REPLICATION_SET_TARGET_DB: 'REPLICATION_SET_TARGET_DB',

    // dispatched when the user changes the password for the source database
    REPLICATION_SET_SOURCE_PASSWORD: 'REPLICATION_SET_SOURCE_PASSWORD',

    // dispatched when the user changes the password for the target database
    REPLICATION_SET_TARGET_PASSWORD: 'REPLICATION_SET_TARGET_PASSWORD',

    // dispatched when a replication option changes on the source side
    REPLICATION_SET_SOURCE_OPTION: 'REPLICATION_SET_SOURCE_OPTION',

    // dispatched when a replication option changes on the target side
    ADV_REPLICATION_SET_TARGET_OPTION: 'ADV_REPLICATION_SET_TARGET_OPTION',

    // dispatched when the user requests to reset the form
    REPLICATION_CLEAR_FORM: 'REPLICATION_CLEAR_FORM'
  };
});
