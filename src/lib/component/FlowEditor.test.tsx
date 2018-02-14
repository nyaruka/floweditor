import * as React from 'react';
import { shallow } from 'enzyme';
import FlowEditor, { getBaseLanguage } from './FlowEditor';
import Flow from './Flow';
import ComponentMap from '../services/ComponentMap';
import FlowMutator from '../services/FlowMutator';
import { getSpecWrapper, jsonEqual } from '../utils';

const config = require('../../../assets/config.json');
const {
    results: [{ definition }]
} = require('../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const wrapper = shallow(<FlowEditor config={config} />);

const CompMap = new ComponentMap(definition);

const Mutator = new FlowMutator(
    CompMap,
    definition,
    wrapper.instance().setDefinition,
    wrapper.instance().save
);

const baseLanguage = getBaseLanguage(config.languages);

const languageSelectorExpectedProps = {
    languages: config.languages,
    iso: baseLanguage.iso,
    onChange: wrapper.instance().setLanguage
};

describe('Editor >', () => {
    describe('helpers >', () => {
        describe('getBaseLanguage', () => {
            it("should return the config's base language", () =>
                expect(getBaseLanguage(config.languages)).toMatchSnapshot());
        });
    });
    describe('render >', () => {
        it('should render itself, children', () => {
            expect(
                getSpecWrapper(wrapper, 'editor-container').exists()
            ).toBeTruthy();
            expect(
                getSpecWrapper(wrapper, 'editor').hasClass('editor')
            ).toBeTruthy();
            expect(wrapper.find('FlowList').props()).toEqual({
                onSelectFlow: wrapper.instance().onSelectFlow,
                flowOption: null,
                flowOptions: []
            });
            expect(wrapper.find('LanguageSelectorComp').props()).toEqual(
                languageSelectorExpectedProps
            );
            expect(wrapper.state('language')).toBe(baseLanguage);
        });

        it('renders a Flow component', () => {
            wrapper.setState({
                fetching: false,
                definition
            });

            expect(wrapper.find('Flow').exists()).toBeTruthy();
        });

        it('should apply translating style when the user selects a language other than base', () => {
            const language = { iso: 'spa', name: 'Spanish' };

            wrapper.setState({
                language,
                translating: !jsonEqual(baseLanguage, language)
            });

            expect(wrapper.state('language')).toEqual(language);
            expect(wrapper.state('translating')).toBeTruthy();
            expect(
                getSpecWrapper(wrapper, 'editor-container').hasClass(
                    'translating'
                )
            ).toBeTruthy();
            expect(wrapper.find('LanguageSelectorComp').props()).toEqual({
                ...languageSelectorExpectedProps,
                iso: language.iso
            });
        });
    });
});
