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
import { Exit } from '../../flowTypes';

const colorsFlow = require('../../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const formStyles = require('../NodeEditor/NodeEditor.scss');

const { getTypeConfig, getOperatorConfig } = Config;

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
        const { nodes: [, node] } = definition;
        const config = getTypeConfig('wait_for_response');
        const ComponentMap = new CompMap(definition);

        const localizations: LocalizedObject[] = [
            {
                localizedKeys: {},
                getLanguage: jest.fn(() => ({
                    iso: 'spa',
                    name: 'Spanish'
                })),
                getObject: jest.fn(() => ({
                    uuid: 'fa0a9b24-5f19-4b8e-b287-27af5811de1d',
                    type: 'has_any_word',
                    exit_uuid: '55855afc-f612-4ef9-9288-dcb1dd136052',
                    arguments: ['red, r']
                })),
                localizedObject: {
                    uuid: 'fa0a9b24-5f19-4b8e-b287-27af5811de1d',
                    type: 'has_any_word',
                    exit_uuid: '55855afc-f612-4ef9-9288-dcb1dd136052',
                    arguments: ['red, r']
                },
                iso: 'spa',
                languages: {
                    eng: 'English',
                    spa: 'Spanish'
                },
                language: {
                    iso: 'spa',
                    name: 'Spanish'
                }
            },
            {
                localizedKeys: {},
                getLanguage: jest.fn(() => ({
                    iso: 'spa',
                    name: 'Spanish'
                })),
                getObject: jest.fn(() => ({
                    uuid: 'b5f900b9-ad13-479a-8ad3-1f1ad5ac88f2',
                    type: 'has_any_word',
                    exit_uuid: '668ca2ab-8d49-47f5-82a1-e3a82a58e5fb',
                    arguments: ['orange, o']
                })),
                localizedObject: {
                    uuid: 'b5f900b9-ad13-479a-8ad3-1f1ad5ac88f2',
                    type: 'has_any_word',
                    exit_uuid: '668ca2ab-8d49-47f5-82a1-e3a82a58e5fb',
                    arguments: ['orange, o']
                },

                iso: 'spa',
                languages: {
                    eng: 'English',
                    spa: 'Spanish'
                }
            },
            {
                localizedKeys: {},
                getLanguage: jest.fn(() => ({
                    iso: 'spa',
                    name: 'Spanish'
                })),
                getObject: jest.fn(() => ({
                    uuid: 'e9c842e8-f1c5-4f07-97e7-50a4f93b22e5',
                    type: 'has_any_word',
                    exit_uuid: '14806949-d583-49e2-aa55-03aa16ee5a3a',
                    arguments: ['yellow, y']
                })),
                localizedObject: {
                    uuid: 'e9c842e8-f1c5-4f07-97e7-50a4f93b22e5',
                    type: 'has_any_word',
                    exit_uuid: '14806949-d583-49e2-aa55-03aa16ee5a3a',
                    arguments: ['yellow, y']
                },
                iso: 'spa',
                languages: {
                    eng: 'English',
                    spa: 'Spanish'
                }
            },
            {
                localizedKeys: {},
                getLanguage: jest.fn(() => ({
                    iso: 'spa',
                    name: 'Spanish'
                })),
                getObject: jest.fn(() => ({
                    uuid: 'cc5894af-5dce-454e-a525-3d7c5c41d21d',
                    type: 'has_any_word',
                    exit_uuid: '77394377-f6b8-4366-9bef-d468621258ef',
                    arguments: ['green, g']
                })),
                localizedObject: {
                    uuid: 'cc5894af-5dce-454e-a525-3d7c5c41d21d',
                    type: 'has_any_word',
                    exit_uuid: '77394377-f6b8-4366-9bef-d468621258ef',
                    arguments: ['green, g']
                },
                iso: 'spa',
                languages: {
                    eng: 'English',
                    spa: 'Spanish'
                }
            },
            {
                localizedKeys: {
                    arguments: true
                },

                getObject: jest.fn(() => ({
                    uuid: 'fa0a9b24-5f19-4b8e-b287-27af5811de1d',
                    type: 'has_any_word',
                    exit_uuid: '55855afc-f612-4ef9-9288-dcb1dd136052',
                    arguments: ['rojo, r']
                })),
                localizedObject: {
                    uuid: 'fa0a9b24-5f19-4b8e-b287-27af5811de1d',
                    type: 'has_any_word',
                    exit_uuid: '55855afc-f612-4ef9-9288-dcb1dd136052',
                    arguments: ['rojo, r']
                },
                iso: 'spa',
                language: {
                    iso: 'spa',
                    name: 'Spanish'
                },
                languages: {
                    eng: 'English',
                    spa: 'Spanish'
                }
            },
            {
                localizedKeys: {
                    arguments: true
                },

                getObject: jest.fn(() => ({
                    uuid: 'b5f900b9-ad13-479a-8ad3-1f1ad5ac88f2',
                    type: 'has_any_word',
                    exit_uuid: '668ca2ab-8d49-47f5-82a1-e3a82a58e5fb',
                    arguments: ['naranja, n']
                })),
                localizedObject: {
                    uuid: 'b5f900b9-ad13-479a-8ad3-1f1ad5ac88f2',
                    type: 'has_any_word',
                    exit_uuid: '668ca2ab-8d49-47f5-82a1-e3a82a58e5fb',
                    arguments: ['naranja, n']
                },
                iso: 'spa',
                language: {
                    iso: 'spa',
                    name: 'Spanish'
                },
                languages: {
                    eng: 'English',
                    spa: 'Spanish'
                }
            },
            {
                localizedKeys: {
                    arguments: true
                },

                getObject: jest.fn(() => ({
                    uuid: 'e9c842e8-f1c5-4f07-97e7-50a4f93b22e5',
                    type: 'has_any_word',
                    exit_uuid: '14806949-d583-49e2-aa55-03aa16ee5a3a',
                    arguments: ['amarillo, a']
                })),
                localizedObject: {
                    uuid: 'e9c842e8-f1c5-4f07-97e7-50a4f93b22e5',
                    type: 'has_any_word',
                    exit_uuid: '14806949-d583-49e2-aa55-03aa16ee5a3a',
                    arguments: ['amarillo, a']
                },
                iso: 'spa',
                language: {
                    iso: 'spa',
                    name: 'Spanish'
                },
                languages: {
                    eng: 'English',
                    spa: 'Spanish'
                }
            },
            {
                localizedKeys: {},
                getLanguage: jest.fn(() => ({
                    iso: 'spa',
                    name: 'Spanish'
                })),
                getObject: jest.fn(() => ({
                    uuid: '590d13e3-7b47-44e3-b8a0-ba9bd41d75d2',
                    type: 'has_any_word',
                    exit_uuid: '92d429d8-c275-4306-9360-93f4b9c7acb1',
                    arguments: ['blue, b']
                })),
                localizedObject: {
                    uuid: '590d13e3-7b47-44e3-b8a0-ba9bd41d75d2',
                    type: 'has_any_word',
                    exit_uuid: '92d429d8-c275-4306-9360-93f4b9c7acb1',
                    arguments: ['blue, b']
                },
                iso: 'spa',
                languages: {
                    eng: 'English',
                    spa: 'Spanish'
                }
            },
            {
                localizedKeys: {},
                getLanguage: jest.fn(() => ({
                    iso: 'spa',
                    name: 'Spanish'
                })),
                getObject: jest.fn(() => ({
                    uuid: '2a7cbed1-6597-4545-b145-14a2e9282e6c',
                    type: 'has_any_word',
                    exit_uuid: '2de9af80-1bd9-4f37-839f-073edbd14369',
                    arguments: ['indigo, i']
                })),
                localizedObject: {
                    uuid: '2a7cbed1-6597-4545-b145-14a2e9282e6c',
                    type: 'has_any_word',
                    exit_uuid: '2de9af80-1bd9-4f37-839f-073edbd14369',
                    arguments: ['indigo, i']
                },
                iso: 'spa',
                languages: {
                    eng: 'English',
                    spa: 'Spanish'
                }
            },
            {
                localizedKeys: {},
                getLanguage: jest.fn(() => ({
                    iso: 'spa',
                    name: 'Spanish'
                })),
                getObject: jest.fn(() => ({
                    uuid: 'ab99e18c-433f-436e-9278-08bcf506f433',
                    type: 'has_any_word',
                    exit_uuid: '5760ec2f-04d4-492b-817b-9f395633ec79',
                    arguments: ['violet, v']
                })),
                localizedObject: {
                    uuid: 'ab99e18c-433f-436e-9278-08bcf506f433',
                    type: 'has_any_word',
                    exit_uuid: '5760ec2f-04d4-492b-817b-9f395633ec79',
                    arguments: ['violet, v']
                },
                iso: 'spa',
                languages: {
                    eng: 'English',
                    spa: 'Spanish'
                }
            },
            {
                localizedKeys: {
                    name: true
                },
                getLanguage: jest.fn(() => ({
                    iso: 'spa',
                    name: 'Spanish'
                })),
                getObject: jest.fn(() => ({
                    name: ['rojo'],
                    uuid: '55855afc-f612-4ef9-9288-dcb1dd136052',
                    destination_node_uuid: 'bc978e00-2f3d-41f2-87c1-26b3f14e5925'
                })),
                localizedObject: {
                    name: ['rojo'],
                    uuid: '55855afc-f612-4ef9-9288-dcb1dd136052',
                    destination_node_uuid: 'bc978e00-2f3d-41f2-87c1-26b3f14e5925'
                },
                iso: 'spa',
                languages: {
                    eng: 'English',
                    spa: 'Spanish'
                }
            },
            {
                localizedKeys: {
                    name: true
                },
                getLanguage: jest.fn(() => ({
                    iso: 'spa',
                    name: 'Spanish'
                })),
                getObject: jest.fn(() => ({
                    name: ['naranja'],
                    uuid: '668ca2ab-8d49-47f5-82a1-e3a82a58e5fb',
                    destination_node_uuid: 'bc978e00-2f3d-41f2-87c1-26b3f14e5925'
                })),
                localizedObject: {
                    name: ['naranja'],
                    uuid: '668ca2ab-8d49-47f5-82a1-e3a82a58e5fb',
                    destination_node_uuid: 'bc978e00-2f3d-41f2-87c1-26b3f14e5925'
                },
                iso: 'spa',
                languages: {
                    eng: 'English',
                    spa: 'Spanish'
                }
            },
            {
                localizedKeys: {
                    name: true
                },
                getLanguage: jest.fn(() => ({
                    iso: 'spa',
                    name: 'Spanish'
                })),
                getObject: jest.fn(() => ({
                    name: ['amarillo'],
                    uuid: '14806949-d583-49e2-aa55-03aa16ee5a3a',
                    destination_node_uuid: 'bc978e00-2f3d-41f2-87c1-26b3f14e5925'
                })),
                localizedObject: {
                    name: ['amarillo'],
                    uuid: '14806949-d583-49e2-aa55-03aa16ee5a3a',
                    destination_node_uuid: 'bc978e00-2f3d-41f2-87c1-26b3f14e5925'
                },
                iso: 'spa',
                languages: {
                    eng: 'English',
                    spa: 'Spanish'
                }
            },
            {
                localizedKeys: {
                    name: true
                },
                getLanguage: jest.fn(() => ({
                    iso: 'spa',
                    name: 'Spanish'
                })),
                getObject: jest.fn(() => ({
                    name: ['verde'],
                    uuid: '77394377-f6b8-4366-9bef-d468621258ef',
                    destination_node_uuid: 'bc978e00-2f3d-41f2-87c1-26b3f14e5925'
                })),
                localizedObject: {
                    name: ['verde'],
                    uuid: '77394377-f6b8-4366-9bef-d468621258ef',
                    destination_node_uuid: 'bc978e00-2f3d-41f2-87c1-26b3f14e5925'
                },
                iso: 'spa',
                languages: {
                    eng: 'English',
                    spa: 'Spanish'
                }
            },
            {
                localizedKeys: {
                    name: true
                },
                getLanguage: jest.fn(() => ({
                    iso: 'spa',
                    name: 'Spanish'
                })),
                getObject: jest.fn(() => ({
                    name: ['azul'],
                    uuid: '92d429d8-c275-4306-9360-93f4b9c7acb1',
                    destination_node_uuid: 'bc978e00-2f3d-41f2-87c1-26b3f14e5925'
                })),
                localizedObject: {
                    name: ['azul'],
                    uuid: '92d429d8-c275-4306-9360-93f4b9c7acb1',
                    destination_node_uuid: 'bc978e00-2f3d-41f2-87c1-26b3f14e5925'
                },
                iso: 'spa',
                languages: {
                    eng: 'English',
                    spa: 'Spanish'
                }
            },
            {
                localizedKeys: {},
                getLanguage: jest.fn(() => ({
                    iso: 'spa',
                    name: 'Spanish'
                })),
                getObject: jest.fn(() => ({
                    name: 'Indigo',
                    uuid: '2de9af80-1bd9-4f37-839f-073edbd14369',
                    destination_node_uuid: 'bc978e00-2f3d-41f2-87c1-26b3f14e5925'
                })),
                LocalizedObject: {
                    name: 'Indigo',
                    uuid: '2de9af80-1bd9-4f37-839f-073edbd14369',
                    destination_node_uuid: 'bc978e00-2f3d-41f2-87c1-26b3f14e5925'
                },
                iso: 'spa',
                languages: {
                    eng: 'English',
                    spa: 'Spanish'
                }
            },
            {
                localizedKeys: {},
                getLanguage: jest.fn(() => ({
                    iso: 'spa',
                    name: 'Spanish'
                })),
                getObject: jest.fn(() => ({
                    name: 'Violet',
                    uuid: '5760ec2f-04d4-492b-817b-9f395633ec79',
                    destination_node_uuid: 'bc978e00-2f3d-41f2-87c1-26b3f14e5925'
                })),
                localizedObject: {
                    name: 'Violet',
                    uuid: '5760ec2f-04d4-492b-817b-9f395633ec79',
                    destination_node_uuid: 'bc978e00-2f3d-41f2-87c1-26b3f14e5925'
                },
                iso: 'spa',
                languages: {
                    eng: 'English',
                    spa: 'Spanish'
                }
            },
            {
                localizedKeys: {},
                getLanguage: jest.fn(() => ({
                    iso: 'spa',
                    name: 'Spanish'
                })),
                addTranslation: jest.fn(() => ({
                    uuid: '326a41b7-9bce-453b-8783-1113f649663c',
                    name: 'Other',
                    destination_node_uuid: '4fac7935-d13b-4b36-bf15-98075dca822a'
                })),
                getObject: jest.fn(() => ({
                    uuid: '326a41b7-9bce-453b-8783-1113f649663c',
                    name: 'Other',
                    destination_node_uuid: '4fac7935-d13b-4b36-bf15-98075dca822a'
                })),
                localizedObject: {
                    uuid: '326a41b7-9bce-453b-8783-1113f649663c',
                    name: 'Other',
                    destination_node_uuid: '4fac7935-d13b-4b36-bf15-98075dca822a'
                },
                iso: 'spa',
                languages: {
                    eng: 'English',
                    spa: 'Spanish'
                }
            }
        ];

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

                const exits = node.exits.reduce((exits, { uuid: exitUUID, name: exitName }) => {
                    const localized = localizations.find(
                        (localizedObject: LocalizedObject) =>
                            localizedObject.getObject().uuid === exitUUID
                    );

                    if (localized) {
                        let value = '';

                        if ('name' in localized.localizedKeys) {
                            ({ name: value } = localized.getObject() as Exit);
                        }

                        exits.push(
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

                    return exits;
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

        // const SwitchFormWaitAdvanced = mount();

        /*
        TESTING GOALS:
        1. Render (Wait & Expression) standard/localized & advanced
        2. Form Elements themselves (CaseElements in this case)

        FIX: can't translated arguments in expression form for some reason

        gotta test case translation as well

        THEN: Fix Axios error (where does it come from?)
        */

        describe('render', () => {
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

                expect(getSpecWrapper(SwitchFormWaitBasic, 'name-field').props()).toEqual({
                    'data-spec': 'name-field',
                    name: 'Result Name',
                    showLabel: true,
                    value: props.node.router.result_name,
                    helpText:
                        'By naming the result, you can reference it later using @run.results.whatever_the_name_is',
                    ComponentMap: props.ComponentMap
                });

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

                getSpecWrapper(SwitchFormWaitTranslatingExits, 'exit-name').forEach((node, idx) =>
                    expect(node.text()).toBe(props.node.exits[idx].name)
                );

                getSpecWrapper(SwitchFormWaitTranslatingExits, 'localization-input').forEach(
                    (node, idx) => {
                        const exitUUID: string = props.node.exits[idx].uuid;
                        const placeholder: string = `${localizations[0].getLanguage().name} Translation`;
                        let value: string = '';
                        const localized = localizations
                            .find(
                                (localizedObject: LocalizedObject) =>
                                    localizedObject.getObject().uuid === exitUUID
                            );

                        if (localized) {
                            if ('name' in localized.localizedKeys) {
                                ({ name: value } = localized.getObject() as Exit);
                            }

                        expect(node.props()).toEqual({
                            'data-spec': 'localization-input',
                            name: exitUUID,
                            placeholder,
                            showLabel: false,
                            value,
                            ComponentMap: props.ComponentMap
                        });
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
        });
    });
});
