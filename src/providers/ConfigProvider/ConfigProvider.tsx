import * as React from 'react';
import { ConfigProviderContext } from './configContext';
import { childContextPT } from './propTypes';
import configContext from './configContext';

export interface ConfigProviderProps {
    flowEditorConfig: FlowEditorConfig;
}


export default class ConfigProvider extends React.Component<ConfigProviderProps> {
    public static childContextTypes = childContextPT;

    constructor(props: ConfigProviderProps) {
        super(props);
        if (React.Children.count(this.props.children) > 1 ) {
            throw new Error('ConfigProvider expects to receive only one child component.');
        }
    }

    public getChildContext(): ConfigProviderContext {
        return configContext;
    }

    public render(): JSX.Element {
        return React.Children.only(this.props.children);
    }
}
