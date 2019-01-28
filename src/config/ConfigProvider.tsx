import * as React from 'react';
import { Endpoints, FlowEditorConfig } from '~/flowTypes';

export const fakePropType: any = (): any => null;
fakePropType.isRequired = (): any => null;

interface ConfigProviderProps {
    config: FlowEditorConfig;
    children: any;
}

export interface ConfigProviderContext {
    endpoints: Endpoints;
    flow: string;
    debug: boolean;
    showDownload: boolean;
}

// ----------------------------------------------------------------------------------------------

export const SINGLE_CHILD_ERROR = 'ConfigProvider expects only one child component.';
export const VALID_CHILD_ERROR =
    'ConfigProvider expects a valid React element: https://reactjs.org/docs/react-api.html#isvalidelement';

export default class ConfigProvider extends React.Component<ConfigProviderProps> {
    public static childContextTypes = {
        assetService: fakePropType,
        endpoints: fakePropType,
        flow: fakePropType,
        debug: fakePropType,
        showDownload: fakePropType
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
            endpoints: this.props.config.endpoints,
            flow: this.props.config.flow,
            debug: this.props.config.debug,
            showDownload: this.props.config.showDownload
        };
    }

    public render(): JSX.Element {
        return React.Children.only(this.props.children);
    }
}
