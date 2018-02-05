import * as React from 'react';
import { mount } from 'enzyme';
import SelectSearch, { SelectSearchProps } from './SelectSearch';
import { SearchResult } from '../services/ComponentMap';
import {
    RESULT_TYPE_FIELD,
    FIELD_PLACEHOLDER,
    FIELD_NOT_FOUND
} from './form/FieldElement';
import { ContactField } from '../flowTypes';

const config = require('../../../assets/config.json');
const { results: fieldsResp } = require('../../assets/fields.json');

describe('SelectSearch >', () => {
    const loadOptionsSpy = jest.spyOn(
        SelectSearch.prototype,
        'loadOptions' as any
    );

    const props: SelectSearchProps = {
        url: config.endpoints.groups,
        name: 'Field',
        resultType: RESULT_TYPE_FIELD,
        placeholder: FIELD_PLACEHOLDER,
        searchPromptText: FIELD_NOT_FOUND,
        closeOnSelect: false,
        initial: []
    };

    const fieldOptions: SearchResult[] = fieldsResp.map(
        ({ name, uuid, type }: ContactField) => ({
            name,
            id: uuid,
            type
        })
    );

    describe('render >', () => {
        describe('split by contact field >', () => {
            const wrapper = mount(<SelectSearch {...props} />);

            it('should render <Async />, pass it expected props', () => {
                expect(wrapper.find('Async').props()).toEqual(
                    expect.objectContaining({
                        name: props.name,
                        placeholder: props.placeholder,
                        searchPromptText: props.searchPromptText,
                        closeOnSelect: props.closeOnSelect
                    })
                );

                expect(loadOptionsSpy).toHaveBeenCalled();
            });
        });
    });

    describe('instance methods >', () => {
        describe('componentWillReceiveProps >', () => {
            it("should update state if next 'initial' prop is different than existing version", () => {
                const wrapper = mount(<SelectSearch {...props} />);

                wrapper.setProps({ initial: [fieldOptions[1]] });

                expect(wrapper.state('selections')).toEqual([fieldOptions[1]]);
            });
        });
    });
});
