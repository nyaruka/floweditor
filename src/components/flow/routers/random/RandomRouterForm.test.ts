import { RouterFormProps } from "components/flow/props";
import RandomRouterForm from "components/flow/routers/random/RandomRouterForm";
import { composeComponentTestUtils, mock } from "testUtils";
import {
  createRandomNode,
  createRenderNode,
  createSendMsgAction,
  getRouterFormProps
} from "testUtils/assetCreators";
import * as utils from "utils";
import { Types } from "config/interfaces";

mock(utils, "createUUID", utils.seededUUIDs());

const { setup } = composeComponentTestUtils<RouterFormProps>(
  RandomRouterForm,
  getRouterFormProps(createRandomNode(2))
);

describe(RandomRouterForm.name, () => {
  it("should render", () => {
    const { wrapper } = setup(true);
    expect(wrapper).toMatchSnapshot();
  });

  it("should initialize existing random", () => {
    const { wrapper } = setup(true, {
      nodeSettings: { $set: { originalNode: createRandomNode(5) } }
    });
    expect(wrapper).toMatchSnapshot();
  });

  it("should convert from a non-random node", () => {
    const { wrapper, instance, props } = setup(true, {
      nodeSettings: {
        $set: {
          originalAction: createSendMsgAction({ text: "" }),
          originalNode: createRenderNode({
            actions: [createSendMsgAction({ text: "A message" })],
            exits: [{ uuid: utils.createUUID() }],
            ui: {
              type: Types.execute_actions,
              position: { left: 100, top: 100 }
            }
          })
        }
      }
    });

    instance.handleSave();

    // our orginal node should still only have one exit
    expect(props.nodeSettings.originalNode.node.exits.length).toBe(1);

    expect(wrapper).toMatchSnapshot();
    expect(props.updateRouter).toMatchCallSnapshot();
    expect(props.nodeSettings.originalNode).toMatchSnapshot();
  });
});
