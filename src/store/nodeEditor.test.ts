import { getTypeConfig } from "config";
import { Types } from "config/interfaces";
import Constants from "store/constants";
import reducer, {
  initialState,
  typeConfig as typeConfigReducer,
  updateTypeConfig,
  updateUserAddingAction,
  userAddingAction as userAddingActionReducer
} from "store/nodeEditor";

const definition = require("test/flows/boring.json");

describe("nodeEditor action creators", () => {
  describe("updateTypeConfig", () => {
    it("should create an action to update typeConfig state", () => {
      const typeConfig = getTypeConfig(Types.send_msg);
      const expectedAction = {
        type: Constants.UPDATE_TYPE_CONFIG,
        payload: {
          typeConfig
        }
      };
      expect(updateTypeConfig(typeConfig)).toEqual(expectedAction);
    });
  });

  describe("updateUserAddingAction", () => {
    it("should create an action to update userAddingAction state", () => {
      const userAddingAction = false;
      const expectedAction = {
        type: Constants.UPDATE_USER_ADDING_ACTION,
        payload: {
          userAddingAction
        }
      };
      expect(updateUserAddingAction(userAddingAction)).toEqual(expectedAction);
    });
  });
});

describe("nodeEditor reducers", () => {
  describe("typeConfig reducer", () => {
    const reduce = (action: any) => typeConfigReducer(undefined, action);

    it("should return initial state", () => {
      expect(reduce({})).toEqual(initialState.typeConfig);
    });

    it("should handle UPDATE_TYPE_CONFIG", () => {
      const typeConfig = getTypeConfig(Types.send_msg);
      const action = updateTypeConfig(typeConfig);
      expect(reduce(action)).toEqual(typeConfig);
    });
  });

  describe("userAddingAction reducer", () => {
    const reduce = (action: any) => userAddingActionReducer(undefined, action);

    it("should return initial state", () => {
      expect(reduce({})).toEqual(initialState.userAddingAction);
    });

    it("should handle UPDATE_USER_ADDING_ACTION", () => {
      const userAddingAction = true;
      const action = updateUserAddingAction(userAddingAction);
      expect(reduce(action)).toEqual(userAddingAction);
    });
  });
});
