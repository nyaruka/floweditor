import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {FlowLoaderComp, FlowLoaderProps, FlowLoaderState} from '../src/components/FlowLoaderComp';
import SaveToContact from '../src/components/actions/SaveToContact';
import { ReactWrapper, ShallowWrapper, mount, render } from 'enzyme';
/*
describe('SaveToContact', () => {

    var flow = null;
    beforeEach(() => {
        // flow = new FlowComp({flowURL: 'base/test_flows/two_questions.json', engineURL: null, contactsURL: null, fieldsURL: null})
        flow = mount(<FlowComp flowURL='base/test_flows/two_questions.json' engineURL='' contactsURL='' fieldsURL=''/>);
        console.log(flow.html());
    });
    afterEach(() => {});

    it('should render', () => {
        let action = new SaveToContact({            
            type:"save_to_contact", 
            name: "name", 
            value: "@results.name", 
            field:"field-uuid", 
            uuid:"action-uuid",
            nodeUUID: "node-uuid", 
        }, {flow: flow });

        // our top level thing renders a div
        let element = action.renderNode();
        chai.assert.equal(element.type, "div");

        action.renderForm();
        console.log(action.fieldSelect);


        // console.log(element.key, element.props, element.type);
        // chai.assert.isNotNull();
    });

});*/