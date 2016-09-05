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

define([], function () {
  return {

    // Actiontype to be used for initializing the bookmark store
    BOOKMARK_INIT: 'BOOKMARK_INIT',

    // Signalizes the store that a bookmark is subject of being edited
    BOOKMARK_FOCUS_BOOKMARK: 'BOOKMARK_FOCUS_BOOKMARK',

    // Signalizes that a change occoured in the list of known bookmarks
    BOOKMARK_UPDATE_BOOKMARKS: 'BOOKMARK_UPDATE_BOOKMARKS',

    // signalizes that the search filter term has altered
    BOOKMARK_UPDATE_FILTER: 'BOOKMARK_UPDATE_FILTER'
  };
});
