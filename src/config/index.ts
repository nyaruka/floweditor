import ConfigProvider, { ConfigProviderContext } from '~/config/ConfigProvider';
import { Operator, Type } from '~/config/interfaces';
import { getOperatorConfig, operatorConfigList } from '~/config/operatorConfigs';
import { getTypeConfig, typeConfigList } from '~/config/typeConfigs';

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
