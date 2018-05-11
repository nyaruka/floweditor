import { getTypeConfig, typeConfigList, typeConfigMap, Types } from './typeConfigs';

describe('typeConfigs', () => {
    it('should provide type configs', () => {
        expect(typeConfigList).toMatchSnapshot();
        expect(typeConfigMap).toMatchSnapshot();

        Object.keys(typeConfigMap).forEach((key: Types) =>
            expect(getTypeConfig(key)).toEqual(typeConfigMap[key])
        );
    });
});
