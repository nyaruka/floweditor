import { RouterFormProps } from "components/flow/props";
import { CaseProps } from "components/flow/routers/caselist/CaseList";
import { DEFAULT_OPERAND } from "components/nodeeditor/constants";
import { Operators, Types } from "config/interfaces";
import { HintTypes, RouterTypes, SwitchRouter, WaitTypes } from "flowTypes";
import { composeComponentTestUtils, mock } from "testUtils";
import { createRenderNode, getRouterFormProps } from "testUtils/assetCreators";
import * as utils from "utils";

import DigitsRouterForm from "./DigitsRouterForm";
import { createUUID } from "utils";
import { DefaultExitNames } from "components/flow/routers/constants";

const exits = [{ uuid: utils.createUUID() }];
const categories = [
  {
    name: DefaultExitNames.All_Responses,
    uuid: utils.createUUID(),
    exit_uuid: exits[0].uuid
  }
];
const { setup } = composeComponentTestUtils<RouterFormProps>(
  DigitsRouterForm,
  getRouterFormProps(
    createRenderNode({
      actions: [],
      exits,
      router: {
        default_category_uuid: categories[0].uuid,
        type: RouterTypes.switch,
        categories,
        wait: {
          type: WaitTypes.msg,
          hint: { type: HintTypes.digits }
        },
        cases: []
      },
      ui: { position: { left: 0, top: 0 }, type: Types.wait_for_response }
    })
  )
);

mock(utils, "createUUID", utils.seededUUIDs());

describe(DigitsRouterForm.name, () => {
  it("should render", () => {
    const { wrapper } = setup(true);
    expect(wrapper).toMatchSnapshot();
  });

  it("initializes", () => {
    const { wrapper } = setup(true, {
      nodeSettings: {
        $set: {
          originalNode: createRenderNode({
            actions: [],

            exits: [{ destination_uuid: null, uuid: "generated_uuid_1" }],
            router: {
              type: RouterTypes.switch,
              operand: DEFAULT_OPERAND,
              categories: [
                {
                  uuid: createUUID(),
                  name: "Other",
                  exit_uuid: "generated_uuid_1"
                }
              ],
              cases: [
                {
                  uuid: "generated_uuid_2",
                  type: Operators.has_any_word,
                  arguments: ["red"],
                  category_uuid: null
                }
              ],
              default_category_uuid: "generated_uuid_1",
              result_name: "Color"
            } as SwitchRouter,
            ui: {
              position: { left: 0, top: 0 },
              type: Types.split_by_expression
            }
          })
        }
      }
    });

    expect(wrapper).toMatchSnapshot();
  });

  describe("updates", () => {
    it("should save changes", () => {
      const { instance, props } = setup(true, {
        $merge: { updateRouter: jest.fn(), onClose: jest.fn() }
      });

      instance.handleUpdateResultName("Favorite Color");
      instance.handleCasesUpdated([
        {
          kase: { type: Operators.has_any_word, arguments: ["red"] },
          categoryName: "Red"
        },
        {
          kase: { type: Operators.has_any_word, arguments: ["maroon"] },
          categoryName: "Red"
        },
        {
          kase: { type: Operators.has_any_word, arguments: ["green"] },
          categoryName: "Green"
        }
      ] as CaseProps[]);

      expect(instance.state).toMatchSnapshot();

      instance.handleSave();
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateRouter).toHaveBeenCalled();
      expect(props.updateRouter).toMatchCallSnapshot();
    });

    it("should cancel", () => {
      const { instance, props } = setup(true, {
        $merge: { updateRouter: jest.fn(), onClose: jest.fn() }
      });

      instance.handleUpdateResultName("Dont save me bro!");
      instance.getButtons().secondary.onClick();
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateRouter).not.toHaveBeenCalled();
    });
  });
});
