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
import ReactDOM from 'react-dom';
import Stores from './stores';
import Actions from './actions';
import FauxtonAPI from '../../../core/api';
import Components from '../../components/react-components.react';
import FauxtonComponentsReact from '../../fauxton/components.react';
import './assets/less/bookmark-manager.less';

const BulkActionComponent = Components.BulkActionComponent;
const ToggleHeaderButton = Components.ToggleHeaderButton;
const store = Stores.bookmarkStore;

class BookmarksController extends React.Component {

  constructor () {
    super();
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
    }

    render() {
      if (!this.props.bookmark) {
        return null;
      }

      return (
        <div className="row-fluid">
          <div className="span12">
            <label>Remote Host</label>
            <input type="text"
              value={this.props.bookmark.host || ''}
              onChange={(e) => this.props.onInputChange('host', e.target.value) }/>
          </div>

          <div className="span12">
            <label>Username</label>
            <input type="text"
              value={this.props.bookmark.user || ''}
              onChange={(e) => this.props.onInputChange('user', e.target.value) }/>
          </div>

          <div className="span12">
            <label>Database</label>
            <input type="text"
              value={this.props.bookmark.database || ''}
              onChange={(e) => this.props.onInputChange('database', e.target.value) }/>
          </div>

          <div className="span6">
            <button type="button" className="btn btn-success"
              onClick={this.props.onSave}>
              <i className="icon icon-ok"></i> Save
            </button>
          </div>

          <div className="span6">
            <button type="button" className="btn btn-danger"
              onClick={this.props.onDismiss}>
              <i className="icon fonticon-delete"></i> Cancel
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

    this.onToggleSelect = this.onToggleSelect.bind(this);
    this.onBulkRemove = this.onBulkRemove.bind(this);
  }

  getStoreState () {
    return {
      bookmarks: store.getBookmarks(),
      page: store.getPage(),
      filter: store.getFilter(),
      bulkOps: this.bulkOps
    };
  }

  componentWillMount () {
    store.on('change', this.onStoreChange, this);
  }

  componentWillUnmount () {
    store.off('change', this.onStoreChange, this);
  }

  onStoreChange() {
    this.setState(this.getStoreState());
  }

  getPreparedModel() {

    const bookmarks = [];
    const term = this.state.filter.term;

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

  onToggleSelect() {
    this.bulkOps.isChecked = !this.bulkOps.isChecked;
    if (this.bulkOps.isChecked) {
      this.bulkOps.selectedItems = Object.keys(store.getBookmarks());
    } else {
      this.bulkOps.selectedItems = [];
    }
    this.setState(this.getStoreState());
  }

  render () {
    const entries = this.createTableEntries();
    return (
      <div className="bookmarks-table">
        <table className="table table-striped">
          <thead>
            <tr>
              <th className="checkbox tableview-header-el-checkbox">
                <BulkActionComponent
                  isChecked={this.bulkOps.isChecked}
                  hasSelectedItem={this.bulkOps.selectedItems.length > 0}
                  removeItem={this.onBulkRemove}
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
    this.state = this.getStoreState();
  }

  getStoreState() {
    return {
      page: store.getPage()
    };
  }

  componentWillMount() {
    store.on('change', this.onStoreChange, this);
  }

  componentWillUnmount() {
    store.off('change', this.onStoreChange, this);
  }

  onStoreChange() {
    this.setState(this.getStoreState());
  }


  render () {
    return (
      <footer className="bookmark-footer pagination-footer">
        <div className="bookmark-pagination">
          <FauxtonComponentsReact.Pagination
            page={this.state.page.currentPage + 1}
            total={this.state.page.numberOfElements}
            urlPrefix="#/bookmarks?page="/>
        </div>
        <div className="current-bookmarks">
          Showing {this.state.page.firstElement} - {this.state.page.lastElement} of {this.state.page.numberOfElements} bookmarks
        </div>
      </footer>
    );
  }
}


class BookmarkHeader extends React.Component {

  render () {
    return (
      <div className="header-right right-db-header flex-layout flex-row">
        <BookmarkSearchInput />
        <AddBookmarkWidget />
      </div>
    );
  }
}


class AddBookmarkWidget extends React.Component {

  constructor (props) {
    super(props);
    this.state = this.getStoreState();
    this.onTrayToggle = this.onTrayToggle.bind(this);
    this.onFormInputChange = this.onFormInputChange.bind(this);
    this.onSave = this.onSave.bind(this);
  }

  getStoreState () {
    return {
      bookmark: store.getFocusedBookmark()
    };
  }

  componentDidMount() {
    store.on('change', this.onStoreChange, this);
  }

  componentWillUnmount() {
    store.off('change', this.onStoreChange, this);
  }

  onStoreChange() {
    const newState = this.getStoreState();
    if (newState.bookmark) {
      this.refs.newBookmarkTray.show();
    } else {
      this.refs.newBookmarkTray.hide();
    }
    this.setState(newState);
  }

  onTrayToggle(event) {
    event.preventDefault();
    if (this.state.bookmark) {
      Actions.clearFocusedBookmark();
    } else {
      Actions.focusBookmark({});
    }
  }

  onFormInputChange(key, value) {
    const s = this.state;
    s.bookmark[key] = value;
    this.setState(s);
  }

  onSave() {
    Actions.saveBookmark(this.state.bookmark);
  }

  onDismiss() {
    Actions.clearFocusedBookmark();
  }

  render() {
    const isActive = (this.state.bookmark != undefined);
    return (
      <div>
        <ToggleHeaderButton
          selected={isActive}
          toggleCallback={this.onTrayToggle}
          containerClasses="header-control-box"
          title="Create a new bookmark"
          fonticon="fonticon-bookmark-ribbon-wplus"
          text="Add Bookmark"/>
        <FauxtonComponentsReact.Tray ref="newBookmarkTray"
          className="new-bookmark-tray"
          onAutoHide={this.onDismiss}>
          <div className="bookmark-form">
            <BookmarkForm
              bookmark={this.state.bookmark}
              onInputChange={this.onFormInputChange}
              onSave={this.onSave}
              onDismiss={this.onDismiss}/>
          </div>
        </FauxtonComponentsReact.Tray>
      </div>
    );
  }
}


/**
 * Component that allows the user to search for a specific bookmark
 */
class BookmarkSearchInput extends React.Component {

  constructor () {
    super();
    this.state = {
      filter: ''
    };
  }

  onChange (value) {
    Actions.setFilter(value);
    this.setState({ filter: value });
  }

  render() {
    return (
      <div className="bookmark-search-field">
        <input type="text"
          value={this.state.filter}
          onChange={(e) => this.onChange(e.target.value) }
          placeholder="Search bookmark"/>
        <div className="icon-container">
          <i className="fonticon icon-search"></i>
        </div>
      </div>
    );
  }
}

/**
 * Component for searching databases on the local machine
 * or in the the stored bookmarks
 */
class AdvancedDatabaseSearch extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      term: '',
      suggestionsVisible: false
    };
  }

  /**
   * Filters the given entries against the current search term
   * @param The entries to be filterd
   * @return The entries matching the current search term
   */
  applyFilter(entries) {
    if (this.state.term && this.state.term.length < 1) {
      return entries;
    }

    const retval = [];
    for (let i in entries) {
      if (typeof entries[i] === 'string' && entries[i].startsWith(this.state.term)) {
        retval.push(entries[i]);
      }

      if (typeof entries[i] === 'object') {
        if (entries[i].host.startsWith(this.state.term) ||
          entries[i].database.startsWith(this.state.term)) {
          retval.push(entries[i]);
        }
      }
    }
    return retval;
  }

  createLocalEntries() {
    const candidates = this.applyFilter(this.props.localEntries);
    const entries = candidates.map(db => {
      return (
        <li className="local-entry" key={db}
          onClick={(e) => this.onSelectEntry(db) }>
          {db}
        </li>
      );
    });

    return (
      <ul>
        <li className="category-headline">Local Databases</li>
        {entries}
      </ul>
    );
  }

  createBookmarkEntries() {
    const candidates = this.applyFilter(this.props.bookmarks);
    const entries = candidates.map(db => {
      return (
        <li className="bookmark-entry" key={db.id}
          onClick={() => this.onSelectEntry(db) }>
          {db.database} at {db.host}
        </li>
      );
    });

    return (
      <ul>
        <li className="category-headline">Bookmarks</li>
        {entries}
      </ul>
    );
  }

  createSuggestions() {
    if (!this.state.suggestionsVisible)
      return null;

    const localDatabases = this.createLocalEntries();
    const bookmarks = this.createBookmarkEntries();

    return (
      <div className="advanced-db-search">
          {localDatabases}
          {bookmarks}
      </div>
    );
  }

  onInputChange(value) {
    this.setState({
      term: value,
      suggestionsVisible: (value.length > 0)
    });

    const retval = {
      database: value,
      type: 'REMOTE'
    };
    this.props.onEntrySelected(retval);
  }

  onSelectEntry(entry) {
    console.log('handling click');
    let value = '';
    if (typeof entry === 'string') {
      value = entry;
    }

    if (typeof entry === 'object') {
      let schema = entry.host.substr(0, entry.host.indexOf('//') + 2);
      value = schema + entry.user + '@' + entry.host.substr(schema.length);
      if (entry.host.charAt(entry.host.length - 1) === '/')
        value += entry.database;
      else
        value += '/' + entry.database;
    }

    this.setState({
      term: value,
      suggestionsVisible: false
    });

    // expose the result as an object
    const retval = {
      database: value,
      type: (typeof entry === 'string') ? 'LOCAL' : 'REMOTE'
    };
    this.props.onEntrySelected(retval);
  }

  onInputBlur() {
    const that = this;
    window.setTimeout(function () {
      that.setState({ suggestionsVisible: false });
    }, 200);
  }

  render() {
    const suggestions = this.createSuggestions();

    return (
      <div className="advanced-db-search-widget">
        <input type="text"
          value={this.state.term}
          onChange={(event) => this.onInputChange(event.target.value) }
          onBlur={(event) => this.onInputBlur()}
          />
        <div className="icon-container">
          <i className="fonticon fonticon-search"></i>
        </div>
        {suggestions}
      </div>
    );
  }
}

export default {
  BookmarksController: BookmarksController,
  BookmarkHeader: BookmarkHeader,
  BookmarkPagination: BookmarkPagination,
  AdvancedDatabaseSearch: AdvancedDatabaseSearch
};
