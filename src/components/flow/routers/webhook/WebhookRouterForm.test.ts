import { RouterFormProps } from "components/flow/props";
import WebhookRouterForm from "components/flow/routers/webhook/WebhookRouterForm";
import { Types } from "config/interfaces";
import { RenderNode } from "store/flowContext";
import { composeComponentTestUtils, mock } from "testUtils";
import {
  createWebhookRouterNode,
  getRouterFormProps
} from "testUtils/assetCreators";
import * as utils from "utils";

mock(utils, "createUUID", utils.seededUUIDs());

const { setup } = composeComponentTestUtils<RouterFormProps>(
  WebhookRouterForm,
  getRouterFormProps({
    node: createWebhookRouterNode(),
    ui: { type: Types.call_webhook }
  } as RenderNode)
);

describe(WebhookRouterForm.name, () => {
  it("should render", () => {
    const { wrapper } = setup(true);
    expect(wrapper).toMatchSnapshot();
  });

  describe("updates", () => {
    it("should save changes", () => {
      const { instance, props } = setup(false, {
        $merge: { onClose: jest.fn(), updateRouter: jest.fn() }
      });

      const header = {
        name: "Content-type",
        value: "application/json",
        uuid: utils.createUUID()
      };

      instance.handleMethodUpdate({ value: "POST" });
      instance.handlePostBodyUpdate("Post Body");
      instance.handleHeaderUpdated(header);
      expect(instance.state).toMatchSnapshot("intitial state");

      // remove our header
      instance.handleHeaderRemoved(header);
      expect(instance.state).toMatchSnapshot("after header removed");

      // trying to save without a url won't continue
      instance.handleSave();
      expect(props.onClose).not.toHaveBeenCalled();
      expect(props.updateRouter).not.toHaveBeenCalled();

      // finally update our url, and save
      instance.handleUrlUpdate("http://domain.com/");
      instance.handleSave();
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateRouter).toHaveBeenCalled();
      expect(props.updateRouter).toMatchCallSnapshot("save all the things");
    });

    it("should repopulate post body", () => {
      const { instance, props } = setup(true, {
        $merge: { onClose: jest.fn(), updateRouter: jest.fn() }
      });

      instance.handleMethodUpdate({ value: "GET" });
      instance.handleUrlUpdate("http://domain.com/");
      expect(instance.state).toMatchSnapshot();

      instance.handleMethodUpdate("POST");
      expect(instance.state).toMatchSnapshot();
    });

    it("should cancel", () => {
      const { instance, props } = setup(true, {
        $merge: { onClose: jest.fn(), updateRouter: jest.fn() }
      });
      instance.getButtons().secondary.onClick();
      instance.handleUrlUpdate("http://domain.com/");
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateRouter).not.toHaveBeenCalled();
    });
  });
});
