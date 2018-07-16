import ConfigProvider, { ConfigProviderContext } from '~/config/ConfigProvider';
import { getOperatorConfig, Operator, operatorConfigList } from '~/config/operatorConfigs';
import { getTypeConfig, Mode, Type, typeConfigList } from '~/config/typeConfigs';

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
