import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import { shallow, ShallowWrapper } from 'enzyme';
import HeaderElement, { Header } from './HeaderElement';

const headers: Header[] = [
    { uuid: generateUUID(), name: 'Content-Type', value: 'application/json' },
    {
        uuid: generateUUID(),
        name: 'Authorization',
        value:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ'
    },
    { uuid: generateUUID(), name: '', value: '' }
];

describe('render >', () => {
    headers.forEach((header, idx, arr) => {
        const isEmpty: boolean = idx === arr.length - 1;
        if (idx === 0 || isEmpty) {
            it("shouldn't render remove icon for first or last header", () => {
                const wrapper: ShallowWrapper = shallow(
                    <HeaderElement {...{ header, empty: isEmpty } as any} />
                );

                expect(wrapper.find('.remove-ico').exists()).toBeFalsy();
            });
        }
    });
});
