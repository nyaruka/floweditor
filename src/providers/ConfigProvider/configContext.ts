// Composes context provided by ConfigProvider.
// Draws from flowEditor.config.*.js in app root.

import { flow, endpoints, languages } from 'Config';
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
    GetFields,
    GetFlows,
    GetFlow,
    SaveFlow,
    getActivity,
    getFields,
    getFlows,
    getFlow,
    saveFlow
} from './external';
import { childContextPT } from './propTypes';
import { Languages, Endpoints } from '../../flowTypes';
import { Language } from '../../components/LanguageSelector';

export const getBaseLanguage = (): Language => {
    const [iso] = Object.keys(languages);
    const name = languages[iso];
    return {
        name,
        iso
    };
};

export interface ConfigProviderContext {
    typeConfigList: Type[];
    operatorConfigList: Operator[];
    actionConfigList: Type[];
    typeConfigMap: TypeMap;
    operatorConfigMap: OperatorMap;
    getTypeConfig: GetTypeConfig;
    getOperatorConfig: GetOperatorConfig;
    getActivity: GetActivity;
    getFields: GetFields;
    getFlows: GetFlows;
    getFlow: GetFlow;
    saveFlow: SaveFlow;
    flow: string;
    baseLanguage: Language;
    endpoints: Endpoints;
    languages: Languages;
}

const baseLanguage = getBaseLanguage();

export default {
    typeConfigList,
    operatorConfigList,
    actionConfigList,
    typeConfigMap,
    operatorConfigMap,
    getTypeConfig,
    getOperatorConfig,
    getActivity,
    getFields,
    getFlows,
    getFlow,
    saveFlow,
    flow,
    baseLanguage,
    endpoints,
    languages
};
