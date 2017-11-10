import * as React from 'react';
import '../enzymeAdapter';
import { shallow } from 'enzyme';
import LanguageSelector, { ILanguageSelectorProps } from './LanguageSelector';

const languageSelectorProps: ILanguageSelectorProps = {
    iso: 'spa',
    languages: {
        eng: 'English',
        spa: 'Spanish'
    },
    onChange: jest.fn()
};

const LanguageSelectorCompShallow = shallow(<LanguageSelector {...languageSelectorProps} />);

describe('Component: LanguageSelector', () => {
    it('should render', () => {
        expect(LanguageSelectorCompShallow.exists()).toBeTruthy();
    });
});
