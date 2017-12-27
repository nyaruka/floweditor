import * as React from 'react';
import { shallow } from 'enzyme';
import CompMap from '../../services/ComponentMap';
import CaseElement, {
    prefix,
    composeExitName,
    getExitName,
    hasArgs,
    getArgsEle,
    getDndIco,
    getRemoveIco
} from './CaseElement';
import { getSpecWrapper, titleCase } from '../../helpers/utils';
import {
    operatorConfigList,
    getOperatorConfig
} from '../../providers/ConfigProvider/operatorConfigs';

const {
    results: [{ definition }]
} = require('../../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const { nodes: [, node] } = definition;
const { router: { cases }, exits } = node;

const context = {
    operatorConfigList,
    getOperatorConfig
};

const ComponentMap = new CompMap(definition);

describe('CaseElement >', () => {
    describe('helpers >', () => {
        describe('prefix >', () =>
            operatorConfigList.forEach(({ verboseName, type }) =>
                it(`should prefix "${verboseName}" operator appropriately`, () =>
                    expect(prefix(type)).toMatchSnapshot())
            ));

        describe('composeExitName >', () => {
            const operatorType = 'has_any_word';
            const strArgOperators = operatorConfigList.slice(0, 6);
            let args = [['tomato, t'], ['papayawhip'], []];

            it('should handle empty arg lists appropriately', () =>
                expect(composeExitName(operatorType, args[2])).toBe(''));

            it('should return the first arg in list, capitalized', () => {
                args = args.slice(0, 2);
                strArgOperators.forEach(({ type }) =>
                    args.slice(0, 2).forEach(argList => {
                        const [firstArg] = argList[0].split(',');
                        expect(composeExitName(type, argList)).toBe(titleCase(firstArg));
                    })
                );
            });
        });

        describe('getExitName >', () => {
            const type = 'has_value';
            const kase = {
                uuid: 'fa0a9b24-5f19-4b8e-b287-27af5811de1d',
                type,
                exit_uuid: '55855afc-f612-4ef9-9288-dcb1dd136052'
            };
            const operatorConfig = getOperatorConfig(type);
            const { categoryName: expectedExitName } = operatorConfig;

            it("should return a given operator's default category name if it has one", () =>
                // prettier-ignore
                expect(
                    getExitName(
                        'somePerhapsPreExistingExitName',
                        operatorConfig,
                        kase
                    )
                ).toBe(expectedExitName));
        });

        describe('hasArgs >', () =>
            it(`should reflect the presence of an arguments array in the passed object's "arguments" property`, () => {
                expect(hasArgs(['tomato, t'])).toBeTruthy();
                expect(hasArgs([])).toBeFalsy();
                expect(hasArgs()).toBeFalsy();
            }));

        describe('getArgsEle >', () => {
            const type = 'has_any_word';
            const kase = {
                uuid: 'fa0a9b24-5f19-4b8e-b287-27af5811de1d',
                type,
                exit_uuid: '55855afc-f612-4ef9-9288-dcb1dd136052'
            };
            const operatorConfig = getOperatorConfig(type);
            const args = ['tomato, t'];
            const ArgsInput = shallow(
                getArgsEle(operatorConfig, args, () => {}, false, ComponentMap)
            );

            it('should return a TextInputElement w/ appropriate props when passed an operator config that has 1 or more operands', () =>
                expect(getSpecWrapper(ArgsInput, 'input').props()).toEqual(
                    expect.objectContaining({
                        value: args[0]
                    })
                ));
        });

        describe('getDndIco >', () => {
            it('should return a drag-and-drop icon if both "empty" and "solo" arguments are falsy', () =>
                expect(getDndIco(undefined, undefined)).toMatchSnapshot());

            it('should return an empty div if either argument is truthy', () =>
                expect(getDndIco(true, true)).toMatchSnapshot());
        });

        describe('getRemoveIco', () =>
            it('should return a remove icon if passed a falsy "empty" argument', () =>
                expect(getRemoveIco()).toMatchSnapshot()));
    });

    describe('Component >', () => {
        describe('render >', () => {
            it('should render empty case', () => {
                const uuid = '29b18c7e-c232-414c-9fc0-2e0b6260d9ca';
                const props = {
                    name: `case_${uuid}`,
                    kase: {
                        uuid,
                        type: 'has_any_word',
                        exit_uuid: null
                    },
                    exitName: null,
                    emtpy: true,
                    onRemove: jest.fn(),
                    onChanged: jest.fn(),
                    focusArgsInput: false,
                    focusExitInput: false,
                    ComponentMap
                };
                const EmptyCase = shallow(<CaseElement {...props} />, { context });
                const {
                    onChangeOperator,
                    onChangeArguments,
                    onChangeExitName
                } = EmptyCase.instance() as any;

                expect(getSpecWrapper(EmptyCase, 'case-form').props()).toEqual(
                    expect.objectContaining({
                        name: props.name,
                        errors: [],
                        case: true
                    })
                );

                expect(getSpecWrapper(EmptyCase, 'operator-list').props()).toEqual(
                    expect.objectContaining({
                        options: operatorConfigList,
                        clearable: false,
                        name: 'operator',
                        searchable: false,
                        optionClassName: 'operator',
                        labelKey: 'verboseName',
                        valueKey: 'type',
                        value: props.kase.type,
                        'data-spec': 'operator-list',
                        onChange: onChangeOperator
                    })
                );

                expect(getSpecWrapper(EmptyCase, 'args-input').props()).toEqual({
                    'data-spec': 'args-input',
                    name: 'arguments',
                    onChange: onChangeArguments,
                    value: '',
                    focus: props.focusArgsInput,
                    autocomplete: true,
                    ComponentMap
                });

                expect(getSpecWrapper(EmptyCase, 'exit-input').props()).toEqual({
                    'data-spec': 'exit-input',
                    name: 'exitName',
                    onChange: onChangeExitName,
                    value: props.exitName ? props.exitName : '',
                    focus: props.focusExitInput,
                    ComponentMap
                });
            });

            cases.forEach((kase, idx) => {
                const props = {
                    name: `case_${kase.uuid}`,
                    kase,
                    exitName: exits[idx].name,
                    onRemove: jest.fn(),
                    onChanged: jest.fn(),
                    focusArgsInput: false,
                    focusExitInput: false,
                    ComponentMap
                };
                const CaseWrapper = shallow(<CaseElement {...props} />, {
                    context
                });

                it('should render FormElements with expected props', () =>
                    expect(getSpecWrapper(CaseWrapper, 'case-form').props()).toEqual(
                        expect.objectContaining({
                            name: props.name,
                            errors: []
                        })
                    ));

                it('should render operator lists w/ expected props', () =>
                    expect(getSpecWrapper(CaseWrapper, 'operator-list').props()).toEqual(
                        expect.objectContaining({
                            value: kase.type
                        })
                    ));

                it('should render arguments inputs w/ expected props', () =>
                    expect(getSpecWrapper(CaseWrapper, 'args-input').props()).toEqual(
                        expect.objectContaining({
                            value:
                                kase.arguments.constructor === Array
                                    ? kase.arguments[0]
                                    : kase.arguments
                        })
                    ));

                it('should render exit inputs w/ expected props', () =>
                    expect(getSpecWrapper(CaseWrapper, 'exit-input').props()).toEqual(
                        expect.objectContaining({
                            value: props.exitName ? props.exitName : '',
                            focus: props.focusExitInput
                        })
                    ));
            });
        });
    });
});
