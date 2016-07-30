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


/**
 * Fetches all local available databases and notifies the store
 */
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
  }, function (xhr) {
    FauxtonAPI.addNotification({
      msg: 'An error occured fetching the local database names',
      type: 'error',
      clear: true
    });
  });
};

/**
 * Fetches _design documents for the specified database
 * and extracts all provided filter functions.
 * If no database provided filters are set to an empty array
 */
function updateFilterFunctions (database) {

  const promise = $.ajax({
    url: '/' + database + '/_all_docs?startkey="_design/"&endkey="_design0"&include_docs=true',
    contentType: 'application/json',
    dataType: 'json'
  }).then(function (result) {
    const filters = _retrieveFilterFunctions(result);
    FauxtonAPI.dispatch({
      type: ActionTypes.FILTER_FUNCTIONS_UPDATED,
      options: {
        filters: filters
      }
    });
    }, function (xhr) {
      FauxtonAPI.addNotification({
        msg: 'Failed to fetch filter functions for database <code>' + database + '</code>',
        type: 'error',
        escape: false,
        clear: true
      });
  });
}

/**
 * Starts the replication
 */
function startReplication(job) {

  const request = JSON.stringify(_assembleReplicationRequest(job));
  const promise = $.ajax({
    url: '/_replicator',
    method: 'POST',
    data: request,
    contentType: 'application/json',
    dataType: 'json'
  }).then(function (result) {
    FauxtonAPI.addNotification({
      msg: 'Replication from <code>' + job.source.database + '</code> to <code>' + job.target.database + '</code> started',
      type: 'success',
      escape: false,
      clear: true
    });
    }, function (xhr) {
      FauxtonAPI.addNotification({
        msg: 'Failed to start the replication.',
        type: 'error',
        clear: true
      });
  });
}

/**
 * Assembles the request body to start a replication.
 * The function assumes that all required job parameters are set and
 * checks for optional parameters only.
 * @param Object containing the parameters for the replication
 * @return Object that (when represented as JSON) is understood by the CouchDB API
 */
function _assembleReplicationRequest (job) {
  const retval = {};
  retval.source = job.source.database;

  /*
   * Option specified on the replication source
   */
  if (job.source.proxyUrl !== undefined && job.source.proxyUrl.length > 0) {
    retval.proxy = job.source.proxyUrl;
  }

  if (job.source.startingSequence !== undefined && job.source.startingSequence.length > 0) {
    retval.since_seq = job.source.startingSequence;
  }

  if (job.source.filter !== undefined && job.source.filter.length > 0) {
    retval.filter = job.source.filter;
  }

  if (job.source.queryParameters !== undefined && job.source.queryParameters.length > 0) {
    retval.query_params = job.source.queryParameters;
  }

  if (job.source.useCheckpoints) {
    retval.use_checkpoints = true;
  }

  if (job.source.checkpointInterval !== undefined && job.source.checkpointInterval.length > 0) {
    retval.checkpoint_interval = parseInt(job.source.checkpointInterval);
  }

  /*
   * Options specified on the replication target
   */
  retval.target = job.target.database;

  if (job.target.continuous) {
    retval.continuous = true;
  }

  if (job.target.documentId !== undefined && job.target.documentId.length > 0) {
    retval._id = job.target.documentId;
  }

  return retval;
}



/**
 * Private function to retrieve the available filter functions
 * on a set of design documents
 * @param result The response body of a '_all_docs' request
 * @returns An array of strings representing filter function names
 */
function _retrieveFilterFunctions (result) {
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
  return filters;
}


/**
 * Sets the type for the replication source.
 * @param value The value for the source type. Either 'LOCAL' or 'REMOTE'
 */
function setSourceType (value) {
  if (value !== 'LOCAL' && value !== 'REMOTE')
    return;

  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_SET_SOURCE_TYPE,
    options: {
      type: value
    }
  });
}

/**
 * Sets the type for the replication target
 * @param value The value for the target type. Either 'LOCAL' or 'REMOTE'
 */
function setTargetType(value) {
  if (value !== 'LOCAL' && value !== 'REMOTE')
    return;

  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_SET_TARGET_TYPE,
    options: {
      type: value
    }
  });
}

/**
 * Action to be triggered when the user selects a new database.
 * @param database The name of the database selected
 */
function setSourceDatabase (database) {

  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_SET_SOURCE_DB,
    options: {
      database: database
    }
  });
}

/**
 * Action to be triggered when the user selects a new target database.
 */
function setTargetDatabase (database) {
  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_SET_TARGET_DB,
    options: {
      database: database
    }
  });
}


/**
 * Sets the users password for the source database
 */
function setSourcePassword (value) {
  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_SET_SOURCE_PASSWORD,
    options: {
      password: value
    }
  });
}

/**
 * Sets the users password for the target database
 * @param value The password to be set
 */
function setTargetPassword (value) {
  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_SET_TARGET_PASSWORD,
    options: {
      password: value
    }
  });
}

/**
 * Sets advanced options for the source of the replication
 */
function setSourceOption (key, value) {
  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_SET_SOURCE_OPTION,
    options: {
      key: key,
      value: value
    }
  });
}

/**
 * Sets advanced options for the target of the replication
 */
function setTargetOption(key, value) {
  FauxtonAPI.dispatch({
    type: ActionTypes.ADV_REPLICATION_SET_TARGET_OPTION,
    options: {
      key: key,
      value: value
    }
  });
}

export default {
  getLocalDatabases,
  setSourceType,
  setTargetType,
  setSourceDatabase,
  setTargetDatabase,
  setSourcePassword,
  setTargetPassword,
  setSourceOption,
  setTargetOption,
  updateFilterFunctions,
  startReplication
};
