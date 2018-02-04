import * as React from 'react';
import { Async, AsyncCreatable } from 'react-select';
import axios, { AxiosResponse } from 'axios';
import { SearchResult } from '../services/ComponentMap';

export interface SelectSearchProps {
    url: string;
    name: string;
    resultType: string;
    placeholder?: string;
    searchPromptText?: string | JSX.Element;
    multi?: boolean;
    closeOnSelect?: boolean;
    initial?: SearchResult[];
    localSearchOptions?: SearchResult[];
    className?: string;
    createPrompt?: string;
    onChange?: (selections: SearchResult[]) => void;
    isValidNewOption?: (option: { label: string }) => boolean;
    createNewOption?: (option: { label: string; labelKey: string; valueKey: string }) => any;
}

interface SelectSearchState {
    selections: SearchResult[];
}

interface SelectSearchResult {
    options: SearchResult[];
    complete: boolean;
}

export default class SelectSearch extends React.PureComponent<
    SelectSearchProps,
    SelectSearchState
> {
    private select: HTMLInputElement;

    constructor(props: SelectSearchProps) {
        super(props);

        this.state = {
            selections: props.initial
        };

        this.selectRef = this.selectRef.bind(this);
        this.loadOptions = this.loadOptions.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    private selectRef(ref: HTMLInputElement): HTMLInputElement {
        return (this.select = ref);
    }

    /**
     * Sorts all search results by name
     */
    private sortResults(a: SearchResult, b: SearchResult): number {
        return a.name.localeCompare(b.name);
    }

    private addSearchResult(results: SearchResult[], result: SearchResult): SearchResult[] {
        const newResults: SearchResult[] = [...results];

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

    private search(term: string, remoteResults: SearchResult[] = []): SelectSearchResult {
        let combined: SearchResult[] = [...remoteResults];

        if (this.props.localSearchOptions) {
            for (const local of this.props.localSearchOptions) {
                if (!term || local.name.toLowerCase().indexOf(term.toLowerCase()) > -1) {
                    combined = this.addSearchResult(combined, local);
                }
            }
        }

        const options: SearchResult[] = combined.sort(this.sortResults);

        const results: SelectSearchResult = {
            options,
            complete: true
        };

        return results;
    }

    private loadOptions(input: string, callback: Function): void {
        if (!this.props.url) {
            const options: SelectSearchResult = this.search(input);

            callback(null, options);
        } else {
            axios.get(this.props.url).then((response: AxiosResponse) => {
                const results: SearchResult[] = response.data.results.map((result: any) => ({
                    name: result.name,
                    id: result.uuid,
                    type: this.props.resultType
                }));

                const options: SelectSearchResult = this.search(input, results);

                callback(null, options);
            });
        }
    }

    private onChange(selections: SearchResult[]): void {
        if (this.props.onChange) {
            this.props.onChange(selections);
        }

        this.setState({ selections }, () => this.select.focus());
    }

    private filterOption(option: SearchResult, term: string): boolean {
        return option.name.toLowerCase().indexOf(term.toLowerCase()) > -1;
    }

    public render(): JSX.Element {
        let value: any;

        if (this.props.multi) {
            value = [];
        }

        if (this.state.selections) {
            for (const selection of this.state.selections) {
                if (selection) {
                    const selectionValue: string | SearchResult =
                        selection.extraResult || this.props.multi ? selection : selection.id;

                    if (this.props.multi) {
                        value.push(selectionValue);
                    } else {
                        value = selectionValue;
                    }
                }
            }
        }

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

        if (this.props.createNewOption) {
            return (
                <AsyncCreatable
                    ref={this.selectRef}
                    className={this.props.className}
                    name={this.props.name}
                    placeholder={this.props.placeholder}
                    loadOptions={this.loadOptions}
                    closeOnSelect={this.props.closeOnSelect}
                    ignoreCase={false}
                    ignoreAccents={false}
                    value={value}
                    openOnFocus={true}
                    cache={false}
                    valueKey="id"
                    labelKey="name"
                    multi={this.props.multi}
                    clearable={this.props.multi}
                    searchable={true}
                    onCloseResetsInput={true}
                    onBlurResetsInput={true}
                    filterOption={this.filterOption}
                    onChange={this.onChange}
                    searchPromptText={this.props.searchPromptText}
                    {...options}
                />
            );
        } else {
            return (
                <Async
                    ref={this.selectRef}
                    className={this.props.className}
                    name={this.props.name}
                    placeholder={this.props.placeholder}
                    loadOptions={this.loadOptions}
                    closeOnSelect={this.props.closeOnSelect}
                    ignoreCase={false}
                    ignoreAccents={false}
                    value={value}
                    openOnFocus={true}
                    cache={false}
                    valueKey="id"
                    labelKey="name"
                    multi={this.props.multi}
                    clearable={this.props.multi}
                    searchable={true}
                    onCloseResetsInput={true}
                    onBlurResetsInput={true}
                    filterOption={this.filterOption}
                    onChange={this.onChange}
                    searchPromptText={this.props.searchPromptText}
                    {...options}
                />
            );
        }
    }
}
