import {
    object,
    arrayOf,
    shape,
    string,
    element,
    func,
    oneOf,
    number,
    objectOf
} from 'prop-types';

export const typeConfigListPT = arrayOf(
    shape({
        type: string.isRequired,
        name: string.isRequired,
        description: string.isRequired,
        allows: func.isRequired,
        component: func,
        form: func,
        advanced: oneOf([1, 2])
    })
);

export const operatorConfigListPT = arrayOf(
    shape({
        type: string,
        verboseName: string,
        operands: number,
        categoryName: string
    })
);

export const configMapPT = objectOf(object);

export const getTypeConfigPT = func;
export const getOperatorConfigPT = func;
export const getActivityPT = func;
export const getFlowsPT = func;
export const getFlowPT = func;
export const saveFlowPT = func;

export const flowPT = string;

export const baseLanguagePT = shape({
    name: string,
    iso: string
});

export const endpointsPT = shape({
    fields: string,
    groups: string,
    engine: string,
    contacts: string,
    flows: string,
    activity: string
});

export const languagesPT = objectOf(string);

export const childContextPT = {
    typeConfigList: typeConfigListPT,
    operatorConfigList: operatorConfigListPT,
    actionConfigList: typeConfigListPT,
    typeConfigMap: configMapPT,
    operatorConfigMap: configMapPT,
    getTypeConfig: getTypeConfigPT,
    getOperatorConfig: getOperatorConfigPT,
    getActivity: getActivityPT,
    getFlows: getFlowsPT,
    getFlow: getFlowPT,
    saveFlow: saveFlowPT,
    flow: flowPT,
    baseLanguage: baseLanguagePT,
    endpoints: endpointsPT,
    languages: languagesPT
};
