import { FlowDefinition, SendMsg } from '../../../flowTypes';
import { createSetup, Resp } from '../../../testUtils';
import SendMsgComp, { PLACEHOLDER } from './SendMsg';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json') as Resp;
const { nodes: [node], language: flowLanguage } = definition as FlowDefinition;
const { actions: [replyAction] } = node;

const setup = createSetup<SendMsg>(SendMsgComp, replyAction as SendMsg);

const COMPONENT_TO_TEST = SendMsgComp.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('render', () => {
        it(`should render ${COMPONENT_TO_TEST} with text prop when passed`, () => {
            const { wrapper, props: { text } } = setup();

            expect(wrapper.text()).toBe(text);
            expect(wrapper).toMatchSnapshot();
        });

        it(`should render ${COMPONENT_TO_TEST} with placeholder when text prop isn't passed`, () => {
            const { wrapper } = setup({ text: '' });

            expect(wrapper.text()).toBe(PLACEHOLDER);
            expect(wrapper).toMatchSnapshot();
        });
    });
});
