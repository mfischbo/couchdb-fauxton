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
import TestUtils from 'react-addons-test-utils';
import utils from '../../../../test/mocha/testUtils';
import Components from '../components.react';
import Constants from '../constants';

var assert = utils.assert;


describe('Replication', () => {

  describe('ReplicationTargetRow', () => {
    let el, container;

    beforeEach(() => {
      container = document.createElement('div');
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('new remote replication target shows a URL field', () => {
      el = TestUtils.renderIntoDocument(
        <Components.ReplicationTargetRow
          remoteTarget="remotetarget"
          replicationTarget={Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE}
          databases={['one', 'two']}
          targetDatabase=""
        />,
        container
      );
      assert.equal($(ReactDOM.findDOMNode(el)).find('input.connection-url').length, 1);
    });

    it('existing remote replication target also shows a URL field', () => {
      el = TestUtils.renderIntoDocument(
        <Components.ReplicationTargetRow
          remoteTarget="remotetarget"
          replicationTarget={Constants.REPLICATION_TARGET.EXISTING_REMOTE_DATABASE}
          databases={['one', 'two']}
          targetDatabase=""
        />,
        container
      );
      assert.equal($(ReactDOM.findDOMNode(el)).find('input.connection-url').length, 1);
    });

    it('new local database fields have simple textfield', () => {
      el = TestUtils.renderIntoDocument(
        <Components.ReplicationTargetRow
          remoteTarget="remotetarget"
          replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
          databases={['one', 'two']}
          targetDatabase=""
        />,
        container
      );
      assert.equal($(ReactDOM.findDOMNode(el)).find('input.connection-url').length, 0);
      assert.equal($(ReactDOM.findDOMNode(el)).find('input.new-local-db').length, 1);
    });

    it('existing local databases fields have typeahead field', () => {
      el = TestUtils.renderIntoDocument(
        <Components.ReplicationTargetRow
          remoteTarget="remotetarget"
          replicationTarget={Constants.REPLICATION_TARGET.EXISTING_LOCAL_DATABASE}
          databases={['one', 'two']}
          targetDatabase=""
        />,
        container
      );
      assert.equal($(ReactDOM.findDOMNode(el)).find('input.connection-url').length, 0);
      assert.equal($(ReactDOM.findDOMNode(el)).find('input.new-local-db').length, 0);

      // (the typeahead field has a search icon)
      assert.equal($(ReactDOM.findDOMNode(el)).find('.icon-search').length, 1);
    });

  });


  describe('ReplicationController', () => {

    describe('Replicate button', () => {
      it('disabled by default', () => {

      });

      it('enabled when all fields entered', () => {

      });

      it('disabled when missing replication source', () => {

      });

      it('disabled when source is local, but not in known list of dbs', () => {

      });

      it('disabled when target is local, but not in known list of dbs', () => {

      });
    });

  });

});
