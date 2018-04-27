import AssetService, { Assets, AssetType, Asset } from './AssetService';
import { dump } from '../utils';
import * as config from '../../__test__/config';

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
                return groups.search('').then((results: Asset[]) => {
                    expect(results.length).toBe(8);
                    expect(results).toMatchSnapshot('empty');
                });
            });

            it('should search for "monkey"', () => {
                return groups.search('monkey').then((results: Asset[]) => {
                    expect(results.length).toBe(3);
                    expect(results).toMatchSnapshot('monkey');
                });
            });

            it('should search for "monkey ha"', () => {
                groups.search('monkey ha').then((results: Asset[]) => {
                    expect(results.length).toBe(2);
                    expect(results).toMatchSnapshot('monkey ha');
                });
            });

            it('should search for "monkey hap"', () => {
                groups.search('monkey hap').then((results: Asset[]) => {
                    expect(results.length).toBe(1);
                    expect(results).toMatchSnapshot('monkey hap');
                });
            });
        });

        it('should not add duplicates', () => {
            groups.add({ name: 'Group A', id: 'groupA', type: AssetType.Group });
            groups.add({ name: 'Group A', id: 'groupA', type: AssetType.Group });
            groups.search('group').then((results: Asset[]) => {
                expect(results.length).toBe(1);
            });
            expect(groups).toMatchSnapshot();
        });
    });

    describe('flows', () => {
        let flows: Assets;
        beforeEach(() => {
            flows = assetService.getFlowAssets();
        });

        it('should initialize field assets', () => {
            dump(flows);
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
});
