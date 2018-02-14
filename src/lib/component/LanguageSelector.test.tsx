import * as React from 'react';
import { shallow } from 'enzyme';
import { getSpecWrapper } from '../utils';
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

const props: LanguageSelectorProps = {
    iso,
    languages,
    onChange: jest.fn()
};

describe('LanguageSelector >', () => {
    describe('helpers >', () => {
        describe('composeLanguageMap', () => {
            it("should return an array of language maps with 'name' and 'iso' keys", () => {
                expect(composeLanguageMap(props.languages)).toMatchSnapshot();
            });
        });
    });

    describe('render >', () =>
        it('should render Select component with expected props', () => {
            const wrapper = shallow(<LanguageSelector {...props} />);

            expect(
                getSpecWrapper(wrapper, 'language-selector').props()
            ).toEqual(
                expect.objectContaining({
                    value: iso,
                    onChange: props.onChange,
                    options: composeLanguageMap(languages)
                })
            );
        }));
});
