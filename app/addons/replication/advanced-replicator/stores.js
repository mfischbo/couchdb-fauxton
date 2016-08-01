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

const AdvancedReplicationStore = FauxtonAPI.Store.extend({

  /**
   * Initializes the stores internal data.
   * @param States if on reinitialization local databases should be kept
   */
  initialize: function (keepLocalDatabases) {

    // the list of local databases
    if (!keepLocalDatabases) {
      this._databases = [];
    }

    // object containing a mapping from local database names
    // to defined filterfunctions for those databases
    this._filterFunctions = {};

    // the selected filter function to be used
    this._filterFunction = '';

    this._source = {
      // The type of the replication source. This is either
      // LOCAL or REMOTE
      sourceType: 'LOCAL',

      // the selected source database. This is either a database name
      // if _sourceType == 'LOCAL' or a URL if _sourceType == 'REMOTE'
      database: '',
      password: '',
      options: {
        proxyUrl: '',
        startingSequence: '',
        filterFunction: '',
        queryParameters: '',
        useCheckpoints: false,
        checkpointInterval: 0
      }
    };

    this._target = {
      sourceType: 'LOCAL',
      database: '',
      password: '',
      options: {
        continuous: false,
        createTarget: false,
        documentId: ''
      }
    };
  },

  getLocalDatabases: function () {
    return this._databases;
  },

  getAvailableFilterFunctions: function (database) {
    return this._filterFunctions[database] || [];
  },

  setAvailableFilterFunctions: function (database, filterFunctions) {
    this._filterFunctions[database] = filterFunctions;
  },

  getSourceType: function () {
    return this._source.sourceType;
  },

  setSourceType: function (type) {
    this._source.sourceType = type;
  },

  getTargetType: function () {
    return this._target.sourceType;
  },

  setTargetType: function (type) {
    this._target.sourceType = type;
  },

  getSourceDatabase: function () {
    return this._source.database;
  },

  setSourceDatabase: function (database) {
    this._source.database = database;
  },

  getTargetDatabase: function () {
    return this._target.database;
  },

  setTargetDatabase: function (database) {
    this._target.database = database;
  },

  getSourcePassword: function () {
    return this._source.password;
  },

  setSourcePassword: function (password) {
    this._source.password = password;
  },

  getTargetPassword: function () {
    return this._target.password;
  },

  setTargetPassword: function (password) {
    this._target.password = password;
  },

  setSourceOption: function (option, value) {
    this._source.options[option] = value;
  },

  getSourceOption: function (option) {
    return this._source.options[option];
  },

  setTargetOption: function (option, value) {
    this._target.options[option] = value;
  },

  getTargetOption: function (option) {
    return this._target.options[option];
  },

  dispatch: function (action) {

    switch (action.type) {
      case ActionTypes.LOCAL_DATABASES_LOADED:
        this._databases = action.options.databases;
        this.triggerChange();
        break;

      case ActionTypes.FILTER_FUNCTIONS_UPDATED:
        this.setAvailableFilterFunctions(action.options.database,
          action.options.filters);
        this.triggerChange();
        break;

      case ActionTypes.REPLICATION_SET_SOURCE_TYPE:
        this._source.sourceType = action.options.type;
        this.triggerChange();
        break;

      case ActionTypes.REPLICATION_SET_TARGET_TYPE:
        this._target.sourceType = action.options.type;
        this.triggerChange();
        break;

      case ActionTypes.REPLICATION_SET_SOURCE_DB:
        this.setSourceDatabase(action.options.database);
        this.triggerChange();
        break;

      case ActionTypes.REPLICATION_SET_TARGET_DB:
        this.setTargetDatabase(action.options.database);
        this.triggerChange();
        break;

      case ActionTypes.REPLICATION_SET_SOURCE_PASSWORD:
        this._source.password = action.options.password;
        this.triggerChange();
        break;

      case ActionTypes.REPLICATION_SET_TARGET_PASSWORD:
        this._target.password = action.options.password;
        this.triggerChange();
        break;

      case ActionTypes.REPLICATION_SET_SOURCE_OPTION:
        this.setSourceOption(action.options.key, action.options.value);
        this.triggerChange();
        break;

      case ActionTypes.ADV_REPLICATION_SET_TARGET_OPTION:
        this.setTargetOption(action.options.key, action.options.value);
        this.triggerChange();
        break;

      case ActionTypes.REPLICATION_START_REPLICATION:
        this._startReplication();
        this.triggerChange();
        break;

      case ActionTypes.REPLICATION_CLEAR_FORM:
        this.initialize(true);
        this.triggerChange();
        break;
    }
 }
});

const advancedReplicationStore = new AdvancedReplicationStore();

advancedReplicationStore.dispatchToken =
  FauxtonAPI.dispatcher.register(advancedReplicationStore.dispatch);

export default {
    advancedReplicationStore
};
