import * as React from 'react';
import '../enzymeAdapter';
import { shallow } from 'enzyme';
import Editor, { EditorProps } from './Editor';
import Flow from './Flow';
import EditorConfig from '../services/EditorConfig';
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

// your base test is done, now test each instance method
// test flow
// push up
// send eric a msg
describe('Component: Editor', () => {
    const EditorComp = shallow(<Editor {...props} />);
    const languageSelectorExpectedProps = {
        languages: props.EditorConfig.languages,
        iso: props.EditorConfig.baseLanguage.iso,
        onChange: EditorComp.instance().setLanguage
    };
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

    it('Applies translating style when the user selects a language other than base', () => {
        const language = { iso: 'spa', name: 'Spanish' };

        EditorComp.setState({ language, translating: true });

        expect(EditorComp.state('language')).toEqual(language);
        expect(EditorComp.state('translating')).toBeTruthy();
        expect(getSpecWrapper(EditorComp, 'editor-container').hasClass('translating')).toBeTruthy();
        expect(EditorComp.find('LanguageSelectorComp').props()).toEqual({
            ...languageSelectorExpectedProps,
            iso: language.iso
        });
    });
});
