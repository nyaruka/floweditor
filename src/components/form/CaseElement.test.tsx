import * as React from 'react';
import { mount } from 'enzyme';
import CompMap from '../../services/ComponentMap';
import CaseElement, { prefix, composeExitName, getExitName } from './CaseElement';
import { getSpecWrapper } from '../../helpers/utils';
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

describe('Component: CaseElement', () => {
    describe('render', () => {
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

            const EmptyCase = mount(<CaseElement {...props} />, { context });

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
                    onChange: EmptyCase.instance().onChangeOperator
                })
            );

            expect(getSpecWrapper(EmptyCase, 'args-input').props()).toEqual({
                'data-spec': 'args-input',
                name: 'arguments',
                onChange: EmptyCase.instance().onChangeArguments,
                value: '',
                focus: props.focusArgsInput,
                autocomplete: true,
                ComponentMap
            });

            expect(getSpecWrapper(EmptyCase, 'exit-input').props()).toEqual({
                'data-spec': 'exit-input',
                name: 'exitName',
                onChange: EmptyCase.instance().onChangeExitName,
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

            const CaseWrapper = mount(<CaseElement {...props} />, {
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

    describe('helpers', () => {
        describe('prefix', () =>
            operatorConfigList.forEach(({ verboseName, type }) =>
                it(`should prefix '${verboseName}' operator appropriately`, () =>
                    expect(prefix(type)).toMatchSnapshot())
            ));

        describe('composeExitName', () => {
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
                        expect(composeExitName(type, argList)).toBe(
                            firstArg.charAt(0).toUpperCase() + firstArg.slice(1)
                        );
                    })
                );
            });
        });

        describe('getExitName', () => {
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
                        type,
                        operatorConfig,
                        kase
                    )
                ).toBe(expectedExitName));
        });
    });
});
