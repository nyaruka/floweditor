import ConfigProvider, {
  fakePropType,
  SINGLE_CHILD_ERROR,
  VALID_CHILD_ERROR
} from 'config/ConfigProvider';
import { shallow } from 'enzyme';
import * as React from 'react';
import config from 'test/config';

describe('ConfigProvider >', () => {
  const createChild = () => {
    class Child extends React.Component<{}> {
      public static contextTypes = {
        config: fakePropType
      };
      public render(): JSX.Element {
        return <div />;
      }
    }
    return Child;
  };

  it('should throw if more than one child component provided', () => {
    expect(() =>
      shallow(
        <ConfigProvider config={config}>
          <div />
          <div />
        </ConfigProvider>
      )
    ).toThrowError(SINGLE_CHILD_ERROR);
  });

  it('should throw if child is not a valid React element', () => {
    expect(() =>
      shallow(
        <ConfigProvider config={config}>
          {() => {
            return;
          }}
        </ConfigProvider>
      )
    ).toThrowError(VALID_CHILD_ERROR);
  });
});
