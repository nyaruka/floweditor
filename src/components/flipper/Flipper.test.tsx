import * as React from "react";
import Flipper, { FlipperProps } from "components/flipper/Flipper";
import { composeComponentTestUtils } from "testUtils";

const baseProps: FlipperProps = {
  front: <div>Front</div>,
  back: <div>Back</div>
};

const { setup } = composeComponentTestUtils<FlipperProps>(Flipper, baseProps);

describe(Flipper.name, () => {
  it("should render", () => {
    const { wrapper } = setup(true);
    expect(wrapper).toMatchSnapshot();
  });

  it("should flip", () => {
    const { instance } = setup(true);
    instance.handleFlip();
    expect(instance.state).toMatchSnapshot();
  });
});
