import * as React from 'react';
import { shallow, mount, ReactWrapper } from 'enzyme';
import { getSpecWrapper } from '../../helpers/utils';
import Config from '../../providers/ConfigProvider/configContext';
import SwitchRouterForm, {
    getListStyle,
    getItemStyle,
    composeExitMap,
    resolveExits,
    isSwitchRouterNode,
    SwitchRouterFormProps,
    SwitchRouterState
} from './SwitchRouter';
import CompMap from '../../services/ComponentMap';
import { LocalizedObject } from '../../services/Localization';
import { Exit, Case, SwitchRouter } from '../../flowTypes';
import { getLocalizations } from '../Node';
import NodeEditor from '../NodeEditor/NodeEditor';

const colorsFlow = require('../../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const formStyles = require('../NodeEditor/NodeEditor.scss');

const { baseLanguage, languages, getTypeConfig, getOperatorConfig, operatorConfigList } = Config;

const { results: [{ definition }] } = colorsFlow;
const { nodes: [replyNode, switchNodeMsg], localization: locals } = definition;

describe('SwitchRouter >', () => {
    describe('style utils >', () => {
        describe('getListStyle >', () => {
            it('should return "pointer" cursor style when passed a falsy isDraggingOver arg', () =>
                expect(getListStyle(false)).toEqual({
                    cursor: 'pointer'
                }));

            it('should return "move" cursor style when passed a truthy isDraggingOver arg', () =>
                expect(getListStyle(true)).toEqual({
                    cursor: 'move'
                }));
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
                        exitName: 'Red'
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
                        type: 'exp'
                    }
                };

                expect(resolveExits(newCases, node)).toMatchSnapshot();
            }));

        describe('composeExitMap >', () =>
            it('should compose a map of exits', () =>
                expect(
                    composeExitMap([
                        {
                            uuid: '63e20770-64c1-4bad-bd73-a34cf6d46866',
                            name: 'All Responses',
                            destination_node_uuid: null
                        }
                    ])
                ).toMatchSnapshot()));

        describe('isSwitchRouterNode >', () => {
            it('should return true if node has a switch router', () =>
                expect(isSwitchRouterNode(switchNodeMsg)).toBeTruthy());

            it("should return false if node doesn't have a switch router", () =>
                expect(isSwitchRouterNode(replyNode)).toBeFalsy());
        });
    });

    describe('render >', () => {
        const config = getTypeConfig('wait_for_response');
        const ComponentMap = new CompMap(definition);
        const iso = 'spa';
        const translations = locals[iso];
        const localizations = getLocalizations(switchNodeMsg, iso, languages, translations);

        const nodeEditorContext = {
            getTypeConfig
        };

        const switchRouterContext = {
            getOperatorConfig,
            operatorConfigList
        };

        const spanish = { name: 'Spanish', iso: 'spa' };

        const nodeProps = {
            show: true,
            node: switchNodeMsg,
            language: spanish,
            definition,
            localizations,
            ComponentMap
        };

        const {
            onBindWidget,
            onBindAdvancedWidget,
            removeWidget,
            getExitTranslations,
            getLocalizedExits
        } = shallow(<NodeEditor {...nodeProps as any} />, {
            context: nodeEditorContext
        }).instance() as any;

        const switchProps = {
            node: switchNodeMsg,
            config,
            definition,
            ComponentMap,
            updateRouter: jest.fn(),
            onBindWidget,
            onBindAdvancedWidget,
            removeWidget,
            language: baseLanguage,
            showAdvanced: false,
            translating: false
        };

        const switchPropsTranslating = {
            ...switchProps,
            translating: true,
            language: spanish,
            localizations,
            getExitTranslations,
            getLocalizedExits
        };

        const placeholder: string = `${localizations[0].getLanguage().name} Translation`;

        it('should render wait_for_response form (not translating)', () => {
            // Cases
            const wrapper: ReactWrapper = mount(<SwitchRouterForm {...switchProps as any} />, {
                context: switchRouterContext
            });

            expect(getSpecWrapper(wrapper, 'case').length).toBe(8);

            expect(getSpecWrapper(wrapper, 'case-draggable').length).toBe(7);

            expect(
                getSpecWrapper(wrapper, 'case')
                    .last()
                    .prop('empty')
            ).toBeTruthy();

            /** Fields */
            expect(getSpecWrapper(wrapper, 'name-field').name()).toBe('TextInputElement');

            expect(getSpecWrapper(wrapper, 'name-field').props()).toEqual(
                expect.objectContaining({
                    'data-spec': 'name-field',
                    name: 'Result Name',
                    showLabel: true,
                    value: switchProps.node.router.result_name,
                    helpText:
                        'By naming the result, you can reference it later using @run.results.whatever_the_name_is',
                    ComponentMap: switchProps.ComponentMap
                })
            );

            expect(getSpecWrapper(wrapper, 'lead-in').text()).toBe('If the message response...');
        });

        it('should render wait_for_response form (translating)', () => {
            const wrapper: ReactWrapper = mount(
                <SwitchRouterForm {...switchPropsTranslating as any} />,
                {
                    context: switchRouterContext
                }
            );

            expect(getSpecWrapper(wrapper, 'title').exists()).toBeTruthy();

            expect(getSpecWrapper(wrapper, 'instructions').text()).toBe(
                'When category names are referenced later in the flow, the appropriate language for the category will be used. If no translation is provided, the original text will be used.'
            );

            getSpecWrapper(wrapper, 'exit-name').forEach((uiNode, idx) =>
                expect(uiNode.text()).toBe(switchProps.node.exits[idx].name)
            );

            getSpecWrapper(wrapper, 'localization-input').forEach((uiNode, idx) => {
                const exitUUID: string = switchProps.node.exits[idx].uuid;
                let value: string = '';
                const localized = localizations.find(
                    localizedObject => localizedObject.getObject().uuid === exitUUID
                );

                if (localized) {
                    if ('name' in localized.localizedKeys) {
                        ({ name: value } = localized.getObject() as Exit);
                    }

                    expect(uiNode.props()).toEqual(
                        expect.objectContaining({
                            'data-spec': 'localization-input',
                            name: exitUUID,
                            placeholder,
                            showLabel: false,
                            value,
                            ComponentMap: switchProps.ComponentMap
                        })
                    );
                }
            });
        });

        it('should render expression form (not translating)', () => {
            /** Note: cases and name field tested in wait_for_expression test above */
            const wrapper: ReactWrapper = mount(
                <SwitchRouterForm
                    {...{
                        ...switchProps,
                        config: getTypeConfig('expression')
                    } as any}
                />,
                { context: switchRouterContext }
            );

            /** Fields */
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
                    value: '@input',
                    onChange: wrapper.instance().onExpressionChanged,
                    autocomplete: true,
                    required: true,
                    ComponentMap: switchProps.ComponentMap
                })
            );
        });

        it('should render advanced form (translating case args)', () => {
            const wrapper: ReactWrapper = mount(
                <SwitchRouterForm {...{ ...switchPropsTranslating, showAdvanced: true } as any} />,
                {
                    context: switchRouterContext
                }
            );

            expect(getSpecWrapper(wrapper, 'advanced-title').text()).toBe('Rules');

            expect(getSpecWrapper(wrapper, 'advanced-instructions').text()).toBe(
                'Sometimes languages need special rules to route things properly. If a translation is not provided, the original rule will be used.'
            );

            expect(getSpecWrapper(wrapper, 'operator-field').length).toBe(7);

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
                    ComponentMap: switchProps.ComponentMap
                });
            });
        });
    });
});
