import * as React from 'react';
import CaseElement, {
    composeExitName,
    getMinMax,
    isFloat,
    isInt,
    parseNum,
    prefix,
    strContainsNum
} from '~/components/flow/routers/case/CaseElement';
import { getTypeConfig, operatorConfigList } from '~/config';
import { Operators } from '~/config/operatorConfigs';
import { Types } from '~/config/typeConfigs';
import { titleCase } from '~/utils';

const definition = require('~/test/assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const {
    nodes: [, node]
} = definition;
const {
    router: { cases },
    exits
} = node;

const config = getTypeConfig(Types.wait_for_response);

describe(CaseElement.name, () => {
    describe('helpers', () => {
        describe('prefix', () =>
            operatorConfigList.forEach(({ verboseName, type }) =>
                it(`should prefix "${verboseName}" operator appropriately`, () => {
                    if (verboseName) {
                        expect(prefix(type)).toMatchSnapshot();
                    }
                })
            ));

        describe('composeExitName', () => {
            const operatorType = Operators.has_any_word;
            const strArgOperators = operatorConfigList.slice(0, 6);
            let args = [['tomato, t'], ['papayawhip'], []];

            it('should handle empty arg lists appropriately', () =>
                expect(composeExitName(operatorType, args[2], '')).toBe(''));

            it('should return the first arg in list, capitalized', () => {
                args = args.slice(0, 2);
                strArgOperators.forEach(({ type }) =>
                    args.slice(0, 2).forEach(argList => {
                        const [firstArg] = argList[0].split(',');
                        expect(composeExitName(type, argList, '')).toBe(titleCase(firstArg));
                    })
                );
            });

            it('should return exit name in the format "min - max" if operator', () => {
                [['1', '2'], ['', '2'], ['1', ''], []].forEach(argList => {
                    expect(
                        composeExitName(Operators.has_number_between, argList, '').indexOf('-') > -1
                    ).toBeTruthy();
                });
            });

            it("should return newExitName if it's truthy and operator is 'has_number_between'", () => {
                expect(composeExitName(Operators.has_number_between, ['1', '2'], 'Violet')).toBe(
                    'Violet'
                );
            });
        });

        describe('getMinMax', () => {
            const emptyStrs = { min: '', max: '' };

            it('should return emtpy strings if arg param is an empty array', () => {
                expect(getMinMax([])).toEqual(emptyStrs);
            });

            it("should return empty strings if arg param doesn't contain two number-containing strings", () => {
                expect(getMinMax(['a', 'b'])).toEqual(emptyStrs);
            });

            it('should return a number-containing string MIN and empty string MAX if first arg is a number-containing string and second arg is not', () => {
                expect(getMinMax(['1', 'b'])).toEqual({ min: '1', max: '' });
            });

            it('should return an empty string MIN and number-containing string MAX if first arg is not a number-containing string and second arg is', () => {
                expect(getMinMax(['a', '2'])).toEqual({ min: '', max: '2' });
            });
        });

        describe('isFloat', () => {
            it('should return true if argument is string containing a float', () => {
                ['0.2', '.2', '+.2', '+0.2', '-.2', '-0.2', '2', '2.'].forEach(arg =>
                    expect(isFloat(arg as any)).toBeTruthy()
                );
            });

            it('should return false if argument is not a string containing a float', () => {
                ['u.2', '0.2u', 'a'].forEach(arg => expect(isFloat(arg as any)).toBeFalsy());
            });
        });

        describe('isInt', () => {
            it('should return true if argument is string containing an int', () => {
                ['1', '+1', '-1'].forEach(arg => expect(isInt(arg)).toBeTruthy());
            });

            it('should return false if argument is not a string containing an int', () => {
                ['0.1', 'e24', '-.3', '5+', '5-', 'a'].forEach(arg =>
                    expect(isInt(arg)).toBeFalsy()
                );
            });
        });

        describe('strContainsNum', () => {
            it('should return true if string contains only a float or int', () => {
                ['0.2', '.2', '+.2', '+0.2', '-.2', '-0.2', '2', '2.', '1', '+1', '-1'].forEach(
                    arg => expect(strContainsNum(arg)).toBeTruthy()
                );
            });

            it('should return false if string does not contain only a float or int', () => {
                ['a', 'e24', '2a', '0.2u', 'u.2', 'u0.2'].forEach(arg =>
                    expect(strContainsNum(arg)).toBeFalsy()
                );
            });
        });

        describe('parseNum', () => {
            it('should return a float if passed a string containing only a float', () => {
                const float = parseNum('0.2');

                expect(typeof float === 'number' && isFinite(float)).toBeTruthy();
            });

            it('should return an int if passed a string containing only an int', () => {
                const int = parseNum('1');

                expect(typeof int === 'number' && isFinite(int)).toBeTruthy();
            });
        });
    });

    describe('Component', () => {
        const caseUUID = '29b18c7e-c232-414c-9fc0-2e0b6260d9ca';
        const onChange = jest.fn();
        const onRemove = jest.fn();
        const props = {
            name: `case_${caseUUID}`,
            kase: {
                uuid: caseUUID,
                type: Operators.has_any_word,
                exit_uuid: '38c1m4g4-b424-585d-8cgi-384d6260ymca'
            },
            exitName: 'Red, ',
            empty: true,
            onRemove,
            onChange,
            focusArgsInput: false,
            focusExitInput: false,
            config
        };

        describe('render', () => {
            it('should render empty case', () => {
                /*const EmptyCase = shallow(<CaseElement {...{ ...props, exitName: '' }} />);

                const {
                    onChangeOperator,
                    onChangeArguments,
                    onChangeExitName
                } = EmptyCase.instance() as any;

                expect(getSpecWrapper(EmptyCase, 'case-form').props()).toEqual(
                    expect.objectContaining({
                        name: props.name,
                        kaseError: false,
                        __className: 'group'
                    })
                );

                expect(getSpecWrapper(EmptyCase, 'operator-list').props()).toEqual(
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
                );*/
            });

            /*cases.forEach((kase: any, idx: number) => {
                const caseProps = {
                    ...props,
                    name: `case_${kase.uuid}`,
                    kase,
                    exitName: exits[idx].name
                };
                const CaseWrapper = shallow(<CaseElement {...caseProps} />);

                it('should render FormElements with expected props', () =>
                    expect(getSpecWrapper(CaseWrapper, 'case-form').props()).toEqual(
                        expect.objectContaining({
                            name: caseProps.name
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
                            entry: {
                                value:
                                    kase.arguments.constructor === Array
                                        ? kase.arguments[0]
                                        : kase.arguments
                            }
                        })
                    ));

                it('should render exit inputs w/ expected props', () =>
                    expect(getSpecWrapper(CaseWrapper, 'exit-input').props()).toEqual(
                        expect.objectContaining({
                            entry: { value: caseProps.exitName || '' }
                        })
                    ));
            });*/
        });
    });
});
