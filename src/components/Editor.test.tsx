import * as React from 'react';
import '../enzymeAdapter';
import { shallow } from 'enzyme';
import Editor, { EditorProps } from './Editor';
import Flow from './Flow';
import EditorConfig from '../services/EditorConfig';
import ComponentMap from '../services/ComponentMap';
import FlowMutator from '../services/FlowMutator';
import External from '../services/External';
import { getSpecWrapper } from '../helpers/utils';

const { results } = require('../../assets/flows.json');
const {
    results: [{ definition }]
} = require('../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const props: EditorProps = {
    flowUUID: results[0].uuid,
    EditorConfig: new EditorConfig(),
    External: {
        getFlow: jest.fn(
            () =>
                new Promise((resolve, reject) =>
                    process.nextTick(() =>
                        resolve({
                            definition
                        })
                    )
                )
        ),
        getFlows: jest.fn(
            () => new Promise((resolve, reject) => process.nextTick(() => resolve({ results })))
        )
    } as any
};
const EditorComp = shallow(<Editor {...props} />);
const CompMap = new ComponentMap(definition);
const Mutator = new FlowMutator(
    CompMap,
    definition,
    EditorComp.instance().setDefinition,
    EditorComp.instance().save
);

const languageSelectorExpectedProps = {
    languages: props.EditorConfig.languages,
    iso: props.EditorConfig.baseLanguage.iso,
    onChange: EditorComp.instance().setLanguage
};

describe('Component: Editor', () => {
    it('Renders itself, children', () => {
        expect(getSpecWrapper(EditorComp, 'editor-container').exists()).toBeTruthy();
        expect(getSpecWrapper(EditorComp, 'editor').hasClass('editor')).toBeTruthy();
        expect(EditorComp.find('FlowList').props()).toEqual({
            EditorConfig: props.EditorConfig,
            External: props.External,
            onFlowSelect: EditorComp.instance().onFlowSelect
        });
        expect(EditorComp.find('LanguageSelectorComp').props()).toEqual(
            languageSelectorExpectedProps
        );
        expect(EditorComp.state('language')).toBe(props.EditorConfig.baseLanguage);
    });

    it('Renders a Flow', () => {
        EditorComp.setState({
            fetching: false,
            definition
        });

        expect(EditorComp.find('Flow').exists()).toBeTruthy();
    });

    it('Applies translating style when the user selects a language other than base', () => {
        const language = { iso: 'spa', name: 'Spanish' };

        EditorComp.setState({
            language,
            translating:
                props.EditorConfig.baseLanguage.iso !== language.iso &&
                props.EditorConfig.baseLanguage.name !== language.name
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
