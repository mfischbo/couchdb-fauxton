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
  initialize: function () {

    // the list of local databases
    this._databases = [];

    // the list of available filter functions for _sourceDatabase
    // this might be empty if _sourceType == 'REMOTE'
    this._filterFunctions = [];

    // the selected filter function to be used
    this._filterFunction = '';
  },

  getLocalDatabases: function () {
    return this._databases;
  },

  getAvailableFilterFunctions: function () {
    return this._filterFunctions;
  },

  getFilterFunction: function () {
    return this._filterFunction;
  },

  dispatch: function (action) {

    switch (action.type) {
      case ActionTypes.LOCAL_DATABASES_LOADED:
        this._databases = action.options.databases;
        this.triggerChange();
        break;

      case ActionTypes.FILTER_FUNCTIONS_UPDATED:
        this._filterFunctions = action.options.filters;
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
