import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import ComponentMap from '../../../services/ComponentMap';
import ChangeGroupFormProps from './groupFormPropTypes';
import Config from '../../../providers/ConfigProvider/configContext';
import RemoveGroupForm, { label, notFound, placeholder } from './RemoveGroupForm';
import { getSpecWrapper } from '../../../helpers/utils';

const {
    results: [{ definition }]
} = require('../../../../test_flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');

const CompMap = new ComponentMap(definition);

const { nodes: [{ actions: [, action] }] } = definition;
const typeConfig = Config.getTypeConfig('add_to_group');
const { endpoints } = Config;
const context = {
    endpoints
};
const props: ChangeGroupFormProps = {
    action,
    config: typeConfig,
    updateAction: jest.fn(),
    onBindWidget: jest.fn(),
    removeWidget: jest.fn(),
    ComponentMap: CompMap
};
const { groups: [{ uuid, name }] } = action;
const groups = [{ group: uuid, name }];
const localGroups = [{ id: uuid, name, type: 'group' }];

const Form: ReactWrapper = mount(<RemoveGroupForm {...props} />, {
    context
});

describe('RemoveGroupForm >', () => {
    describe('render >', () => {
        it('should render form label', () => {
            expect(Form.find('div').exists()).toBeTruthy();
            expect(Form.find('p').text()).toBe(label);
        });

        it("should call 'onBindWidget'", () => expect(props.onBindWidget).toBeCalled());

        it("should pass GroupElement an empty 'groups' prop if existing action isn't of type 'remove_from_group", () => {
            expect(Form.find('GroupElement').props()).toEqual({
                name: 'Group',
                placeholder,
                endpoint: endpoints.groups,
                groups: [],
                localGroups,
                add: false,
                required: true,
                searchPromptText: notFound
            });
        });

        it("should pass GroupElement groups to remove if existing action is of type 'remove_from_group'", () => {
            const FormNewAction: ReactWrapper = mount(
                <RemoveGroupForm
                    {...{ ...props, action: { ...action, type: 'remove_from_group' } }}
                />,
                {
                    context
                }
            );

            expect(FormNewAction.find('GroupElement').props()).toEqual({
                name: 'Group',
                placeholder,
                endpoint: endpoints.groups,
                groups,
                localGroups,
                add: false,
                required: true,
                searchPromptText: notFound
            });
        });
    });

    it("should render only the 'Remove from Group' checkbox element when it's checked", () => {
        Form.find('CheckboxElement')
            .find('input')
            .simulate('change');

        const FieldContainer = getSpecWrapper(Form, 'field-container');

        expect(Form.state('removeFromAll')).toBeTruthy();
        expect(FieldContainer.children()).toHaveLength(1);
        expect(FieldContainer.find('CheckboxElement').exists()).toBeTruthy();
    });
});
