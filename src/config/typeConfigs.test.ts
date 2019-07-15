import { getTypeConfig, typeConfigList, typeConfigMap } from 'config/typeConfigs';

describe('typeConfigs', () => {
  it('should provide type configs', () => {
    expect(typeConfigList).toMatchSnapshot();
    expect(typeConfigMap).toMatchSnapshot();

    Object.keys(typeConfigMap).forEach((key: string) =>
      expect(getTypeConfig(key as any)).toEqual(typeConfigMap[key])
    );
  });
});
