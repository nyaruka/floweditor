import * as React from 'react';
import * as UUID from 'uuid';
import * as Select from 'react-select';
import axios from 'axios';
import {AxiosResponse} from 'axios';

import {SearchResult} from '../interfaces';

interface SelectSearchProps {
    url: string;
    name: string;
    placeholder?: string;
    multi?: boolean;
    initial?: SearchResult;
    localSearchOptions?: SearchResult[];
    className: string;
    addLabelText: string;
    onChange?(selection: SearchResult): void;
    isValidNewOption?(option: {label: string}): boolean;
    createNewOption?(option: {label: string, labelKey: string, valueKey: string}): any;
}

interface SelectSearchState {
    selection: SearchResult;
}

interface SearchParams {
    term: string;
    page: number;
    _type: string;
}

interface SelectSearchResult {
    options: SearchResult[];
    complete: boolean;
}

export class SelectSearch extends React.PureComponent<SelectSearchProps, SelectSearchState> {

    constructor(props: SelectSearchProps) {
        super(props);
        this.state = {
            selection: props.initial
        }
    }

    /**
     * Sorts all search results by name
     */
    private sortResults(a: SearchResult, b: SearchResult): number {
        return a.name.localeCompare(b.name);
    }

    private addSearchResult(results: SearchResult[], result: SearchResult) {
        var found = false;
        for (let existing of results) {
            if (result.id == existing.id){
                found = true;
                break;
            }
        }

        if (!found) {
            results.push(result);
        }   
    }

    search(term: string, remoteResults: SearchResult[] = []): SelectSearchResult {

        var combined = remoteResults.concat([]);

        if (term) {
            term = term.toLowerCase();
        }

        for (let local of this.props.localSearchOptions) {
            if (!term || local.name.toLowerCase().indexOf(term) > -1) {
                this.addSearchResult(combined, local);
            }
        }
        
        combined.sort(this.sortResults);

        var results: SelectSearchResult = {
            options: combined,
            complete: true
        };

        return results;
    }

    loadOptions(input: string, callback: any) {
        if (this.props.url == null) {
            callback(this.search(input));
        } else {
            axios.get(this.props.url).then((response: AxiosResponse) => {
                // console.log(response);
                callback(null, this.search(input, response.data.results as SearchResult[]));
            });
        }
    }

    private onChange(searchResult: SearchResult){
        if (this.props.onChange) {
            this.props.onChange(searchResult);
        }
        this.setState({selection: searchResult});
    };

    render() {
        // options={Config.get().operators}
        // optionClassName="operator"

        var value = null;
        if (this.state.selection) {
            if (this.state.selection.extraResult) {
                value = this.state.selection;
            } else {
                value = this.state.selection.id;
            }
        }

        return (
            <Select.AsyncCreatable
                className={this.props.className}
                name={this.props.name}
                loadOptions={this.loadOptions.bind(this)}
                clearable={false}
                ignoreCase={true}
                value={value}
                valueKey="id"
                labelKey="name"
                searchable={true}
                addLabelText={this.props.addLabelText}
                newOptionCreator={this.props.createNewOption}
                isValidNewOption={this.props.isValidNewOption}
                onChange={this.onChange.bind(this)}
            />
        );
    }
}