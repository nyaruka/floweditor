import CallWebhookComp from "components/flow/actions/callwebhook/CallWebhook";
import { CallWebhook } from "flowTypes";
import { composeComponentTestUtils } from "testUtils";
import { createCallWebhookAction } from "testUtils/assetCreators";

const callWebhookAction = createCallWebhookAction();

const { setup } = composeComponentTestUtils<CallWebhook>(
  CallWebhookComp,
  callWebhookAction as CallWebhook
);

describe(CallWebhookComp.name, () => {
  describe("render", () => {
    it("should render self", () => {
      const { wrapper, props } = setup();
      expect(wrapper.text()).toBe(props.url);
      expect(wrapper).toMatchSnapshot();
    });
  });
});
