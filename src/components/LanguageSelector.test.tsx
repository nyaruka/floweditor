import * as React from 'react';
import '../enzymeAdapter';
import { shallow } from 'enzyme';
import LanguageSelectorComp, { ILanguageSelectorProps } from './LanguageSelector';

const languageSelectorProps: ILanguageSelectorProps = {
    iso: 'spa',
    languages: {
        eng: 'English',
        spa: 'Spanish'
    },
    onChange: jest.fn()
};

const LanguageSelectorCompShallow = shallow(<LanguageSelectorComp {...languageSelectorProps} />);

describe('Component: LanguageSelector', () => {
    it('should render', () => {
        expect(LanguageSelectorCompShallow).toBePresent();
    });
});
