import * as React from 'react';
import { mount } from 'enzyme';
import FieldElement, {
    FieldElementProps,
    isValidNewOption,
    createNewOption,
    RESULT_TYPE_FIELD
} from './FieldElement';
import Config from '../../providers/ConfigProvider/configContext';
import { FIELD_PLACEHOLDER, FIELD_NOT_FOUND } from '../routers/SwitchRouter';
import { SearchResult } from '../../services/ComponentMap';
import { validUUID } from '../../helpers/utils';

const { results: fieldsResp } = require('../../../assets/fields.json');

describe('FieldElement >', () => {
    const onChangeMock = jest.fn();

    const props: FieldElementProps = {
        name: 'Field',
        endpoint: Config.endpoints.fields,
        placeholder: FIELD_PLACEHOLDER,
        searchPromptText: FIELD_NOT_FOUND,
        required: true,
        onChange: onChangeMock
    };

    const fieldOptions: SearchResult[] = fieldsResp.map(({ name, uuid, type }) => ({
        name,
        id: uuid,
        type
    }));

    describe('helpers >', () => {
        const newField: { label: string } = { label: 'new field' };

        describe('isValidNewOption >', () => {
            it('should return false if new option is invalid', () => {
                expect(isValidNewOption({ label: '$$$' })).toBeFalsy();
            });

            it('should return true if new option is valid', () => {
                expect(isValidNewOption(newField)).toBeTruthy();
            });
        });

        describe('createNewOption >', () => {
            it('should generate a new search result object', () => {
                const newOption: SearchResult = createNewOption(newField);

                expect(validUUID(newOption.id)).toBeTruthy();
                expect(newOption.name).toBe(newField.label);
                expect(newOption.extraResult).toBeTruthy();
            });
        });
    });

    describe('render >', () => {
        describe('split by contact field >', () => {
            it('should render <SelectSearch />, pass it expected props', () => {
                const wrapper = mount(<FieldElement {...props} />);

                expect(wrapper.find('SelectSearch').props()).toEqual({
                    className: '',
                    initial: [],
                    localSearchOptions: undefined,
                    multi: false,
                    name: props.name,
                    onChange: wrapper.instance().onChange,
                    placeholder: props.placeholder,
                    resultType: RESULT_TYPE_FIELD,
                    searchPromptText: props.searchPromptText,
                    url: props.endpoint
                });
            });
        });
    });

    describe('instance methods >', () => {
        describe('componentWillReceiveProps >', () => {
            it("should update state if next 'initial' prop is different than existing version", () => {
                const wrapper = mount(<FieldElement {...props} />);

                wrapper.setProps({ initial: fieldOptions[1]});

                expect(wrapper.state('field')).toEqual(fieldOptions[1]);
            })
        })

        describe('onChange >', () => {
            it('should update state when called', () => {
                const wrapper = mount(<FieldElement {...props} />);

                wrapper.instance().onChange([fieldOptions[1]]);

                expect(wrapper.state('field')).toEqual(fieldOptions[1]);
            });

            it("should call 'onChange' prop if passed", () => {
                const onChange = jest.fn();
                const wrapper = mount(<FieldElement {...{ ...props, onChange }} />);

                wrapper.instance().onChange([fieldOptions[1]]);

                expect(onChange).toHaveBeenCalled();
            });
        });

        describe('validate >', () => {
            it("should return false, update state if FieldElement isn't valid", () => {
                const wrapper = mount(<FieldElement {...props} />);

                expect(wrapper.instance().validate()).toBeFalsy();
                expect(wrapper.state('errors')[0]).toBe('Field is required');
            });

            it('should return true if FieldElement is valid', () => {
                const wrapper = mount(<FieldElement {...props} />);

                expect(wrapper.instance().onChange([fieldOptions[1])]);
                expect(wrapper.instance().validate()).toBeTruthy();
            });
        });
    });
});
