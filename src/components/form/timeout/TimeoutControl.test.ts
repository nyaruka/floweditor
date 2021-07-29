import TimeoutControl, {
  TIMEOUT_OPTIONS,
  TimeoutControlProps
} from 'components/form/timeout/TimeoutControl';
import { composeComponentTestUtils, setMock } from 'testUtils';

const { setup } = composeComponentTestUtils<TimeoutControlProps>(TimeoutControl, {
  timeout: 0,
  onChanged: jest.fn()
});

describe(TimeoutControl.name, () => {
  it('renders', () => {
    const { wrapper } = setup();
    expect(wrapper).toMatchSnapshot();
  });

  it('updates', () => {
    const { instance, props } = setup(true, { onChanged: setMock() });
    instance.handleChecked();
    expect(props.onChanged).toMatchCallSnapshot('check');

    instance.handleTimeoutChanged(TIMEOUT_OPTIONS[0]);
    expect(props.onChanged).toMatchCallSnapshot('update');
  });

  it('handles initial values', () => {
    const { wrapper, instance } = setup(true, {
      timeout: { $set: 15 },
      onChanged: setMock()
    });

    instance.handleChecked();
    expect(wrapper).toMatchSnapshot();
  });
});
