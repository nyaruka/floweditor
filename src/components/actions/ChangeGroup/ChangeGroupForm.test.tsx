import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import ComponentMap from '../../../services/ComponentMap';
import ChangeGroupForm, { ChangeGroupFormProps } from './ChangeGroupForm';
import Config from '../../../providers/ConfigProvider/configContext';
import {
    addType,
    removeType,
    addLabel,
    removeLabel,
    notFoundAdd,
    notFoundRemove,
    placeholder
} from './ChangeGroupForm';

const {
    results: [{ definition }]
} = require('../../../../test_flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');

const CompMap = new ComponentMap(definition);

const testGroupForm = (type: string): void => {
    const { nodes: [{ actions: [, action] }] } = definition;
    const typeConfig = Config.getTypeConfig(type);
    const { endpoints } = Config;
    const context = {
        endpoints
    };
    const props: ChangeGroupFormProps = {
        action,
        getActionUUID: jest.fn(() => action.uuid),
        config: typeConfig,
        updateAction: jest.fn(),
        onBindWidget: jest.fn(),
        removeWidget: jest.fn(),
        ComponentMap: CompMap
    };
    const { groups: [{ uuid, name }] } = action;
    const groups = [{ group: uuid, name }];
    const localGroups = [{ id: uuid, name, type: 'group' }];
    const GroupForm: ReactWrapper = mount(<ChangeGroupForm {...props} />, {
        context
    });
    const add: boolean = type === addType;
    const searchPromptText: string = add ? notFoundAdd : notFoundRemove;
    const label: string = add ? addLabel : removeLabel;

    expect(GroupForm.find('div').exists()).toBeTruthy();
    expect(GroupForm.find('p').text()).toBe(label);
    expect(props.onBindWidget).toBeCalled();
    expect(GroupForm.find('GroupElement').props()).toEqual({
        name: 'Group',
        placeholder,
        endpoint: endpoints.groups,
        groups,
        localGroups,
        add,
        required: true,
        searchPromptText
    });
};

describe('Component: ChangeGroupForm', () => {
    it("renders an 'Add to Group' form", () => testGroupForm(addType));

    it("renders a 'Remove from Group' form", () => testGroupForm(removeType));
});
