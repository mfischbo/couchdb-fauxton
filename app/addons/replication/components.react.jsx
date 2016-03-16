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
import app from "../../app";
import FauxtonAPI from "../../core/api";
import React from 'react';
import Stores from "./stores";
import Actions from "./actions";
import Constants from "./constants";
import Components from "../components/react-components.react";
import Base64 from '../style/assets/js/webtoolkit.base64';

var store = Stores.replicationStore;
var LoadLines = GeneralComponents.LoadLines;
var TypeaheadField = GeneralComponents.TypeaheadField;
var StyledSelect = GeneralComponents.StyledSelect;
var ConfirmButton = GeneralComponents.ConfirmButton;


var ReplicationController = React.createClass({

  getInitialState: function () {
    return this.getStoreState();
  },

  getStoreState: function () {
    return {
      loading: store.isLoading(),
      databases: store.getDatabases(),

      // source fields
      replicationSource: store.getReplicationSource(),
      sourceDatabase: store.getSourceDatabase(),
      localSourceDatabaseKnown: store.isLocalSourceDatabaseKnown(),
      remoteSource: store.getRemoteSource(),

      // target fields
      replicationTarget: store.getReplicationTarget(),
      targetDatabase: store.getTargetDatabase(),
      localTargetDatabaseKnown: store.isLocalTargetDatabaseKnown(),
      remoteTarget: store.getRemoteTarget(),

      // other
      replicationType: store.getReplicationType(),
      replicationDocName: store.getReplicationDocName()
    };
  },

  componentDidMount: function () {
    store.on('change', this.onChange, this);
  },

  componentWillUnmount: function () {
    store.off('change', this.onChange);
  },

  onChange: function () {
    if (this.isMounted()) {
      this.setState(this.getStoreState());
    }
  },

  // the four local replication targets all show slightly different fields
  getReplicationTargetRow: function () {
    if (!this.state.replicationTarget) {
      return null;
    }

    return (
      <ReplicationTargetRow
        remoteTarget={this.state.remoteTarget}
        replicationTarget={this.state.replicationTarget}
        databases={this.state.databases}
        targetDatabase={this.state.targetDatabase} />
    );
  },

  clear: function (e) {
    e.preventDefault();
    Actions.clearReplicationForm();
  },


  // TODO move this elsewhere.
  getAuthHeaders (user, password) {
    return {
      'Authorization': 'Basic ' + Base64.encode(user + ':' + password)
    };
  },

  submit: function () {

    // what we're going to construct
    var params = {
      source: {
        headers: { }
        url: ''
      },
      target: {}
    };

    if (this.state.replicationSource === Constants.REPLICATION_SOURCE.LOCAL) {
      params.source.url = window.location.origin + '/' + this.state.sourceDatabase;
    } else {
      params.source = this.state.remoteSource;
    }

    if (this.state.replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE) {
      params.target = this.state.targetDatabase;
    }

    if (this.state.replicationTarget === Constants.REPLICATION_TARGET.EXISTING_REMOTE_DATABASE) {
      params.target = this.state.targetDatabase;
    }

    if (this.state.replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE ||
        this.state.replicationTarget === Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE) {
      params.create_target = true;
    }
    if (this.state.replicationType === Constants.REPLICATION_TYPE.CONTINUOUS) {
      params.continuous = true;
    }

    if (this.state.replicationDocName) {
      params._id = this.state.replicationDocName;
    }

    // POSTing to the _replicator DB requires authentication. See:
    // https://gist.github.com/fdmanana/832610#8-the-user_ctx-property-and-delegations
    var user = FauxtonAPI.session.user();
    var userName = _.isNull(user) ? '' : FauxtonAPI.session.user().name;
    params.user_ctx = {
      name: userName,
      roles: ['_admin']
    };

    Actions.replicate(params);
  },

  getReplicationSourceRow: function () {
    if (!this.state.replicationSource) {
      return null;
    }

    if (this.state.replicationSource === Constants.REPLICATION_SOURCE.LOCAL) {
      return (
        <div className="row">
          <div className="span3">
            Source Name:
          </div>
          <div className="span7">
            <TypeaheadField
              list={this.state.databases}
              placeholder="Database name"
              onChange={(val) => Actions.updateFormField('sourceDatabase', val)}
              value={this.state.sourceDatabase} />
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="row">
          <div className="span3">Database URL:</div>
          <div className="span7">
            <input type="text" className="connection-url" placeholder="https://" value={this.state.remoteSource}
              onChange={(e) => Actions.updateFormField('remoteSource', e.target.value)} />
            <div className="connection-url-example">e.g. https://$USERNAME:$PASSWORD@server.com/$DATABASE</div>
          </div>
        </div>
      </div>
    );
  },

  render: function () {
    if (this.state.loading) {
      return (
        <LoadLines />
      );
    }

    var confirmButtonEnabled = true;
    if (!this.state.replicationSource || !this.state.replicationTarget) {
      confirmButtonEnabled = false;
    }

    return (
      <div className="replication-page">
        <div className="row">
          <div className="span3">
            Replication Source:
          </div>
          <div className="span7">
            <ReplicationSource
              value={this.state.replicationSource}
              onChange={(repSource) => Actions.updateFormField('replicationSource', repSource)} />
          </div>
        </div>
        {this.getReplicationSourceRow()}

        <hr size="1" />

        <div className="row">
          <div className="span3">
            Replication Target:
          </div>
          <div className="span7">
            <ReplicationTarget
              value={this.state.replicationTarget}
              onChange={(repTarget) => Actions.updateFormField('replicationTarget', repTarget)} />
          </div>
        </div>
        {this.getReplicationTargetRow()}

        <hr size="1" />

        <div className="row">
          <div className="span3">
            Replication Type:
          </div>
          <div className="span7">
            <ReplicationType
              value={this.state.replicationType}
              onChange={(repType) => Actions.updateFormField('replicationType', repType)} />
          </div>
        </div>

        <div className="row">
          <div className="span3">
            Replication Document:
          </div>
          <div className="span7">
            <input type="text" placeholder="Custom ID (optional)" value={this.state.replicationDocName}
              onChange={(e) => Actions.updateFormField('replicationDocName', e.target.value)} />
          </div>
        </div>

        <div className="row buttons-row">
          <div className="span3">
          </div>
          <div className="span7">
            <ConfirmButton id="replicate" text="Replicate" onClick={this.submit} disabled={!confirmButtonEnabled} />
            <a href="#" data-bypass="true" onClick={this.clear}>Clear</a>
          </div>
        </div>

      </div>
    );
  }
});


var ReplicationSource = React.createClass({
  propTypes: {
    value: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired
  },

  getOptions: function () {
    var options = [
      { value: '', label: 'Select source' },
      { value: Constants.REPLICATION_SOURCE.LOCAL, label: 'Local database' },
      { value: Constants.REPLICATION_SOURCE.REMOTE, label: 'Remote database' }
    ];
    return _.map(options, function (option) {
      return (
        <option value={option.value} key={option.value}>{option.label}</option>
      );
    });
  },

  render: function () {
    return (
      <StyledSelect
        selectContent={this.getOptions()}
        selectChange={(e) => this.props.onChange(e.target.value)}
        selectId="replication-source"
        selectValue={this.props.value} />
    );
  }
});


var ReplicationTarget = React.createClass({
  propTypes: {
    value: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired
  },

  getOptions: function () {
    var options = [
      { value: '', label: 'Select target' },
      { value: Constants.REPLICATION_TARGET.EXISTING_LOCAL_DATABASE, label: 'Existing local database' },
      { value: Constants.REPLICATION_TARGET.EXISTING_REMOTE_DATABASE, label: 'Existing remote database' },
      { value: Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE, label: 'New local database' },
      { value: Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE, label: 'New remote database' }
    ];
    return _.map(options, function (option) {
      return (
        <option value={option.value} key={option.value}>{option.label}</option>
      );
    });
  },

  render: function () {
    return (
      <StyledSelect
        selectContent={this.getOptions()}
        selectChange={(e) => this.props.onChange(e.target.value)}
        selectId="replication-target"
        selectValue={this.props.value} />
    );
  }
});


var ReplicationType = React.createClass({
  propTypes: {
    value: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired
  },

  getOptions: function () {
    var options = [
      { value: Constants.REPLICATION_TYPE.ONE_TIME, label: 'One time' },
      { value: Constants.REPLICATION_TYPE.CONTINUOUS, label: 'Continuous' }
    ];
    return _.map(options, function (option) {
      return (
        <option value={option.value} key={option.value}>{option.label}</option>
      );
    });
  },

  render: function () {
    return (
      <StyledSelect
        selectContent={this.getOptions()}
        selectChange={(e) => this.props.onChange(e.target.value)}
        selectId="replication-target"
        selectValue={this.props.value} />
    );
  }
});

var ReplicationTargetRow = React.createClass({
  propTypes: {
    remoteTarget: React.PropTypes.string.isRequired,
    replicationTarget: React.PropTypes.string.isRequired,
    databases: React.PropTypes.array.isRequired,
    targetDatabase: React.PropTypes.string.isRequired
  },

  update: function (value) {
    Actions.updateFormField('remoteTarget', value);
  },

  render: function () {
    var targetLabel = 'Target Name:';
    var field = null;

    // new and existing remote DBs show a URL field
    if (this.props.replicationTarget === Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE ||
        this.props.replicationTarget === Constants.REPLICATION_TARGET.EXISTING_REMOTE_DATABASE) {
      targetLabel = 'Database URL';
      field = (
        <div>
          <input type="text" className="connection-url" placeholder="https://" value={this.props.remoteTarget}
            onChange={(e) => Actions.updateFormField('remoteTarget', e.target.value)} />
          <div className="connection-url-example">e.g. https://$USERNAME:$PASSWORD@server.com/$DATABASE</div>
        </div>
      );

    // new local databases have a freeform text field
    } else if (this.props.replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE) {
      field = (
        <input type="text" placeholder="Database name" value={this.props.targetDatabase}
          onChange={(e) => Actions.updateFormField('targetDatabase', e.target.value)} />
      );

    // existing local databases have a typeahead field
    } else {
      field = (
        <TypeaheadField
          list={this.props.databases}
          placeholder="Database name"
          onChange={(val) => Actions.updateFormField('targetDatabase', val)}
          value={this.props.targetDatabase} />
      );
    }

    if (this.props.replicationTarget === Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE ||
        this.props.replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE) {
      targetLabel = 'New Database:';
    }

    return (
      <div className="row">
        <div className="span3">{targetLabel}</div>
        <div className="span7">
          {field}
        </div>
      </div>
    );
  }
});


export default {
  ReplicationController: ReplicationController
};

