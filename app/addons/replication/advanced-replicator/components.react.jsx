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
import './assets/less/advanced-replicator.less';

const store = Stores.advancedReplicationStore;
const TypeaheadField = Components.TypeaheadField;
const StyledSelect = Components.StyledSelect;

export default class AdvancedReplicationController extends React.Component {

  render() {
    return (
      <div>
        <SourcePane />
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
  }

  getStoreState () {
    return {
      sourceType: 'LOCAL',
      database: '',
      password: '',
    };
  }

  onSourceTypeChange (event) {
    this.setState({ sourceType: event.target.value });
  }

  onDatabaseChange (value) {
    this.setState({database: value});

    // if we have a valid database we query for filter options
    if (this.props.databases.indexOf(this.state.database) > -1) {
      Actions.updateFilterFunctions(this.state.database);
    } else {
      Actions.updateFilterFunctions();
    }
  }

  onPasswordChange (event) {
    this.setState({ password: event.target.value });
  }

  createDatabaseField () {
    if (this.state.sourceType === 'LOCAL') {
      return (
        <TypeaheadField
          list={this.props.databases}
          placeholder="Database name"
          value={this.state.database || ''}
          onChange={(value) => this.onDatabaseChange(value)}/>
      );
    } else {
      return (
        <input type="text" placeholder="Remote Database URL"/>
      );
    }
  }

  createSourceTypeOptions () {
    const options = [
      { value: 'LOCAL', label: 'Local' },
      { value: 'REMOTE', label: 'Remote' }
    ];
    return options.map(o => {
      return (<option value={o.value} key={o.value}>{o.label}</option>);
    });
  }



  render () {
    const databaseField = this.createDatabaseField();

    return (
      <div>
        <div className="row">
          <div className="span3">{this.props.sourceLabel}</div>
          <div className="span7">
            <StyledSelect
              selectContent={this.createSourceTypeOptions()}
              selectChange={(e) => this.onSourceTypeChange(e)}
              selectValue={this.state.sourceType}
              selectId="replication-source-select"/>
          </div>
        </div>

        <div className="row">
          <div className="span3">&nbsp; </div>
          <div className="span7">
            {databaseField}
          </div>
        </div>

        <div className="row">
          <div className="span3">{this.props.passwordLabel}</div>
          <div className="span7">
            <input type="password" placeholder="Password"
              value={this.state.password || ''} onChange={(e) => this.onPasswordChange(e)}/>
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
    this.state = this.getStoreState();
  }

  getStoreState () {
    return {
      sourceType: 'LOCAL',
      localDatabases: store.getLocalDatabases(),
      filterFunctions: store.getAvailableFilterFunctions(),
      filterFunction: store.getFilterFunction()
    };
  }

  onStoreChange() {
    this.setState(this.getStoreState());
  }

  componentWillMount () {
    store.on('change', this.onStoreChange, this);
  }

  componentWillUnmount () {
    store.off('change', this.onStoreChange, this);
  }

  onProxyUrlChange (event) {
    this.setState({ proxyUrl: event.target.value });
  }

  onSequenceNumberChange (event) {
    this.setState({ sequenceNumber: event.target.value });
  }

  onFilterFunctionChange (event) {
    this.setState({ filterFunction: event.target.value });
  }

  onQueryParamsChange (event) {
    this.setState({ queryParams: event.target.value });
  }

  onUseCheckpointsChange(event) {
    this.setState({ useCheckpoints: event.target.checked });
  }

  createFilterField() {
    console.log('filter functions length: ', this.state.filterFunctions.length);
    if (this.state.filterFunctions.length === 0) {
      return (
        <StyledSelect
          selectContent={[]}
          selectChange={(e) => { }}
          selectValue=""
          selectId="replication-filter-select"/>
      );
    } else {
      const options = [
        { value: '', label: 'Please select' }
      ];
      this.state.filterFunctions.map(f => {
        options.push({ value: f, label: f });
      });

      const optionsList = options.map(o => {
        return (<option value={o.value} key={o.value}>{o.label}</option>);
      });

      return (
        <StyledSelect
          selectContent={optionsList}
          selectId="replication-filter-select"
          selectValue={this.state.filterFunction}
          selectChange={(e) => this.onFilterFunctionChange(e) }/>
      );
    }
  }

  createDatabaseRow() {
    // list of databases is loaded async so we need to ensure to have them
    // available when setting the props of the child component
    if (this.state.localDatabases == undefined || this.state.localDatabases.length === 0)
      return null;
    else
      return (
        <DatabaseEntryRow
          databases={this.state.localDatabases}
          sourceLabel="Replication Source:"
          passwordLabel="Source Password:"/>
      );
  }


  render() {
    const filterField = this.createFilterField();
    const databases = this.createDatabaseRow();

    return (
      <div className="advanced-replicator-page">

        {databases}

        <div className="row">
          <div className="span3">Proxy URL</div>
          <div className="span7">
            <input type="text" placeholder="Proxy server URL (if required)"
              value={this.state.proxyUrl || ''} onChange={(e) => this.onProxyUrlChange(e)}/>
          </div>
        </div>

        <div className="row">
          <div className="span3">Starting sequence</div>
          <div className="span7">
            <input type="text" placeholder="Sequence number (optional)"
              value={this.state.sequenceNumber || ''} onChange={(e) => this.onSequenceNumberChange(e) }/>
          </div>
        </div>

        <div className="row">
          <div className="span3">Filter</div>
          <div className="span7">
            {filterField}
          </div>
        </div>

        <div className="row">
          <div className="span3">Query Parameters</div>
          <div className="span7">
            <textarea placeholder="Query Parameters (optional)" disabled={this.state.filterFunction === ''}
              value={this.state.queryParams || ''} onChange={(e) => this.onQueryParamsChange(e)}/>
          </div>
        </div>

        <div className="row">
          <div className="span3">Use Checkpoints</div>
          <div className="checkbox inline">
            <input
              type="checkbox"
              checked={this.state.useCheckpoints === true}
              data-checked={this.state.useCheckpoints === true}
              onChange={(e) => this.onUseCheckpointsChange(e)}/>
            <label onClick={(e) => this.onUseCheckpointsChange(e) }
              className="label-checkbox-doclist"/>
          </div>
        </div>
      </div>
    );
  }
}
