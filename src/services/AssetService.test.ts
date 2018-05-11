import * as config from '../../__test__/config';
import AssetService, { Assets, AssetSearchResult, AssetType } from './AssetService';

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
                return groups.search('').then((results: AssetSearchResult) => {
                    expect(results.assets.length).toBe(8);
                    expect(results).toMatchSnapshot('empty');
                });
            });

            it('should search for "monkey"', () => {
                return groups.search('monkey').then((results: AssetSearchResult) => {
                    expect(results.assets.length).toBe(3);
                    expect(results).toMatchSnapshot('monkey');
                });
            });

            it('should search for "monkey ha"', () => {
                return groups.search('monkey ha').then((results: AssetSearchResult) => {
                    expect(results.assets.length).toBe(2);
                    expect(results).toMatchSnapshot('monkey ha');
                });
            });

            it('should search for "monkey hap"', () => {
                return groups.search('monkey hap').then((results: AssetSearchResult) => {
                    expect(results.assets.length).toBe(1);
                    expect(results).toMatchSnapshot('monkey hap');
                });
            });
        });

        it('should not add duplicates', () => {
            groups.add({ name: 'Group A', id: 'groupA', type: AssetType.Group });
            groups.add({ name: 'Group A', id: 'groupA', type: AssetType.Group });
            return groups.search('group').then((results: AssetSearchResult) => {
                expect(results.assets.length).toBe(1);
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
