import * as React from 'react';
import { mount } from 'enzyme';
import { getSpecWrapper } from '../../helpers/utils';
import Config from '../../providers/ConfigProvider/configContext';
import SwitchRouterForm, {
    getListStyle,
    getItemStyle,
    composeExitMap,
    resolveExits,
    SwitchRouterFormProps
} from './SwitchRouter';
import CompMap from '../../services/ComponentMap';
import { LocalizedObject } from '../../services/Localization';
import TextInputElement from '../form/TextInputElement/TextInputElement';
import { Exit, Case } from '../../flowTypes';
import { getLocalizations } from '../Node';

const colorsFlow = require('../../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const formStyles = require('../NodeEditor/NodeEditor.scss');

const { languages, getTypeConfig, getOperatorConfig } = Config;

describe('SwitchRouter', () => {
    describe('style utils', () => {
        describe('getListStyle', () => {
            it('should return "pointer" cursor style when passed a falsy isDraggingOver arg', () =>
                expect(getListStyle(false)).toEqual({
                    cursor: 'pointer'
                }));

            it('should return "move" cursor style when passed a truthy isDraggingOver arg', () =>
                expect(getListStyle(true)).toEqual({
                    cursor: 'move'
                }));
        });

        describe('getItemStyle', () => {
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

            it('should return notDragging style when passed a falsy isDragging arg (snapshot)', () =>
                expect(getItemStyle(notDraggingStyle, false)).toMatchSnapshot());

            it('should return dragging style when passed a truthy isDragging arg (snapshot)', () =>
                expect(getItemStyle(draggingStyle, true)).toMatchSnapshot());
        });
    });

    describe('exit utils', () => {
        describe('resolveExits', () =>
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

        describe('composeExits', () => {
            it('should compose a map of exits', () =>
                expect(
                    composeExitMap([
                        {
                            uuid: '63e20770-64c1-4bad-bd73-a34cf6d46866',
                            name: 'All Responses',
                            destination_node_uuid: null
                        }
                    ])
                ).toMatchSnapshot());
        });
    });

    describe('Component: SwitchRouterForm', () => {
        const { results: [{ definition }] } = colorsFlow;
        const { nodes: [, node], localization: locals } = definition;
        const config = getTypeConfig('wait_for_response');
        const ComponentMap = new CompMap(definition);

        const iso = 'spa';
        const translations = locals[iso];

        const localizations = getLocalizations(node, iso, languages, translations);

        const props = {
            node,
            config,
            definition,
            ComponentMap,
            updateRouter: jest.fn(),
            onBindWidget: jest.fn(),
            onBindAdvancedWidget: jest.fn(),
            removeWidget: jest.fn(),
            updateLocalizations: jest.fn(),
            renderExitTranslations: jest.fn(),
            getLocalizedExits: jest.fn()
        };

        const context = {
            getOperatorConfig
        };

        const SwitchFormWaitBasic = mount(
            <SwitchRouterForm
                {...{
                    ...props,
                    showAdvanced: false,
                    translating: false,
                    iso: 'eng'
                }}
            />,
            { context }
        );

        const SwitchFormExpressionBasic = mount(
            <SwitchRouterForm
                {...{
                    ...props,
                    config: {
                        ...getTypeConfig('expression')
                    },
                    showAdvanced: false,
                    translating: false,
                    iso: 'eng'
                }}
            />,
            { context }
        );

        const translatingProps = {
            ...props,
            showAdvanced: false,
            translating: true,
            iso: 'spa',
            localizations,
            renderExitTranslations: jest.fn(() => {
                let languageName: string = '';

                if (localizations.length > 0) {
                    ({ name: languageName } = localizations[0].getLanguage());
                }

                if (!languageName) {
                    return null;
                }

                const exits = node.exits.reduce((exitsArr, { uuid: exitUUID, name: exitName }) => {
                    const localized = localizations.find(
                        localizedObject => localizedObject.getObject().uuid === exitUUID
                    );

                    if (localized) {
                        let value = '';

                        if ('name' in localized.localizedKeys) {
                            ({ name: value } = localized.getObject() as Exit);
                        }

                        exitsArr.push(
                            <div key={exitUUID} className={formStyles.translating_exit}>
                                <div data-spec="exit-name" className={formStyles.translating_from}>
                                    {exitName}
                                </div>
                                <div className={formStyles.translating_to}>
                                    <TextInputElement
                                        data-spec="localization-input"
                                        ref={() => {}}
                                        name={exitUUID}
                                        placeholder={`${languageName} Translation`}
                                        showLabel={false}
                                        value={value}
                                        /** Node */
                                        ComponentMap={props.ComponentMap}
                                    />
                                </div>
                            </div>
                        );
                    }

                    return exitsArr;
                }, []);

                return (
                    <div>
                        <div data-spec="title" className={formStyles.title}>
                            Categories
                        </div>
                        <div data-spec="instructions" className={formStyles.instructions}>
                            When category names are referenced later in the flow, the appropriate
                            language for the category will be used. If no translation is provided,
                            the original text will be used.
                        </div>
                        <div className={formStyles.translating_exits}>{exits}</div>
                    </div>
                );
            })
        } as any;

        const SwitchFormWaitTranslatingExits = mount(<SwitchRouterForm {...translatingProps} />, {
            context
        });

        const SwitchFormTranslatingArgs = mount(
            <SwitchRouterForm {...{ ...translatingProps, showAdvanced: true }} />,
            {
                context
            }
        );

        describe('render', () => {
            const placeholder: string = `${localizations[0].getLanguage().name} Translation`;

            it('should render wait_for_response form (not translating)', () => {
                /** Cases */
                expect(getSpecWrapper(SwitchFormWaitBasic, 'case').length).toBe(8);

                expect(getSpecWrapper(SwitchFormWaitBasic, 'case-draggable').length).toBe(7);

                expect(
                    getSpecWrapper(SwitchFormWaitBasic, 'case')
                        .last()
                        .prop('empty')
                ).toBeTruthy();

                /** Fields */
                expect(getSpecWrapper(SwitchFormWaitBasic, 'name-field').name()).toBe(
                    'TextInputElement'
                );

                expect(getSpecWrapper(SwitchFormWaitBasic, 'name-field').props()).toEqual(
                    expect.objectContaining({
                        'data-spec': 'name-field',
                        name: 'Result Name',
                        showLabel: true,
                        value: props.node.router.result_name,
                        helpText:
                            'By naming the result, you can reference it later using @run.results.whatever_the_name_is',
                        ComponentMap: props.ComponentMap
                    })
                );

                expect(getSpecWrapper(SwitchFormWaitBasic, 'lead-in').text()).toBe(
                    'If the message response...'
                );
            });

            it('should render wait_for_response `form (translating)', () => {
                expect(
                    getSpecWrapper(SwitchFormWaitTranslatingExits, 'title').exists()
                ).toBeTruthy();

                expect(getSpecWrapper(SwitchFormWaitTranslatingExits, 'instructions').text()).toBe(
                    'When category names are referenced later in the flow, the appropriate language for the category will be used. If no translation is provided, the original text will be used.'
                );

                getSpecWrapper(SwitchFormWaitTranslatingExits, 'exit-name').forEach((uiNode, idx) =>
                    expect(uiNode.text()).toBe(props.node.exits[idx].name)
                );

                getSpecWrapper(SwitchFormWaitTranslatingExits, 'localization-input').forEach(
                    (uiNode, idx) => {
                        const exitUUID: string = props.node.exits[idx].uuid;
                        let value: string = '';
                        const localized = localizations.find(
                            localizedObject => localizedObject.getObject().uuid === exitUUID
                        );

                        if (localized) {
                            if ('name' in localized.localizedKeys) {
                                ({ name: value } = localized.getObject() as Exit);
                            }

                            expect(uiNode.props()).toEqual({
                                'data-spec': 'localization-input',
                                name: exitUUID,
                                placeholder,
                                showLabel: false,
                                value,
                                ComponentMap: props.ComponentMap
                            });
                        }
                    }
                );
            });

            it('should render expression form (not translating)', () => {
                /** Note: cases and name field tested in wait_for_expression test above */

                /** Fields */
                expect(
                    getSpecWrapper(SwitchFormExpressionBasic, 'lead-in')
                        .find('p')
                        .text()
                ).toBe('If the expression...');

                expect(
                    getSpecWrapper(SwitchFormExpressionBasic, 'lead-in')
                        .find('TextInputElement')
                        .props()
                ).toEqual({
                    name: 'Expression',
                    showLabel: false,
                    value: '@input',
                    onChange: SwitchFormExpressionBasic.instance().onExpressionChanged,
                    autocomplete: true,
                    required: true,
                    ComponentMap: props.ComponentMap
                });
            });

            it('should render advanced form (translating case args)', () => {
                expect(getSpecWrapper(SwitchFormTranslatingArgs, 'advanced-title').text()).toBe(
                    'Rules'
                );

                expect(
                    getSpecWrapper(SwitchFormTranslatingArgs, 'advanced-instructions').text()
                ).toBe(
                    'Sometimes languages need special rules to route things properly. If a translation is not provided, the original rule will be used.'
                );

                expect(getSpecWrapper(SwitchFormTranslatingArgs, 'operator-field').length).toBe(7);

                const localizedArgs = props.node.router.cases.reduce((argsArr, kase) => {
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

                            const { verboseName } = context.getOperatorConfig(kase.type);
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

                getSpecWrapper(SwitchFormTranslatingArgs, 'operator-field').forEach(
                    (uiNode, idx) => {
                        const { verboseName, argument, uuid, value } = localizedArgs[idx];

                        expect(getSpecWrapper(uiNode, 'verbose-name').text()).toBe(verboseName);
                        expect(getSpecWrapper(uiNode, 'argument-to-translate').text()).toBe(
                            argument
                        );
                        expect(getSpecWrapper(uiNode, 'translation-input').props()).toEqual({
                            'data-spec': 'translation-input',
                            name: uuid,
                            placeholder,
                            showLabel: false,
                            value,
                            ComponentMap: props.ComponentMap
                        });
                    }
                );
            });
        });
    });
});
