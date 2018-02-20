import * as React from 'react';
import { shape, string, objectOf } from 'prop-types';
import { Languages, Endpoints, FlowEditorConfig } from '../flowTypes';
import { Language } from '../component/LanguageSelector';

interface ConfigProviderProps {
    config: FlowEditorConfig;
    children: any;
}

export interface ConfigProviderContext {
    assetHost: string;
    endpoints: Endpoints;
    languages: Languages;
}

// Prop-type definitions (required by React's context API: https://reactjs.org/docs/context.html)
export const assetHostPT = string;
export const endpointsPT = shape({
    fields: string,
    groups: string,
    engine: string,
    contacts: string,
    flows: string,
    activity: string
});
export const languagesPT = objectOf(string);
// ----------------------------------------------------------------------------------------------

export const SINGLE_CHILD_ERROR = 'ConfigProvider expects only one child component.';
export const VALID_CHILD_ERROR =
    'ConfigProvider expects a valid React element: https://reactjs.org/docs/react-api.html#isvalidelement';

export default class ConfigProvider extends React.Component<ConfigProviderProps> {
    public static childContextTypes = {
        assetHost: assetHostPT,
        endpoints: endpointsPT,
        languages: languagesPT
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
            assetHost: this.props.config.assetHost,
            languages: this.props.config.languages,
            endpoints: this.props.config.endpoints
        };
    }

    public render(): JSX.Element {
        return React.Children.only(this.props.children);
    }
}
