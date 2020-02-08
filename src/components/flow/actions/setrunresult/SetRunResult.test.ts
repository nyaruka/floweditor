import { SetRunResult } from 'flowTypes';
import { composeComponentTestUtils } from 'testUtils';
import { createSetRunResultAction } from 'testUtils/assetCreators';
import { setEmpty } from 'utils';

import SetRunResultComp, {
  getClearPlaceholder,
  getSavePlaceholder
} from 'components/flow/actions/setrunresult/SetRunResult';

const setRunResultAction = createSetRunResultAction();

const { setup } = composeComponentTestUtils<SetRunResult>(
  SetRunResultComp,
  setRunResultAction as SetRunResult
);

describe(SetRunResultComp.name, () => {
  it('should render save placeholder when value prop passed', () => {
    const { wrapper, props } = setup();

    expect(
      wrapper.containsMatchingElement(getSavePlaceholder(props.value, props.name))
    ).toBeTruthy();
    expect(wrapper).toMatchSnapshot();
  });

  it("should render with clear placholder when value prop isn't passed", () => {
    const { wrapper, props } = setup(true, { value: setEmpty() });

    expect(wrapper.containsMatchingElement(getClearPlaceholder(props.name))).toBeTruthy();
    expect(wrapper).toMatchSnapshot();
  });
});
