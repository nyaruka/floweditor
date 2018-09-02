import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { AsyncCreatable, components } from 'react-select';
import { OptionProps } from 'react-select/lib/components/Option';
import { StylesConfig } from 'react-select/lib/styles';
import { OptionsType } from 'react-select/lib/types';
import FormElement, { FormElementProps } from '~/components/form/FormElement';
import { Asset } from '~/services/AssetService';
import { Assets } from '~/store/flowContext';

type CallbackFunction = (options: OptionsType<Asset>) => void;

const AssetOption = (props: OptionProps<Asset>) => {
    // dont see a TS safe way to get at the underlying object
    const asset = (props as any).data as Asset;
    return !props.isDisabled ? (
        <div ref={props.innerRef} {...props.innerProps}>
            <components.Option {...props}>{asset.name}</components.Option>
        </div>
    ) : null;
};

export interface AssetSelectorProps extends FormElementProps {
    assets: Assets;

    searchable?: boolean;

    placeholder?: string;
    clearable?: boolean;

    styles?: StylesConfig;

    // creation options
    allowCreation?: boolean;
    onCreateOption?: any;
    createPrefix?: string;

    multi?: boolean;

    noOptionsMessage?: string;
    notFoundText?: string;
    onChange?: (selected: Asset[]) => void;
    sortFunction?(a: Asset, b: Asset): number;
    localSearchOptions?: Asset[];
}

export default class AssetSelector extends React.Component<AssetSelectorProps> {
    constructor(props: AssetSelectorProps) {
        super(props);
        bindCallbacks(this, {
            include: [/^get/, /^on/, /^handle/]
        });
    }

    private handleChanged(selected: any): void {
        if (Array.isArray(selected)) {
            this.props.onChange(selected);
        } else if (this.props.onChange) {
            /* istanbul ignore else */
            this.props.onChange([selected]);
        }
    }

    public handleLoadOptions(input: string, callback: CallbackFunction): void {
        callback(this.handleFilter(input));
    }

    public handleFilter(inputValue: string): Asset[] {
        const search = inputValue.toLowerCase();
        return Object.keys(this.props.assets.items)
            .map(key => this.props.assets.items[key])
            .filter((asset: Asset) => asset.name.toLowerCase().includes(search));
    }

    public handleCheckValid(inputValue: string): boolean {
        if (!this.props.onCreateOption) {
            return false;
        }
        return inputValue.length > 0;
    }

    public handleCreatePrompt(input: string): any {
        return (this.props.createPrefix || `New ${this.props.name}: `) + input;
    }

    public handleCreateNewOption(inputValue: string, label: any): Asset {
        return { id: '_', name: label, type: null };
    }

    public render(): JSX.Element {
        return (
            <FormElement
                name={this.props.name}
                entry={this.props.entry}
                showLabel={this.props.showLabel}
            >
                <AsyncCreatable
                    placeholder={this.props.placeholder || 'Select ' + this.props.name}
                    value={this.props.entry.value}
                    components={{ Option: AssetOption }}
                    styles={this.props.styles}
                    defaultOptions={this.handleFilter('')}
                    cacheOptions={true}
                    loadOptions={this.handleLoadOptions}
                    onChange={this.handleChanged}
                    isMulti={this.props.multi}
                    isSearchable={this.props.searchable}
                    isValidNewOption={this.handleCheckValid}
                    formatCreateLabel={this.handleCreatePrompt}
                    getNewOptionData={this.handleCreateNewOption}
                    onCreateOption={this.props.onCreateOption}
                    noOptionsMessage={(obj: { inputValue: string }) => this.props.noOptionsMessage}
                    getOptionValue={(option: Asset) => option.id}
                    getOptionLabel={(option: Asset) => option.name}
                />
            </FormElement>
        );
    }
}
