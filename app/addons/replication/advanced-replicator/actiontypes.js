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
    LOCAL_DATABASES_LOADED: 'LOCAL_DATABASES_LOADED',
    FILTER_FUNCTIONS_UPDATED: 'FILTER_FUNCTIONS_UPDATED',

    REPLICATION_START_REPLICATION: 'REPLICATION_START_REPLICATION',

    REPLICATION_SET_SOURCE_TYPE: 'REPLICATION_SET_SOURCE_TYPE',
    REPLICATION_SET_TARGET_TYPE: 'REPLICATION_SET_TARGET_TYPE',

    REPLICATION_SET_SOURCE_DB: 'REPLICATION_SET_SOURCE_DB',
    REPLICATION_SET_TARGET_DB: 'REPLICATION_SET_TARGET_DB',

    REPLICATION_SET_SOURCE_PASSWORD: 'REPLICATION_SET_SOURCE_PASSWORD',
    REPLICATION_SET_TARGET_PASSWORD: 'REPLICATION_SET_TARGET_PASSWORD',

    REPLICATION_SET_SOURCE_OPTION: 'REPLICATION_SET_SOURCE_OPTION',
    ADV_REPLICATION_SET_TARGET_OPTION: 'ADV_REPLICATION_SET_TARGET_OPTION'
  };
});
