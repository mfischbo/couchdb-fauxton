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


function initialize() {
  let bookmarks = {};
  if (localStorage.getItem('__bookmarks')) {
    bookmarks = JSON.parse(localStorage.getItem('__bookmarks'));
  }

  // calculate page information
  const cnt = Object.keys(bookmarks).length;
  const page = {
    hasNextPage: cnt > FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE,
    hasPreviousPage: false,
    numberOfPages: Math.ceil(cnt / FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE),
    currentPage: 0
  };

  FauxtonAPI.dispatch({
    type: ActionTypes.BOOKMARK_INIT,
    options: {
      bookmarks: bookmarks,
      page: page
    }
  });
}

/**
 * Sets the bookmark that is currently subject of being edited
 * @param The bookmark to be edited
 */
function focusBookmark (bookmark) {
  FauxtonAPI.dispatch({
    type: ActionTypes.BOOKMARK_FOCUS_BOOKMARK,
    options: {
      bookmark: bookmark
    }
  });
}

/**
 * Deletes the bookmark from the map of available bookmarks
 * @param The bookmark to be deleted
 */
function deleteBookmark (bookmark) {
  FauxtonAPI.dispatch({
    type: ActionTypes.BOOKMARK_DELETE_BOOKMARK,
    options: {
      bookmark: bookmark
    }
  });
}

/**
 * Saves the bookmark in a repository and triggers an update on the store
 * @param The bookmark to be stored
 */
function saveBookmark(bookmark) {
  bookmark.id = _uuid();

  // For now we use local storage and switch to couchdb later on
  let bookmarks = {};
  if (localStorage.getItem('__bookmarks')) {
     bookmarks = JSON.parse(localStorage.getItem('__bookmarks'));
  }
  bookmarks[bookmark.id] = bookmark;
  localStorage.setItem('__bookmarks', JSON.stringify(bookmarks));

  FauxtonAPI.dispatch({
    type: ActionTypes.BOOKMARK_SAVE_BOOKMARK,
    options: {
      bookmark: bookmark
    }
  });
  return true;
}

/**
 * Displays the previous page on the table of bookmarks.
 * If the page currently being displayed is 0 the invocation has no effect
 */
function previousPage (bookmarks, page) {

  if (page.hasPreviousPage) {
    const cnt = Object.keys(bookmarks).length;

    const nPage = {
      hasNextPage: true,
      hasPreviousPage: (page.currentPage > 1),
      numberOfPages: Math.ceil(cnt / FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE),
      currentPage: page.currentPage - 1
    };

    FauxtonAPI.dispatch({
      type: ActionTypes.BOOKMARK_PAGE_UPDATE,
      options: {
        page: nPage
      }
    });
  }
}

/**
 * Displays the next page on the table of bookmarks.
 * If the page currently being displayed is the last available page the
 * invocation has no effect.
 */
function nextPage (bookmarks, page) {

  // if we have enough many elements
  if (page.hasNextPage) {

    const cnt = Object.keys(bookmarks).length;
    const hasNextIndex = (page.currentPage + 2)
      * FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE;

    // create a new page
    const nPage = {
      hasNextPage: Object.keys(bookmarks).length > hasNextIndex,
      hasPreviousPage: true,
      numberOfPages: Math.ceil(cnt / FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE),
      currentPage: page.currentPage + 1
    };

    // and dispatch an update
    FauxtonAPI.dispatch({
      type: ActionTypes.BOOKMARK_PAGE_UPDATE,
      options: {
        page: nPage
      }
    });
  }
}

/**
 * TODO: Remove this. Only used temporaryly
 */
function _uuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

export default {
  initialize,
  focusBookmark,
  deleteBookmark,
  saveBookmark,
  previousPage,
  nextPage
};
