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

import app from "../../app";
import FauxtonAPI from "../../core/api";
import Replication from "./resources";
import Actions from "./actions";
import Components from "./components.react";


var RepRouteObject = FauxtonAPI.RouteObject.extend({
  layout: 'one_pane',
  routes: {
    "replication": 'defaultView',
    "replication/:dbname": 'defaultView'
  },
  selectedHeader: 'Replication',
  apiUrl: function () {
    return ['TODO url here', FauxtonAPI.constants.DOC_URLS.REPLICATION];
  },
  crumbs: [
    { "name": 'Replication', 'link': 'replication' }
  ],
  roles: ['fx_loggedIn'],
  defaultView: function (databaseName) {
    var isAdmin = FauxtonAPI.session.isAdmin();

    //this.tasks = [];
    //this.replication = new Replication.Replicate({});
    //if (isAdmin) {
    //  this.tasks = new Replication.Tasks({ id: 'ReplicationTasks' });
    //  this.setView('#dashboard-content', new Views.ReplicationFormForAdmins({
    //    selectedDB: dbname || '',
    //    collection: this.databases,
    //    status: this.tasks
    //  }));
    //  return;
    //}

    var sourceDatabase = databaseName || '';
    Actions.initReplicator(sourceDatabase);
    this.setComponent('#dashboard-content', Components.ReplicationController);
  }
});


Replication.RouteObjects = [RepRouteObject];

export default Replication;
