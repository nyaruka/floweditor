import * as React from 'react';
import '../enzymeAdapter';
import { shallow } from 'enzyme';
import Editor from './Editor';
import Flow from './Flow';
import ComponentMap from '../services/ComponentMap';
import FlowMutator from '../services/FlowMutator';
import context from '../providers/ConfigProvider/configContext';
import { getSpecWrapper } from '../helpers/utils';

const { results } = require('../../assets/flows.json');
const {
    results: [{ definition }]
} = require('../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const { baseLanguage, languages } = context;
const EditorComp = shallow(<Editor />, { context }) as any;
const CompMap = new ComponentMap(definition);
const Mutator = new FlowMutator(
    CompMap,
    definition,
    EditorComp.instance().setDefinition,
    EditorComp.instance().save
);

const languageSelectorExpectedProps = {
    languages,
    iso: baseLanguage.iso,
    onChange: EditorComp.instance().setLanguage
};

describe('Component: Editor', () => {
    it('should render itself, children', () => {
        expect(getSpecWrapper(EditorComp, 'editor-container').exists()).toBeTruthy();
        expect(getSpecWrapper(EditorComp, 'editor').hasClass('editor')).toBeTruthy();
        expect(EditorComp.find('FlowList').props()).toEqual({
            onFlowSelect: EditorComp.instance().onFlowSelect,
            flow: null,
            flows: []
        });
        expect(EditorComp.find('LanguageSelectorComp').props()).toEqual(
            languageSelectorExpectedProps
        );
        expect(EditorComp.state('language')).toBe(baseLanguage);
    });

    it('Renders a Flow', () => {
        EditorComp.setState({
            fetching: false,
            definition
        });

        expect(EditorComp.find('Flow').exists()).toBeTruthy();
    });

    it('should apply translating style when the user selects a language other than base', () => {
        const language = { iso: 'spa', name: 'Spanish' };

        EditorComp.setState({
            language,
            translating:
                baseLanguage.iso !== language.iso &&
                baseLanguage.name !== language.name
        });

        expect(EditorComp.state('language')).toEqual(language);
        expect(EditorComp.state('translating')).toBeTruthy();
        expect(getSpecWrapper(EditorComp, 'editor-container').hasClass('translating')).toBeTruthy();
        expect(EditorComp.find('LanguageSelectorComp').props()).toEqual({
            ...languageSelectorExpectedProps,
            iso: language.iso
        });
    });
});
