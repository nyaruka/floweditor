import { SendMsg } from '../../../flowTypes';
import { composeComponentTestUtils, genSendMsgAction } from '../../../testUtils';
import SendMsgComp, { PLACEHOLDER } from './SendMsg';
import { setEmpty } from '../../../utils';

const sendMsgAction = genSendMsgAction();

const { setup } = composeComponentTestUtils<SendMsg>(SendMsgComp, sendMsgAction);

describe(SendMsgComp.name, () => {
    describe('render', () => {
        it('should render text prop when passed', () => {
            const { wrapper, props } = setup();

            expect(wrapper.text()).toBe(props.text);
            expect(wrapper).toMatchSnapshot();
        });

        it("should render placeholder when text prop isn't passed", () => {
            const { wrapper } = setup(true, { text: setEmpty() });

            expect(wrapper.text()).toBe(PLACEHOLDER);
            expect(wrapper).toMatchSnapshot();
        });
    });
});
