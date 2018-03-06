import * as React from 'react';
import { shallow, mount } from 'enzyme';
import { getSpecWrapper } from '../../utils';
import { DEFAULT_OPERAND, OPERAND_LOCALIZATION_DESC } from './constants';
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
import { Language } from '../LanguageSelector';
import { getBaseLanguage } from '../';
import { getTypeConfig, getOperatorConfig } from '../../config';

const colorsFlow = require('../../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const { languages, endpoints } = require('../../../assets/config');
const { results: [{ definition }] } = colorsFlow;
const {
    nodes: [replyNode, switchNodeMsg, switchNodeExp, , , switchNodeGroup],
    localization: locals
} = definition;

describe('SwitchRouter >', () => {
    const baseLanguage = getBaseLanguage(languages);
    const msgRouterConfig = getTypeConfig('wait_for_response');
    const expRouterConfig = getTypeConfig('split_by_expression');
    const groupRouterConfig = getTypeConfig('split_by_group');
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
            const getOperandsForLocalizationSpy = jest.spyOn(
                SwitchRouterForm.prototype,
                'getOperandsForLocalization'
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
                OPERAND_LOCALIZATION_DESC
            );
            expect(getOperandsForLocalizationSpy).toHaveBeenCalled();

            getOperandsForLocalizationSpy.mockRestore();
        });
    });

    describe('instance methods >', () => {
        describe('getOperandsForLocalization >', () => {
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

                        const { verboseName } = getOperatorConfig(kase.type);

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
