import * as React from 'react';

import { Asset, Assets } from '../../services/AssetService';
import { getSelectClassForEntry } from '../../utils';
import SelectSearch from '../SelectSearch/SelectSearch';
import FormElement, { FormElementProps } from './FormElement';

interface FlowElementProps extends FormElementProps {
    endpoint?: string;
    placeholder?: string;
    assets: Assets;
    onChange?: (selected: Asset[]) => void;
}

export const notFound: string = 'Enter the name of an existing flow';

export default class FlowElement extends React.Component<FlowElementProps> {
    constructor(props: FlowElementProps) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    private handleChange(selected: Asset[]): void {
        if (this.props.onChange) {
            this.props.onChange(selected);
        }
    }

    public render(): JSX.Element {
        return (
            <FormElement name={this.props.name} entry={this.props.entry}>
                <SelectSearch
                    __className={getSelectClassForEntry(this.props.entry)}
                    onChange={this.handleChange}
                    name={this.props.name}
                    assets={this.props.assets}
                    multi={false}
                    initial={[this.props.entry.value]}
                    searchPromptText={notFound}
                />
            </FormElement>
        );
    }
}
