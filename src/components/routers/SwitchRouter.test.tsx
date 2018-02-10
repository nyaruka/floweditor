import * as React from 'react';
import { shallow, mount } from 'enzyme';
import { getSpecWrapper } from '../../helpers/utils';
import { DEFAULT_OPERAND, OPERATOR_LOCALIZATION_LEGEND } from './constants';
import SwitchRouterForm, {
    getListStyle,
    getItemStyle,
    resolveExits,
    hasWait,
    hasCases,
    SwitchRouterProps,
    SwitchRouterState
} from './SwitchRouter';
import CompMap, { SearchResult } from '../../services/ComponentMap';
import { LocalizedObject } from '../../services/Localization';
import { Case, WaitType } from '../../flowTypes';
import { getLocalizations } from '../Node';
import { GroupElementProps } from '../form/GroupElement';
import configContext from '../../providers/ConfigProvider/configContext';
import { Language } from '../LanguageSelector';

const colorsFlow = require('../../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const { languages, endpoints } = configContext;
const { results: [{ definition }] } = colorsFlow;
const {
    nodes: [replyNode, switchNodeMsg, switchNodeExp, , , switchNodeGroup],
    localization: locals
} = definition;

describe('SwitchRouter >', () => {
    const { baseLanguage, operatorConfigList, getOperatorConfig, getTypeConfig } = configContext;
    const msgRouterConfig = getTypeConfig('wait_for_response');
    const expRouterConfig = getTypeConfig('expression');
    const groupRouterConfig = getTypeConfig('group');
    const ComponentMap = new CompMap(definition);
    const iso = 'spa';
    const translations = locals[iso];
    const localizations = getLocalizations(switchNodeMsg, iso, languages, translations);
    // Mocking callbacks
    const onUpdateLocalizations = jest.fn();
    const onUpdateRouter = jest.fn();
    const updateRouter = jest.fn();
    const getResultNameFieldMock = jest.fn();
    const getExitTranslationsMock = jest.fn(() => <div />);

    const switchRouterContext = {
        operatorConfigList,
        getOperatorConfig,
        endpoints
    };

    const spanish: Language = { name: 'Spanish', iso: 'spa' };

    const switchProps = {
        node: switchNodeMsg,
        config: msgRouterConfig,
        definition,
        ComponentMap,
        language: baseLanguage,
        showAdvanced: false,
        translating: false,
        getResultNameField: getResultNameFieldMock,
        updateRouter
    };

    const switchPropsTranslating = {
        ...switchProps,
        translating: true,
        language: spanish,
        localizations,
        getExitTranslations: getExitTranslationsMock
    };

    const expRouterProps = {
        ...switchProps,
        node: switchNodeExp,
        config: expRouterConfig
    };

    const placeholder: string = `${localizations[0].getLanguage().name} Translation`;

    describe('style utils >', () => {
        describe('getListStyle >', () => {
            it('should return "pointer" cursor style when passed a falsy isDraggingOver arg', () =>
                expect(getListStyle(false, false)).toEqual({
                    cursor: 'pointer'
                }));

            it('should return "move" cursor style when passed a truthy isDraggingOver arg', () =>
                expect(getListStyle(true, false)).toEqual({
                    cursor: 'move'
                }));

            it('should return null if "single" parameter is true', () => {
                expect(getListStyle(true, true)).toBe(null);
                expect(getListStyle(false, true)).toBe(null);
            });
        });

        describe('getItemStyle >', () => {
            const notDraggingStyle = {
                transition: null,
                transform: null,
                pointerEvents: 'auto',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'rgba(0,0,0,0)',
                touchAction: 'manipulation'
            };

            const draggingStyle = {
                position: 'fixed',
                boxSizing: 'border-box',
                pointerEvents: 'none',
                zIndex: 5000,
                width: 595,
                height: 28,
                top: 271.3333435058594,
                left: 318.66668701171875,
                margin: 0,
                transform: 'translate(-2px, 17px)',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'rgba(0,0,0,0)',
                touchAction: 'manipulation'
            };

            it('should return not-dragging style when passed a falsy isDragging arg (snapshot)', () =>
                expect(getItemStyle(notDraggingStyle, false)).toMatchSnapshot());

            it('should return dragging style when passed a truthy isDragging arg (snapshot)', () =>
                expect(getItemStyle(draggingStyle, true)).toMatchSnapshot());
        });
    });

    describe('helpers >', () => {
        describe('resolveExits >', () =>
            it('should resolve exits', () => {
                const newCases = [
                    {
                        kase: {
                            uuid: '87173eee-5270-4233-aede-ca88e14b672a',
                            type: 'has_any_word',
                            exit_uuid: '7b245d49-e9e3-4387-b4ad-48deb03528cd',
                            arguments: ['red, r']
                        },
                        exitName: 'Red',
                        config: msgRouterConfig
                    }
                ];

                const node = {
                    uuid: 'bc978e00-2f3d-41f2-87c1-26b3f14e5925',
                    router: {
                        type: 'switch',
                        default_exit_uuid: 'a8bdc1c5-0283-4656-b932-4f4094f4cc7e',
                        cases: [
                            {
                                uuid: '87173eee-5270-4233-aede-ca88e14b672a',
                                type: 'has_any_word',
                                exit_uuid: '7b245d49-e9e3-4387-b4ad-48deb03528cd',
                                arguments: ['red, r']
                            }
                        ],
                        operand: '@run.results.color '
                    },
                    exits: [
                        {
                            name: 'Red',
                            uuid: '7b245d49-e9e3-4387-b4ad-48deb03528cd',
                            destination_node_uuid: 'e2ecc8de-9774-4b74-a0dc-ca8aea123227'
                        },
                        {
                            uuid: 'a8bdc1c5-0283-4656-b932-4f4094f4cc7e',
                            name: 'Other',
                            destination_node_uuid: '533b64e2-5906-4d33-a8e9-64f1cb6c20dd'
                        }
                    ],
                    wait: {
                        type: WaitType.exp
                    }
                };

                expect(resolveExits(newCases, node)).toMatchSnapshot();
            }));

        describe('hasWait >', () => {
            it('should return true if node has wait', () => {
                expect(hasWait(switchProps.node)).toBeTruthy();
            });

            it('should return false if node does not have wait', () => {
                expect(hasWait(replyNode)).toBeFalsy();
            });
        });

        describe('hasCases >', () => {
            it('should return true if node has cases', () => {
                expect(hasCases(switchNodeExp)).toBeTruthy();
            });

            it('should return false if node does not have cases', () => {
                expect(
                    hasCases({
                        ...switchNodeExp,
                        router: { ...switchNodeExp.router, cases: [] }
                    })
                ).toBeFalsy();
            });
        });
    });

    describe('render >', () => {
        it('should render wait_for_response form', () => {
            const wrapper = mount(<SwitchRouterForm {...switchProps} />, {
                context: switchRouterContext
            });

            expect(getSpecWrapper(wrapper, 'case').length).toBe(8);

            expect(getSpecWrapper(wrapper, 'case-draggable').length).toBe(7);

            expect(
                getSpecWrapper(wrapper, 'case')
                    .last()
                    .prop('empty')
            ).toBeTruthy();

            expect(getResultNameFieldMock).toHaveBeenCalled();

            expect(getSpecWrapper(wrapper, 'lead-in').text()).toBe('If the message response...');

            getResultNameFieldMock.mockReset();
        });

        it('should call "getExitTranslations" prop when "translating" prop is truthy', () => {
            const wrapper = mount(
                <SwitchRouterForm
                    {...{ ...switchPropsTranslating, getExitTranslations: getExitTranslationsMock }}
                />,
                {
                    context: switchRouterContext
                }
            );

            expect(getExitTranslationsMock).toHaveBeenCalled();

            getExitTranslationsMock.mockReset();
        });

        it('should render expression form', () => {
            const wrapper = mount(
                <SwitchRouterForm
                    {...{
                        ...switchProps,
                        config: expRouterConfig
                    }}
                />,
                { context: switchRouterContext }
            );

            expect(
                getSpecWrapper(wrapper, 'lead-in')
                    .find('p')
                    .text()
            ).toBe('If the expression...');

            expect(
                getSpecWrapper(wrapper, 'lead-in')
                    .find('TextInputElement')
                    .props()
            ).toEqual(
                expect.objectContaining({
                    name: 'Expression',
                    showLabel: false,
                    value: DEFAULT_OPERAND,
                    onChange: wrapper.instance().onExpressionChanged,
                    autocomplete: true,
                    required: true,
                    ComponentMap: switchProps.ComponentMap
                })
            );

            expect(getResultNameFieldMock).toHaveBeenCalled();

            getResultNameFieldMock.mockReset();
        });

        it('should render advanced form (translating case args)', () => {
            const getOperatorsForLocalizationSpy = jest.spyOn(
                SwitchRouterForm.prototype,
                'getOperatorsForLocalization'
            );

            const wrapper = mount(
                <SwitchRouterForm
                    {...{
                        ...switchPropsTranslating,
                        showAdvanced: true
                    }}
                />,
                {
                    context: switchRouterContext
                }
            );

            expect(getSpecWrapper(wrapper, 'advanced-title').text()).toBe('Rules');
            expect(getSpecWrapper(wrapper, 'advanced-instructions').text()).toBe(
                OPERATOR_LOCALIZATION_LEGEND
            );
            expect(getOperatorsForLocalizationSpy).toHaveBeenCalled();

            getOperatorsForLocalizationSpy.mockRestore();
        });
    });

    describe('instance methods >', () => {
        describe('getOperatorsForLocalization >', () => {
            const wrapper = mount(
                <SwitchRouterForm
                    {...{
                        ...switchPropsTranslating,
                        showAdvanced: true
                    }}
                />,
                {
                    context: switchRouterContext
                }
            );

            const localizedArgs = switchProps.node.router.cases.reduce((argsArr, kase) => {
                if (kase.arguments && kase.arguments.length) {
                    const localized = localizations.find(
                        localizedObject => localizedObject.getObject().uuid === kase.uuid
                    );

                    if (localized) {
                        let value: string = '';

                        if ('arguments' in localized.localizedKeys) {
                            const localizedCase = localized.getObject() as Case;

                            if (localizedCase.arguments.length) {
                                [value] = localizedCase.arguments;
                            }
                        }

                        const { verboseName } = switchRouterContext.getOperatorConfig(kase.type);

                        const [argument] = kase.arguments;

                        argsArr.push({
                            value,
                            verboseName,
                            argument,
                            uuid: kase.uuid
                        });
                    }
                }

                return argsArr;
            }, []);

            expect(getSpecWrapper(wrapper, 'operator-field').length).toBe(7);
            getSpecWrapper(wrapper, 'operator-field').forEach((uiNode, idx) => {
                const { verboseName, argument, uuid, value } = localizedArgs[idx];

                expect(getSpecWrapper(uiNode, 'verbose-name').text()).toBe(verboseName);
                expect(getSpecWrapper(uiNode, 'argument-to-translate').text()).toBe(argument);
                expect(getSpecWrapper(uiNode, 'translation-input').props()).toEqual({
                    'data-spec': 'translation-input',
                    name: uuid,
                    placeholder,
                    showLabel: false,
                    value,
                    ComponentMap: switchProps.ComponentMap,
                    config: msgRouterConfig
                });
            });
        });
    });
});
