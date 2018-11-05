import { Simulator, SimulatorProps } from '~/components/simulator/Simulator';
import { composeComponentTestUtils } from '~/testUtils';

const { setup } = composeComponentTestUtils<SimulatorProps>(Simulator, {
    assetStore: {},
    nodes: {},
    definition: {
        name: 'Simulate this',
        uuid: '28742b21-4762-4184-91c8-cc7324a30402',
        nodes: [],
        localization: {},
        language: null,
        _ui: null
    },
    Activity: null
});

describe(Simulator.name, () => {
    it('renders', () => {
        const { wrapper } = setup();
        expect(wrapper).toMatchSnapshot();
    });
});
