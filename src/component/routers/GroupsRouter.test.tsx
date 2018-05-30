import * as React from 'react';

import { SwitchRouter } from '../../flowTypes';
import { composeComponentTestUtils, setMock } from '../../testUtils';
import {
    createExit,
    createFlowNode,
    createGroupsRouterNode,
    createSendMsgAction
} from '../../testUtils/assetCreators';
import { setTrue } from '../../utils';
import { GROUP_LABEL } from './constants';
import { extractGroups, GroupsRouter, GroupsRouterProps, hasGroupsRouter } from './GroupsRouter';

const groupsRouterNode = createGroupsRouterNode();
const sendMsgNode = createFlowNode({
    actions: [createSendMsgAction({ text: '😎' })],
    exits: [createExit()]
});

const baseProps: GroupsRouterProps = {
    translating: false,
    settings: { originalNode: groupsRouterNode },
    saveLocalizations: jest.fn(),
    updateRouter: jest.fn(),
    getExitTranslations: jest.fn(),
    getResultNameField: jest.fn()
};

const { setup } = composeComponentTestUtils(GroupsRouter, baseProps);

describe(GroupsRouter.name, () => {
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

            it('should return false if given Node does not have a groups router', () => {
                expect(hasGroupsRouter(sendMsgNode)).toBeFalsy();
            });
        });
    });

    describe('render', () => {
        it('should render self, children', () => {
            const { wrapper, instance, props, context } = setup(false, {
                getResultNameField: setMock()
            });

            expect(props.getResultNameField).toHaveBeenCalledTimes(1);
            expect(wrapper.find('.instructions').exists()).toBeTruthy();
            expect(wrapper.find('p').text()).toBe(GROUP_LABEL);
            expect(wrapper.find('GroupsElement').props()).toMatchSnapshot();
        });

        it('should render exit translations when user is translating', () => {
            const { wrapper, props, instance } = setup(true, {
                translating: setTrue(),
                getExitTranslations: setMock()
            });

            expect(props.getExitTranslations).toHaveBeenCalledTimes(1);
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('instance methods', () => {
        describe('onValid', () => {
            it('should call "updateRouter" prop if user is not translating', () => {
                const { wrapper, props, instance } = setup(true, {
                    updateRouter: setMock()
                });
                const widgets = { Groups: '' };

                instance.onValid(widgets);

                expect(props.updateRouter).toHaveBeenCalledTimes(1);
            });

            it('should call "saveLocalizations" prop if user is translating', () => {
                const { wrapper, props, instance } = setup(true, {
                    translating: setTrue(),
                    saveLocalizations: setMock(),
                    getExitTranslations: setMock(() => <div />)
                });
                const widgets = { Groups: '' };

                instance.onValid(widgets);

                expect(props.saveLocalizations).toHaveBeenCalledTimes(1);
                expect(props.saveLocalizations).toHaveBeenCalledWith(widgets);
            });
        });
    });
});
