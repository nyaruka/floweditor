import StartSessionForm from "components/flow/actions/startsession/StartSessionForm";
import { ActionFormProps } from "components/flow/props";
import { AssetType } from "store/flowContext";
import { composeComponentTestUtils, mock } from "testUtils";
import {
  createStartSessionAction,
  getActionFormProps,
  SubscribersGroup
} from "testUtils/assetCreators";
import * as utils from "utils";

mock(utils, "createUUID", utils.seededUUIDs());

const { setup } = composeComponentTestUtils<ActionFormProps>(
  StartSessionForm,
  getActionFormProps(createStartSessionAction())
);

describe(StartSessionForm.name, () => {
  describe("render", () => {
    it("should render self, children with base props", () => {
      const { wrapper } = setup(true);
      expect(wrapper).toMatchSnapshot();
    });

    it("should render an empty form with no action", () => {
      const { wrapper, instance } = setup(true, {
        $merge: {
          nodeSettings: { originalNode: null, originalAction: null }
        }
      });

      expect(instance.state).toMatchSnapshot();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe("updates", () => {
    it("should save changes", () => {
      const { instance, props } = setup(true);

      instance.handleRecipientsChanged([SubscribersGroup]);
      instance.handleFlowChanged([
        { id: "my_flow", name: "My Flow", type: AssetType.Flow }
      ]);
      expect(instance.state).toMatchSnapshot();

      instance.handleSave();
      expect(props.updateAction).toHaveBeenCalled();
      expect(props.updateAction).toMatchCallSnapshot();
    });

    it("should allow switching from router", () => {
      const { instance, props } = setup(true, {
        $merge: { updateAction: jest.fn() },
        nodeSettings: { $merge: { originalAction: null } }
      });

      instance.handleRecipientsChanged([SubscribersGroup]);
      instance.handleFlowChanged([
        { id: "my_flow", name: "My Flow", type: AssetType.Flow }
      ]);
      instance.handleSave();

      expect(props.updateAction).toMatchCallSnapshot();
    });
  });

  describe("cancel", () => {
    it("should cancel without changes", () => {
      const { instance, props } = setup(true, {
        $merge: { onClose: jest.fn(), updateAction: jest.fn() }
      });

      instance.handleRecipientsChanged([SubscribersGroup]);
      instance.handleFlowChanged([
        { id: "my_flow", name: "My Flow", type: AssetType.Flow }
      ]);
      instance.getButtons().secondary.onClick();
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateAction).not.toHaveBeenCalled();
    });
  });
});
