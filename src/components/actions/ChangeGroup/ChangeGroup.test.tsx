import * as React from 'react';
import '../../../enzymeAdapter';
import { shallow } from 'enzyme';
import { ChangeGroup } from '../../../flowTypes';
import ChangeGroupComp from './ChangeGroup';

const { results: [{ definition }]} = require('../../../../test_flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { nodes: [node], language: flowLanguage } = definition;
const { actions: [, addToGroupAction] } = node;
const { uuid, type, groups: [{ name: groupName}] } = addToGroupAction as ChangeGroup;

describe('Component: ChangeGroup', () => {
    it('should render ChangeGroupComp with group name', () => {
        const ChangeGroupDivShallow = shallow(<ChangeGroupComp {...addToGroupAction as ChangeGroup} />);

        expect(ChangeGroupDivShallow.text()).toBe(groupName);
    });
});



