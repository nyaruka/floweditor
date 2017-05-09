import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as axios from 'axios';
import * as Interfaces from '../src/interfaces';
import Plumber from '../src/services/Plumber';
import FlowMutator from '../src/components/FlowMutator';
import NodeModal from '../src/components/NodeModal';
import { ShallowWrapper, shallow, mount, render } from 'enzyme';
import {getFavorites, dump} from './utils';

var request = require('sync-request');
var sinon = require('sinon');

describe('NodeModal', () => {

    var mutator: FlowMutator;
    beforeEach(() => {
        mutator = new FlowMutator();
    });
    
    afterEach(() => {});

    it('should render', () => {

        var initial = {            
            name: "Expected Delivery Date",
            type: "save_to_contact", 
            value: "@results.name", 
            field: "field-uuid", 
            uuid: "action-uuid",
            mutator: mutator
        }

        let wrapper = shallow(<NodeModal initial={initial} changeType={true}/>);

        // var modal: any = wrapper.instance();
        // modal.open();
        // wrapper.update();

        // wrapper.find("input[name='value']").simulate('change', {target: {value: 'My new value'}});
        // console.log(wrapper.debug());

    });

});