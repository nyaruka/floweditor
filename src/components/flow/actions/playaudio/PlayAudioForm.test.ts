import { ActionFormProps } from "components/flow/props";
import { composeComponentTestUtils, mock } from "testUtils";
import {
  createPlayAudioAction,
  getActionFormProps
} from "testUtils/assetCreators";
import * as utils from "utils";

import PlayAudioForm from "./PlayAudioForm";

const { setup } = composeComponentTestUtils<ActionFormProps>(
  PlayAudioForm,
  getActionFormProps(createPlayAudioAction())
);

mock(utils, "createUUID", utils.seededUUIDs());

describe(PlayAudioForm.name, () => {
  describe("render", () => {
    it("should render", () => {
      const { wrapper } = setup(true);
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe("updates", () => {
    it("should save changes", () => {
      const { instance, props } = setup(true);

      instance.handleAudioUpdate("@flow.recording");
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

      instance.handleAudioUpdate("@flow.recording");
      instance.handleSave();
      expect(props.updateAction).toMatchCallSnapshot();
    });
  });

  describe("cancel", () => {
    it("should cancel without changes", () => {
      const { instance, props } = setup(true, {
        $merge: { onClose: jest.fn(), updateAction: jest.fn() }
      });
      instance.handleAudioUpdate("@flow.recording");
      instance.getButtons().secondary.onClick();
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateAction).not.toHaveBeenCalled();
    });
  });
});
