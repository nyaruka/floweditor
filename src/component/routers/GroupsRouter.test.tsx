import * as React from 'react';
import { ConfigProviderContext } from '../../config/ConfigProvider';
import { FlowDefinition, FlowEditorConfig, SwitchRouter } from '../../flowTypes';
import { createSetup, Resp } from '../../testUtils';
import { GROUP_NOT_FOUND, GROUP_PLACEHOLDER } from '../form/GroupsElement';
import { GROUP_LABEL } from './constants';
import { extractGroups, GroupsRouter, GroupsRouterProps, hasGroupsRouter } from './GroupsRouter';

const config = require('../../../assets/config') as FlowEditorConfig;
const colorsFlowResp = require('../../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json') as Resp;
const groupsResp = require('../../../assets/groups.json') as Resp;

const definition = colorsFlowResp.results[0].definition as FlowDefinition;
const { nodes: [sendMsgNode, , , , , groupsRouterNode] } = definition;

const context = {
    endpoints: config.endpoints
};

const baseProps = {
    translating: false,
    localGroups: [],
    nodeToEdit: groupsRouterNode,
    saveLocalizations: jest.fn(),
    updateRouter: jest.fn(),
    getExitTranslations: jest.fn(),
    getResultNameField: jest.fn(),
    onBindWidget: jest.fn()
};

const setup = createSetup<GroupsRouterProps, ConfigProviderContext>(
    GroupsRouter,
    baseProps,
    context
);

const COMPONENT_TO_TEST = GroupsRouter.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('helpers', () => {
        describe('extractGroups', () => {
            it('should extract groups from the exits of a groupsRouter node', () => {
                extractGroups(groupsRouterNode).forEach((group, idx) => {
                    expect(group.name).toBe(groupsRouterNode.exits[idx].name);
                    expect(group.id).toBe(
                        (groupsRouterNode.router as SwitchRouter).cases[idx].arguments[0]
                    );
                    expect(group).toMatchSnapshot();
                });
            });
        });

        describe('hasGroupsRouter', () => {
            it('should return true if given Node has a groups router', () => {
                expect(hasGroupsRouter(groupsRouterNode)).toBeTruthy();
            });

            it('should return false if given NOde does not have a groups router', () => {
                expect(hasGroupsRouter(sendMsgNode)).toBeFalsy();
            });
        });
    });

    describe('render', () => {
        it('should render self, children', () => {
            const getResultNameFieldMock = jest.fn();
            const onBindWidgetMock = jest.fn();
            const {
                wrapper,
                instance,
                props: { localGroups, nodeToEdit },
                context: { endpoints }
            } = setup({
                getResultNameField: getResultNameFieldMock,
                onBindWidget: onBindWidgetMock
            });

            expect(getResultNameFieldMock).toHaveBeenCalledTimes(1);
            expect(wrapper.find('.instructions').exists()).toBeTruthy();
            expect(wrapper.find('p').text()).toBe(GROUP_LABEL);
            expect(wrapper.find('GroupsElement').props()).toEqual({
                name: 'Groups',
                endpoint: endpoints.groups,
                add: false,
                required: true,
                localGroups,
                groups: extractGroups(nodeToEdit),
                placeholder: GROUP_PLACEHOLDER,
                searchPromptText: GROUP_NOT_FOUND
            });
            expect(onBindWidgetMock).toHaveBeenCalledTimes(1);
        });

        it('should render exit translations when user is translating', () => {
            const getExitTranslationsMock = jest.fn(() => <div />);
            const { wrapper, instance } = setup(
                {
                    translating: true,
                    getExitTranslations: getExitTranslationsMock
                },
                true
            );

            expect(getExitTranslationsMock).toHaveBeenCalledTimes(1);
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('instance methods', () => {
        describe('onValid', () => {
            it('should call "updateRouter" prop if user is not translating', () => {
                const updateRouterMock = jest.fn();
                const { wrapper, instance } = setup(
                    {
                        updateRouter: updateRouterMock
                    },
                    true
                );
                const widgets = { Groups: '' };

                instance.onValid(widgets);

                expect(updateRouterMock).toHaveBeenCalledTimes(1);
            });

            it('should call "saveLocalizations" prop if user is translating', () => {
                const saveLocalizationsMock = jest.fn();
                const getExitTranslationsMock = jest.fn(() => <div />);
                const { wrapper, instance } = setup(
                    {
                        translating: true,
                        saveLocalizations: saveLocalizationsMock,
                        getExitTranslations: getExitTranslationsMock
                    },
                    true
                );
                const widgets = { Groups: '' };

                instance.onValid(widgets);

                expect(saveLocalizationsMock).toHaveBeenCalledTimes(1);
                expect(saveLocalizationsMock).toHaveBeenCalledWith(widgets);
            });
        });
    });
});
