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
        this.resetForm();

        // array containing the users bookmarks
        this._bookmarks = [];
    },

    resetForm: function () {
        // the object containing the forms values
        this._focusedBookmark = {
            id: 0,
            name: '',
            host: '',
            databases: []
        };

        this._focusedDatabase = {
            id: '',
            username: '',
            database: ''
        };
    },

    /**
     * Returns the currently focues bookmark
     */
    getFocusedBookmark () {
        return this._focusedBookmark;
    },

    getFocusedDatabase () {
        return this._focusedDatabase;
    },

    getBookmarks () {
        return this._bookmarks;
    },

    setBookmarks (bookmarks) {
        this._bookmarks = bookmarks;
    },

    _pushDatabase () {
        if (this._focusedDatabase.id !== '') {
            for (let i in this._focusedBookmark.databases) {
                if (this._focusedBookmark.databases[i].id == this._focusedDatabase.id) {
                    this._focusedBookmark.databases[i] = this._focusedDatabase;
                }
            }
        } else {
            this._focusedDatabase.id = this._focusedBookmark.databases.length + 1;
            this._focusedBookmark.databases.push(this._focusedDatabase);
        }
        this._focusedDatabase = {
            id: '',
            username: '',
            database: ''
        };
        this.triggerChange();
    },

    _editDatabase (database) {
        this._focusedDatabase = database;
        this.triggerChange();
    },

    _removeDatabase (database) {
        const idx = this._focusedBookmark.databases.indexOf(database);
        this._focusedBookmark.databases.splice(idx, 1);
        this.triggerChange();
    },

    _editBookmark (bookmark) {
        // TODO: Implmeent check if the form has been edited and ask
        // the user for permission to reset the form
        this._focusedBookmark = bookmark;
        this.triggerChange();
    },

    _deleteBookmark (bookmark) {
        // TODO: Let the user confirm the action
        const idx = this._bookmarks.indexOf(bookmark);
        if (idx > -1) {
            this._bookmarks.splice(idx, 1);
        }
        this.triggerChange();
    },

    _saveBookmark () {
        const bookmark = {
            id : this._bookmarks.length + 1,
            name: this._focusedBookmark.name,
            host: this._focusedBookmark.host,
            databases: this._focusedBookmark.databases
        };

        this._bookmarks.push(bookmark);
        this.resetForm();
        this.triggerChange();
    },

    dispatch: function (action) {

        switch (action.type) {
            case ActionTypes.BOOKMARK_UPDATE_FORM_FIELD:
                if (action.options.field === 'username' || action.options.field === 'database') {
                    this._focusedDatabase[action.options.field] = action.options.value;
                } else {
                    this._focusedBookmark[action.options.field] = action.options.value;
                }
                this.triggerChange();
                break;

            case ActionTypes.BOOKMARK_RESET_FORM:
                this.resetForm();
                this.triggerChange();
                break;

            case ActionTypes.BOOKMARK_PUSH_DATABASE:
                this._pushDatabase();
                break;

            case ActionTypes.BOOKMARK_EDIT_DATABASE:
                this._editDatabase(action.options.database);
                break;

            case ActionTypes.BOOKMARK_REMOVE_DATABASE:
                this._removeDatabase(action.options.database);
                break;

            case ActionTypes.BOOKMARK_SAVE_BOOKMARK:
                this._saveBookmark();
                break;

            case ActionTypes.BOOKMARK_EDIT_BOOKMARK:
                this._editBookmark(action.options.bookmark);
                break;

            case ActionTypes.BOOKMARK_DELETE_BOOKMARK:
                this._deleteBookmark(action.options.bookmark);
                break;
        }
    }
});

const bookmarkStore = new BookmarkStore();
bookmarkStore.dispatchToken = FauxtonAPI.dispatcher.register(bookmarkStore.dispatch);

export default {
    bookmarkStore
};
