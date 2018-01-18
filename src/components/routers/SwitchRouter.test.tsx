import * as React from 'react';
import { shallow, mount } from 'enzyme';
import { getSpecWrapper, snakify } from '../../helpers/utils';
import Config from '../../providers/ConfigProvider/configContext';
import SwitchRouterForm, {
    getListStyle,
    getItemStyle,
    composeExitMap,
    resolveExits,
    SwitchRouterState,
    WAIT_LABEL,
    FIELD_LABEL,
    EXPRESSION_LABEL,
    OPERATOR_LOCALIZATION_LEGEND,
    parseFieldName,
    isSwitchRouterNode,
    hasCases,
    composeCaseProps,
} from './SwitchRouter';
import CompMap, { SearchResult } from '../../services/ComponentMap';
import { LocalizedObject } from '../../services/Localization';
import { Exit, Case, ContactField, SwitchRouter } from '../../flowTypes';
import { getLocalizations } from '../Node';
import NodeEditor from '../NodeEditor/NodeEditor';
import { Language } from '../LanguageSelector';

const colorsFlow = require('../../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const fieldsResp = require('../../../assets/fields.json');

const { results: [{ definition }] } = colorsFlow;
const {
    nodes: [replyNode, switchNodeMsg, switchNodeExp, , , , switchNodeField],
    localization: locals
} = definition;

describe('SwitchRouter >', () => {
    const {
        baseLanguage,
        languages,
        getTypeConfig,
        getOperatorConfig,
        operatorConfigList,
        endpoints
    } = Config;

    const config = getTypeConfig('wait_for_response');
    const ComponentMap = new CompMap(definition);
    const iso = 'spa';
    const translations = locals[iso];
    const localizations = getLocalizations(switchNodeMsg, iso, languages, translations);

    const fieldRouterConfig = getTypeConfig('contact_field');
    const expRouterConfig = getTypeConfig('expression');

    const nodeEditorContext = {
        getTypeConfig
    };

    const getFieldsMock = jest.fn(() => Promise.resolve(fieldsResp));

    const switchRouterContext = {
        getOperatorConfig,
        operatorConfigList,
        endpoints,
        getFields: getFieldsMock
    };

    const placeholder = `${localizations[0].getLanguage().name} Translation`;

    const spanish: Language = { name: 'Spanish', iso: 'spa' };

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
        translating: false,
        updateLocalizations: jest.fn(),
        getLocalizedExits: jest.fn(),
        getExitTranslations: jest.fn()
    };

    const switchPropsTranslating = {
        ...switchProps,
        translating: true,
        language: spanish,
        localizations,
        getExitTranslations,
        getLocalizedExits
    };

    const expRouterProps = {
        ...switchProps,
        node: switchNodeExp,
        config: expRouterConfig
    };

    const fieldRouterProps = {
        ...switchProps,
        node: switchNodeField,
        config: fieldRouterConfig
    };

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
        describe('resolveExits >', () => {
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

            const expRouterNode = {
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

            it('should resolve exits', () =>
                expect(resolveExits(newCases, expRouterNode, expRouterConfig)).toMatchSnapshot());

            it("should give default exit the name 'Any Value' when router is passive", () =>
                expect(
                    resolveExits([], { ...expRouterNode, wait: { type: 'exp' } }, expRouterConfig)
                ).toMatchSnapshot());
        });

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

        describe('parseFieldName >', () =>
            it('should parse field name from contac field operand', () => {
                expect(parseFieldName('@contact.some_field_name')).toBe('some field name');
                expect(parseFieldName('@contact.field')).toBe('field');
            }));

        describe('isSwitchRouterNode >', () => {
            it('should return true if node has a switch router', () =>
                expect(isSwitchRouterNode(switchNodeMsg)).toBeTruthy());

            it("should return false if node doesn't have a switch router", () =>
                expect(isSwitchRouterNode(replyNode)).toBeFalsy());
        });

        describe('hasCases >', () => {
            it('should return true if node has cases', () => {
                expect(hasCases(switchNodeExp)).toBeTruthy();
            });

            it('should return false if node does not have cases', () => {
                expect(
                    hasCases({ ...switchNodeExp, router: { ...switchNodeExp.router, cases: [] } })
                ).toBeFalsy();
            });
        });

        describe('composeCaseProps >', () => {
            it('should compose a list of CaseElementProp objects', () => {
                const wrapper = shallow(<SwitchRouterForm {...switchProps} />, {
                    context: switchRouterContext
                });

                expect(
                    composeCaseProps(
                        switchNodeMsg,
                        wrapper.instance().onCaseChanged,
                        wrapper.instance().onCaseRemoved
                    )
                ).toMatchSnapshot();
            });
        });
    });

    describe('render >', () => {
        it('should render wait_for_response form', () => {
            const wrapper = mount(<SwitchRouterForm {...switchProps} />, {
                context: switchRouterContext
            });

            // Cases
            expect(getSpecWrapper(wrapper, 'case').length).toBe(8);

            expect(getSpecWrapper(wrapper, 'case-draggable').length).toBe(7);

            expect(
                getSpecWrapper(wrapper, 'case')
                    .last()
                    .prop('empty')
            ).toBeTruthy();

            // Fields
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

            expect(getSpecWrapper(wrapper, 'lead-in').text()).toBe(WAIT_LABEL);
        });

        it('should render wait_for_response form (translating)', () => {
            const wrapper = mount(<SwitchRouterForm {...switchPropsTranslating} />, {
                context: switchRouterContext
            });

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

        it('should render expression form', () => {
            const wrapper = mount(<SwitchRouterForm {...expRouterProps} />, {
                context: switchRouterContext
            });

            const leadInWrapper = getSpecWrapper(wrapper, 'lead-in');

            expect(leadInWrapper.find('p').text()).toBe(EXPRESSION_LABEL);

            expect(leadInWrapper.find('TextInputElement').props()).toEqual(
                expect.objectContaining({
                    name: 'Expression',
                    showLabel: false,
                    value: '@run.results.color',
                    onChange: wrapper.instance().onExpressionChanged,
                    autocomplete: true,
                    required: true,
                    ComponentMap: switchProps.ComponentMap
                })
            );
        });

        it("should render contact field form label, container when config type is 'contact_field'", () => {
            const wrapper = mount(<SwitchRouterForm {...fieldRouterProps} />, {
                context: switchRouterContext
            });

            expect(wrapper.find('.select-medium').exists()).toBeTruthy();
            expect(wrapper.find('.fieldsText').text()).toBe(FIELD_LABEL);
            expect(wrapper.find('.fieldsText').hasClass('fieldsText')).toBeTruthy();
        });

        it("should update 'field' state to first field in fetched fields list if config type is config is 'contact_field' and node doesn't yet exist or existing node's router doesn't contain a contact field operand", () => {
            const wrapper = mount(
                <SwitchRouterForm {...{ ...expRouterProps, config: fieldRouterConfig }} />,
                {
                    context: switchRouterContext
                }
            );

            getFieldsMock().then(() =>
                expect(wrapper.state('field')).toEqual(fieldsResp.results[0])
            );
        });

        it("should update 'field' state to the field that matches router's operand if config type is 'contact_field' and existing node's operand is a contact field", () => {
            const wrapper = mount(
                <SwitchRouterForm {...{ ...expRouterProps, config: fieldRouterConfig }} />,
                {
                    context: switchRouterContext
                }
            );

            getFieldsMock().then(() => expect(wrapper.state('field')).toBe(fieldsResp.results[1]));
        });

        it("generate contact field operand, update state when config type is 'contact_field' if node doesn't yet exist or existing node's router doesn't contain a contact field operand", () => {
            const wrapper = mount(
                <SwitchRouterForm {...{ ...expRouterProps, config: fieldRouterConfig }} />,
                {
                    context: switchRouterContext
                }
            );

            getFieldsMock().then(() =>
                expect(wrapper.state('operand')).toEqual(
                    `@contact.${snakify(fieldsResp.results[0].name)}`
                )
            );
        });

        it('should use existing contact field operand, update state if node exists and its router contains a contact field operand', () => {
            const wrapper = mount(<SwitchRouterForm {...fieldRouterProps} />, {
                context: switchRouterContext
            });

            getFieldsMock().then(() =>
                expect(wrapper.state('operand')).toEqual(fieldRouterProps.node.router.operand)
            );
        });

        it('should render advanced form (translating case args)', () => {
            const wrapper = mount(
                <SwitchRouterForm {...{ ...switchPropsTranslating, showAdvanced: true }} />,
                {
                    context: switchRouterContext
                }
            );

            expect(getSpecWrapper(wrapper, 'advanced-title').text()).toBe('Rules');
            expect(getSpecWrapper(wrapper, 'advanced-instructions').text()).toBe(
                OPERATOR_LOCALIZATION_LEGEND
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

    describe('instance methods >', () => {
        const [{ name, uuid, type }]: ContactField[] = fieldsResp.results;

        const initialField: SearchResult = { name, id: uuid, type };

        const initialOperand: string = `@contact.${snakify(initialField.name)}`;

        const initialState: Pick<SwitchRouterState, 'field' | 'operand'> = {
            field: initialField,
            operand: initialOperand
        };

        describe('onSelectField', () => {
            it("change 'field' state to selected field", () => {
                const wrapper = mount(<SwitchRouterForm {...fieldRouterProps} />, {
                    context: switchRouterContext
                });

                getFieldsMock().then(() => {
                    expect(wrapper.state()).toEqual(expect.objectContaining(initialState));

                    wrapper.instance().onSelectField(initialField);

                    expect(wrapper.state('field')).toEqual(initialField);
                });
            });
        });
    });
});
