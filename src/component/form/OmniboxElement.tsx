import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import { ResultType } from '../../flowTypes';
import { getSelectClass, isValidLabel, jsonEqual } from '../../utils';
import SelectSearch from '../SelectSearch/SelectSearch';
import FormElement, { FormElementProps } from './FormElement';
import { NewOptionCreatorHandler, IsValidNewOptionHandler } from 'react-select';
import AssetService, { Assets, Asset, AssetType } from '../../services/AssetService';

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
    className: string;
}

interface OmniboxElementState {
    selected: Asset[];
    errors: string[];
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
            selected: this.props.selected,
            errors: []
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

    public validate(): boolean {
        const errors: string[] = [];

        if (this.props.required && !this.state.selected.length) {
            errors.push(`${this.props.name} is required.`);
        }

        this.setState({ errors });

        return errors.length === 0;
    }

    public render(): JSX.Element {
        const createOptions: any = {};
        const className = getSelectClass(this.state.errors.length);
        const eleClass = this.props.className || '';

        return (
            <FormElement name={this.props.name} errors={this.state.errors} __className={eleClass}>
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
