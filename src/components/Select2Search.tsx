import * as React from 'react';
import {SearchResult, ContactFieldResult} from '../interfaces';

var Select2 = require('react-select2-wrapper');
var UUID = require('uuid');

interface Select2SearchProps {
    url: string;
    placeholder?: string;
    multi?: boolean;
    initial?: SearchResult;
    localSearchOptions?: SearchResult[];
    addExtraResults?: Function;
}

interface SearchParams {
    term: string;
    page: number;
    _type: string;
}

export class Select2Search extends React.PureComponent<Select2SearchProps, {}> {

    selected: any;
    ele: any;

    constructor (props: Select2SearchProps) {
        super(props);
        this.formatOption = this.formatOption.bind(this);
        this.processResults = this.processResults.bind(this);
    }

    /**
     * Gets the current selection as SearchResult[]
     */
    public getSelection(): SearchResult[] {
        return $(this.ele.el).select2("data");
    }

    /**
     * Format a single search result option
     */
    private formatOption (result: SearchResult) {
        
        // our custom placeholder
        if (this.props.placeholder && result.id === '') { 
            return this.props.placeholder;
        }

        // include the prefix if we have one
        if (result.prefix) {
            return "<span class='emph'>" + result.prefix + "</span> " + result.name;
        }

        return result.name;
    }

    /**
     * Format a selected option
     */
    private formatSelection(selection: SearchResult) {
        return selection.name;
    }

    /**
     * Does the contact field match. This should be the same contract as the remote
     * endpoint serving up contact field searches.
     */
    private contactFieldMatches(field: ContactFieldResult, term: string): boolean {
        return (field.name.toLowerCase().indexOf(term) > -1);
    }

    /**
     * Sorts all search results by name
     */
    private sortResults(a: SearchResult, b: SearchResult): number {
        return a.name.localeCompare(b.name);
    }

    /**
     * Adds a result to our list of results if it's not already present
     * @param results the results so far
     * @param result the result to add
     */
    private addSearchResult(results: SearchResult[], result: SearchResult) {
        var exists = false;
        for(var r of results) {
            if (r.id == result.id) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            results.push(result);
        }
    }

    /**
     * Takes our results from our endpoint, merges them with our additional options
     * and then filters it by the search term, sorting the results
     */
    private processResults (data: any, params: SearchParams) {
        
        var results: SearchResult[] = []

        // iterate over endpoint results and additional options
        for (let result of data.results.concat(this.props.localSearchOptions)) {
            if (params.term) {
                let term = params.term.toLowerCase()
                if (this.contactFieldMatches(result as ContactFieldResult, term)) {
                    this.addSearchResult(results, result);
                }
            } else {
                this.addSearchResult(results, result);
            }
        }

        // sort our final results
        results.sort(this.sortResults);

        // add any extra results
        var createSearch: Function;
        if (this.props.addExtraResults) {
            this.props.addExtraResults(results, params.term);
        }

        // TODO: sort results alpha with contact name at top
        params.page = params.page || 1;
        return {
            results: results,
            pagination: {
                more: (params.page * 30) < data.total_count
            }
        };
    }

    render() {
        return (
            <div>
                <Select2
                    className="method"
                    ref={(ele: any) => {this.ele = ele}} 
                    options={
                        {
                            data: this.props.localSearchOptions,
                            ajax: {
                                url: this.props.url,
                                dataType: 'json',
                                delay: 100,
                                data: function (params: any) {
                                    return {
                                        term: params.term,
                                        page: params.page || 1,
                                    };
                                },
                                processResults: this.processResults,
                                cache: true
                            },
                            escapeMarkup: function (markup: any) { return markup; },
                            templateResult: this.formatOption,
                            templateSelection: this.formatSelection
                        }
                    }
                    style={{width: 'auto'}}
                    value={this.props.initial.id}
                />
            </div>
        )
    }
}

export default Select2Search