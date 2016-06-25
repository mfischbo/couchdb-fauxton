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

function updateFormField (field, value) {
    FauxtonAPI.dispatch({
        type: ActionTypes.BOOKMARK_UPDATE_FORM_FIELD,
        options: {
            field: field,
            value: value
        }
    });
}

function resetForm () {
    FauxtonAPI.dispatch({
        type: ActionTypes.BOOKMARK_RESET_FORM
    });
}

function pushDatabase () {
    FauxtonAPI.dispatch({
        type: ActionTypes.BOOKMARK_PUSH_DATABASE
    });
}

function removeDatabase (database) {
    FauxtonAPI.dispatch({
        type: ActionTypes.BOOKMARK_REMOVE_DATABASE,
        options: {
            database: database
        }
    });
}

function editBookmark (bookmark) {
    FauxtonAPI.dispatch({
        type: ActionTypes.BOOKMARK_EDIT_BOOKMARK,
        options: {
            bookmark: bookmark
        }
    });
}

function deleteBookmark (bookmark) {
    FauxtonAPI.dispatch({
        type: ActionTypes.BOOKMARK_DELETE_BOOKMARK,
        options: {
            bookmark: bookmark
        }
    });
}

function saveBookmark () {
    // TODO: Fire an API request and store the bookmark in the users object
    FauxtonAPI.dispatch({
        type: ActionTypes.BOOKMARK_SAVE_BOOKMARK
    });
}

export default {
    updateFormField,
    resetForm,
    pushDatabase,
    removeDatabase,
    editBookmark,
    deleteBookmark,
    saveBookmark
};
