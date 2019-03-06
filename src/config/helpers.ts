import { Operator, Type } from '~/config';
import { FlowTypes, FlowTypeVisibility } from '~/config/interfaces';

export const filterOperators = (operators: Operator[], flowType: FlowTypes): Operator[] => {
    // return filterVisibility(operators, flowType);
    return operators;
};

export const filterTypeConfigs = (typeConfigs: Type[], flowType: FlowTypes): Type[] => {
    return filterVisibility(typeConfigs, flowType);
};

const filterVisibility = (items: FlowTypeVisibility[], flowType: FlowTypes): any[] => {
    return items.filter((item: FlowTypeVisibility) => {
        if (item.visibility === undefined) {
            return true;
        }

        return item.visibility.findIndex((ft: FlowTypes) => ft === flowType) > -1;
    });
};
