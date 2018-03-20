import * as React from 'react';
import { shallow } from 'enzyme';
import { ChangeGroups } from '../../../flowTypes';
import ChangeGroupsComp from './ChangeGroups';
import { getSpecWrapper } from '../../../utils';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { results: groups } = require('../../../../assets/groups.json');

const { nodes: [node], language: flowLanguage } = definition;
const { actions: [, addToGroupsAction] } = node;
const { uuid, type, groups: [{ name: groupName }] } = addToGroupsAction as ChangeGroups;

describe('ChangeGroups >', () => {
    describe('render >', () => {
        it('should render ChangeGroupsComp with group name', () =>
            expect(shallow(<ChangeGroupsComp {...addToGroupsAction} />).text()).toBe(groupName));

        it('should cut off groups after 3 and include an ellipses', () => {
            const Content = getSpecWrapper(
                shallow(<ChangeGroupsComp {...{ ...addToGroupsAction, groups }} />),
                'content'
            );

            expect(Content.children().length).toBe(4);
            expect(Content.childAt(3).text()).toBe('...');
        });

        it("should render 'remove from all' div when passed group action of type 'remove_contact_groups'", () => {
            const Remove = getSpecWrapper(
                shallow(
                    <ChangeGroupsComp
                        {...{ ...addToGroupsAction, groups: [], type: 'remove_contact_groups' }}
                    />
                ),
                'remove-all'
            );

            expect(Remove.text()).toBe('Remove from all groups');
        });
    });
});
