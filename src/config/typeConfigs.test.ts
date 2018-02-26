import { typeConfigList, actionConfigList, typeConfigMap, getTypeConfig } from './typeConfigs';

describe('typeConfigs >', () => {
    it('should provide type configs', () => {
        expect(typeConfigList).toMatchSnapshot();
        expect(actionConfigList).toMatchSnapshot();
        expect(typeConfigMap).toMatchSnapshot();

        Object.keys(typeConfigMap).forEach(key =>
            expect(getTypeConfig(key)).toEqual(typeConfigMap[key])
        );
    });
});
