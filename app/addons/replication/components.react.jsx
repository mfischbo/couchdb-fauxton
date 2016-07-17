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
import app from '../../app';
import FauxtonAPI from '../../core/api';
import React from 'react';
import Stores from './stores';
import Actions from './actions';
import Constants from './constants';
import Components from '../components/react-components.react';
import base64 from 'base-64';
import AuthActions from '../auth/actions';
import AuthComponents from '../auth/components.react';
import BookmarksController from './bookmark-manager/components.react';
import AdvancedReplicationController from './advanced-replicator/components.react';
import ActivityController from './replication-activity/components.react';

const store = Stores.replicationStore;
const LoadLines = Components.LoadLines;
const TypeaheadField = Components.TypeaheadField;
const StyledSelect = Components.StyledSelect;
const ConfirmButton = Components.ConfirmButton;
const PasswordModal = AuthComponents.PasswordModal;
const TabElementWrapper = Components.TabElementWrapper;
const TabElement = Components.TabElement;

/**
 * The root component for the replication page.
 * The component consists of multiple tabs and tab pages and can
 * easily be extended by simply adding more tab pages
 */
class ReplicationPageController extends React.Component {

  constructor (props) {
    super(props);
  }

  render () {
    return (
    <div className="scrollable">
      <ReplicatorTabs />
      <TabPage id="simple-replication">
        <ReplicationController />
      </TabPage>
      <TabPage id="advanced-replication">
        <AdvancedReplicationController />
      </TabPage>
      <TabPage id="bookmark-manager">
        <BookmarksController />
      </TabPage>
      <TabPage id="replication-activity">
        <ActivityController />
      </TabPage>
    </div>
    );
  }
}

/**
 * Component to handle all clicks on tabs and the navigation
 * between pages.
 */
class ReplicatorTabs extends React.Component {

  constructor () {
    super();
    this.state = this.getStoreState();
    this.handleTabClick = this.handleTabClick.bind(this);
  }

  getStoreState () {
    return {
      activePage: store.getActivePage()
    };
  }

  componentDidMount () {
    store.on('change', this.onStoreChange, this);

    // on default we select the first page
    Actions.switchTab(this.props.pages[0]);
  }

  componentWillUnmount () {
    store.off('change', this.onStoreChange, this);
  }

  onStoreChange () {
    this.setState(this.getStoreState());
  }

  handleTabClick (e) {
    const radioName = e.target.value;

    this.props.pages.map((page) => {
      if (page.label === radioName) {
        Actions.switchTab(page);
      }
    });
  }

  createTabs () {
    return (
      this.props.pages.map((page, i) => {

        const isActive = (page === this.state.activePage);
        return (
          <TabElement
            key={i}
            selected={isActive}
            text={page.label}
            onChange={this.handleTabClick} />
        );
      })
    );
  }

  render () {
    const tabs = this.createTabs();
    return (
      <TabElementWrapper>
        {tabs}
      </TabElementWrapper>
    );
  }
};
ReplicatorTabs.defaultProps = {
  pages : [
    { id: 'simple-replication', label: 'Simple Replication'},
    { id: 'advanced-replication', label: 'Advanced Replication'},
    { id: 'bookmark-manager', label: 'Bookmarks'},
    { id: 'replication-activity', label: 'Activity'}
  ]
};

/**
 * Component to handle the view state of a tab page.
 */
class TabPage extends React.Component {

  constructor () {
    super();
    this.state = this.getStoreState();
  }

  getStoreState () {
    return {
      activePage: store.getActivePage()
    };
  }

  componentDidMount () {
    store.on('change', this.onChange, this);
  }

  componentWillUnmount () {
    store.off('change', this.onChange, this);
  }

  onChange () {
    this.setState(this.getStoreState());
  }

  render () {
    if (this.props.id === this.state.activePage.id) {
      return (
        <div id={this.props.id}>
          {this.props.children}
        </div>
      );
    } else {
      return null;
    }
  }
}

class ReplicationController extends React.Component {
  constructor (props) {
    super(props);
    this.state = this.getStoreState();
    this.submit = this.submit.bind(this);
    this.clear = this.clear.bind(this);
    this.showPasswordModal = this.showPasswordModal.bind(this);
  }

  getStoreState () {
    return {
      loading: store.isLoading(),
      databases: store.getDatabases(),
      authenticated: store.isAuthenticated(),
      password: store.getPassword(),

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
      passwordModalVisible: store.isPasswordModalVisible(),
      replicationType: store.getReplicationType(),
      replicationDocName: store.getReplicationDocName()
    };
  }

  componentDidMount () {
    store.on('change', this.onChange, this);
  }

  componentWillUnmount () {
    store.off('change', this.onChange);
  }

  onChange () {
    this.setState(this.getStoreState());
  }

  // the four local replication targets all show slightly different fields
  getReplicationTargetRow () {
    const { replicationTarget, remoteTarget, databases, targetDatabase } = this.state;
    if (!replicationTarget) {
      return null;
    }
    return (
      <ReplicationTargetRow
        remoteTarget={remoteTarget}
        replicationTarget={replicationTarget}
        databases={databases}
        targetDatabase={targetDatabase}/>
    );
  }

  clear (e) {
    e.preventDefault();
    Actions.clearReplicationForm();
  }

  showPasswordModal () {
    const { replicationSource, replicationTarget } = this.state;

    var hasLocalSourceOrTarget = (replicationSource === Constants.REPLICATION_SOURCE.LOCAL ||
      replicationTarget === Constants.REPLICATION_TARGET.EXISTING_LOCAL_DATABASE ||
      replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE);

    // if the user is authenticated, or if NEITHER the source nor target are local, just submit. The password
    // modal isn't necessary
    if (!hasLocalSourceOrTarget || this.state.authenticated) {
      this.submit();
      return;
    }
    AuthActions.showPasswordModal();
  }

  getUsername () {
    return app.session.get('userCtx').name;
  }

  getAuthHeaders () {
    const username = this.getUsername();
    return {
      'Authorization': 'Basic ' + base64.encode(username + ':' + this.state.password)
    };
  }

  submit () {
    const { replicationSource, sourceDatabase, remoteSource, remoteTarget, replicationTarget, targetDatabase, replicationType,
      replicationDocName} = this.state;

    const params = {};

    // perform a little validatin here
    if (!this.validate()) {
      return;
    }

    // source
    if (replicationSource === Constants.REPLICATION_SOURCE.LOCAL) {
      params.source = {
        headers: this.getAuthHeaders(),
        url: window.location.origin + '/' + sourceDatabase
      };
    } else {
      params.source = remoteSource;
    }

    // target
    if (replicationTarget === Constants.REPLICATION_TARGET.EXISTING_LOCAL_DATABASE) {
      params.target = {
        headers: this.getAuthHeaders(),
        url: window.location.origin + '/' + targetDatabase
      };
    } else if (replicationTarget === Constants.REPLICATION_TARGET.EXISTING_REMOTE_DATABASE) {
      params.target = remoteTarget;
    } else if (replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE) {

      // check to see if we really need to send headers here or can just do the ELSE clause in all scenarioe
      if (replicationSource === Constants.REPLICATION_SOURCE.LOCAL) {
        params.target = {
          headers: this.getAuthHeaders(),
          url: window.location.origin + '/' + targetDatabase
        };
      } else {
        const port = window.location.port === '' ? '' : ':' + window.location.port;
        params.target = window.location.protocol + '//' + this.getUsername() + ':' + this.state.password + '@'
          + window.location.hostname + port + '/' + targetDatabase;
      }
    } else if (replicationTarget === Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE) {
      params.target = remoteTarget;
    }

    if (_.contains([Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE, Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE], replicationTarget)) {
      params.create_target = true;
    }
    if (replicationType === Constants.REPLICATION_TYPE.CONTINUOUS) {
      params.continuous = true;
    }

    if (replicationDocName) {
      params._id = this.state.replicationDocName;
    }

    // POSTing to the _replicator DB requires authentication
    const user = FauxtonAPI.session.user();
    const userName = _.isNull(user) ? '' : FauxtonAPI.session.user().name;
    params.user_ctx = {
      name: userName,
      roles: ['_admin', '_reader', '_writer']
    };

    Actions.replicate(params);
  }

  validate () {
    const { replicationTarget, targetDatabase, databases } = this.state;

    if (replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE && _.contains(databases, targetDatabase)) {
      FauxtonAPI.addNotification({
        msg: 'The <code>' + targetDatabase + '</code> database already exists locally. Please enter another database name.',
        type: 'error',
        escape: false,
        clear: true
      });
      return false;
    }

    return true;
  }

  getReplicationSourceRow () {
    const { replicationSource, databases, sourceDatabase, remoteSource } = this.state;

    if (!replicationSource) {
      return null;
    }

    if (replicationSource === Constants.REPLICATION_SOURCE.LOCAL) {
      return (
        <div className="row">
          <div className="span3">
            Source Name:
          </div>
          <div className="span7">
            <TypeaheadField
              list={databases}
              placeholder="Database name"
              onChange={(val) => Actions.updateFormField('sourceDatabase', val)}
              value={sourceDatabase}/>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="row">
          <div className="span3">Database URL:</div>
          <div className="span7">
            <input type="text" className="connection-url" placeholder="https://" value={remoteSource}
              onChange={(e) => Actions.updateFormField('remoteSource', e.target.value)}/>
            <div className="connection-url-example">e.g. https://$REMOTE_USERNAME:$REMOTE_PASSWORD@$REMOTE_SERVER/$DATABASE</div>
          </div>
        </div>
      </div>
    );
  }

  render () {
    const { loading, replicationSource, replicationTarget, replicationType, replicationDocName, passwordModalVisible,
      localSourceDatabaseKnown, localTargetDatabaseKnown } = this.state;

    if (loading) {
      return (
        <LoadLines />
      );
    }

    let confirmButtonEnabled = true;
    if (!replicationSource || !replicationTarget) {
      confirmButtonEnabled = false;
    }
    if (replicationSource === Constants.REPLICATION_SOURCE.LOCAL && !localSourceDatabaseKnown) {
      confirmButtonEnabled = false;
    }
    if (replicationTarget === Constants.REPLICATION_TARGET.EXISTING_LOCAL_DATABASE && !localTargetDatabaseKnown) {
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
              value={replicationSource}
              onChange={(repSource) => Actions.updateFormField('replicationSource', repSource)}/>
          </div>
        </div>
        {this.getReplicationSourceRow()}

        <hr size="1"/>

        <div className="row">
          <div className="span3">
            Replication Target:
          </div>
          <div className="span7">
            <ReplicationTarget
              value={replicationTarget}
              onChange={(repTarget) => Actions.updateFormField('replicationTarget', repTarget)}/>
          </div>
        </div>
        {this.getReplicationTargetRow()}

        <hr size="1"/>

        <div className="row">
          <div className="span3">
            Replication Type:
          </div>
          <div className="span7">
            <ReplicationType
              value={replicationType}
              onChange={(repType) => Actions.updateFormField('replicationType', repType)}/>
          </div>
        </div>

        <div className="row">
          <div className="span3">
            Replication Document:
          </div>
          <div className="span7">
            <input type="text" placeholder="Custom ID (optional)" value={replicationDocName}
              onChange={(e) => Actions.updateFormField('replicationDocName', e.target.value)}/>
          </div>
        </div>

        <div className="row buttons-row">
          <div className="span3">
          </div>
          <div className="span7">
            <ConfirmButton id="replicate" text="Start Replication" onClick={this.showPasswordModal} disabled={!confirmButtonEnabled}/>
            <a href="#" data-bypass="true" onClick={this.clear}>Clear</a>
          </div>
        </div>

        <PasswordModal
          visible={passwordModalVisible}
          modalMessage={<p>Replication requires authentication.</p>}
          submitBtnLabel="Continue Replication"
          onSuccess={this.submit} />
      </div>
    );
  }
}


class ReplicationSource extends React.Component {
  getOptions () {
    const options = [
      { value: '', label: 'Select source' },
      { value: Constants.REPLICATION_SOURCE.LOCAL, label: 'Local database' },
      { value: Constants.REPLICATION_SOURCE.REMOTE, label: 'Remote database' }
    ];
    return _.map(options, function (option) {
      return (
        <option value={option.value} key={option.value}>{option.label}</option>
      );
    });
  }

  render () {
    return (
      <StyledSelect
        selectContent={this.getOptions()}
        selectChange={(e) => this.props.onChange(e.target.value)}
        selectId="replication-source"
        selectValue={this.props.value} />
    );
  }
}
ReplicationSource.propTypes = {
  value: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired
};


class ReplicationTarget extends React.Component {
  getOptions () {
    const options = [
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
  }

  render () {
    return (
      <StyledSelect
        selectContent={this.getOptions()}
        selectChange={(e) => this.props.onChange(e.target.value)}
        selectId="replication-target"
        selectValue={this.props.value} />
    );
  }
}

ReplicationTarget.propTypes = {
  value: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired
};


class ReplicationType extends React.Component {
  getOptions () {
    const options = [
      { value: Constants.REPLICATION_TYPE.ONE_TIME, label: 'One time' },
      { value: Constants.REPLICATION_TYPE.CONTINUOUS, label: 'Continuous' }
    ];
    return _.map(options, function (option) {
      return (
        <option value={option.value} key={option.value}>{option.label}</option>
      );
    });
  }

  render () {
    return (
      <StyledSelect
        selectContent={this.getOptions()}
        selectChange={(e) => this.props.onChange(e.target.value)}
        selectId="replication-target"
        selectValue={this.props.value} />
    );
  }
}
ReplicationType.propTypes = {
  value: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired
};


class ReplicationTargetRow extends React.Component {
  update (value) {
    Actions.updateFormField('remoteTarget', value);
  }

  render () {
    const { replicationTarget, remoteTarget, targetDatabase, databases } = this.props;

    let targetLabel = 'Target Name:';
    let field = null;
    let remoteHelpText = 'https://$USERNAME:$PASSWORD@server.com/$DATABASE';

    // new and existing remote DBs show a URL field
    if (replicationTarget === Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE ||
        replicationTarget === Constants.REPLICATION_TARGET.EXISTING_REMOTE_DATABASE) {
      targetLabel = 'Database URL';
      remoteHelpText = 'https://$REMOTE_USERNAME:$REMOTE_PASSWORD@$REMOTE_SERVER/$DATABASE';

      field = (
        <div>
          <input type="text" className="connection-url" placeholder="https://" value={remoteTarget}
            onChange={(e) => Actions.updateFormField('remoteTarget', e.target.value)} />
          <div className="connection-url-example">e.g. {remoteHelpText}</div>
        </div>
      );

    // new local databases have a freeform text field
    } else if (replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE) {
      field = (
        <input type="text" placeholder="Database name" value={targetDatabase}
          onChange={(e) => Actions.updateFormField('targetDatabase', e.target.value)} />
      );

    // existing local databases have a typeahead field
    } else {
      field = (
        <TypeaheadField
          list={databases}
          placeholder="Database name"
          onChange={(val) => Actions.updateFormField('targetDatabase', val)}
          value={targetDatabase} />
      );
    }

    if (replicationTarget === Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE ||
        replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE) {
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
}
ReplicationTargetRow.propTypes = {
  remoteTarget: React.PropTypes.string.isRequired,
  replicationTarget: React.PropTypes.string.isRequired,
  databases: React.PropTypes.array.isRequired,
  targetDatabase: React.PropTypes.string.isRequired
};


export default {
  ReplicationPageController,
  ReplicationController,
  ReplicationSource,
  ReplicationTarget,
  ReplicationType,
  ReplicationTargetRow
};