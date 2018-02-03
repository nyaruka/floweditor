jest.mock('Config');

import configContext, { getBaseLanguage } from './configContext';

describe('Providers: ConfigProvider: configContext', () => {
    describe('configContext', () => {
        it('should return app config', () =>
            expect(configContext).toMatchSnapshot());
    });
    describe('getBaseLanguage', () => {
        it("should return the config's base language", () =>
            expect(getBaseLanguage()).toMatchSnapshot());
    });
});
