import { StylesConfig } from 'react-select';

export const large = {
  placeholder: (styles: StylesConfig, state: any) => {
    return { ...styles, color: '#ddd', marginLeft: '3px' };
  },
  singleValue: (styles: StylesConfig, state: any) => {
    return { ...styles, marginLeft: '3px' };
  },
  multiValue: (styles: StylesConfig, state: any) => {
    return { ...styles, marginLeft: '0px' };
  },
  input: (styles: StylesConfig, state: any) => {
    return {
      ...styles,
      marginLeft: '0px',
      caretColor: '#999',
      marginBottom: '0px',
      boxShadow: 'none',
      border: 'none',
      fontSize: '13px'
    };
  },
  control: (styles: StylesConfig, state: any) => {
    return {
      ...styles,
      borderColor: '#e6e6e6',
      boxShadow: 'none',
      fontSize: '13px',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        borderColor: '#e6e6e6'
      },
      '&:focus-within': {
        boxShadow: 'var(--widget-box-shadow-focused) !important',
        border: '1px solid #a4cafe !important'
      }
    };
  }
};

export const messageStyle = {
  control: (styles: StylesConfig, state: any) => {
    return {
      ...styles,
      borderColor: '#e6e6e6',
      boxShadow: 'none',
      borderBottom: 'none',
      borderBottomRightRadius: '0px',
      borderBottomLeftRadius: '0px',
      '&:hover': {
        borderColor: '#e6e6e6'
      }
    };
  }
};

export const getErroredSelect = (baseControl: any): any => {
  return {
    control: (styles: StylesConfig) => ({
      ...styles,
      ...baseControl,
      borderColor: 'tomato',
      boxShadow: '0 0 0 3px rgba(255,196,186,0.5) !important;',
      '&:hover': {
        borderColor: 'tomato'
      }
    })
  };
};

export const small = {
  control: (styles: StylesConfig) => ({
    ...styles,
    borderColor: '#e6e6e6',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#e6e6e6'
    },
    maxHeight: '28px',
    minHeight: '28px',
    fontSize: '12px',
    lineHeight: '12px',
    marginBottom: '-10px',
    '&:focus-within': {
      boxShadow: 'var(--widget-box-shadow-focused) !important',
      border: '1px solid #a4cafe !important'
    }
  }),
  menuList: (styles: StylesConfig) => ({
    ...styles,
    maxHeight: 200
  }),
  option: (styles: StylesConfig) => ({
    ...styles,
    fontSize: 12
  }),
  singleValue: (styles: StylesConfig) => ({
    ...styles,
    maxHeight: 28,
    lineHeight: '13px'
  }),
  indicatorsContainer: (styles: StylesConfig) => ({
    ...styles,
    height: 28,
    maxHeight: 28
  }),
  valueContainer: (styles: StylesConfig) => ({
    ...styles,
    height: 28,
    maxHeight: 28
  }),
  input: (styles: StylesConfig) => ({
    ...styles,
    marginLeft: '-2px',
    marginTop: '0px',
    caretColor: '#999',
    boxShadow: 'none',
    border: 'none',
    maxHeight: '20px',
    minHeight: '20px',
    lineHeight: '12px'
  })
};

export const tagging = {
  control: (styles: StylesConfig, state: any) => {
    return {
      ...styles,
      borderColor: '#e6e6e6',
      boxShadow: 'none',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        borderColor: '#e6e6e6'
      },
      '&:focus-within': {
        boxShadow: 'var(--widget-box-shadow-focused) !important',
        border: '1px solid #a4cafe !important'
      }
    };
  },
  input: (styles: StylesConfig, state: any) => {
    return {
      ...styles,
      marginLeft: '0px',
      caretColor: '#999',
      marginBottom: '0px',
      boxShadow: 'none',
      border: 'none'
    };
  },
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
