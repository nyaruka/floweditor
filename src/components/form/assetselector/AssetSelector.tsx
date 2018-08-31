import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Select, { components } from 'react-select';
import { OptionProps } from 'react-select/lib/components/Option';
import { StylesConfig } from 'react-select/lib/styles';
import FormElement, { FormElementProps } from '~/components/form/FormElement';
import { CreateOptions } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import { Assets } from '~/store/flowContext';

export interface AssetSelectorProps extends FormElementProps {
    assets: Assets;

    searchable: boolean;

    placeholder?: string;
    clearable?: boolean;

    styles?: StylesConfig;

    add?: boolean;
    onCreateOption?: any;
    createPrompt?: string;
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

    private handleChanged(selected: Asset): void {
        /* istanbul ignore else */
        if (this.props.onChange) {
            this.props.onChange([selected]);
        }
    }

    /* private handleFilter(input: string): any[] {
        const inputText = input.toLocaleLowerCase();
        return Object.keys(this.props.assets.items)
            .map((key: string) => {
                return { label: key, value: key };
            })
            .filter(option => option.label.toLocaleLowerCase().indexOf(inputText) > -1);
    }*/

    public render(): JSX.Element {
        const createOptions: CreateOptions = {};

        if (this.props.add) {
            createOptions.createNewOption = this.props.onCreateOption;
            createOptions.createPrompt = this.props.createPrompt || 'New: ';
        }

        const options = Object.keys(this.props.assets.items).map((key: string) => {
            return this.props.assets.items[key];
        });

        const CustomOption = (props: OptionProps<Asset>) => {
            // dont see a TS safe way to get at the underlying object
            const asset = (props as any).data as Asset;
            return !props.isDisabled ? (
                <div ref={props.innerRef} {...props.innerProps}>
                    <components.Option {...props}>{asset.name}</components.Option>
                </div>
            ) : null;
        };

        return (
            <FormElement
                name={this.props.name}
                entry={this.props.entry}
                showLabel={this.props.showLabel}
            >
                <Select
                    value={this.props.entry.value}
                    components={{ Option: CustomOption }}
                    styles={this.props.styles}
                    placeholder={this.props.placeholder}
                    options={options}
                    onChange={this.handleChanged}
                    isSearchable={this.props.searchable}
                    getOptionValue={(option: Asset) => option.id}
                    getOptionLabel={(option: Asset) => option.name}
                />
            </FormElement>
        );
    }
}
