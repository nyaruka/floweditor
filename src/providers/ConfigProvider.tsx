import * as React from 'react';
import { Endpoints, Languages } from '../flowTypes';
import { Language } from '../components/LanguageSelector';
import { flow } from 'Config';
import {
    Type,
    TypeMap,
    GetTypeConfig,
    typeConfigList,
    actionConfigList,
    typeConfigMap,
    getTypeConfig
} from './typeConfigs';
import {
    Operator,
    OperatorMap,
    GetOperatorConfig,
    operatorConfigList,
    operatorConfigMap,
    getOperatorConfig
} from './operatorConfigs';
import {
    GetActivity,
    GetFlows,
    GetFlow,
    SaveFlow,
    getActivity,
    getFlows,
    getFlow,
    saveFlow
} from './external';
import { childContextPT } from './propTypes';

export const getBaseLanguage = (languages: Languages): Language => {
    const [iso] = Object.keys(languages);
    const name = languages[iso];
    return {
        name,
        iso
    };
};

export interface ConfigProviderProps {
    flowEditorConfig: FlowEditorConfig;
}

export interface ConfigProviderContext {
    typeConfigList: Type[];
    operatorConfigList: Operator[];
    actionConfigList: Type[];
    typeConfigMap: TypeMap;
    operatorConfigMap: OperatorMap;
    getTypeConfig: GetTypeConfig;
    getOperatorConfig: GetOperatorConfig;
    getActivity: GetActivity;
    getFlows: GetFlows;
    getFlow: GetFlow;
    saveFlow: SaveFlow;
    flow: string;
    baseLanguage: Language;
    endpoints: Endpoints;
    languages: Languages;
}

export default class ConfigProvider extends React.Component<ConfigProviderProps> {
    public static childContextTypes = childContextPT;

    constructor(props: ConfigProviderProps) {
        super(props);
    }

    public getChildContext(): ConfigProviderContext {
        const { flowEditorConfig: { endpoints, languages } } = this.props;
        const baseLanguage = getBaseLanguage(languages);
        return {
            typeConfigList,
            operatorConfigList,
            actionConfigList,
            typeConfigMap,
            operatorConfigMap,
            getTypeConfig,
            getOperatorConfig,
            getActivity,
            getFlows,
            getFlow,
            saveFlow,
            flow,
            baseLanguage,
            endpoints,
            languages
        };
    }

    public render(): JSX.Element {
        return React.Children.only(this.props.children);
    }
}
