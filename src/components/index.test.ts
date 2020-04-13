import { editorContainerSpecId, editorSpecId, FlowEditor, FlowEditorStoreProps } from 'components';
import { composeComponentTestUtils, getSpecWrapper, setMock } from 'testUtils';
import { English, languages } from 'testUtils/assetCreators';
import { set, setTrue } from 'utils';

const colorsFlow = require('test/flows/colors.json');

const baseProps: FlowEditorStoreProps = {
  assetStore: null,
  language: English,
  languages,
  simulating: false,
  translating: false,
  fetchingFlow: false,
  definition: null,
  loadFlowDefinition: jest.fn(),
  createNewRevision: jest.fn(),
  fetchFlow: jest.fn(),
  mergeEditorState: jest.fn(),
  modalMessage: null,
  saving: false,
  nodes: null,
  baseLanguage: null,
  onOpenNodeEditor: jest.fn(),
  handleLanguageChange: jest.fn(),
  scrollToAction: null,
  scrollToNode: null,
  popped: null,
  issues: {}
};

const { setup, spyOn } = composeComponentTestUtils(FlowEditor, baseProps);

describe('Root', () => {
  const definition = require('test/flows/boring.json');

  describe('render', () => {
    it('should render self, children with required props', () => {
      const { wrapper } = setup();
      const editorContainer = getSpecWrapper(wrapper, editorContainerSpecId);
      const editor = getSpecWrapper(wrapper, editorSpecId);

      expect(editorContainer.hasClass('translating')).toBeFalsy();
      expect(editor.hasClass('editor')).toBeTruthy();
      expect(wrapper.find('Connect(LanguageSelector)').exists()).toBeFalsy();
      expect(wrapper).toMatchSnapshot();
    });

    it('should apply translating style if passed a truthy translating prop', () => {
      const { wrapper } = setup(true, { translating: setTrue() });
      const editorContainer = getSpecWrapper(wrapper, editorContainerSpecId);

      expect(editorContainer.hasClass('translating')).toBeTruthy();
      expect(wrapper).toMatchSnapshot();
    });

    it('should render flow if passed a definition, language', () => {
      const { wrapper } = setup(true, {
        language: set(English),
        definition: set(colorsFlow)
      });

      expect(wrapper.find('Connect(Flow)').exists()).toBeTruthy();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('instance methods', () => {
    describe('componentDidMount', () => {
      it('should be called after component is mounted', () => {
        const componentDidMountSpy = spyOn('componentDidMount');
        const { wrapper } = setup();

        expect(componentDidMountSpy).toHaveBeenCalledTimes(1);

        componentDidMountSpy.mockRestore();
      });

      it('should call action creators', () => {
        const { props } = setup(true, {
          updateLanguage: setMock(),
          fetchFlow: setMock(),
          fetchFlows: setMock()
        });

        expect(props.fetchFlow).toHaveBeenCalledTimes(1);
        expect(props.fetchFlow).toMatchCallSnapshot();
      });
    });
  });
});
