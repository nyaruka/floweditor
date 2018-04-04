import { v4 as generateUUID } from 'uuid';
import { createSetup, getSpecWrapper } from '../../testUtils';
import HeaderElement, {
    Header,
    headerContainerSpecId,
    HeaderElementProps,
    nameContainerSpecId,
    removeIcoSpecId,
    valueConatainerSpecId,
    NAME_PLACEHOLDER,
    VALUE_PLACEHOLDER,
    HEADER_NAME_ERROR
} from './HeaderElement';

const headers: Header[] = [
    {
        uuid: '00c4498e-1c9e-4c26-aa7c-f81d13573129',
        name: 'Content-Type',
        value: 'application/json'
    },
    {
        uuid: '3e7d8366-22ff-452b-953e-3a9a88b5d72c ',
        name: 'Authorization',
        value:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ'
    },
    { uuid: '236f2392-e576-4254-8c28-db175510c6a8', name: '', value: '' }
];

const baseProps: HeaderElementProps = {
    name: `header_${headers[0].uuid}`,
    header: headers[0],
    index: 0,
    onRemove: jest.fn(),
    onChange: jest.fn()
};

const setup = createSetup<HeaderElementProps>(HeaderElement, baseProps);

const COMPONENT_TO_TEST = HeaderElement.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const { wrapper, props: { name, header }, instance } = setup({}, true);
            const inputs = wrapper.find('Connect(TextInputElement)');

            expect(wrapper.find('FormElement').props()).toEqual(
                expect.objectContaining({
                    name,
                    errors: []
                })
            );
            expect(getSpecWrapper(wrapper, headerContainerSpecId).hasClass('header')).toBeTruthy();
            expect(
                getSpecWrapper(wrapper, nameContainerSpecId).hasClass('header_name')
            ).toBeTruthy();
            expect(inputs.at(0).props()).toEqual({
                placeholder: NAME_PLACEHOLDER,
                name: 'name',
                onChange: instance.onChangeName,
                value: header.name,
                showInvalid: false
            });
            expect(
                getSpecWrapper(wrapper, valueConatainerSpecId).hasClass('header_value')
            ).toBeTruthy();
            expect(inputs.at(1).props()).toEqual({
                placeholder: VALUE_PLACEHOLDER,
                name: 'value',
                onChange: instance.onChangeValue,
                value: header.value,
                autocomplete: true
            });
            expect(getSpecWrapper(wrapper, removeIcoSpecId).exists()).toBeFalsy();
            expect(wrapper).toMatchSnapshot();
        });

        it('should render remove icon', () => {
            const { wrapper, instance } = setup({ index: 1, empty: false }, true);
            const removeIcon = getSpecWrapper(wrapper, removeIcoSpecId);

            expect(removeIcon.hasClass('removeIco')).toBeTruthy();
            expect(removeIcon.props()).toEqual(
                expect.objectContaining({
                    onClick: instance.onRemove
                })
            );
            expect(wrapper.find('.icon-remove').exists()).toBeTruthy();
            expect(wrapper).toMatchSnapshot();
        });

        it('should indicate header error to TextInputElement', () => {
            const { wrapper } = setup({}, true);

            wrapper.setState({ errors: [HEADER_NAME_ERROR] }, () => wrapper.update());

            expect(
                wrapper
                    .find('Connect(TextInputElement)')
                    .at(0)
                    .prop('showInvalid')
            ).toBeTruthy();
        });
    });

    describe('instance methods', () => {
        describe('onChangeName', () => {
            it('should update state, call onChange prop', () => {
                const setStateSpy = jest.spyOn(HeaderElement.prototype, 'setState');
                const { wrapper, props: { onChange: onChangeMock }, instance } = setup(
                    { onChange: jest.fn() },
                    true
                );
                const mockEvent = {
                    currentTarget: {
                        value: headers[0].name
                    }
                };

                instance.onChangeName(mockEvent);
                wrapper.update();

                expect(setStateSpy).toHaveBeenCalledTimes(1);
                expect(setStateSpy).toHaveBeenCalledWith(
                    { name: headers[0].name },
                    expect.any(Function)
                );
                expect(onChangeMock).toHaveBeenCalledTimes(1);
                expect(onChangeMock).toHaveBeenCalledWith(expect.any(HeaderElement));
                expect(
                    wrapper
                        .find('Connect(TextInputElement)')
                        .at(0)
                        .prop('value')
                ).toBe(headers[0].name);
                expect(wrapper).toMatchSnapshot();

                setStateSpy.mockRestore();
            });
        });

        describe('onChangeValue', () => {
            it('should update state, call onChange prop', () => {
                const setStateSpy = jest.spyOn(HeaderElement.prototype, 'setState');
                const { wrapper, props: { onChange: onChangeMock }, instance } = setup(
                    { onChange: jest.fn() },
                    true
                );
                const mockEvent = {
                    currentTarget: {
                        value: headers[0].value
                    }
                };

                instance.onChangeValue(mockEvent);
                wrapper.update();

                expect(setStateSpy).toHaveBeenCalledTimes(1);
                expect(setStateSpy).toHaveBeenCalledWith(
                    { value: headers[0].value },
                    expect.any(Function)
                );
                expect(onChangeMock).toHaveBeenCalledTimes(1);
                expect(onChangeMock).toHaveBeenCalledWith(expect.any(HeaderElement));
                expect(
                    wrapper
                        .find('Connect(TextInputElement)')
                        .at(1)
                        .prop('value')
                ).toBe(headers[0].value);
                expect(wrapper).toMatchSnapshot();

                setStateSpy.mockRestore();
            });
        });
    });

    describe('onRemove', () => {
        it('should call onRemove prop', () => {
            const { wrapper, props: { onRemove: onRemoveMock }, instance } = setup(
                { onRemove: jest.fn() },
                true
            );

            instance.onRemove();

            expect(onRemoveMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('validate', () => {
        it('should return true, update state if errors', () => {
            const setStateSpy = jest.spyOn(HeaderElement.prototype, 'setState');
            const namelessHeader = { ...headers[0], name: '' };
            const { wrapper, instance } = setup({ header: namelessHeader }, true);

            expect(instance.validate()).toBeFalsy();
            expect(setStateSpy).toHaveBeenCalledTimes(1);
            expect(setStateSpy).toHaveBeenCalledWith({ errors: [HEADER_NAME_ERROR] });

            setStateSpy.mockRestore();
        });

        it('should return false, update state if no errors', () => {
            const setStateSpy = jest.spyOn(HeaderElement.prototype, 'setState');
            const { wrapper, instance } = setup({}, true);

            expect(instance.validate()).toBeTruthy();
            expect(setStateSpy).toHaveBeenCalledTimes(1);
            expect(setStateSpy).toHaveBeenCalledWith({ errors: [] });

            setStateSpy.mockRestore();
        });
    });
});
