import * as React from 'react';
import { Async, AsyncCreatable } from 'react-select';
import axios, { AxiosResponse } from 'axios';
import { SearchResult } from '../services/ComponentMap';
import { jsonEqual } from '../utils';
import { RESULT_TYPE_FIELD } from './form/FieldElement';

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
    createNewOption?: (
        option: { label: string; labelKey: string; valueKey: string }
    ) => any;
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

    public componentWillReceiveProps(nextProps: SelectSearchProps): void {
        if (!jsonEqual(this.props.initial, nextProps.initial)) {
            this.setState({ selections: nextProps.initial });
        }
    }

    /**
     * Sorts all search results by name
     */
    private sortResults(a: SearchResult, b: SearchResult): number {
        return a.name.localeCompare(b.name);
    }

    private addSearchResult(
        results: SearchResult[],
        result: SearchResult
    ): SearchResult[] {
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

    private search(
        term: string,
        remoteResults: SearchResult[] = []
    ): SelectSearchResult {
        let combined: SearchResult[] = [...remoteResults];

        if (this.props.localSearchOptions) {
            for (const local of this.props.localSearchOptions) {
                if (
                    !term ||
                    local.name.toLowerCase().indexOf(term.toLowerCase()) > -1
                ) {
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

            callback(options);
        } else {
            axios.get(this.props.url).then((response: AxiosResponse) => {
                const results: SearchResult[] = response.data.results.map(
                    ({ name, uuid, type }: any) => ({
                        name,
                        id: uuid,
                        type
                    })
                );

                const options: SelectSearchResult = this.search(input, results);

                callback(null, options);
            });
        }
    }

    // If 'multi' prop is truthy, we get an array. If not, we get a single object.
    private onChange(selections: SearchResult | SearchResult[]): void {
        // Account for null selections
        if (!selections) {
            return;
        }

        const isArray: boolean = selections.constructor === Array;

        let newSelections: SearchResult[];

        if (isArray) {
            newSelections = selections as SearchResult[];
        } else {
            newSelections = [selections] as SearchResult[];
        }

        if (!jsonEqual(this.state.selections, newSelections)) {
            if (this.props.onChange) {
                this.props.onChange(newSelections);
            }

            this.setState(
                {
                    selections: newSelections
                },
                () => this.select.focus()
            );
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
                        selections.extraResult || this.props.multi
                            ? selections
                            : selections.id;

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
            options.promptTextCreator = (label: string) =>
                this.props.createPrompt + label;
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
