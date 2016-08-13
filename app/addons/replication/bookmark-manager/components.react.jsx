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
import FauxtonAPI from '../../../core/api';
import Components from '../../components/react-components.react';
import FauxtonComponentsReact from '../../fauxton/components.react';
import './assets/less/bookmark-manager.less';

const BulkActionComponent = Components.BulkActionComponent;
const store = Stores.bookmarkStore;

export default class BookmarksController extends React.Component {

  constructor () {
    super();
    Actions.initialize();
    this.state = this.getStoreState();
  }

  getStoreState() {
    return {
      focusedBookmark: store.getFocusedBookmark(),
      page: store.getPage()
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
        <div className="bookmark-form">
          <BookmarkForm
            bookmark={this.state.focusedBookmark}/>
        </div>
        <BookmarkTable />
        <BookmarkPagination page={this.state.page} />
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

class SortingTableHead extends React.Component {

  constructor(props) {
    super(props);
  }

  getSortingIcon() {
     if (this.props.sorting.property === this.props.property) {
      const clazz = this.props.sorting.direction === 'ASC' ? 'icon icon-caret-up' : 'icon icon-caret-down';
      return (<i className={clazz}></i>);
    }
    return null;
  }

  render() {
    const icon = this.getSortingIcon();
    return (
      <th className="sortable" onClick={this.props.callback}>
        {this.props.children}
        &nbsp;
        {icon}
      </th>
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

    this.sorting = {
      property: 'database',
      direction: 'ASC'
    };

    this.bulkOps = {
      isChecked: false,
      selectedItems: []
    };

    this.filter = {
      term: ''
    };

    this.onToggleSelect = this.onToggleSelect.bind(this);
    this.onBulkRemove = this.onBulkRemove.bind(this);
  }

  getStoreState () {
    return {
      bookmarks: store.getBookmarks(),
      page: store.getPage(),
      bulkOps: this.bulkOps,
      filter: this.filter
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

  getPreparedModel() {

    const bookmarks = [];
    const term = this.filter.term;

    Object.keys(this.state.bookmarks).map(id => {

      let bookmark = this.state.bookmarks[id];

      // Apply the filter function if a term is set in filter.term
      if (term.length > 0) {
        if (bookmark.host.startsWith(term) ||
          bookmark.user.startsWith(term) ||
          bookmark.database.startsWith(term)) {

          bookmarks.push(bookmark);
        }
      } else {
        // no filter set
        bookmarks.push(bookmark);
      }
    });

    // apply sorting
    const that = this;
    bookmarks.sort(function (left, right) {
      return left[that.sorting.property] > right[that.sorting.property];
    });
    if (this.sorting.direction === 'DESC') {
      bookmarks.reverse();
    }
    return bookmarks;
  }

  createTableEntries() {
    if (Object.keys(this.state.bookmarks).length == 0) {
      return (
        <tr>
          <td colSpan="5">No bookmarks available</td>
        </tr>
      );
    }

    // calculate the current page offsets
    const start = this.state.page.currentPage * FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE;
    const len = start + FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE;

    const bookmarks = this.getPreparedModel().slice(start, len);

    return (
      bookmarks.map(bm => {
        return (
          <tr key={bm.id}>
            <td>
              <div className="custom-inputs show-select">
              <div className="checkbox inline">
                <input
                  id={bm.id}
                  checked={this.bulkOps.selectedItems.indexOf(bm.id) > -1}
                  data-checked={this.bulkOps.selectedItems.indexOf(bm.id) > -1}
                  onChange={(e) => this.onSelected(bm.id)}
                  type="checkbox"
                  className="js-row-select"/>
                <label
                  className="label-checkbox-doclist"
                  htmlFor={bm.id}/>
              </div>
                </div>
            </td>
            <td>{bm.database}</td>
            <td>{bm.host}</td>
            <td>{bm.user}</td>
            <td className="actions">
              <button className="btn icon-pencil"
                onClick={(e) => Actions.focusBookmark(bm) }>
              </button>
              <button className="btn icon-trash"
                onClick={(e) => Actions.deleteBookmark(bm) }>
              </button>
            </td>
          </tr>
        );
      })
    );
  }

  onSortingChange (property) {
    this.sorting.property = property;
    if (this.sorting.direction === 'ASC') {
      this.sorting.direction = 'DESC';
    } else {
      this.sorting.direction = 'ASC';
    }
    this.forceUpdate();
  }

  onSelected (id) {
    let idx = this.bulkOps.selectedItems.indexOf(id);
    if (idx > -1) {
      this.bulkOps.selectedItems.splice(idx, 1);
    } else {
      this.bulkOps.selectedItems.push(id);
    }
    this.setState(this.getStoreState());
  }

  onBulkRemove () {
    // TODO: Add a user confirmation here
    debugger;
    Actions.bulkRemove(this.bulkOps.selectedItems);
  }

  onSelectAll () {
    console.log('Select all');
  }

  onToggleSelect() {
    this.bulkOps.isChecked = !this.bulkOps.isChecked;
    if (this.bulkOps.isChecked) {
      this.bulkOps.selectedItems = Object.keys(store.getBookmarks());
    } else {
      this.bulkOps.selectedItems = [];
    }
    this.setState(this.getStoreState());
  }

  onFilterTermChanged (value) {
    this.filter.term = value;
    this.setState(this.getStoreState());
  }


  render () {
    const entries = this.createTableEntries();
    return (
      <div className="bookmarks-table">
        <div className="row-fluid">
          <div className="span6">
            <input type="text"
              value={this.filter.term}
              onChange={(e) => this.onFilterTermChanged(e.target.value) }/>
          </div>
        </div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th className="checkbox tableview-header-el-checkbox">
                <BulkActionComponent
                  isChecked={this.bulkOps.isChecked}
                  hasSelectedItem={this.bulkOps.selectedItems.length > 0}
                  removeItem={this.onBulkRemove}
                  selectAll={this.onSelectAll}
                  toggleSelect={this.onToggleSelect}
                />
              </th>
              <SortingTableHead callback={() => this.onSortingChange('database')}
                property="database" sorting={this.sorting}>Database</SortingTableHead>
              <SortingTableHead callback={() => this.onSortingChange('host') }
                property="host"  sorting={this.sorting}>Remote URL</SortingTableHead>
              <SortingTableHead callback={() => this.onSortingChange('username') }
                property="username" sorting={this.sorting}>Remote User</SortingTableHead>
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

/**
 * Component to display a pagination navigation
 */
class BookmarkPagination extends React.Component {

  constructor (props) {
    super(props);
  }

  render () {
    return (
      <footer className="pagination-footer">
        <div className="bookmark-pagination">
          <FauxtonComponentsReact.Pagination
            page={this.props.page.currentPage + 1}
            total={this.props.page.numberOfElements}
            urlPrefix="#/replication/bookmarks?page="/>
        </div>
        <div className="current-bookmarks">
          Showing {this.props.page.firstElement} - {this.props.page.lastElement} of {this.props.page.numberOfElements} bookmarks
        </div>
      </footer>
    );
  }
}
