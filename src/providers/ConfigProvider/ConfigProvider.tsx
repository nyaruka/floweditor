import * as React from 'react';
import { ConfigProviderContext } from './configContext';
import { childContextPT } from './propTypes';
import configContext from './configContext';


export default class ConfigProvider extends React.Component<any> {
    public static childContextTypes = childContextPT;

    constructor(props: any) {
        super(props);

        if (React.Children.count(props.children) > 1 ) {
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
