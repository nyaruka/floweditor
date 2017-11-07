import * as React from 'react';
import { ISaveFlowResult } from '../../../flowTypes';
import withAction from '../../enhancers/withAction';

export const SaveFlowResultCompBase = ({ value, result_name }: ISaveFlowResult) => {
    if (value) {
        return (
            <div>
                Save {value} as <span className="emph">{result_name}</span>
            </div>
        );
    }
    return (
        <div>
            Clear value for <span className="emph">{result_name}</span>
        </div>
    );
};

export default withAction()(SaveFlowResultCompBase)
