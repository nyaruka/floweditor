import * as React from 'react';
import { ChangeGroups, FlowDefinition } from '../../../flowTypes';
import { createSetup, getSpecWrapper } from '../../../testUtils';
import { removeAllSpecId, getRemoveAllMarkup } from './ChangeGroups';
import ChangeGroupsComp, {
    contentSpecId,
    ellipses,
    getContentMarkup,
    removeAllSpecId
} from './ChangeGroups';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { results: groups } = require('../../../../assets/groups.json');

const { nodes: [node], language: flowLanguage } = definition as FlowDefinition;
const { actions: [, addToGroupsAction] } = node;

const setup = createSetup<ChangeGroups>(ChangeGroupsComp, addToGroupsAction as ChangeGroups);

const COMPONENT_TO_TEST = ChangeGroupsComp.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('render', () => {
        it('should render group name', () => {
            const { wrapper, props } = setup({}, true);

            expect(props.groups.length === 1).toBeTruthy();
            expect(wrapper.html().indexOf(props.groups[0].name)).toBeTruthy();
        });

        it('should limit div to 3 groups, include ellipses', () => {
            const { wrapper } = setup({ groups }, true);
            const content = getSpecWrapper(wrapper, contentSpecId);

            expect(content.children().length).toBe(4);
            expect(content.childAt(3).text()).toBe(ellipses);
        });

        it("should render 'remove from all' markup when passed group action of type 'remove_contact_groups'", () => {
            const { wrapper, props } = setup({ groups: [], type: 'remove_contact_groups' }, true);

            expect(wrapper.children().length).toBe(1);
            expect(wrapper.containsMatchingElement(getRemoveAllMarkup())).toBeTruthy();
        });
    });
});
