import * as React from 'react';
import '../../../enzymeAdapter';
import { shallow } from 'enzyme';
import EditorConfig from '../../../services/EditorConfig';
import ComponentMap from '../../../services/ComponentMap';
import ChangeGroupForm, { ChangeGroupFormProps } from './ChangeGroupForm';

const {
    results: [{ definition }]
} = require('../../../../test_flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');

const Config = new EditorConfig();
const CompMap = new ComponentMap(definition);

const testGroupForm = (type: string) => {
    const action = {
        uuid: 'd5293394-c6d4-407c-97da-8149faea24cf',
        type: 'add_to_group',
        groups: [
            {
                uuid: '2429d573-80d7-47f8-879f-f2ba442a1bfd',
                name: 'Unsatisfied Customers'
            }
        ]
    };
    const typeConfig = Config.getTypeConfig(type);
    const { endpoints } = Config;
    const props = {
        action,
        getActionUUID: jest.fn(() => action.uuid),
        config: typeConfig,
        updateAction: jest.fn(),
        onBindWidget: jest.fn(),
        endpoints,
        ComponentMap: CompMap
    };
    const { groups: [{ uuid, name }] } = action;
    const groups = [{ group: uuid, name }];
    const localGroups = [{ id: uuid, name, type: 'group' }];
    const GroupForm = shallow(<ChangeGroupForm ref={props.onBindWidget} {...props} />);
    const expectedP =
        type === 'add_to_group'
            ? 'Select the group(s) to add the contact to.'
            : 'Select the group(s) to remove the contact from.';

    expect(GroupForm.find('div').exists()).toBeTruthy();
    expect(GroupForm.find('p').text()).toBe(expectedP);
    expect(GroupForm.find('GroupElement').props()).toEqual({
        name: 'Group',
        endpoint: endpoints.groups,
        groups,
        localGroups,
        add: type === 'add_to_group',
        required: true
    });
};

describe('Component: ChangeGroupForm', () => {
    it("renders an 'Add to Group' form", () => {
        testGroupForm('add_to_group');
    });

    it("renders a 'Remove from Group' form", () => {
        testGroupForm('remove_from_group');
    });
});
