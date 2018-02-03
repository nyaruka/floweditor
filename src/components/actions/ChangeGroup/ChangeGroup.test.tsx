import * as React from 'react';
import { shallow } from 'enzyme';
import { ChangeGroup } from '../../../flowTypes';
import ChangeGroupComp from './ChangeGroup';
import { getSpecWrapper } from '../../../helpers/utils';

const {
    results: [{ definition }]
} = require('../../../../test_flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { results: groups } = require('../../../../assets/groups.json');
const { nodes: [node], language: flowLanguage } = definition;
const { actions: [, addToGroupAction] } = node;
const {
    uuid,
    type,
    groups: [{ name: groupName }]
} = addToGroupAction as ChangeGroup;

describe('ChangeGroup >', () => {
    describe('render >', () => {
        it('should render ChangeGroupComp with group name', () =>
            expect(
                shallow(<ChangeGroupComp {...addToGroupAction} />).text()
            ).toBe(groupName));

        it('should cut off groups after 3 and include an ellipses', () => {
            const Content = getSpecWrapper(
                shallow(
                    <ChangeGroupComp {...{ ...addToGroupAction, groups }} />
                ),
                'content'
            );

            expect(Content.children().length).toBe(4);
            expect(Content.childAt(3).text()).toBe('...');
        });

        it("should render 'remove from all' div when passed group action of type 'remove_from_groups'", () => {
            const Remove = getSpecWrapper(
                shallow(
                    <ChangeGroupComp
                        {...{
                            ...addToGroupAction,
                            groups: [],
                            type: 'remove_from_group'
                        }}
                    />
                ),
                'remove-all'
            );

            expect(Remove.text()).toBe('Remove from all groups');
        });
    });
});
