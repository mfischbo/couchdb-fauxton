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
import './assets/less/bookmark-manager.less';

const store = Stores.bookmarkStore;

export default class BookmarksController extends React.Component {

    constructor () {
        super();
    }

    componentWillMount () {

    }

    componentDidMount () {
    }

    componentWillUnmount () {

    }

    render () {
        return (
            <div className="bookmarks-page">
                <BookmarkForm/>
                <BookmarkTable />
            </div>
        );
    }
}


class BookmarkForm extends React.Component {

    constructor () {
        super();
        this.state = this.getStoreState();
    }

    getStoreState () {
        return {
            bookmark: store.getFocusedBookmark(),
            database: store.getFocusedDatabase()
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

    createDatabaseEntries () {
        if (this.state.bookmark.databases.length == 0) {
            return (
                <tr>
                    <td colSpan="3">
                        <span>No databases available</span>
                    </td>
                </tr>
            );
        }

        return this.state.bookmark.databases.map(db => {
            return (
                <tr key={db.id}>
                    <td>{db.username}</td>
                    <td>{db.database}</td>
                    <td className="actions">
                        <button className="btn icon-pencil"
                            onClick={(e) => Actions.editDatabase(db)}>
                        </button>
                        <button className="btn icon-trash"
                            onClick={(e) => Actions.removeDatabase(db)}>
                        </button>
                    </td>
                </tr>
            );
        });
    }

    render () {
        const dbEntries = this.createDatabaseEntries();

        return (
            <div className="bookmarks-form">
                <h5>Add a bookmark</h5>
                <div className="row-fluid">
                    <div className="span4">
                        <label>Bookmark Name</label>
                        <input type="text" onChange={(event) => Actions.updateFormField('name', event.target.value)}
                            value={this.state.bookmark.name} className="form-input" />

                        <label>Host URL</label>
                        <input type="text" onChange={(event) => Actions.updateFormField('host', event.target.value)}
                            value={this.state.bookmark.host} className="form-input"/>
                    </div>

                    <div className="span4">
                        <label>Username</label>
                        <input type="text" onChange={(event) => Actions.updateFormField('username', event.target.value)}
                             value={this.state.database.username} className="form-input"/>

                        <label>Database</label>
                        <form className="form-inline">
                            <input type="text" onChange={(event) => Actions.updateFormField('database', event.target.value)}
                                value={this.state.database.database} className="form-input"/>

                            <button type="button" className="btn btn-success"
                                onClick={(event) => Actions.pushDatabase()}>Add</button>
                        </form>
                    </div>

                    <div className="span4">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Database</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dbEntries}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="row-fluid">
                    <div className="span12">
                        <div className="pull-right">
                            <button type="button" className="btn btn-danger"
                                onClick={(e) => Actions.resetForm()}>Cancel</button>
                            <button type="button" className="btn btn-success"
                                onClick={(e) => Actions.saveBookmark()}>Save</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class BookmarkTable extends React.Component {

    constructor () {
        super();
        this.state = this.getStoreState();
    }

    getStoreState () {
        return {
            bookmarks: store.getBookmarks()
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

    createTableEntries () {
        if (this.state.bookmarks.length == 0) {
            return (
                <tr>
                    <td colSpan="3">No bookmarks available</td>
                </tr>
            );
        }
        return (
           this.state.bookmarks.map(bm => {
                return (
                    <tr key={bm.id}>
                        <td>{bm.name}</td>
                        <td>{bm.host}</td>
                        <td className="actions">
                            <button className="btn icon-pencil"
                                onClick={(e) => Actions.editBookmark(bm)}></button>
                            <button className="btn icon-trash"
                                onClick={(e) => Actions.deleteBookmark(bm)}></button>
                        </td>
                    </tr>
                );
            })
        );
    }

    render () {
        const entries = this.createTableEntries();
        return (
            <div className="bookmarks-table">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Host</th>
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
