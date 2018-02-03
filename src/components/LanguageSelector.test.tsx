import * as React from 'react';
import { shallow } from 'enzyme';
import { getSpecWrapper } from '../helpers/utils';
import { Languages } from '../flowTypes';
import LanguageSelector, {
    LanguageSelectorProps,
    composeLanguageMap
} from './LanguageSelector';

const iso: string = 'spa';

const languages: Languages = {
    eng: 'English',
    spa: 'Spanish',
    fre: 'French'
};

const onChange: () => void = jest.fn();

const props: LanguageSelectorProps = {
    iso,
    languages,
    onChange
};

const LanguageSelectorShallow = shallow(<LanguageSelector {...props} />);

describe('LanguageSelector >', () => {
    describe('helpers >', () => {
        describe('composeLanguageMap', () => {
            it("should return an array of language maps with 'name' and 'iso' keys", () => {
                expect(composeLanguageMap(props.languages)).toMatchSnapshot();
            });
        });
    });

    describe('render >', () =>
        it('should render Select component with expected props', () =>
            expect(
                getSpecWrapper(
                    LanguageSelectorShallow,
                    'language-selector'
                ).props()
            ).toEqual(
                expect.objectContaining({
                    value: iso,
                    onChange,
                    options: composeLanguageMap(languages)
                })
            )));
});
