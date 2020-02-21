import ChangeGroupsComp, {
  contentSpecId,
  getChangeGroupsMarkup,
  getContentMarkup,
  getRemoveAllMarkup,
  MAX_TO_SHOW
} from 'components/flow/actions/changegroups/ChangeGroups';
import { Types } from 'config/interfaces';
import { ChangeGroups } from 'flowTypes';
import { composeComponentTestUtils, getSpecWrapper } from 'testUtils';
import { createAddGroupsAction } from 'testUtils/assetCreators';
import { set } from 'utils';

const { results: groups } = require('test/assets/groups.json');

const addGroupsAction: ChangeGroups = createAddGroupsAction({ groups: groups.slice(2) });

const { setup } = composeComponentTestUtils<ChangeGroups>(ChangeGroupsComp, addGroupsAction);

describe(ChangeGroupsComp.name, () => {
  describe('helpers', () => {
    describe('getRemoveAllMarkup', () => {
      it('should return remove-all markup', () => {
        expect(getRemoveAllMarkup()).toMatchSnapshot();
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

    it('should limit div to max number of groups', () => {
      const { wrapper } = setup(true, { groups: set(groups) });
      const content = getSpecWrapper(wrapper, contentSpecId);

      expect(content.children().length).toBe(MAX_TO_SHOW);
      expect(wrapper).toMatchSnapshot();
    });

    it("should render 'remove from all' markup when passed group action of type Types.remove_contact_groups", () => {
      const { wrapper } = setup(true, {
        groups: set([]),
        type: set(Types.remove_contact_groups)
      });

      expect(wrapper.children().length).toBe(1);
      expect(wrapper.containsMatchingElement(getRemoveAllMarkup())).toBeTruthy();
      expect(wrapper).toMatchSnapshot();
    });
  });
});
