import * as config from '../../../assets/config';
import { AttributeType, ResultType } from '../../flowTypes';
import { SearchResult } from '../../store';
import { createSetup, createSpy } from '../../testUtils';
import { getSelectClass } from '../../utils';
import { V4_UUID } from '../../utils';
import {
    AttribElement,
    AttribElementProps,
    CREATE_PROMPT,
    attribExists,
    fieldNameValid,
    NOT_FOUND,
    PLACEHOLDER,
    isValidNewOption,
    isOptionUnique,
    createNewOption
} from './AttribElement';

const initial: SearchResult = {
    id: 'name',
    name: 'Name',
    type: AttributeType.property
};

const baseProps: AttribElementProps = {
    name: 'Attribute',
    contactFields: [],
    initial,
    endpoint: config.endpoints.fields
};

const setup = createSetup<AttribElementProps>(AttribElement, baseProps);

const spyOn = createSpy(AttribElement);

describe(`${AttribElement.name}`, () => {
    describe('helpers', () => {
        describe('attribExists', () => {
            const matchingOptions = [
                {
                    name: 'Expected Delivery Date',
                    id: 'expected_delivery_date',
                    type: 'field'
                }
            ];

            it('should return true if field exists in matching options provided by react-select', () => {
                expect(attribExists('expected delivery date', matchingOptions)).toBeTruthy();
            });

            it('should return false if field does not exist in matching options provided by react-select', () => {
                expect(attribExists('national id', [])).toBeFalsy();
                expect(attribExists('national id', matchingOptions)).toBeFalsy();
            });
        });

        describe('fieldNameValid', () => {
            it('should return true if field name is valid', () => {
                expect(fieldNameValid('Age')).toBeTruthy();
            });

            it('should return false if field name invalid', () => {
                expect(fieldNameValid('')).toBeFalsy();
                expect(
                    fieldNameValid('pneumonoultramicroscopicsilicovolcanoconiosis ')
                ).toBeFalsy();
                expect(fieldNameValid('Age$')).toBeFalsy();
            });
        });

        describe('isOptionUnique', () => {
            const isOptionUniqueSignature = {
                labelKey: 'name',
                valueKey: 'id',
                options: []
            };

            it('should return true if new option is unique', () => {
                const newOption = {
                    id: '2e020526-06a7-4acc-8f3f-90b4ceffdd91',
                    name: 'Age',
                    type: AttributeType.field
                };

                expect(
                    isOptionUnique({
                        ...isOptionUniqueSignature,
                        option: newOption
                    })
                ).toBeTruthy();
            });

            it('should return false if new option is not unique', () => {
                const newOption = {
                    id: 'name',
                    name: 'Name',
                    type: AttributeType.property
                };

                expect(
                    isOptionUnique({
                        ...isOptionUniqueSignature,
                        option: newOption
                    })
                ).toBeFalsy();
            });
        });

        describe('createNewOption', () => {
            it('should return a new SearchResult', () => {
                const newOption = { label: 'Age', labelKey: 'name', valueKey: 'id' };

                expect(createNewOption(newOption)).toEqual({
                    id: expect.stringMatching(V4_UUID),
                    name: newOption.label,
                    type: AttributeType.field,
                    extraResult: true
                });
            });
        });
    });

    describe('render', () => {
        it('should render self, children with base props', () => {
            const {
                wrapper,
                instance,
                props: { showLabel, name, helpText, endpoint, contactFields }
            } = setup({}, true);

            expect(wrapper.find('FormElement').props()).toEqual(
                expect.objectContaining({
                    showLabel,
                    name,
                    helpText,
                    errors: [],
                    attribError: false
                })
            );
            expect(wrapper.find('SelectSearch').props()).toEqual(
                expect.objectContaining({
                    __className: getSelectClass(0),
                    onChange: instance.onChange,
                    name,
                    url: endpoint,
                    resultType: ResultType.field,
                    localSearchOptions: contactFields,
                    multi: false,
                    initial: [initial],
                    closeOnSelect: true,
                    searchPromptText: NOT_FOUND,
                    placeholder: PLACEHOLDER
                })
            );
            expect(wrapper).toMatchSnapshot();
        });

        it('should pass createOptions to SelectSearch', () => {
            const { wrapper } = setup({ add: true }, true);

            expect(wrapper.find('SelectSearch').props()).toEqual(
                expect.objectContaining({
                    isValidNewOption,
                    isOptionUnique,
                    createNewOption,
                    createPrompt: CREATE_PROMPT
                })
            );
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('instance methods', () => {
        const existingField: SearchResult = {
            id: '2003ec76-69e3-455e-a603-938ad90cb53f',
            name: 'National ID',
            type: AttributeType.field
        };

        describe('onChange', () => {
            it('should set state if attribute is new', () => {
                const setStateSpy = spyOn('setState');
                const { wrapper, instance } = setup({}, true);

                instance.onChange(existingField);

                expect(setStateSpy).toHaveBeenCalledTimes(1);
                expect(setStateSpy).toHaveBeenCalledWith({ attribute: existingField });

                setStateSpy.mockRestore();
            });

            it('should not set state if attribute is not new', () => {
                const setStateSpy = spyOn('setState');
                // tslint:disable-next-line:no-shadowed-variable
                const { wrapper, instance, props: { initial } } = setup({}, true);

                instance.onChange(initial);

                expect(setStateSpy).toHaveBeenCalledTimes(0);

                setStateSpy.mockRestore();
            });
        });

        describe('getErrors', () => {
            it('should return list of errors', () => {
                const { wrapper, instance, props: { name } } = setup(
                    { required: true, initial: { ...initial, name: '' } },
                    true
                );

                expect(instance.getErrors()).toEqual([`${name} is required.`]);
            });

            it('should return an empty list', () => {
                const { wrapper, instance } = setup({}, true);

                expect(instance.getErrors()).toEqual([]);
            });
        });

        describe('updateErrorState', () => {
            it('should set state', () => {
                const setStateSpy = spyOn('setState');
                const { wrapper, instance } = setup({}, true);
                const oldErrorState = [];
                const newErrorState = [`${name} is required.`];

                instance.updateErrorState(newErrorState);

                expect(setStateSpy).toHaveBeenCalledTimes(1);
                expect(setStateSpy).toHaveBeenCalledWith({ errors: newErrorState });

                setStateSpy.mockRestore();
            });
        });

        describe('validate', () => {
            it('should return true if control does not contain errors', () => {
                const updateErrorStateSpy = spyOn('updateErrorState');
                const { wrapper, instance } = setup({}, true);

                expect(instance.validate()).toBeTruthy();
                expect(updateErrorStateSpy).toHaveBeenCalledTimes(1);
                expect(updateErrorStateSpy).toHaveBeenCalledWith([]);

                updateErrorStateSpy.mockRestore();
            });

            it('should return false if control contains errors', () => {
                const updateErrorStateSpy = spyOn('updateErrorState');
                const { wrapper, instance, props: { name } } = setup(
                    {
                        initial: { ...initial, name: '' },
                        required: true
                    },
                    true
                );

                expect(instance.validate()).toBeFalsy();
                expect(updateErrorStateSpy).toHaveBeenCalledTimes(1);
                expect(updateErrorStateSpy).toHaveBeenCalledWith([`${name} is required.`]);

                updateErrorStateSpy.mockRestore();
            });
        });
    });
});
