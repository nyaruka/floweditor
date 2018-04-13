import { FlowDefinition, SendEmail } from '../../../flowTypes';
import { composeComponentTestUtils, genSendEmailAction } from '../../../testUtils';
import SendEmailComp from './SendEmail';

const sendEmailAction = genSendEmailAction();

const { setup } = composeComponentTestUtils<SendEmail>(SendEmailComp, sendEmailAction);

describe(SendEmailComp.name, () => {
    describe('render', () => {
        it('should render self, children', () => {
            const { wrapper, props } = setup();

            expect(wrapper.text()).toBe(props.subject);
            expect(wrapper).toMatchSnapshot();
        });
    });
});
