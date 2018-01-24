import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import GroupElement, {
    GroupElementProps,
    GroupList,
    transformGroups,
    isValidNewOption,
    createNewOption
} from './GroupElement';
import Config from '../../providers/ConfigProvider/configContext';
import { GROUP_PLACEHOLDER, GROUP_NOT_FOUND } from '../routers/SwitchRouter';
import { SearchResult } from '../../services/ComponentMap';
import { validUUID } from '../../helpers/utils';
import { transformGroups } from './GroupElement';

const { results: groupsResp } = require('../../../assets/groups.json');

describe('GroupElement >', () => {
    const props: GroupElementProps = {
        name: 'Group',
        endpoint: Config.endpoints,
        placeholder: GROUP_PLACEHOLDER,
        searchPromptText: GROUP_NOT_FOUND,
        required: true
    };

    const groupList: GroupList = groupsResp.map(({ name, uuid }) => ({ name, group: uuid }));

    describe('helpers >', () => {
        const newGroup: { label: string } = { label: 'new group' };

        describe('transformGroups >', () => {
            it('should transform group list into search result objects', () => {
                expect(transformGroups(groupList)).toMatchSnapshot();
            });
        });

        describe('isValidNewOption >', () => {
            it('should return false if new option is invalid', () => {
                expect(isValidNewOption({ label: '$$$' })).toBeFalsy();
            });

            it('should return true if new option is valid', () => {
                expect(isValidNewOption(newGroup)).toBeTruthy();
            });
        });

        describe('createNewOption >', () => {
            it('should generate a new search result object', () => {
                const newOption: SearchResult = createNewOption(newGroup);

                expect(validUUID(newOption.id)).toBeTruthy();
                expect(newOption.name).toBe(newGroup.label);
                expect(newOption.extraResult).toBeTruthy();
            });
        });
    });

    describe('render >', () => {
        describe('split by group membership', () => {
            it('should render <SelectSearch />, pass it expected props', () => {
                const wrapper: ReactWrapper = mount(<GroupElement {...props} />);

                expect(wrapper.find('SelectSearch').props()).toEqual(
                    expect.objectContaining({
                        className: '',
                        onChange: wrapper.instance().onChange,
                        name: props.name,
                        url: props.endpoint,
                        resultType: 'group',
                        multi: true,
                        initial: [],
                        closeOnSelect: false,
                        placeholder: props.placeholder,
                        searchPromptText: props.searchPromptText
                    })
                );
            });
        });
    });

    describe('instance methods >', () => {
        const groups: SearchResult[] = transformGroups(groupList).slice(3);
        const searchResults: SearchResult[] = transformGroups(groupList);

        describe('onChange >', () => {
            it('should update state when called', () => {
                const wrapper: ReactWrapper = mount(<GroupElement {...props} />);

                wrapper.instance().onChange(groups);

                expect(wrapper.state('groups')).toEqual(groups);
            });

            it("should call 'onChange' prop if passed", () => {
                const onChange: jest.Mock<{}> = jest.fn();
                const wrapper: ReactWrapper = mount(<GroupElement {...{ ...props, onChange }} />);

                wrapper.instance().onChange(groups);

                expect(onChange).toHaveBeenCalled();
            });
        });

        describe('validate >', () => {
            it("should return false, update state if GroupElement isn't valid", () => {
                const wrapper: ReactWrapper = mount(<GroupElement {...props} />);

                expect(wrapper.instance().validate()).toBeFalsy();
                expect(wrapper.state('errors')[0]).toBe('Group is required');
            });

            it('should return true if GroupElement is valid', () => {
                const wrapper: ReactWrapper = mount(<GroupElement {...props} />);

                expect(wrapper.instance().onChange(groups));
                expect(wrapper.instance().validate()).toBeTruthy();
            });
        });

        describe('getGroups >', () => {
            it("should return an empty array if GroupElement is passed a falsy 'groups' prop", () => {
                const wrapper: ReactWrapper = mount(<GroupElement {...props} />);

                expect(wrapper.instance().getGroups()).toEqual([]);
            });

            it("should return an array of SearchResult objects if GroupElement is passed a truthy 'groups' prop", () => {
                const wrapper: ReactWrapper = mount(
                    <GroupElement {...{ ...props, groups: groupList }} />
                );

                expect(wrapper.instance().getGroups()).toEqual(searchResults);
            });

            it("should return localGroups array if GroupElement passed 'localGroups' prop but not 'groups'", () => {
                const wrapper: ReactWrapper = mount(
                    <GroupElement {...{ ...props, localGroups: searchResults }} />
                );

                expect(wrapper.instance().getGroups()).toEqual(searchResults);
            });
        });
    });
});
