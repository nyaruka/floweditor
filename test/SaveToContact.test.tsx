import * as React from 'react';
import { mount } from 'enzyme';

import { SaveToContactComp } from '../src/components/actions/SaveToContact';
import { FlowMutator } from '../src/components/FlowMutator';
import { FlowDefinition } from '../src/FlowDefinition';
import { getFavorites } from './test-utils';

describe('SaveToContact', () => {
    let definition: FlowDefinition;
    let mutator: FlowMutator;

    beforeEach(() => {
        definition = getFavorites();
        mutator = new FlowMutator(
            definition,
            (updated: FlowDefinition) => {
                definition = updated;
            },
            () => {},
            {
                // contactsURL:'/assets/contacts.json'
            }
        );
    });

    it('should render', () => {
        const props = {
            action: {
                field: 'field-uuid',
                mutator,
                name: 'name',
                type: 'save_contact_field',
                uuid: 'action-uuid',
                value: '@results.name'
            },
            context: {
                eventHandler:
            },
            node: 'b4ac7bff-2852-4874-b47d-1163c902e22c',
        };
        const wrapper = mount(<SaveToContactComp {...props} />)
        // our top level thing renders a div
        // let element = action.renderNode();
        // chai.assert.equal(element.type, "div");
        // action.renderForm();
        // console.log(element.key, element.props, element.type);
        // chai.assert.isNotNull();
    });
});
