import * as React from 'react';
import '../enzymeAdapter';
import { shallow } from 'enzyme';
import { SelectSearch, ISelectSearchProps } from './SelectSearch';

const selectSearchProps: ISelectSearchProps = {
    url: 'https://some-url.com',
    name: 'name',
    resultType: 'resultType'
};

describe('Component: SelectSearch', () => {
    it('should mount', () => {
        expect(shallow(<SelectSearch {...selectSearchProps} />)).toBePresent();
    });
});
