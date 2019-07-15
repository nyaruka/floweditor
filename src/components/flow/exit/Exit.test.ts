import { ExitComp, ExitProps } from 'components/flow/exit/Exit';
import { Exit } from 'flowTypes';
import { composeComponentTestUtils, mock } from 'testUtils';
import * as utils from 'utils';

mock(utils, 'createUUID', utils.seededUUIDs());

const exit: Exit = {
  uuid: utils.createUUID(),
  destination_uuid: utils.createUUID()
};
const categories = [{ uuid: utils.createUUID(), name: 'Red', exit_uuid: exit.uuid }];

const { setup } = composeComponentTestUtils<ExitProps>(ExitComp, {
  exit,
  categories,
  recentMessages: [],
  node: { uuid: utils.createUUID(), actions: [], exits: [] },
  showDragHelper: false,
  translating: false,
  dragging: false,
  language: null,
  localization: null,
  segmentCount: 1000,
  plumberConnectExit: jest.fn(),
  plumberRemove: jest.fn(),
  plumberMakeSource: jest.fn(),
  plumberUpdateClass: jest.fn(),
  disconnectExit: jest.fn()
});

describe(ExitComp.name, () => {
  it('should render', () => {
    const { wrapper } = setup(true);
    expect(wrapper).toMatchSnapshot();
  });

  it('shows recent messages', () => {
    const { wrapper, instance } = setup(true);
    instance.setState(
      {
        recentMessages: [
          { text: 'Hi Mom!', sent: 'Apr 1, 2019' },
          { text: 'Hi Dad!', sent: 'Apr 2, 2019' }
        ]
      },
      () => {
        expect(wrapper).toMatchSnapshot();
      }
    );
  });

  it('shows missing localization', () => {
    const { wrapper } = setup(true, {
      $merge: { translating: true, language: 'spa', localization: {} }
    });
    expect(wrapper).toMatchSnapshot();
  });

  it('shows localization', () => {
    const { wrapper } = setup(true, {
      $merge: {
        translating: true,
        language: { id: 'spa' },
        localization: { spa: { [categories[0].uuid]: { name: ['Hola!'] } } }
      }
    });
    expect(wrapper).toMatchSnapshot();
  });
});
