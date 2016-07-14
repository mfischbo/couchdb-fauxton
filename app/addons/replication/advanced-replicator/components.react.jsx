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
import ReplicationType from '../components.react';
import ReplicationSource from '../components.react';
import ReplicationTarget from '../components.react';

const store = Stores.advancedReplicationStore;

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
 * This class represents the source pane of the advanced replicator.
 */
class SourcePane extends React.Component {

  constructor () {
    super();
    Actions.initialize();
    this.state = this.getStoreState();
  }

  getStoreState () {
    return {
      sourceType: store.getSourceType(),
      localDatabases: store.getLocalDatabases()
    };
  }

  onStoreChange () {
    this.setState(this.getStoreState());
  }

  componentWillMount () {
    store.on('change', this.onStoreChange, this);
  }

  componentWillUnmount () {
    store.off('change', this.onStoreChange, this);
  }

  createDatabaseOptions() {
    return this.state.localDatabases.map(db => {
      return (<option value="{db}" key={db}>{db}</option>);
    });
  }


  render() {
    const databases = this.createDatabaseOptions();

    return (
      <div className="dashboard-content">
        <div className="row">
          <div className="span3">Replication Source</div>
          <div className="span7">
            <input type="radio" name="replicationSource" value="LOCAL"
              checked={this.state.sourceType == 'LOCAL'}/> Local
            <input type="radio" name="replicationSource" value="REMOTE"
              checked={this.state.sourceType == 'REMOTE'}/> Remote
          </div>
        </div>

        <div className="row">
          <div className="span3">&nbsp; </div>
          <div className="span7">
            <select>
              {databases}
            </select>
          </div>
        </div>

        <div className="row">
          <div className="span3">Source Password</div>
          <div className="span7">
            <input type="password" placeholder="Password"/>
          </div>
        </div>

        <div className="row">
          <div className="span3">Proxy URL</div>
          <div className="span7">
            <input type="text" placeholder="Proxy server URL (if required)"/>
          </div>
        </div>

        <div className="row">
          <div className="span3">Starting sequence</div>
          <div className="span7">
            <input type="text" placeholder="Sequence number (optional)" />
          </div>
        </div>

        <div className="row">
          <div className="span3">Filter</div>
          <div className="span7">
            <select type="text">

            </select>
          </div>
        </div>

        <div className="row">
          <div className="span3">Query Parameters</div>
          <div className="span7">
            <textarea placeholder="Query Parameters (optional)"/>
          </div>
        </div>

        <div className="row">
          <div className="span3">Use Checkpoints</div>
          <input type="checkbox" />
        </div>
      </div>
    );
  }
}
