import * as React from 'react';
import '../enzymeAdapter';
import { shallow } from 'enzyme';
import SelectSearch, { SelectSearchProps } from './SelectSearch';

const selectSearchProps: SelectSearchProps = {
    url: 'https://some-url.com',
    name: 'name',
    resultType: 'resultType'
};

describe('Component: SelectSearch', () => {
    it('should mount', () => {
        expect(shallow(<SelectSearch {...selectSearchProps} />)).toBePresent();
    });
});
