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
import base64 from 'base-64';


/**
 * Fetches all local available databases and notifies the store.
 * Creates a notification if the fetch operation failed.
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
        database: database,
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
 * @param job The object containing all user defined properties for the replication
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
    FauxtonAPI.dispatch({
      type: ActionTypes.REPLICATION_CLEAR_FORM
    });
    }, function (xhr) {
      const txt = JSON.parse(xhr.responseText);
      FauxtonAPI.addNotification({
        msg: 'Failed to start the replication. Reason: ' + txt.reason,
        type: 'error',
        clear: true
      });
  });
}

/**
 * Sets the store back to an initial state
 */
function clear () {
  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_CLEAR_FORM
  });
}

/**
 * Assembles the request body to start a replication.
 * The function assumes that all required job parameters are set and
 * checks for optional parameters only.
 * @param Object containing the parameters for the replication
 * @return Object that (when represented as JSON) is a valid RequestBody to the /_replicator API
 */
function _assembleReplicationRequest(job) {
  const retval = {};

  /*
   * Check for authentication
   */
  const user = FauxtonAPI.session.user();
  const username = _.isNull(user) ? '' : FauxtonAPI.session.user().name;
  retval.user_ctx = {
    name: username,
    roles: ['_reader', '_writer']
  };

  retval.source = {
    url: _createUrl(job.source.database),
    headers: _createAuthenticationHeaders(username, job.source.password)
  };

  /*
   * Option specified on the replication source
   */
  if (job.source.options.proxyUrl !== undefined && job.source.options.proxyUrl.length > 0) {
    retval.proxy = job.source.options.proxyUrl;
  }


  if (job.source.options.filter !== undefined && job.source.options.filter.length > 0) {
    retval.filter = job.source.options.filter;
  }

  if (job.source.options.queryParameters !== undefined &&
    job.source.options.queryParameters.length > 0) {
    retval.query_params = JSON.parse(job.source.options.queryParameters);
  }

  if (job.source.options.useCheckpoints) {
    retval.use_checkpoints = true;
  }

  // TODO: Check if checkpoint_interval > 0
  if (job.source.options.checkpointInterval !== undefined &&
    job.source.options.checkpointInterval.length > 0) {
    retval.checkpoint_interval = parseInt(job.source.options.checkpointInterval);
  }

  /*
   * Assemble the replication target
   */
  retval.target = {
    url: _createUrl(job.target.database),
    headers: _createAuthenticationHeaders(username, job.target.password)
  };

  if (job.target.continuous) {
    retval.continuous = true;
  }

  if (job.target.createTarget) {
    retval.create_target = true;
  }

  if (job.target.documentId !== undefined && job.target.documentId.length > 0) {
    retval._id = job.target.documentId;
  }

  return retval;
}


/**
 * Ensures that a given string represents a valid URL.
 * @param database The name of a database (or URL)
 * @return A valid URL
 */
function _createUrl (database) {

  // check if we already have a valid URL
  if (database.startsWith('http://') || database.startsWith('https://')) {
    return database;
  }

  // seems only the name of the database is given.
  const retval = window.location.protocol + '//' + window.location.hostname
    + ':' + window.location.port + '/' + database;
  return retval;
}


/**
 * Creates a base64 encoded basic authorization headers
 * @param username The username to be encoded in the header
 * @param password The password to be encoded in the header
 * @return The HTTP Authorization header field in JSON format
 */
function _createAuthenticationHeaders (username, password) {
  return {
    'Authorization': 'Basic ' + base64.encode(username + ':' + password)
  };
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

        // strip the '_design/' prefix from the id
        let id = doc._id.substring('_design/'.length);
        filters.push({ id: id + '/' + filter, label: filter });
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
  startReplication,
  clear
};
