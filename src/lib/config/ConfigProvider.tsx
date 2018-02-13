import * as React from 'react';
import { shape, string, objectOf } from 'prop-types';
import { Languages, Endpoints } from '../flowTypes';
import { Language } from '../component/LanguageSelector';

export interface ConfigProviderContext {
    assetHost: string;
    endpoints: Endpoints;
    languages: Languages;
}

// Prop-type definitions (required by React's context API)
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
// -------------------------------------------------------

export default class ConfigProvider extends React.Component<any> {
    public static childContextTypes = {
        assetHost: assetHostPT,
        endpoints: endpointsPT,
        languages: languagesPT
    };

    constructor(props: any) {
        super(props);

        if (React.Children.count(props.children) > 1) {
            throw new Error('ConfigProvider expects only one child component.');
        }
    }

    public getChildContext(): ConfigProviderContext {
        return {
            assetHost: this.props.assetHost,
            languages: this.props.languages,
            endpoints: this.props.endpoints
        };
    }

    public render(): JSX.Element {
        return React.Children.only(this.props.children);
    }
}
