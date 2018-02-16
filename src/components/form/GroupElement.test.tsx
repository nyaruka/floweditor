import * as React from 'react';
import { mount } from 'enzyme';
import GroupElement, {
    GroupElementProps,
    GROUP_PLACEHOLDER,
    GROUP_NOT_FOUND,
    isValidNewOption,
    createNewOption,
    getInitialGroups
} from './GroupElement';
import { SearchResult } from '../../services/ComponentMap';
import { validUUID } from '../../helpers/utils';
import configContext from '../../providers/ConfigProvider/configContext';

const { results: groupsResp } = require('../../../assets/groups.json');

describe('GroupElement >', () => {
    const props: GroupElementProps = {
        name: 'Group',
        endpoint: configContext.endpoints.groups,
        required: true
    };

    const groupOptions: SearchResult[] = groupsResp.map(({ name, uuid }) => ({
        name,
        id: uuid
    }));

    describe('helpers >', () => {
        const newGroup: { label: string } = { label: 'new group' };

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

        describe('getInitialGroups >', () => {
            it("should return an empty array if passed a falsy 'groups' prop", () => {
                expect(getInitialGroups(props)).toEqual([]);
            });

            it("should return an array of SearchResult objects if passed a truthy 'groups' prop", () => {
                expect(
                    getInitialGroups({
                        groups: groupOptions
                    } as GroupElementProps)
                ).toEqual(groupOptions);
            });

            it("should return localGroups array if GroupElement passed 'localGroups' prop but not 'groups'", () => {
                expect(
                    getInitialGroups({
                        localGroups: groupOptions
                    } as GroupElementProps)
                ).toEqual(groupOptions);
            });
        });
    });

    describe('render >', () => {
        describe('split by group membership', () => {
            it('should render <SelectSearch />, pass it expected props', () => {
                const wrapper = mount(<GroupElement {...props} />);

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
                        placeholder: GROUP_PLACEHOLDER,
                        searchPromptText: GROUP_NOT_FOUND
                    })
                );
            });
        });
    });

    describe('instance methods >', () => {
        const groups: SearchResult[] = groupOptions.slice(3);

        describe('onChange >', () => {
            it('should update state when called', () => {
                const wrapper = mount(<GroupElement {...props} />);

                wrapper.instance().onChange(groups);

                expect(wrapper.state('groups')).toEqual(groups);
            });

            it("should call 'onChange' prop if passed", () => {
                const onChange = jest.fn();
                const wrapper = mount(<GroupElement {...{ ...props, onChange }} />);

                wrapper.instance().onChange(groups);

                expect(onChange).toHaveBeenCalled();
            });
        });

        describe('validate >', () => {
            it("should return false, update state if GroupElement isn't valid", () => {
                const wrapper = mount(<GroupElement {...props} />);

                expect(wrapper.instance().validate()).toBeFalsy();
                expect(wrapper.state('errors')[0]).toBe('Group is required');
            });

            it('should return true if GroupElement is valid', () => {
                const wrapper = mount(<GroupElement {...props} />);

                expect(wrapper.instance().onChange(groups));
                expect(wrapper.instance().validate()).toBeTruthy();
            });
        });
    });
});
