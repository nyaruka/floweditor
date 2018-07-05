import * as React from 'react';
import SelectSearch from '~/components/form/selectsearch/SelectSearch';
import AssetService, { Asset, Assets } from '~/services/AssetService';
import { getSelectClassForEntry } from '~/utils';

import FormElement, { FormElementProps } from './FormElement';

export interface GroupOption {
    group: string;
    name: string;
}

export interface OmniboxElementProps extends FormElementProps {
    add?: boolean;
    placeholder?: string;
    searchPromptText?: string | JSX.Element;
    onChange?: (groups: Asset[]) => void;
    assets: Assets;
    className?: string;
}

export const PLACEHOLDER = 'Enter a group or contact...';
export const NOT_FOUND = 'No matches';

export default class OmniboxElement extends React.Component<OmniboxElementProps> {
    public static defaultProps = {
        placeholder: PLACEHOLDER,
        searchPromptText: NOT_FOUND
    };

    constructor(props: OmniboxElementProps) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    private handleChange(selected: Asset[]): void {
        if (this.props.onChange) {
            this.props.onChange(selected);
        }
    }

    public render(): JSX.Element {
        const createOptions: any = {};
        const eleClass = this.props.className || '';

        return (
            <FormElement name={this.props.name} __className={eleClass} entry={this.props.entry}>
                <SelectSearch
                    __className={getSelectClassForEntry(this.props.entry)}
                    onChange={this.handleChange}
                    name={this.props.name}
                    assets={this.props.assets}
                    multi={true}
                    initial={this.props.entry.value}
                    placeholder={this.props.placeholder}
                    searchPromptText={this.props.searchPromptText}
                    {...createOptions}
                />
            </FormElement>
        );
    }
}
