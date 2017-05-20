import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as axios from 'axios';
import {FlowDefinition} from '../src/interfaces';
import {Plumber} from '../src/services/Plumber';
import {FlowMutator} from '../src/components/FlowMutator';
import {Flow} from '../src/components/Flow';
import { ShallowWrapper, shallow, mount, render } from 'enzyme';

var request = require('sync-request');
var sinon = require('sinon');

describe('Flow', () => {

    var definition: FlowDefinition;
    var mutator: FlowMutator;

    beforeEach(() => {
        definition = JSON.parse(request('GET', 'base/test_flows/two_questions.json').getBody()) as FlowDefinition;
        mutator = new FlowMutator(definition);

        var plumber = Plumber.get();
        sinon.stub(plumber, "makeSource");
        sinon.stub(plumber, "makeTarget");
        sinon.stub(plumber, "connect");

    });
    
    afterEach(() => {});

    it('should render', () => {

        let wrapper = mount(<Flow definition={definition} mutator={mutator} dependencies={[]}/>);

        // make sure all our components are present
        var ids = [
            "node1", "node2", "node3", "action3",
            "node1-exit1", "node1-exit2", "node1-exit3", "node2-exit1", "node2-exit2", "node2-exit3", "node3-exit1"
        ];

        for (let id of ids) {
            chai.assert.equal(wrapper.find("#" + id).length, 1, "Couldn't find id (" + id + ")");
        }
    });
});