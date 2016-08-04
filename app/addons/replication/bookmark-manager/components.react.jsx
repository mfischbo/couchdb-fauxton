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

import React from 'react';
import Stores from './stores';
import Actions from './actions';
import './assets/less/bookmark-manager.less';

const store = Stores.bookmarkStore;

export default class BookmarksController extends React.Component {

  constructor () {
    super();
    this.state = this.getStoreState();
  }

  getStoreState() {
    return {
      focusedBookmark: store.getFocusedBookmark()
    };
  }

  componentDidMount() {
    store.on('change', this.onStoreChange, this);
  }

  componentWillUnmount () {
    store.off('change', this.onStoreChange, this);
  }

  onStoreChange () {
    this.setState(this.getStoreState());
  }

  render() {
    return (
      <div className="bookmarks-page">
        <BookmarkForm
          bookmark={this.state.focusedBookmark}/>
        <BookmarkTable />
      </div>
    );
  }
}


/**
 * This class represents the form which enables the user to
 * create new bookmarks and enables the user to edit stored bookmarks.
 */
class BookmarkForm extends React.Component {

    constructor (props) {
      super(props);
      this.state = this.getLocalState(props);
      this.saveBookmark = this.saveBookmark.bind(this);
    }

    getLocalState(props) {
      return {
        id: props.bookmark.id || '',
        host: props.bookmark.host || '',
        user: props.bookmark.user || '',
        database: props.bookmark.database || ''
      };
    }

    componentWillReceiveProps(props) {
      this.setState(this.getLocalState(props));
    }

    onInputChange (key, value) {
      const s = this.state;
      s[key] = value;
      this.setState(s);
    }

    saveBookmark () {
      const success = Actions.saveBookmark(this.state);
      if (success) {
        this.setState(this.getLocalState({ bookmark: {}}));
      }
    }

    render () {
      return (
        <div className="row-fluid">
          <div className="span3">
            <label>Remote Host</label>
            <input type="text" value={this.state.host} onChange={(e) => this.onInputChange('host', e.target.value) }/>
          </div>

          <div className="span3">
            <label>Username</label>
            <input type="text" value={this.state.user} onChange={(e) => this.onInputChange('user', e.target.value) }/>
          </div>

          <div className="span3">
            <label>Database</label>
            <input type="text" value={this.state.database} onChange={(e) => this.onInputChange('database', e.target.value) }/>
          </div>

          <div className="span3">
            <label>&nbsp;</label>
            <button type="button" className="btn btn-success"
              onClick={this.saveBookmark}>
              <i className="icon icon-ok"></i> Save
            </button>
          </div>
        </div>
      );
    }
}

/**
 * Class that represents the table to display all bookmarks that have
 * been stored by a user.
 */
class BookmarkTable extends React.Component {

  constructor () {
    super();
    this.state = this.getStoreState();
  }

  getStoreState () {
    return {
      bookmarks: store.getBookmarks()
    };
  }

  componentWillMount () {
    store.on('change', this.onStoreChange, this);
  }

  componentWillUnmount () {
    store.off('change', this.onStoreChange, this);
  }

  onStoreChange () {
    this.setState(this.getStoreState());
  }

  createTableEntries () {
    const bookmarks = this.state.bookmarks;
    if (Object.keys(bookmarks).length == 0) {
      return (
        <tr>
          <td colSpan="5">No bookmarks available</td>
        </tr>
      );
    }


    return (
      Object.keys(bookmarks).map(id => {
        return (
          <tr key={id}>
            <td>
              <input type="checkbox"/>
            </td>
            <td>{bookmarks[id].database}</td>
            <td>{bookmarks[id].host}</td>
            <td>{bookmarks[id].user}</td>
            <td className="actions">
              <button className="btn icon-pencil"
                onClick={(e) => Actions.focusBookmark(bookmarks[id]) }>
              </button>
              <button className="btn icon-trash"
                onClick={(e) => Actions.deleteBookmark(bookmarks[id]) }>
              </button>
            </td>
          </tr>
        );
      })
    );
  }

  render () {
    const entries = this.createTableEntries();
    return (
      <div className="bookmarks-table">
        <table className="table table-striped">
          <thead>
            <tr>
              <th></th>
              <th>Database</th>
              <th>Remote Server URL</th>
              <th>Remote User</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries}
          </tbody>
        </table>
      </div>
    );
  }
}
