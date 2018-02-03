import * as React from 'react';
import { shallow, mount } from 'enzyme';
import CompMap from '../../services/ComponentMap';
import CaseElement, {
    prefix,
    composeExitName,
    getExitName,
    hasArgs
} from './CaseElement';
import { getSpecWrapper, titleCase } from '../../helpers/utils';
import { object } from 'prop-types';
import { getTypeConfig } from '../../providers/ConfigProvider/typeConfigs';
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

const config = getTypeConfig('wait_for_response');

describe('CaseElement >', () => {
    describe('helpers >', () => {
        describe('prefix >', () =>
            operatorConfigList.forEach(({ verboseName, type }) =>
                it(`should prefix "${
                    verboseName
                }" operator appropriately`, () =>
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
                        expect(composeExitName(type, argList)).toBe(
                            titleCase(firstArg)
                        );
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
    });

    describe('Component >', () => {
        const caseUUID = '29b18c7e-c232-414c-9fc0-2e0b6260d9ca';
        const onChange = jest.fn();
        const onRemove = jest.fn();
        const props = {
            name: `case_${caseUUID}`,
            kase: {
                uuid: caseUUID,
                type: 'has_any_word',
                exit_uuid: '38c1m4g4-b424-585d-8cgi-384d6260ymca'
            },
            exitName: 'Red, ',
            empty: true,
            onRemove,
            onChange,
            focusArgsInput: false,
            focusExitInput: false,
            ComponentMap,
            config
        };

        describe('render >', () => {
            it('should render empty case', () => {
                const EmptyCase = shallow(
                    <CaseElement {...{ ...props, exitName: '' }} />,
                    {
                        context
                    }
                );

                const {
                    onChangeOperator,
                    onChangeArguments,
                    onChangeExitName
                } = EmptyCase.instance() as any;

                expect(getSpecWrapper(EmptyCase, 'case-form').props()).toEqual(
                    expect.objectContaining({
                        name: props.name,
                        errors: [],
                        kaseError: false,
                        __className: 'group'
                    })
                );

                expect(
                    getSpecWrapper(EmptyCase, 'operator-list').props()
                ).toEqual(
                    expect.objectContaining({
                        options: operatorConfigList,
                        clearable: false,
                        name: 'operator',
                        optionClassName: 'operator',
                        labelKey: 'verboseName',
                        valueKey: 'type',
                        value: props.kase.type,
                        'data-spec': 'operator-list',
                        onChange: onChangeOperator
                    })
                );

                expect(getSpecWrapper(EmptyCase, 'args-input').props()).toEqual(
                    {
                        'data-spec': 'args-input',
                        name: 'arguments',
                        onChange: onChangeArguments,
                        value: '',
                        focus: props.focusArgsInput,
                        autocomplete: true,
                        ComponentMap,
                        showInvalid: false,
                        config
                    }
                );

                expect(getSpecWrapper(EmptyCase, 'exit-input').props()).toEqual(
                    {
                        'data-spec': 'exit-input',
                        name: 'exitName',
                        onChange: onChangeExitName,
                        value: '',
                        focus: props.focusExitInput,
                        ComponentMap,
                        showInvalid: false,
                        config
                    }
                );
            });

            cases.forEach((kase, idx) => {
                const caseProps = {
                    ...props,
                    name: `case_${kase.uuid}`,
                    kase,
                    exitName: exits[idx].name
                };
                const CaseWrapper = shallow(<CaseElement {...caseProps} />, {
                    context
                });

                it('should render FormElements with expected props', () =>
                    expect(
                        getSpecWrapper(CaseWrapper, 'case-form').props()
                    ).toEqual(
                        expect.objectContaining({
                            name: caseProps.name,
                            errors: []
                        })
                    ));

                it('should render operator lists w/ expected props', () =>
                    expect(
                        getSpecWrapper(CaseWrapper, 'operator-list').props()
                    ).toEqual(
                        expect.objectContaining({
                            value: kase.type
                        })
                    ));

                it('should render arguments inputs w/ expected props', () =>
                    expect(
                        getSpecWrapper(CaseWrapper, 'args-input').props()
                    ).toEqual(
                        expect.objectContaining({
                            value:
                                kase.arguments.constructor === Array
                                    ? kase.arguments[0]
                                    : kase.arguments
                        })
                    ));

                it('should render exit inputs w/ expected props', () =>
                    expect(
                        getSpecWrapper(CaseWrapper, 'exit-input').props()
                    ).toEqual(
                        expect.objectContaining({
                            value: caseProps.exitName || '',
                            focus: caseProps.focusExitInput
                        })
                    ));
            });
        });

        describe('instance methods >', () => {
            describe('onChangeOperator >', () => {
                const Case = mount(<CaseElement {...props} />, { context });
                const { onChangeOperator } = Case.instance() as any;
                const [anyWordOperator, allWordsOperator] = operatorConfigList;

                it("should update state operator config to the value it's passed if value is different than operatorConfig in state", () => {
                    onChangeOperator(allWordsOperator);
                    expect(Case.state('operatorConfig')).toEqual(
                        allWordsOperator
                    );
                });

                it("should update exitName if value it's passed is different than operatorConfig in state", () => {
                    onChangeOperator(anyWordOperator);
                    expect(Case.state('exitName')).toBe(
                        getExitName(
                            Case.state('exitName'),
                            anyWordOperator,
                            props.kase,
                            Case.state('arguments')
                        )
                    );
                });

                it('should call "onChange" prop after setting own state', () => {
                    onChangeOperator(allWordsOperator);
                    expect(onChange).toHaveBeenCalled();
                });
            });
        });
    });
});
