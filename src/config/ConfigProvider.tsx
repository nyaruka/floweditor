import { objectOf, shape, string } from 'prop-types';
import * as React from 'react';
import { Endpoints, FlowEditorConfig, Languages } from '../flowTypes';

interface ConfigProviderProps {
    config: FlowEditorConfig;
    children: any;
}

export interface ConfigProviderContext {
    endpoints: Endpoints;
    languages: Languages;
    flow: string;
}

// Prop-type definitions (required by React's context API: https://reactjs.org/docs/context.html)
export const endpointsPT = shape({
    fields: string,
    groups: string,
    engine: string,
    contacts: string,
    flows: string,
    activity: string
});
export const languagesPT = objectOf(string);
export const flowPT = string;
// ----------------------------------------------------------------------------------------------

export const SINGLE_CHILD_ERROR = 'ConfigProvider expects only one child component.';
export const VALID_CHILD_ERROR =
    'ConfigProvider expects a valid React element: https://reactjs.org/docs/react-api.html#isvalidelement';

export default class ConfigProvider extends React.Component<ConfigProviderProps> {
    public static childContextTypes = {
        endpoints: endpointsPT,
        languages: languagesPT,
        flow: flowPT
    };

    constructor(props: ConfigProviderProps) {
        super(props);

        if (React.Children.count(props.children) > 1) {
            throw new Error(SINGLE_CHILD_ERROR);
        } else if (!React.isValidElement(props.children)) {
            throw new Error(VALID_CHILD_ERROR);
        }
    }

    public getChildContext(): ConfigProviderContext {
        return {
            languages: this.props.config.languages,
            endpoints: this.props.config.endpoints,
            flow: this.props.config.flow
        };
    }

    public render(): JSX.Element {
        return React.Children.only(this.props.children);
    }
}
