import { Types } from '../../../config/typeConfigs';
import { composeComponentTestUtils, getSpecWrapper, setMock } from '../../../testUtils';
import { createAddGroupsAction } from '../../../testUtils/assetCreators';
import { set } from '../../../utils';
import AddGroupsForm, { LABEL, labelSpecId } from './AddGroupsForm';
import { mapAssetsToGroups, mapGroupsToAssets } from './helpers';
import ChangeGroupsFormProps from './props';

const { assets: groups } = require('../../../../__test__/assets/groups.json');

const addGroupsAction = createAddGroupsAction();

const baseProps: ChangeGroupsFormProps = {
    action: addGroupsAction,
    updateAction: jest.fn(),
    onBindWidget: jest.fn(),
    removeWidget: jest.fn(),
    groups: []
};

const { setup, spyOn } = composeComponentTestUtils<ChangeGroupsFormProps>(AddGroupsForm, baseProps);

describe(AddGroupsForm.name, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const {
                wrapper,
                props,
                // tslint:disable-next-line:no-shadowed-variable
                context,
                instance
            } = setup(false, {
                onBindWidget: setMock()
            });
            const label = getSpecWrapper(wrapper, labelSpecId);

            expect(label.is('p')).toBeTruthy();
            expect(label.text()).toBe(LABEL);
            expect(props.onBindWidget).toHaveBeenCalledTimes(1);
            expect(wrapper.find('GroupsElement').props()).toMatchSnapshot();
        });
    });

    describe('instance methods', () => {
        describe('getGroups', () => {
            it("should return an empty list if action's groups are null", () => {
                const grouplessAction = { ...addGroupsAction, groups: null };
                const { wrapper, instance } = setup(true, {
                    action: set(grouplessAction)
                });

                const returnedGroups = instance.getGroups();

                expect(returnedGroups).toEqual([]);
                expect(returnedGroups).toMatchSnapshot();
            });

            it("should return an empty list if action's groups property is an empty list", () => {
                const grouplessAction = { ...addGroupsAction, groups: [] };
                const { wrapper, instance } = setup(true, {
                    action: set(grouplessAction)
                });

                const returnedGroups = instance.getGroups();

                expect(returnedGroups).toEqual([]);
                expect(returnedGroups).toMatchSnapshot();
            });

            it('should return empty list if action is remove groups action', () => {
                const removeGroupsAction = {
                    ...addGroupsAction,
                    type: Types.remove_contact_groups
                };
                const { wrapper, instance } = setup(true, {
                    action: set(removeGroupsAction)
                });
                const groupOptions = instance.getGroups();

                expect(groupOptions).toEqual([]);
                expect(groupOptions).toMatchSnapshot();
            });

            it('should return SearchResult[] if action is add groups action and it has groups', () => {
                const { wrapper, instance, props } = setup();
                const searchResults = mapGroupsToAssets(props.action.groups);
                const groupOptions = instance.getGroups();

                expect(groupOptions).toEqual(searchResults);
                expect(groupOptions).toMatchSnapshot();
            });
        });

        describe('onValid', () => {
            it('should call updateAction action creator with a ChangeGroups action', () => {
                const { wrapper, instance, props } = setup(false, { updateAction: setMock() });
                const widgets = {
                    Groups: {
                        state: {
                            groups: props.groups
                        }
                    }
                };
                const expectedAction = {
                    uuid: props.action.uuid,
                    type: props.action.type,
                    groups: mapAssetsToGroups(widgets.Groups.state.groups)
                };

                instance.onValid(widgets);

                expect(props.updateAction).toHaveBeenCalledWith(expectedAction);
            });
        });
    });
});
