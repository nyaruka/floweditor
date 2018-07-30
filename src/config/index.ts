import ConfigProvider, { ConfigProviderContext } from '~/config/ConfigProvider';
import { getOperatorConfig, Operator, operatorConfigList } from '~/config/operatorConfigs';
import { getTypeConfig, Type, typeConfigList } from '~/config/typeConfigs';

export {
    ConfigProviderContext,
    Type,
    Operator,
    typeConfigList,
    getTypeConfig,
    operatorConfigList,
    getOperatorConfig
};

export default ConfigProvider;
