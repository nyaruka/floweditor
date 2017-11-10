import * as React from 'react';
import '../../enzymeAdapter';
import { shallow } from 'enzyme';
import LogEvent, { IEventProps } from './LogEvent';

const logEventProps: IEventProps = {
    uuid: '580387d9-a593-453a-9327-46ede2ade646',
    type: 'save_contact_field',
    field_name: 'favorite_color',
    field_uuid: '302f47cc-b5a0-4b9b-9947-46785c6e8b0e',
    result_name: 'result_name',
    value: 'tomato'
};

const LogEventShallow = shallow(<LogEvent {...logEventProps} />);

describe('Component: LogEvent', () => {
    it('should render', () => {
        expect(LogEventShallow.exists()).toBeTruthy();
        expect(LogEventShallow.state('detailsVisible')).toBeFalsy();
    });
});
