import ConfigProvider, {
    ConfigProviderContext,
    assetHostPT,
    endpointsPT,
    languagesPT
} from './ConfigProvider';
import Config from './Config';
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
    typeConfigList,
    getTypeConfig,
    operatorConfigList,
    getOperatorConfig,
    Config
};

export default ConfigProvider;
