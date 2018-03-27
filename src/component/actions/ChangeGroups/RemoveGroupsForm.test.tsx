import * as React from 'react';
import { getTypeConfig } from '../../../config';
import { FlowEditorConfig } from '../../../flowTypes';
import { createSetup, getSpecWrapper } from '../../../testUtils';
import { Resp } from '../../../testUtils';
import ChangeGroupFormProps from './props';
import {
    RemoveGroupsForm,
    LABEL,
    PLACEHOLDER,
    NOT_FOUND,
    REMOVE_FROM_ALL,
    REMOVE_FROM_ALL_DESC
} from './RemoveGroupsForm';
import { labelSpecId } from './AddGroupsForm';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json') as Resp;
const { endpoints } = require('../../../../assets/config') as FlowEditorConfig;
const { results: groupsResp } = require('../../../../assets/groups.json') as Resp;

const { nodes: [{ actions: [, removeGroupsAction] }] } = definition;
const removeGroupConfig = getTypeConfig('remove_contact_groups');

const context = {
    endpoints
};

const baseProps = {
    action: removeGroupsAction,
    updateAction: jest.fn(),
    onBindWidget: jest.fn(),
    removeWidget: jest.fn(),
    typeConfig: removeGroupConfig
};

const setup = createSetup<ChangeGroupFormProps>(RemoveGroupsForm, baseProps, context);

const COMPONENT_TO_TEST = RemoveGroupsForm.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const {
                wrapper,
                props: { onBindWidget: onBindWidgetMock },
                // tslint:disable-next-line:no-shadowed-variable
                context: { endpoints }
            } = setup({
                onBindWidget: jest.fn()
            });
            const RemoveGroupsFormInstance = wrapper.instance();
            const label = getSpecWrapper(wrapper, labelSpecId);

            expect(label.is('p')).toBeTruthy();
            expect(label.text()).toBe(LABEL);
            expect(onBindWidgetMock).toHaveBeenCalledTimes(2);
            expect(wrapper.find('GroupsElement').props()).toEqual({
                name: 'Groups',
                placeholder: PLACEHOLDER,
                endpoint: endpoints.groups,
                groups: wrapper.state('groups'),
                add: false,
                required: true,
                onChange: RemoveGroupsFormInstance.onGroupsChanged,
                searchPromptText: NOT_FOUND
            });
            expect(wrapper.find('CheckboxElement').props()).toEqual({
                name: REMOVE_FROM_ALL,
                defaultValue: false,
                description: REMOVE_FROM_ALL_DESC,
                sibling: true,
                onCheck: RemoveGroupsFormInstance.onCheck
            });
        });

        it('should render only the checkbox', () => {
            const {
                wrapper,
                props: { onBindWidget: onBindWidgetMock, removeWidget: removeWidgetMock },
                // tslint:disable-next-line:no-shadowed-variable
                context: { endpoints }
            } = setup({
                onBindWidget: jest.fn(),
                removeWidget: jest.fn()
            });
            const RemoveGroupsFormInstance = wrapper.instance();

            RemoveGroupsFormInstance.onCheck();

            wrapper.update();

            expect(removeWidgetMock).toHaveBeenCalledTimes(1);
            expect(removeWidgetMock).toHaveBeenCalledWith('Groups');
            expect(getSpecWrapper(wrapper, labelSpecId).exists()).toBeFalsy();
            expect(wrapper.find('GroupsElement').exists()).toBeFalsy();
            expect(wrapper.find('CheckboxElement').props()).toEqual({
                name: REMOVE_FROM_ALL,
                defaultValue: true,
                description: REMOVE_FROM_ALL_DESC,
                sibling: false,
                onCheck: RemoveGroupsFormInstance.onCheck
            });
        });
    });

    describe('instance methods', () => {
        describe('getFields', () => {
            it('should call removeWidget prop', () => {});
        });
    });
});
