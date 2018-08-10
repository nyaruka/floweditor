import Pill, { PillProps } from '~/components/pill/Pill';
import { composeComponentTestUtils } from '~/testUtils';

const { setup } = composeComponentTestUtils<PillProps>(Pill, {
    advanced: false,
    text: 'This is my pill text',
    maxLength: 10
});

describe(Pill.name, () => {
    it('renders', () => {
        const { wrapper } = setup();
        expect(wrapper).toMatchSnapshot();
    });

    it('treats @ text differently', () => {
        const { wrapper } = setup(true, { text: { $set: '@(CONCAT(contact.name, contact.age))' } });
        expect(wrapper).toMatchSnapshot();
    });
});
