import * as React from 'react';

import { ResultType } from '../../flowTypes';
import AssetService, { Asset, Assets } from '../../services/AssetService';
import { getSelectClass, jsonEqual } from '../../utils';
import SelectSearch from '../SelectSearch/SelectSearch';
import FormElement, { FormElementProps } from './FormElement';

export interface GroupOption {
    group: string;
    name: string;
}

export interface OmniboxElementProps extends FormElementProps {
    add?: boolean;
    selected?: Asset[];
    placeholder?: string;
    searchPromptText?: string | JSX.Element;
    onChange?: (groups: Asset[]) => void;
    assets: Assets;
    className?: string;
}

interface OmniboxElementState {
    selected: Asset[];
}

export const PLACEHOLDER = 'Enter a group or contact...';
export const NOT_FOUND = 'No matches';

export default class OmniboxElement extends React.Component<
    OmniboxElementProps,
    OmniboxElementState
> {
    public static defaultProps = {
        placeholder: PLACEHOLDER,
        searchPromptText: NOT_FOUND
    };

    constructor(props: OmniboxElementProps) {
        super(props);

        this.state = {
            selected: this.props.selected
        };

        this.onChange = this.onChange.bind(this);
    }

    public componentWillReceiveProps(nextProps: OmniboxElementProps): void {
        if (
            nextProps.selected &&
            nextProps.selected.length &&
            !jsonEqual(nextProps.selected, this.props.selected)
        ) {
            this.setState({ selected: nextProps.selected });
        }
    }

    private onChange(selected: Asset[]): void {
        if (!jsonEqual(selected, this.state.selected)) {
            this.setState(
                {
                    selected
                },
                () => {
                    if (this.props.onChange) {
                        this.props.onChange(selected);
                    }
                }
            );
        }
    }

    public render(): JSX.Element {
        const createOptions: any = {};
        const className = getSelectClass(0);
        const eleClass = this.props.className || '';

        return (
            <FormElement name={this.props.name} __className={eleClass}>
                <SelectSearch
                    _className={className}
                    onChange={this.onChange}
                    name={this.props.name}
                    resultType={ResultType.group}
                    assets={this.props.assets}
                    multi={true}
                    initial={this.state.selected}
                    placeholder={this.props.placeholder}
                    searchPromptText={this.props.searchPromptText}
                    {...createOptions}
                />
            </FormElement>
        );
    }
}
