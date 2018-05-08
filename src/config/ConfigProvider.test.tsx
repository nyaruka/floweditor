import { shallow } from 'enzyme';
import * as React from 'react';
import { findRenderedComponentWithType, renderIntoDocument } from 'react-dom/test-utils';

import ConfigProvider, {
    fakePropType,
    SINGLE_CHILD_ERROR,
    VALID_CHILD_ERROR
} from './ConfigProvider';

const config = require('../../__test__/config.js');

describe('ConfigProvider >', () => {
    const createChild = () => {
        class Child extends React.Component<{}> {
            public static contextTypes = {
                endpoints: fakePropType,
                languages: fakePropType,
                flow: fakePropType
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

    it("should provide config to child's context", () => {
        const Child = createChild();
        const tree = renderIntoDocument(
            <ConfigProvider config={config}>
                <Child />
            </ConfigProvider>
        ) as React.Component<any, {}>;
        const childComp = findRenderedComponentWithType(tree, Child);
        const { assetHost, endpoints, languages, flow } = config;

        expect(childComp.context).toEqual({
            endpoints,
            languages,
            flow
        });
        expect(childComp.context).toMatchSnapshot();
    });
});
