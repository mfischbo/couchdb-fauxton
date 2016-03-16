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

define([
  '../../core/api',
  './actiontypes',
  './constants'
],

function (FauxtonAPI, ActionTypes, Constants) {
  var Stores = {};


  Stores.ReplicationStore = FauxtonAPI.Store.extend({
    initialize: function () {
      this.reset();
    },

    reset: function () {
      this._loading = false;
      this._databases = [];

      // source fields
      this._replicationSource = '';
      this._sourceDatabase = '';
      this._remoteSource = '';

      // target fields
      this._replicationTarget = '';
      this._targetDatabase = '';
      this._remoteTarget = '';

      // other
      this._replicationType = Constants.REPLICATION_TYPE.ONE_TIME;
      this._replicationDocName = '';
    },

    isLoading: function () {
      return this._loading;
    },

    getReplicationSource: function () {
      return this._replicationSource;
    },

    getSourceDatabase: function () {
      return this._sourceDatabase;
    },

    isLocalSourceDatabaseKnown: function () {
      return _.contains(this._databases, this._sourceDatabase);
    },

    isLocalTargetDatabaseKnown: function () {
      return _.contains(this._databases, this._targetDatabase);
    },

    getReplicationTarget: function () {
      return this._replicationTarget;
    },

    getDatabases: function () {
      return this._databases;
    },

    setDatabases: function (databases) {
      this._databases = databases;
    },

    getReplicationType: function () {
      return this._replicationType;
    },

    getTargetDatabase: function () {
      return this._targetDatabase;
    },

    getReplicationDocName: function () {
      return this._replicationDocName;
    },

    // to cut down on boilerplate
    updateFormField: function (fieldName, value) {

      // I know this could be done by just adding the _ prefix to the passed field name, I just don't much like relying
      // on the var names like that...
      var validFieldMap = {
        remoteSource: '_remoteSource',
        remoteTarget: '_remoteTarget',
        targetDatabase: '_targetDatabase',
        replicationType: '_replicationType',
        replicationDocName: '_replicationDocName',
        replicationSource: '_replicationSource',
        replicationTarget: '_replicationTarget',
        sourceDatabase: '_sourceDatabase'
      };

      // TODO confirm exists

      this[validFieldMap[fieldName]] = value;
    },

    getRemoteSource: function () {
      return this._remoteSource;
    },

    getRemoteTarget: function () {
      return this._remoteTarget;
    },

    dispatch: function (action) {
      switch (action.type) {

        case ActionTypes.INIT_REPLICATION:
          this._loading = true;
          this._sourceDatabase = action.options.sourceDatabase;
        break;

        case ActionTypes.REPLICATION_DATABASES_LOADED:
          this.setDatabases(action.options.databases);
          this._loading = false;
        break;

        case ActionTypes.REPLICATION_UPDATE_FORM_FIELD:
          this.updateFormField(action.options.fieldName, action.options.value);
        break;

        case ActionTypes.REPLICATION_CLEAR_FORM:
          this.reset();
        break;

        default:
        return;
      }

      this.triggerChange();
    }
  });

  Stores.replicationStore = new Stores.ReplicationStore();
  Stores.replicationStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.replicationStore.dispatch);

  return Stores;
});
