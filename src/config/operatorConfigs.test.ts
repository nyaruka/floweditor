import { getOperatorConfig, operatorConfigList, operatorConfigMap } from './operatorConfigs';

describe('Providers: ConfigProvider: operatorConfigs', () => {
    it('should provide operator config', () => {
        expect(operatorConfigList).toMatchSnapshot();
        expect(operatorConfigMap).toMatchSnapshot();

        Object.keys(operatorConfigMap).forEach((key: any) =>
            expect(getOperatorConfig(key)).toEqual(operatorConfigMap[key])
        );
    });
});
