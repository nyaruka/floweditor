import { Simulator, SimulatorProps } from 'components/simulator/Simulator';
import { composeComponentTestUtils } from 'testUtils';

const { setup } = composeComponentTestUtils<SimulatorProps>(Simulator, {
  assetStore: {},
  nodes: {},
  activity: null,
  definition: {
    name: 'Simulate this',
    uuid: '28742b21-4762-4184-91c8-cc7324a30402',
    nodes: [],
    revision: 1,
    localization: {},
    language: null,
    _ui: null
  },
  liveActivity: null,
  mergeEditorState: jest.fn(),
  language: null
});

describe(Simulator.name, () => {
  it('renders', () => {
    const { wrapper } = setup();
    expect(wrapper).toMatchSnapshot();
  });
});
