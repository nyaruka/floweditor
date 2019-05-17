import { Types } from "config/interfaces";
import {
  getTypeConfig,
  typeConfigList,
  typeConfigMap
} from "config/typeConfigs";

describe("typeConfigs", () => {
  it("should provide type configs", () => {
    expect(typeConfigList).toMatchSnapshot();
    expect(typeConfigMap).toMatchSnapshot();

    Object.keys(typeConfigMap).forEach((key: Types) =>
      expect(getTypeConfig(key)).toEqual(typeConfigMap[key])
    );
  });
});
