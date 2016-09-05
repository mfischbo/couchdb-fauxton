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
import React from 'react';
import Stores from './stores';
import Actions from './actions';
import Components from '../../components/react-components.react';
import ReplicationType from '../components.react';
import ReplicationSource from '../components.react';
import ReplicationTarget from '../components.react';

import AdvancedDatabaseSearch from '../bookmark-manager/components.react';
import BookmarkStores from '../bookmark-manager/stores';
import BookmarkActions from '../bookmark-manager/actions';

import './assets/less/advanced-replicator.less';

const store = Stores.advancedReplicationStore;
const bookmarkStore = BookmarkStores.bookmarkStore;

const TypeaheadField = Components.TypeaheadField;
const StyledSelect = Components.StyledSelect;
const DatabaseSearch = AdvancedDatabaseSearch.AdvancedDatabaseSearch;

export default class AdvancedReplicationController extends React.Component {

  /**
   * Assembles all required data from the store and triggers the replication action.
   */
  onStartReplicationClicked () {
    const job = {
      source: {
        database: store.getSourceDatabase(),
        password: store.getSourcePassword(),
        options: {
          proxyUrl: store.getSourceOption('proxyUrl'),
          startingSequence: store.getSourceOption('startingSequence'),
          filter: store.getSourceOption('filterFunction'),
          queryParameters: store.getSourceOption('queryParameters'),
          useCheckpoints: store.getSourceOption('useCheckpoints'),
          checkpointInterval: store.getSourceOption('checkpointInterval')
        }
      },
      target: {
        database: store.getTargetDatabase(),
        password: store.getTargetPassword(),
        continuous: store.getTargetOption('continuous'),
        createTarget: store.getTargetOption('createTarget'),
        documentId: store.getTargetOption('documentId')
      }
    };

    Actions.startReplication(job);
  }

  render() {
    return (
      <div className="advanced-replicator-page">
        <div className="row-fluid">
          <div className="span6">
            <SourcePane />
          </div>
          <div className="span6">
            <TargetPane />
          </div>
        </div>
        <div className="row-fluid">
          <hr />
        </div>
        <div className="row-fluid">
          <div className="span3">&nbsp;</div>
          <div className="span6">
            <button className="btn btn-success"
              onClick={(e) => this.onStartReplicationClicked()}>
              <i className="icon fonticon-ok-circled"></i> Start Replication
            </button>

            <button className="btn btn-danger"
              onClick={(e) => Actions.clear() }>
              <i className="icon icon-delete"></i> Clear
            </button>
          </div>
        </div>
      </div>
    );
  }
};

/**
 * This class represents a component that handles
 * form fields for the replication source type, the database (URL) and
 * the users password
 */
class DatabaseEntryRow extends React.Component {

  constructor (props) {
    super(props);
    this.state = this.getStoreState();
    this.onEntrySelected = this.onEntrySelected.bind(this);
  }

  componentDidMount () {
    store.on('change', this.onStoreChange, this);
  }

  componentWillUnmount () {
    store.off('change', this.onStoreChange, this);
  }

  onStoreChange () {
    this.setState(this.getStoreState());
  }

  getStoreState () {
    if (this.props.type == 'SOURCE') {
      return {
        sourceType: store.getSourceType(),
        database: store.getSourceDatabase(),
        password: store.getSourcePassword()
      };
    } else {
      return {
        sourceType: store.getTargetType(),
        database: store.getTargetDatabase(),
        password: store.getTargetPassword()
      };
    }
  }

  /**
   * Handler to be triggered when the database selection is changed
   *
   */
  onDatabaseChange (value) {
    if (this.props.type == 'SOURCE') {
      if (store.getLocalDatabases().indexOf(value) > -1) {
        Actions.updateFilterFunctions(value);
      }
      Actions.setSourceDatabase(value);
    } else {
      Actions.setTargetDatabase(value);
    }
  }


  /**
   * Handler to be triggered whenever the password changes
   * @param value The new password value
   */
  onPasswordChange (value) {
    if (this.props.type == 'SOURCE') {
      Actions.setSourcePassword(value);
    } else {
      Actions.setTargetPassword(value);
    }
  }


  /**
   * Handler to be triggered when an entry from the AdvancedDatabaseSearch is selected.
   * Checks if the entry is a local database and if so updates the filter functions.
   * Further the new entry is propagated through an action to the store.
   * @param entry The entry to be
   */
  onEntrySelected (entry) {
    if (this.props.type === 'SOURCE') {
      if (entry.type === 'LOCAL' && store.getLocalDatabases().indexOf(entry.database) > -1) {
        Actions.updateFilterFunctions(entry.database);
      }
      Actions.setSourceDatabase(entry.database);
    } else {
      Actions.setTargetDatabase(entry.database);
    }
  }


  /**
   * Internal helper method to create the AdvancedDatabaseSearch field.
   * @return The correctly configured AdvancedDatabaseSearch field.
   */
  createDatabaseField() {
    const bookmarks = [];
    for (let i in this.props.bookmarks)
      bookmarks.push(this.props.bookmarks[i]);

    return (
      <DatabaseSearch
        localEntries={this.props.databases}
        bookmarks={bookmarks}
        onEntrySelected={this.onEntrySelected}
      />
    );
  }


  /**
   * Renders the component.
   * @return The element to be rendered into the DOM
   */
  render() {
    const databaseField = this.createDatabaseField();

    return (
      <div>
        <div className="row-fluid">
          <div className="span3">Database</div>
          <div className="span5">
            {databaseField}
          </div>
        </div>

        <div className="row-fluid">
          <div className="span3">{this.props.passwordLabel}</div>
          <div className="span5">
            <input type="password" placeholder="Password"
              value={this.state.password || ''}
              onChange={(event) => this.onPasswordChange(event.target.value)}/>
          </div>
        </div>
      </div>
    );
  }
};


/**
 * This class represents the source pane of the advanced replicator.
 */
class SourcePane extends React.Component {

  constructor () {
    super();
    Actions.getLocalDatabases();
    BookmarkActions.initialize();
    this.state = this.getStoreState();
  }

  getStoreState () {
    return {
      localDatabases: store.getLocalDatabases(),
      bookmarks: bookmarkStore.getBookmarks(),
      filterFunctions: store.getAvailableFilterFunctions(store.getSourceDatabase()),
      proxyUrl: store.getSourceOption('proxyUrl'),
      filterFunction: store.getSourceOption('filterFunction'),
      queryParameters: store.getSourceOption('queryParameters'),
      useCheckpoints: store.getSourceOption('useCheckpoints'),
      checkpointInterval: store.getSourceOption('checkpointInterval')
    };
  }

  onStoreChange () {
    this.setState(this.getStoreState());
  }

  componentDidMount () {
    store.on('change', this.onStoreChange, this);
    bookmarkStore.on('change', this.onStoreChange, this);
  }

  componentWillUnmount () {
    store.off('change', this.onStoreChange, this);
    bookmarkStore.off('change', this.onStoreChange, this);
  }

  createFilterField () {
    if (this.state.filterFunctions.length === 0 ||
      store.getSourceDatabase().length === 0 ||
      store.getAvailableFilterFunctions(store.getSourceDatabase()) === undefined) {
      return null;
    }

    const options = [
      { value: '', label: 'Please select' }
    ];
    this.state.filterFunctions.map(f => {
      options.push({ value: f.id, label: f.label });
    });

    const optionsList = options.map(o => {
      return (<option value={o.value} key={o.value}>{o.label}</option>);
    });

    return (
      <div className="row-fluid">
        <div className="span3">Filter</div>
        <div className="span5">
          <StyledSelect
            selectContent={optionsList}
            selectId="replication-filter-select"
            selectValue={this.state.filterFunction}
            selectChange={(e) => Actions.setSourceOption('filterFunction', e.target.value) }/>
        </div>
      </div>
    );
  }

  createQueryParams () {
    if (this.state.filterFunction !== undefined && this.state.filterFunction.length > 0) {
      return (
        <div className="row-fluid">
          <div className="span3">Query Parameters</div>
          <div className="span5">
            <textarea placeholder="Query Parameters (optional)" disabled={this.state.filterFunction === ''}
              value={this.state.queryParameters}
              onChange={(e) => Actions.setSourceOption('queryParameters', e.target.value) }/>
          </div>
        </div>
      );
    }
    return null;
  }

  createDatabaseRow () {
    // list of databases is loaded async so we need to ensure to have them
    // available when setting the props of the child component
    if (this.state.localDatabases == undefined || this.state.localDatabases.length === 0)
      return null;
    else
      return (
        <DatabaseEntryRow
          type="SOURCE"
          databases={this.state.localDatabases}
          bookmarks={this.state.bookmarks}
          sourceLabel="Replication Source"
          passwordLabel="Source Password"/>
      );
  }


  render () {
    const filterField = this.createFilterField();
    const databases = this.createDatabaseRow();
    const queryParams = this.createQueryParams();

    return (
      <div>
        {databases}
        <div className="row-fluid">
          <div className="span3">Proxy URL</div>
          <div className="span5">
            <input type="text" placeholder="Proxy server URL (if required)"
              value={this.state.proxyUrl}
              onChange={(e) => Actions.setSourceOption('proxyUrl', e.target.value)}/>
          </div>
        </div>

        {filterField}

        {queryParams}

        <div className="row-fluid">
          <div className="span3">Use Checkpoints</div>
          <div className="span5">
            <div className="custom-inputs show-select">
              <div className="checkbox inline">
                <input
                  id="use-checkpoints-checkbox"
                  checked={this.state.useCheckpoints}
                  data-checked={this.state.useCheckpoints}
                  onChange={(e) => Actions.setSourceOption('useCheckpoints', !this.state.useCheckpoints) }
                  type="checkbox"
                  className="js-row-select"/>
                <label className="custom-checkbox" htmlFor="use-checkpoints-checkbox"/>

                <input
                  disabled={!this.state.useCheckpoints}
                  min="0"
                  className="checkpoint-interval-input"
                  type="number"
                  value={this.state.checkpointInterval}
                  onChange={(e) => Actions.setSourceOption('checkpointInterval', e.target.value) }/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * This class represents the target pane of a replication.
 * It includes the name / URL of the target database, the password for replication
 * as well as options for the replication type and the optional document id
 * of the replication within the _replicator database
 */
class TargetPane extends React.Component {

  constructor (props) {
    super(props);
    this.state = this.getStoreState();
  }

  getStoreState () {
    return {
      sourceType: store.getTargetType(),
      localDatabases: store.getLocalDatabases(),
      bookmarks: bookmarkStore.getBookmarks(),
      continuous: store.getTargetOption('continuous'),
      createTarget: store.getTargetOption('createTarget'),
      documentId: store.getTargetOption('documentId')
    };
  }

  componentDidMount () {
    store.on('change', this.onStoreChange, this);
  }

  componentWillUnmount () {
    store.off('change', this.onStoreChange, this);
  }

  onStoreChange () {
    this.setState(this.getStoreState());
  }

  createDatabaseRow () {
    if (this.state.localDatabases == undefined || this.state.localDatabases.length == 0) {
      return null;
    }

    return (
      <DatabaseEntryRow
        type="TARGET"
        databases={this.state.localDatabases}
        bookmarks={this.state.bookmarks}
        sourceLabel="Replication Target"
        passwordLabel="Target Password"/>
    );
  }

  render () {
    const databaseRow = this.createDatabaseRow();

    return (
      <div className="row-fluid">
        {databaseRow}

        <div className="row-fluid">
          <div className="span3">Continuous</div>
          <div className="span5">
            <div className="custom-inputs show-select">
              <div className="checkbox inline target-pane">
                <input type="checkbox"
                  id="continuous-checkbox"
                  checked={this.state.continuous}
                  data-checked={this.state.continuous}
                  onChange={(e) => Actions.setTargetOption('continuous', !this.state.continuous) }
                  type="checkbox"
                  className="js-row-select"/>
                <label className="label-checkbox-doclist" htmlFor="continuous-checkbox"/>
              </div>
            </div>
          </div>
        </div>

        <div className="row-fluid">
          <div className="span3">Create Target</div>
          <div className="span5">
            <div className="custom-inputs show-select">
              <div className="checkbox inline target-pane">
                <input type="checkbox"
                  id="create-target-checkbox"
                  checked={this.state.createTarget}
                  data-checked={this.state.createTarget}
                  onChange={(e) => Actions.setTargetOption('createTarget', !this.state.createTarget) }
                  type="checkbox"
                  className="js-row-select"/>
                <label className="label-checkbox-doclist" htmlFor="create-target-checkbox"/>
              </div>
            </div>
          </div>
        </div>

        <div className="row-fluid">
          <div className="span3">Replication ID</div>
          <div className="span5">
            <input type="text" placeholder="Document ID (optional)"
              value={this.state.documentId}
              onChange={(e) => Actions.setTargetOption('documentId', e.target.value) }/>
          </div>
        </div>
      </div>
    );
  }
}
