import { RouterFormProps } from "components/flow/props";
import ResultRouterForm from "components/flow/routers/result/ResultRouterForm";
import { Types } from "config/interfaces";
import { AssetType } from "store/flowContext";
import { composeComponentTestUtils, mock } from "testUtils";
import {
  createRenderNode,
  getRouterFormProps,
  createMatchRouter
} from "testUtils/assetCreators";
import * as utils from "utils";

const routerNode = createMatchRouter([]);
routerNode.ui = {
  position: { left: 0, top: 0 },
  type: Types.split_by_run_result,
  config: {
    id: "favorite_color",
    type: AssetType.Result
  }
};

const { setup } = composeComponentTestUtils<RouterFormProps>(
  ResultRouterForm,
  getRouterFormProps(routerNode)
);

mock(utils, "createUUID", utils.seededUUIDs());

describe(ResultRouterForm.name, () => {
  it("should render", () => {
    const { wrapper } = setup(true);
    expect(wrapper).toMatchSnapshot();
  });
});
