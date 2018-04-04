import ConfigProvider, {
    ConfigProviderContext,
    assetHostPT,
    endpointsPT,
    languagesPT,
    flowPT
} from './ConfigProvider';
import { Type, Mode, typeConfigList, getTypeConfig } from './typeConfigs';
import { Operator, operatorConfigList, getOperatorConfig } from './operatorConfigs';

export {
    ConfigProviderContext,
    Type,
    Mode,
    Operator,
    assetHostPT,
    endpointsPT,
    languagesPT,
    flowPT,
    typeConfigList,
    getTypeConfig,
    operatorConfigList,
    getOperatorConfig
};

export default ConfigProvider;
