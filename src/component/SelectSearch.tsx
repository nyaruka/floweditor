import { react as bindCallbacks } from 'auto-bind';
import axios, { AxiosResponse } from 'axios';
import * as React from 'react';
import Select, { Async, AsyncCreatable, AutocompleteResult } from 'react-select';
import { AttributeType, ContactProperties, ResultType, ValueType } from '../flowTypes';
import { SearchResult, UpdateContactFields } from '../store';
import { jsonEqual } from '../utils';

export interface SelectSearchProps {
    url: string;
    name: string;
    resultType: ResultType;
    placeholder?: string;
    searchPromptText?: string | JSX.Element;
    multi?: boolean;
    closeOnSelect?: boolean;
    initial?: SearchResult[];
    localSearchOptions?: SearchResult[];
    _className?: string;
    createPrompt?: string;
    onChange?: (selections: SearchResult | SearchResult[]) => void;
    isValidNewOption?: (option: { label: string }) => boolean;
    isOptionUnique?: Function;
    createNewOption?: (option: { label: string; labelKey: string; valueKey: string }) => any;
}

interface SelectSearchState {
    selections: SearchResult[];
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

export const CONTACT_PROPERTIES: SearchResult[] = [
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
    private select: Select;

    constructor(props: SelectSearchProps) {
        super(props);

        this.state = {
            selections: props.initial || []
        };

        bindCallbacks(this, {
            include: ['selectRef', 'loadOptions', /^on/]
        });
    }

    public selectRef(ref: Select): Select {
        return (this.select = ref);
    }

    public componentWillReceiveProps(nextProps: SelectSearchProps): void {
        if (!jsonEqual(this.props.initial, nextProps.initial)) {
            this.setState({ selections: nextProps.initial });
        }
    }

    private onChange(selection: SearchResult): void {
        // Account for null selections
        if (!selection) {
            return;
        }

        // Convert to array to update state
        const selections = [selection];

        if (!jsonEqual(this.state.selections, selections)) {
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

    private onChangeMulti(selections: SearchResult[]): void {
        // Account for null selections
        if (!selections) {
            return;
        }

        if (!jsonEqual(this.state.selections, selections)) {
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
    private sortResults(a: SearchResult, b: SearchResult): number {
        return a.name.localeCompare(b.name);
    }

    private addSearchResult(results: SearchResult[], result: SearchResult): SearchResult[] {
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

    public search(term: string, remoteResults: SearchResult[] = []): AutocompleteResult {
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

    public getSearchResults(results: Array<{}>): SearchResult[] {
        switch (this.props.resultType) {
            case ResultType.field:
                return [...results.map(mapFieldsRespToSearchResult), ...CONTACT_PROPERTIES];
            default:
                return [...results.map(mapRespToSearchResult)];
        }
    }

    public loadOptions(input: string, callback: Function): void {
        if (!this.props.url) {
            callback(this.search(input));
        } else {
            axios.get(this.props.url).then((response: AxiosResponse) => {
                const results = this.getSearchResults(response.data.results);
                callback(null, this.search(input, results));
            });
        }
    }

    private filterOption(option: SearchResult, term: string): boolean {
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
                    const selectionValue: string | SearchResult =
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

        const options: any = {};
        if (this.props.createPrompt) {
            options.promptTextCreator = (label: string) => this.props.createPrompt + label;
        }
        if (this.props.createNewOption) {
            options.newOptionCreator = this.props.createNewOption;
        }
        if (this.props.isValidNewOption) {
            options.isValidNewOption = this.props.isValidNewOption;
        }

        if (this.props.isOptionUnique) {
            options.isOptionUnique = this.props.isOptionUnique;
        }

        if (this.props.createNewOption) {
            return (
                <AsyncCreatable
                    ref={this.selectRef}
                    className={this.props._className}
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
                    onCloseResetsInput={true}
                    onBlurResetsInput={true}
                    filterOption={this.filterOption}
                    onChange={onChange}
                    searchPromptText={this.props.searchPromptText}
                    {...options}
                />
            );
        } else {
            return (
                <Async
                    ref={this.selectRef}
                    className={this.props._className}
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
                    onCloseResetsInput={true}
                    onBlurResetsInput={true}
                    filterOption={this.filterOption}
                    onChange={onChange}
                    searchPromptText={this.props.searchPromptText}
                    {...options}
                />
            );
        }
    }
}
