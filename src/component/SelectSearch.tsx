import { react as bindCallbacks } from 'auto-bind';
import axios, { AxiosResponse } from 'axios';
import * as isEqual from 'fast-deep-equal';
import * as React from 'react';
import Select, {
    Async,
    AsyncCreatable,
    AutocompleteResult,
    IsOptionUniqueHandler,
    IsValidNewOptionHandler,
    NewOptionCreatorHandler,
    Option
} from 'react-select';
import {
    AttributeType,
    ContactProperties,
    CreateOptions,
    ResultType,
    ValueType
} from '../flowTypes';

export interface SelectSearchProps {
    url: string;
    name: string;
    resultType: ResultType;
    placeholder?: string;
    searchPromptText?: string;
    multi?: boolean;
    closeOnSelect?: boolean;
    initial?: Option[];
    localSearchOptions?: Option[];
    __className?: string;
    createPrompt?: string;
    onChange?: (selections: Option | Option[]) => void;
    isValidNewOption?: IsValidNewOptionHandler;
    isOptionUnique?: IsOptionUniqueHandler;
    createNewOption?: NewOptionCreatorHandler;
}

interface SelectSearchState {
    selections: Option[];
}

export interface FieldResult {
    key: string;
    label: string;
    value_type: ValueType;
}

export const mapFieldsRespToSearchResult = ({ key, label, value_type }: FieldResult) => ({
    name: label,
    id: key,
    type: AttributeType.field
});

export const mapRespToSearchResult = ({ name, uuid, type }: any) => ({
    name,
    id: uuid,
    type
});

export const CONTACT_PROPERTIES: Option[] = [
    {
        name: ContactProperties.Name,
        id: ContactProperties.Name.toLowerCase(),
        type: AttributeType.property
    }
    // { id: ContactProperties.Language.toLowerCase(), name: ContactProperties.Language, type: AttributeType.property }
];

export default class SelectSearch extends React.PureComponent<
    SelectSearchProps,
    SelectSearchState
> {
    private select: any;

    constructor(props: SelectSearchProps) {
        super(props);

        this.state = {
            selections: props.initial || []
        };

        bindCallbacks(this, {
            include: ['selectRef', 'loadOptions', /^on/]
        });
    }

    public selectRef(ref: any): any {
        return (this.select = ref);
    }

    public componentWillReceiveProps(nextProps: SelectSearchProps): void {
        if (!isEqual(this.props.initial, nextProps.initial)) {
            this.setState({ selections: nextProps.initial });
        }
    }

    private onChange(selection: Option): void {
        // Account for null selections
        if (!selection) {
            return;
        }

        // Convert to array to update state
        const selections = [selection];

        if (!isEqual(this.state.selections, selections)) {
            if (this.props.onChange) {
                this.props.onChange(selection);
            }

            this.setState(
                {
                    selections
                },
                () => this.select.focus()
            );
        }
    }

    private onChangeMulti(selections: Option[]): void {
        // Account for null selections
        if (!selections) {
            return;
        }

        if (!isEqual(this.state.selections, selections)) {
            if (this.props.onChange) {
                this.props.onChange(selections);
            }

            this.setState(
                {
                    selections
                },
                () => this.select.focus()
            );
        }
    }

    /**
     * Sorts all search results by name
     */
    private sortResults(a: Option, b: Option): number {
        return a.name.localeCompare(b.name);
    }

    private addSearchResult(results: Option[], result: Option): Option[] {
        const newResults = [...results];

        let found = false;
        for (const existing of newResults) {
            if (result.id === existing.id) {
                found = true;
                break;
            }
        }

        if (!found) {
            newResults.push(result);
        }

        return newResults;
    }

    public search(term: string, remoteResults: Option[] = []): AutocompleteResult {
        let combined = [...remoteResults];

        if (this.props.localSearchOptions) {
            for (const local of this.props.localSearchOptions) {
                if (!term || local.name.toLowerCase().indexOf(term.toLowerCase()) > -1) {
                    combined = this.addSearchResult(combined, local);
                }
            }
        }
        const options = combined.sort(this.sortResults);

        const results = {
            options,
            complete: true
        };

        return results;
    }

    public getSearchResults(results: Array<{}>): Option[] {
        switch (this.props.resultType) {
            case ResultType.field:
                return [...results.map(mapFieldsRespToSearchResult), ...CONTACT_PROPERTIES];
            default:
                return [...results.map(mapRespToSearchResult)];
        }
    }

    public loadOptions(
        input: string,
        callback: (err: any, result: AutocompleteResult) => void
    ): void {
        if (!this.props.url) {
            callback(null, this.search(input));
        } else {
            axios.get(this.props.url).then((response: AxiosResponse) => {
                const results = this.getSearchResults(response.data.results);
                callback(null, this.search(input, results));
            });
        }
    }

    private filterOption(option: Option, term: string): boolean {
        return option.name.toLowerCase().indexOf(term.toLowerCase()) > -1;
    }

    public render(): JSX.Element {
        let value: any;

        if (this.props.multi) {
            value = [];
        }

        if (this.state.selections.length) {
            for (const selections of this.state.selections) {
                if (selections) {
                    const selectionValue: string | Option =
                        selections.extraResult || this.props.multi ? selections : selections.id;

                    if (this.props.multi) {
                        value.push(selectionValue);
                    } else {
                        value = selectionValue;
                    }
                }
            }
        }

        const onChange = this.props.multi ? this.onChangeMulti : this.onChange;

        const createOptions: CreateOptions = {};
        if (this.props.createPrompt) {
            createOptions.promptTextCreator = (label: string) => this.props.createPrompt + label;
        }
        if (this.props.createNewOption) {
            createOptions.newOptionCreator = this.props.createNewOption;
        }
        if (this.props.isValidNewOption) {
            createOptions.isValidNewOption = this.props.isValidNewOption;
        }

        if (this.props.isOptionUnique) {
            createOptions.isOptionUnique = this.props.isOptionUnique;
        }

        if (this.props.createNewOption) {
            return (
                <AsyncCreatable
                    ref={this.selectRef}
                    className={this.props.__className}
                    name={this.props.name}
                    placeholder={this.props.placeholder}
                    loadOptions={this.loadOptions}
                    closeOnSelect={this.props.closeOnSelect}
                    ignoreCase={false}
                    ignoreAccents={false}
                    value={value}
                    openOnFocus={true}
                    valueKey="id"
                    labelKey="name"
                    multi={this.props.multi}
                    clearable={this.props.multi}
                    searchable={true}
                    onBlurResetsInput={true}
                    filterOption={this.filterOption}
                    onChange={onChange}
                    searchPromptText={this.props.searchPromptText}
                    {...createOptions}
                />
            );
        } else {
            return (
                <Async
                    ref={this.selectRef}
                    className={this.props.__className}
                    name={this.props.name}
                    placeholder={this.props.placeholder}
                    loadOptions={this.loadOptions}
                    closeOnSelect={this.props.closeOnSelect}
                    ignoreCase={false}
                    ignoreAccents={false}
                    value={value}
                    openOnFocus={true}
                    valueKey="id"
                    labelKey="name"
                    multi={this.props.multi}
                    clearable={this.props.multi}
                    searchable={true}
                    onBlurResetsInput={true}
                    filterOption={this.filterOption}
                    onChange={onChange}
                    searchPromptText={this.props.searchPromptText}
                    {...createOptions}
                />
            );
        }
    }
}
