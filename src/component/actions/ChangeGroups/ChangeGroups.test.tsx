import * as React from 'react';
import { ChangeGroups, FlowDefinition } from '../../../flowTypes';
import { createSetup, getSpecWrapper } from '../../../testUtils';
import ChangeGroupsComp from './ChangeGroups';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { results: groups } = require('../../../../assets/groups.json');

const { nodes: [node], language: flowLanguage } = definition as FlowDefinition;
const { actions: [, addToGroupsAction] } = node;

const setup = createSetup<ChangeGroups>(addToGroupsAction as ChangeGroups, null, ChangeGroupsComp);

const COMPONENT_TO_TEST = ChangeGroupsComp.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('render', () => {
        it(`should render ${COMPONENT_TO_TEST} with group name`, () => {
            const { wrapper, props: { groups: [{ name: groupName }] } } = setup();

            expect(wrapper.text()).toBe(groupName);
        });

        it('should limit div to 3 groups, include ellipses', () => {
            const { wrapper } = setup({ groups });
            const content = getSpecWrapper(wrapper, 'content');

            expect(content.children().length).toBe(4);
            expect(content.childAt(3).text()).toBe('...');
        });

        it("should render 'remove from all' div when passed group action of type 'remove_contact_groups'", () => {
            const { wrapper } = setup({ groups: [], type: 'remove_contact_groups' });
            const removeAll = getSpecWrapper(wrapper, 'remove-all');

            expect(removeAll.text()).toBe('Remove from all groups');
        });
    });
});
