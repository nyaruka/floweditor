import { ChangeGroups, FlowDefinition } from '../../../flowTypes';
import { createSetup, getSpecWrapper } from '../../../testUtils';
import ChangeGroupsComp, {
    contentSpecId,
    ellipsesText,
    getRemoveAllMarkup,
    getGroupElements,
    getContentMarkup,
    getChangeGroupsMarkup
} from './ChangeGroups';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { results: groups } = require('../../../../assets/groups.json');

const { nodes: [node], language: flowLanguage } = definition as FlowDefinition;
const { actions: [, addToGroupsAction] } = node;

const setup = createSetup<ChangeGroups>(ChangeGroupsComp, addToGroupsAction as ChangeGroups);

const COMPONENT_TO_TEST = ChangeGroupsComp.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('helpers', () => {
        describe('getRemoveAllMarkup', () => {
            it('should return remove-all markup', () => {
                expect(getRemoveAllMarkup()).toMatchSnapshot();
            });
        });

        describe('getGroupElements', () => {
            it('should return a list of group elements', () => {
                expect(getGroupElements([])).toEqual([]);
                expect(
                    getGroupElements((addToGroupsAction as ChangeGroups).groups)
                ).toMatchSnapshot();
            });
        });

        describe('getContentMarkup', () => {
            it('should return list of elements that contains remove-all markup', () => {
                const markup = getContentMarkup({
                    type: 'remove_contact_groups',
                    groups: []
                } as ChangeGroups);

                expect(markup.length).toBe(1);
                expect(markup).toMatchSnapshot();
            });

            it('should return list of group elements', () => {
                const markup = getContentMarkup(addToGroupsAction as ChangeGroups);

                expect(markup.length).toBeGreaterThanOrEqual(1);
                expect(markup).toMatchSnapshot();
            });
        });

        describe('getChangeGroupsMarkup', () => {
            it(`should return ${COMPONENT_TO_TEST} markup w/ container`, () => {
                expect(getChangeGroupsMarkup(addToGroupsAction as ChangeGroups)).toMatchSnapshot();
            });
        });
    });
    describe('render', () => {
        it('should render group name', () => {
            const { wrapper, props } = setup({}, true);

            expect(props.groups.length === 1).toBeTruthy();
            expect(wrapper.html().indexOf(props.groups[0].name)).toBeTruthy();
            expect(wrapper).toMatchSnapshot();
        });

        it('should limit div to 3 groups, include ellipsesText', () => {
            const { wrapper } = setup({ groups }, true);
            const content = getSpecWrapper(wrapper, contentSpecId);

            expect(content.children().length).toBe(4);
            expect(content.childAt(3).text()).toBe(ellipsesText);
            expect(wrapper).toMatchSnapshot();
        });

        it("should render 'remove from all' markup when passed group action of type 'remove_contact_groups'", () => {
            const { wrapper, props } = setup({ groups: [], type: 'remove_contact_groups' }, true);

            expect(wrapper.children().length).toBe(1);
            expect(wrapper.containsMatchingElement(getRemoveAllMarkup())).toBeTruthy();
            expect(wrapper).toMatchSnapshot();
        });
    });
});
