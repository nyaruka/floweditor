import AssetService, {
    Assets,
    AssetSearchResult,
    AssetType,
    LabelAssets
} from '~/services/AssetService';

const config = require('~/test/config');

describe('AssetService', () => {
    let assetService: AssetService;

    beforeEach(() => {
        assetService = new AssetService(config);
    });

    describe('groups', () => {
        let groups: Assets;
        beforeEach(() => {
            groups = assetService.getGroupAssets();
        });

        it('should initialize group assets', () => {
            expect(groups).toMatchSnapshot();
        });

        it('should add groups', () => {
            // we are local storage, this should be added to our items
            groups.add({ name: 'Group A', id: 'groupA', type: AssetType.Group });
            expect(groups).toMatchSnapshot();
        });

        describe('searching', () => {
            beforeEach(() => {
                groups.addAll([
                    { name: 'Monkey Happy', id: 'monkey_happy', type: AssetType.Group },
                    { name: 'Monkey Haters', id: 'monkey_haters', type: AssetType.Group },
                    { name: 'Monkey Lovers', id: 'monkey_lovers', type: AssetType.Group }
                ]);
            });

            it('should return everything for empty search', () => {
                return groups.search('').then((assets: AssetSearchResult) => {
                    expect(assets.results.length).toBe(8);
                    expect(assets).toMatchSnapshot('empty');
                });
            });

            it('should search for "monkey"', () => {
                return groups.search('monkey').then((assets: AssetSearchResult) => {
                    expect(assets.results.length).toBe(3);
                    expect(assets).toMatchSnapshot('monkey');
                });
            });

            it('should search for "monkey ha"', () => {
                return groups.search('monkey ha').then((assets: AssetSearchResult) => {
                    expect(assets.results.length).toBe(2);
                    expect(assets).toMatchSnapshot('monkey ha');
                });
            });

            it('should search for "monkey hap"', () => {
                return groups.search('monkey hap').then((assets: AssetSearchResult) => {
                    expect(assets.results.length).toBe(1);
                    expect(assets).toMatchSnapshot('monkey hap');
                });
            });
        });

        it('should not add duplicates', () => {
            groups.add({ name: 'Group A', id: 'groupA', type: AssetType.Group });
            groups.add({ name: 'Group A', id: 'groupA', type: AssetType.Group });
            return groups.search('group').then((assets: AssetSearchResult) => {
                expect(assets.results.length).toBe(1);
                expect(groups).toMatchSnapshot();
            });
        });
    });

    describe('flows', () => {
        let flows: Assets;
        beforeEach(() => {
            flows = assetService.getFlowAssets();
        });

        it('should initialize field assets', () => {
            expect(flows).toMatchSnapshot();
        });
    });

    describe('fields', () => {
        let fields: Assets;
        beforeEach(() => {
            fields = assetService.getGroupAssets();
        });

        it('should initialize field assets', () => {
            expect(fields).toMatchSnapshot();
        });
    });

    describe('labels', () => {
        let labels: LabelAssets;
        beforeEach(() => {
            labels = assetService.getLabelAssets();
        });

        it('should initialize label assets', () => {
            expect(labels).toMatchSnapshot();
        });
    });
});
