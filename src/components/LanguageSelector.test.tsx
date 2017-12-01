import * as React from 'react';
import '../enzymeAdapter';
import { shallow } from 'enzyme';
import LanguageSelector, { LanguageSelectorProps } from './LanguageSelector';

const languageSelectorProps: LanguageSelectorProps = {
    iso: 'spa',
    languages: {
        eng: 'English',
        spa: 'Spanish'
    },
    onChange: jest.fn()
};

const LanguageSelectorShallow = shallow(<LanguageSelector {...languageSelectorProps} />);

describe('Component: LanguageSelector', () => {
    it('should render', () => {
        expect(LanguageSelectorShallow.exists()).toBeTruthy();
    });
});
