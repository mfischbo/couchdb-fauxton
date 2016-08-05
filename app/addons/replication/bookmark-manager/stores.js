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
    this._focusedBookmark = {};
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
   * Removes the bookmark from the internal map of stored bookmarks
   * @param The bookmark to be removed
   */
  _deleteBookmark(bookmark) {
    if (this._focusedBookmark === bookmark) {
      this.setFocusedBookmark({});
    }
    delete this._bookmarks[bookmark.id];
  },

  /**
   * Stores the bookmark internally
   * @param The bookmark to be stored.
   */
  _saveBookmark (bookmark) {
    this._bookmarks[bookmark.id] = bookmark;
  },

  dispatch: function (action) {
    switch (action.type) {

      case ActionTypes.BOOKMARK_INIT:
        this.setBookmarks(action.options.bookmarks);
        this.triggerChange();
        break;

      case ActionTypes.BOOKMARK_SAVE_BOOKMARK:
        this._saveBookmark(action.options.bookmark);
        this.triggerChange();
        break;

      case ActionTypes.BOOKMARK_FOCUS_BOOKMARK:
        this.setFocusedBookmark(action.options.bookmark);
        this.triggerChange();
        break;

      case ActionTypes.BOOKMARK_DELETE_BOOKMARK:
        this._deleteBookmark(action.options.bookmark);
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
