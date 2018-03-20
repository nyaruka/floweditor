import * as React from 'react';
import { ConfigProviderContext, assetHostPT, endpointsPT, languagesPT } from './ConfigProvider';

interface ConfigProps {
    render: (context: ConfigProviderContext) => React.ReactNode;
}

export default class Config extends React.Component<ConfigProps> {
    public static contextTypes = {
        assetHost: assetHostPT,
        endpoints: endpointsPT,
        languages: languagesPT
    };

    public render(): React.ReactNode {
        return this.props.render(this.context);
    }
}
