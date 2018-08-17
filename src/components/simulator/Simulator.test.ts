import { Simulator, SimulatorProps } from '~/components/simulator/Simulator';
import { composeComponentTestUtils } from '~/testUtils';

const { setup } = composeComponentTestUtils<SimulatorProps>(Simulator, {
    Activity: null,
    plumberDraggable: jest.fn()
});

describe(Simulator.name, () => {
    it('renders', () => {
        const { wrapper } = setup();
        expect(wrapper).toMatchSnapshot();
    });
});
