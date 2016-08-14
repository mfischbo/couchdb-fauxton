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

const PAGE_SIZE = FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE;

const BookmarkStore = FauxtonAPI.Store.extend({
  initialize: function () {
    /*
     * A map to hold all bookmarks. Key is the id of the bookmark
     * value is the bookmark itself
     */
    this._bookmarks = {};

    /**
     * The bookmark that is currently subject to be edited
     */
    this._focusedBookmark = undefined;

    /**
     * Contains information about pagination
     */
    this._page = {
      numberOfElements: Object.keys(this._bookmarks).length,
      hasNextPage: false,
      hasPreviousPage: false,
      numberOfPages: 1,
      currentPage: 0,
      firstElement: 0,
      lastElement: 0
    };

    /**
     * Contains the filter term to filter bookmarks
     */
    this._filter = {
      term: '',
    };
  },

  /**
   * Returns the currently focues bookmark
   */
  getFocusedBookmark () {
    return this._focusedBookmark;
  },

  /**
   * Sets the bookmark that is currently subject to be edited
   * @param The bookmark to be edited
   */
  setFocusedBookmark (bookmark) {
    this._focusedBookmark = bookmark;
  },

  /**
   * Returns a map of stored bookmarks.
   * Key is the id of the bookmark, value is the bookmark itself
   * @return The bookmarks that are available
   */
  getBookmarks () {
    return this._bookmarks;
  },

  /**
   * Sets the bookmarks that are available. This must be a map
   * of key value pairs. Key is the id of the bookmark,
   * value is the bookmark itself.
   * @param The bookmarks
   */
  setBookmarks (bookmarks) {
    this._bookmarks = bookmarks;
  },

  /**
   * Returns the meta information of the current page
   * @return The page
   */
  getPage () {
    return this._page;
  },

  /**
   * Sets the meta information for the current page
   * @param Page the new page to be used
   */
  setPage (page) {
    this._page = page;
  },

  getFilter() {
    return this._filter;
  },

  setFilter (filter) {
    this._filter = filter;
  },

  /**
   * Method to update the current page object.
   * @param page The page to calculate the page object for. Must be an integer
   * between 0 (first page) and n (last page) or undefined.
   * If undefined the method recalculates the page object for the current amount
   * of elements
   */
  _updatePage (page) {
    if (!page) {
      page = this._page.currentPage;
    }
    const cnt = Object.keys(this._bookmarks).length;
    const nPage = {
      numberOfElements: cnt,
      hasNextPage: cnt > ((page + 1) * PAGE_SIZE),
      hasPreviousPage: page > 0,
      numberOfPages: Math.ceil(cnt / PAGE_SIZE),
      currentPage: page,
      firstElement: page * PAGE_SIZE + 1,
      lastElement: Math.min(page * PAGE_SIZE + PAGE_SIZE, cnt)
    };
    this.setPage(nPage);
  },

  dispatch: function (action) {
    switch (action.type) {

      case ActionTypes.BOOKMARK_INIT:
        this.setBookmarks(action.options.bookmarks);
        this._updatePage(action.options.page);
        this.triggerChange();
        break;

      case ActionTypes.BOOKMARK_FOCUS_BOOKMARK:
        this.setFocusedBookmark(action.options.bookmark);
        this.triggerChange();
        break;

      case ActionTypes.BOOKMARK_UPDATE_BOOKMARKS:
        this.setBookmarks(action.options.bookmarks);
        this.setFocusedBookmark(undefined);
        this._updatePage(action.options.page);
        this.triggerChange();
        break;

      case ActionTypes.BOOKMARK_UPDATE_FILTER:
        this.setFilter({ term: action.options.term });
        this.triggerChange();
        break;
    }
  }
});

const bookmarkStore = new BookmarkStore();
bookmarkStore.dispatchToken = FauxtonAPI.dispatcher.register(bookmarkStore.dispatch);

export default {
    bookmarkStore
};
