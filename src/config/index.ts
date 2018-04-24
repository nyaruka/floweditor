import ConfigProvider, { ConfigProviderContext } from './ConfigProvider';
import { Type, Mode, typeConfigList, getTypeConfig } from './typeConfigs';
import { Operator, operatorConfigList, getOperatorConfig } from './operatorConfigs';

export {
    ConfigProviderContext,
    Type,
    Mode,
    Operator,
    typeConfigList,
    getTypeConfig,
    operatorConfigList,
    getOperatorConfig
};

export default ConfigProvider;
