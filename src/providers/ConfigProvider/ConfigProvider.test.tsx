jest.mock('Config');

import * as React from 'react';
import { renderIntoDocument, findRenderedComponentWithType } from 'react-dom/test-utils';
import '../../enzymeAdapter';
import { shallow } from 'enzyme';
import ConfigProvider from './ConfigProvider';
import configContext from './configContext';
import {
    typeConfigListPT,
    operatorConfigListPT,
    configMapPT,
    getTypeConfigPT,
    getOperatorConfigPT,
    getActivityPT,
    getFlowsPT,
    getFlowPT,
    saveFlowPT,
    flowPT,
    baseLanguagePT,
    endpointsPT,
    languagesPT
} from './propTypes';

const flowEditorConfig = require('Config');

describe('Component: ConfigProvider', () => {
    const createChild = () => {
        class Child extends React.Component<{}> {
            public static contextTypes = {
                typeConfigList: typeConfigListPT,
                operatorConfigList: operatorConfigListPT,
                actionConfigList: typeConfigListPT,
                typeConfigMap: configMapPT,
                operatorConfigMap: configMapPT,
                getTypeConfig: getTypeConfigPT,
                getOperatorConfig: getOperatorConfigPT,
                getActivity: getActivityPT,
                getFlows: getFlowsPT,
                getFlow: getFlowPT,
                saveFlow: saveFlowPT,
                flow: flowPT,
                baseLanguage: baseLanguagePT,
                endpoints: endpointsPT,
                languages: languagesPT
            };
            public render(): JSX.Element {
                return <div />;
            }
        }
        return Child;
    };

    it('should throw if more than one child component provided', () => {
        expect(
            shallow(
                <ConfigProvider flowEditorConfig={flowEditorConfig}>
                    <div />
                </ConfigProvider>
            ).exists()
        ).toBeTruthy();
        expect(() =>
            shallow(
                <ConfigProvider flowEditorConfig={flowEditorConfig}>
                    <div />
                    <div />
                </ConfigProvider>
            )
        ).toThrowError('ConfigProvider expects to receive only one child component.');
    });

    it("should provide config to child's context", () => {
        const Child = createChild();
        const tree = renderIntoDocument(
            <ConfigProvider flowEditorConfig={flowEditorConfig}>
                <Child />
            </ConfigProvider>
        );
        const childComp = findRenderedComponentWithType(tree, Child);
        expect(childComp.context).toEqual(configContext);
    });
});
