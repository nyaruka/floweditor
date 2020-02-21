import AddLabelsComp, { MAX_TO_SHOW } from 'components/flow/actions/addlabels/AddLabels';
import { Types } from 'config/interfaces';
import { AddLabels } from 'flowTypes';
import { composeComponentTestUtils } from 'testUtils';

const labels = [
  'Help',
  'New',
  'Feedback',
  'Needs Attention',
  'Running Out of Plausible Label Names',
  'But alas, here is another one'
];

const baseProps: AddLabels = {
  type: Types.add_input_labels,
  uuid: `${Types.add_input_labels}-0`,
  labels: labels.map((name, idx) => ({ name, uuid: `label-${idx}` }))
};

const { setup } = composeComponentTestUtils(AddLabelsComp, baseProps);

describe(AddLabelsComp.name, () => {
  it('should display labels on action', () => {
    const { wrapper } = setup();

    // Assert that we're displaying the max labels
    // we want to display plus an ellipses.
    expect(wrapper.find('div').length).toBe(MAX_TO_SHOW);
    expect(wrapper).toMatchSnapshot();
  });
});
