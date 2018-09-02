import { StylesConfig } from 'react-select/lib/styles';
import { border } from '~/components/form/FormElement.scss';

export const small = {
    control: (styles: StylesConfig) => ({
        ...styles,
        minHeight: 28,
        maxHeight: 28,
        fontSize: 12
    }),
    menuList: (styles: StylesConfig) => ({
        ...styles,
        maxHeight: 200
    }),
    option: (styles: StylesConfig) => ({
        ...styles,
        fontSize: 12
    })
};

export const tagging = {
    multiValue: (styles: StylesConfig) => {
        return {
            ...styles,
            maxHeight: 24,
            minHeight: 24,
            lineHeight: '17px',
            backgroundColor: 'hsl(0, 0%, 94%)',
            border: '1px solid hsl(0, 0%, 85%)'
        };
    }
};
