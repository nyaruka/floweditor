import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {FlowLoaderComp, FlowLoaderProps, FlowLoaderState} from '../src/components/FlowLoaderComp';
import SaveToContact from '../src/components/actions/SaveToContact';
import { ReactWrapper, ShallowWrapper, mount, render } from 'enzyme';
import {getFavorites, dump} from './utils';
import {FlowMutator} from '../src/components/FlowMutator';
import {FlowDefinition} from '../src/interfaces';

describe('SaveToContact', () => {

    var definition: FlowDefinition;
    var mutator: FlowMutator;
    beforeEach(() => {
        definition = getFavorites()
        mutator = new FlowMutator(definition, (updated: FlowDefinition)=>{
            definition = updated;
        }, ()=>{}, {
            contactsURL:'/assets/contacts.json'
        });
    });

    afterEach(() => {});

    it('should render', () => {
        
        let action = new SaveToContact({            
            name: "name",
            type: "save_to_contact", 
            value: "@results.name", 
            field: "field-uuid", 
            uuid: "action-uuid",
            mutator: mutator
        });

        // our top level thing renders a div
        let element = action.renderNode();
        chai.assert.equal(element.type, "div");

        action.renderForm();
        // console.log(element.key, element.props, element.type);
        // chai.assert.isNotNull();
    });

});