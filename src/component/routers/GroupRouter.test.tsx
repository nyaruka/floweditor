import * as React from 'react';
import { shallow, mount } from 'enzyme';
import GroupRouter, { extractGroups, groupSplitExistsAtNode } from './GroupRouter';
import CompMap, { SearchResult } from '../../services/ComponentMap';
import { getLocalizations } from '../Node';
import { GroupElementProps } from '../form/GroupElement';
import { GROUP_LABEL } from './constants';
import { getTypeConfig } from '../../config';

const colorsFlow = require('../../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const { endpoints } = require('../../../assets/config');

const { results: [{ definition }] } = colorsFlow;
const { nodes: [replyNode, , , , , node], localization: locals } = definition;

const groupRouterConfig = getTypeConfig('split_by_group');
const ComponentMap = new CompMap(definition);
// Mocking callbacks
const onUpdateLocalizations = jest.fn();
const onUpdateRouter = jest.fn();
const updateRouter = jest.fn();

const groupRouterProps = {
    node,
    config: groupRouterConfig,
    translating: false,
    definition,
    getResultNameField: jest.fn(),
    ComponentMap
};

const groupRouterContext = {
    endpoints
};

describe('GroupRouter >', () => {
    describe('helpers >', () => {
        describe('extractGroups >', () => {
            it("should extract a list of group SearchResult objects from a group router node's cases, exits", () => {
                extractGroups(node).forEach(({ name, id, type }) => {
                    expect(
                        node.router.cases.filter(kase => kase.arguments[0] === id).length
                    ).toBeTruthy();

                    expect(node.exits.filter(exit => exit.name === name).length).toBeTruthy();
                });
            });
        });

        describe('groupSplitExistsAtNode >', () => {
            it('should return true if node contains a group split router, false otherwise', () => {
                expect(groupSplitExistsAtNode(node)).toBeTruthy();
                expect(groupSplitExistsAtNode(replyNode)).toBeFalsy();
            });
        });
    });

    describe('render >', () => {
        it('should call "getResultNameField" prop from "render"', () => {
            const getResultNameFieldMock = jest.fn();

            const wrapper = shallow(
                <GroupRouter
                    {...{ ...groupRouterProps, getResultNameField: getResultNameFieldMock }}
                />,
                {
                    context: groupRouterContext
                }
            );

            expect(getResultNameFieldMock).toHaveBeenCalled();

            getResultNameFieldMock.mockReset();
        });

        it('should pass groups pulled from existing cases to GroupElement', () => {
            const wrapper = shallow(<GroupRouter {...groupRouterProps} />, {
                context: groupRouterContext
            });

            const groups: SearchResult[] = extractGroups(node);

            const groupElementProps = {
                add: false,
                groups,
                endpoint: endpoints.groups,
                localGroups: [],
                name: 'Group',
                required: true
            };

            expect(wrapper.find('p').text()).toBe(GROUP_LABEL);
            expect(wrapper.find('GroupElement').props()).toEqual(
                expect.objectContaining(groupElementProps)
            );
        });

        it('should call "getExitTranslations" prop from render if "translating" prop is truthy', () => {
            const getExitTranslationsMock = jest.fn();

            const wrapper = shallow(
                <GroupRouter
                    {...{
                        ...groupRouterProps,
                        getExitTranslations: getExitTranslationsMock,
                        translating: true
                    }}
                />,
                {
                    context: groupRouterContext
                }
            );

            expect(getExitTranslationsMock).toHaveBeenCalled();

            getExitTranslationsMock.mockReset();
        });
    });

    describe('instance methods >', () => {
        describe('onValid >', () => {
            it('should call "saveLocalizations" prop when if "translating" prop is truthy', () => {
                const saveLocalizationsMock = jest.fn();

                const wrapper = shallow(
                    <GroupRouter
                        {...{
                            ...groupRouterProps,
                            saveLocalizations: saveLocalizationsMock,
                            getExitTranslations: jest.fn(),
                            translating: true
                        }}
                    />,
                    {
                        context: groupRouterContext
                    }
                );

                wrapper.instance().onValid({ Group: {} });

                expect(saveLocalizationsMock).toHaveBeenCalled();

                saveLocalizationsMock.mockReset();
            });
        });
    });

    it('should call "updateRouter" prop if "translating" prop is falsy', () => {
        const updateRouterMock = jest.fn();

        const wrapper = shallow(
            <GroupRouter
                {...{
                    ...groupRouterProps,
                    cleanUpLocalizations: jest.fn(),
                    updateRouter: updateRouterMock
                }}
            />,
            {
                context: groupRouterContext
            }
        );

        wrapper.instance().onValid({
            Group: {
                state: {
                    groups: extractGroups(node)
                }
            }
        });

        expect(updateRouterMock).toHaveBeenCalled();

        updateRouterMock.mockReset();
    });
});
