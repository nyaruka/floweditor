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
    clearable?: boolean;
    initial?: SearchResult[];
    localSearchOptions?: SearchResult[];
    className: string;
    createPrompt: string;
    onChange?(selection: SearchResult): void;
    isValidNewOption?(option: {label: string}): boolean;
    createNewOption?(option: {label: string, labelKey: string, valueKey: string}): any;
}

interface SelectSearchState {
    selection: SearchResult[];
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

    private select: any;

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

    private onChange(selection: any){
        if (!this.props.multi) {
            selection = [selection];
        }

        if (this.props.onChange) {
            this.props.onChange(selection);
        }
        this.setState({selection: selection});

        this.select.focus();

    };

    private onInputChange(value: string) {
    }

    render() {
        var value: any;

        if (this.props.multi) {
            value = [];
        }

        if (this.state.selection) {
            for (let selection of this.state.selection) {
                if (selection){
                    var selectionValue;
                    if (selection.extraResult || this.props.multi) {
                        selectionValue = selection;
                    } else {
                        selectionValue = selection.id;
                    }

                    if (this.props.multi) {
                        value.push(selectionValue);
                    } else {
                        value = selectionValue;
                    }
                }
            }
        }

        var sample = [{value: "R", label: "Red"}, {value:"G", label: "Green"}];

        var promptTextCreator = null;
        if (this.props.createPrompt) {
            promptTextCreator = (label: string) => {
                return this.props.createPrompt + label
            }
        }

        return (
            <Select.AsyncCreatable
                className={this.props.className}
                ref={(ele: any)=>{ this.select = ele}}
                name={this.props.name}
                loadOptions={this.loadOptions.bind(this)}
                // loadOptions={(term, callback)=>{callback(null, {options: sample, complete: true})}}
                clearable={this.props.clearable}
                ignoreCase={true}
                value={value}
                openOnFocus={true}
                cache={false}
                valueKey="id"
                labelKey="name"
                multi={this.props.multi}
                searchable={true}
                onInputChange={this.onInputChange.bind(this)}
                newOptionCreator={this.props.createNewOption}
                isValidNewOption={this.props.isValidNewOption}
                promptTextCreator={promptTextCreator}
                onChange={this.onChange.bind(this)}
            />
        );
    }
}