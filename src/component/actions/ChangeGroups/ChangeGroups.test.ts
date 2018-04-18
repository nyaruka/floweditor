import { Types } from '../../../config/typeConfigs';
import { ChangeGroups } from '../../../flowTypes';
import { composeComponentTestUtils, getSpecWrapper } from '../../../testUtils';
import { createAddGroupsAction } from '../../../testUtils/assetCreators';
import { set } from '../../../utils';
import ChangeGroupsComp, {
    contentSpecId,
    ellipsesText,
    getChangeGroupsMarkup,
    getContentMarkup,
    getGroupElements,
    getRemoveAllMarkup
} from './ChangeGroups';

const { results: groups } = require('../../../../assets/groups.json');

const addGroupsAction = createAddGroupsAction({ groups: groups.slice(2) });

const { setup } = composeComponentTestUtils<ChangeGroups>(ChangeGroupsComp, addGroupsAction);

describe(ChangeGroupsComp.name, () => {
    describe('helpers', () => {
        describe('getRemoveAllMarkup', () => {
            it('should return remove-all markup', () => {
                expect(getRemoveAllMarkup()).toMatchSnapshot();
            });
        });

        describe('getGroupElements', () => {
            it('should return a list of group elements', () => {
                expect(getGroupElements([])).toEqual([]);
                expect(getGroupElements(addGroupsAction.groups)).toMatchSnapshot();
            });
        });

        describe('getContentMarkup', () => {
            it('should return list of elements that contains remove-all markup', () => {
                const markup = getContentMarkup({
                    type: Types.remove_contact_groups,
                    groups: []
                } as ChangeGroups);

                expect(markup.length).toBe(1);
                expect(markup).toMatchSnapshot();
            });

            it('should return list of group elements', () => {
                const markup = getContentMarkup(addGroupsAction);

                expect(markup.length).toBeGreaterThanOrEqual(1);
                expect(markup).toMatchSnapshot();
            });
        });

        describe('getChangeGroupsMarkup', () => {
            it(`should return ${ChangeGroupsComp.name} markup w/ container`, () => {
                expect(getChangeGroupsMarkup(addGroupsAction)).toMatchSnapshot();
            });
        });
    });
    describe('render', () => {
        it('should render group name', () => {
            const { wrapper, props } = setup();

            expect(wrapper.html().indexOf(props.groups[0].name)).toBeTruthy();
            expect(wrapper).toMatchSnapshot();
        });

        it('should limit div to 3 groups, include ellipsesText', () => {
            const { wrapper } = setup(true, { groups: set(groups) });
            const content = getSpecWrapper(wrapper, contentSpecId);

            expect(content.children().length).toBe(4);
            expect(content.childAt(3).text()).toBe(ellipsesText);
            expect(wrapper).toMatchSnapshot();
        });

        it("should render 'remove from all' markup when passed group action of type Types.remove_contact_groups", () => {
            const { wrapper, props } = setup(true, {
                groups: set([]),
                type: set(Types.remove_contact_groups)
            });

            expect(wrapper.children().length).toBe(1);
            expect(wrapper.containsMatchingElement(getRemoveAllMarkup())).toBeTruthy();
            expect(wrapper).toMatchSnapshot();
        });
    });
});
