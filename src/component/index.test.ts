import { editorContainerSpecId, editorSpecId, FlowEditor, FlowEditorStoreProps } from '.';
import { FlowEditorConfig } from '../flowTypes';
import { createSetup, getSpecWrapper, Resp } from '../testUtils';
import { getBaseLanguage, getLanguage } from '../utils';

const config = require('../../assets/config') as FlowEditorConfig;
const colorsFlowResp = require('../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json') as Resp;

const context = {
    assetHost: config.assetHost,
    endpoints: config.endpoints,
    languages: config.languages,
    flow: config.flow
};

const baseProps = {
    language: null,
    translating: false,
    fetchingFlow: false,
    definition: null,
    dependencies: null,
    updateLanguage: jest.fn(),
    fetchFlow: jest.fn(),
    fetchFlows: jest.fn()
};

const setup = createSetup<FlowEditorStoreProps>(FlowEditor, baseProps, config);

describe('Root', () => {
    describe('render', () => {
        it('should render self, children with required props', () => {
            const { wrapper } = setup({}, true);
            const editorContainer = getSpecWrapper(wrapper, editorContainerSpecId);
            const editor = getSpecWrapper(wrapper, editorSpecId);

            expect(editorContainer.hasClass('translating')).toBeFalsy();
            expect(editor.hasClass('editor')).toBeTruthy();
            expect(wrapper.find('Connect(FlowList)').exists()).toBeTruthy();
            expect(wrapper.find('Connect(LanguageSelector)').exists()).toBeTruthy();
        });

        it('should apply translating style if passed a truthy translating prop', () => {
            const { wrapper } = setup({ translating: true }, true);
            const editorContainer = getSpecWrapper(wrapper, editorContainerSpecId);

            expect(editorContainer.hasClass('translating')).toBeTruthy();
        });

        it('should render flow if passed a definition, language', () => {
            const { wrapper } = setup(
                {
                    language: getLanguage(config.languages, 'eng'),
                    definition: colorsFlowResp.results[0].definition
                },
                true
            );

            expect(wrapper.find('Connect(Flow)').exists()).toBeTruthy();
        });
    });

    describe('instance methods', () => {
        describe('componentDidMount', () => {
            it('should be called after component is mounted', () => {
                const componentDidMountSpy = jest.spyOn(FlowEditor.prototype, 'componentDidMount');
                const { wrapper } = setup(null, true);

                expect(componentDidMountSpy).toHaveBeenCalledTimes(1);

                componentDidMountSpy.mockRestore();
            });

            it('should call action creators', () => {
                const {
                    wrapper,
                    props: {
                        updateLanguage: updateLanguageMock,
                        fetchFlow: fetchFlowMock,
                        fetchFlows: fetchFlowsMock
                    }
                } = setup(
                    {
                        updateLanguage: jest.fn(),
                        fetchFlow: jest.fn(),
                        fetchFlows: jest.fn()
                    },
                    true
                );

                expect(updateLanguageMock).toHaveBeenCalledTimes(1);
                expect(updateLanguageMock).toHaveBeenCalledWith(getBaseLanguage(config.languages));
                expect(fetchFlowMock).toHaveBeenCalledTimes(1);
                expect(fetchFlowMock).toHaveBeenCalledWith(config.endpoints.flows, config.flow);
                expect(fetchFlowsMock).toHaveBeenCalledTimes(1);
                expect(fetchFlowsMock).toHaveBeenCalledWith(config.endpoints.flows);
            });
        });
    });
});
