import * as React from 'react';
import {SearchResult, ContactFieldResult} from '../interfaces';
var Select2 = require('react-select2-wrapper');
var UUID = require('uuid');


interface Select2SearchProps {
    url: string,
    placeholder?: string;
    multi?: boolean,
    initial?: SearchResult,
    additionalOptions?: SearchResult[]
    addSearchOption?: string
}

interface SearchParams {
    term: string;
    page: number;
    _type: string;
}

export class Select2Search extends React.Component<Select2SearchProps, {}> {

    selected: any;
    ele: any;

    constructor (props: Select2SearchProps) {
        super(props);
        this.formatOption = this.formatOption.bind(this);
        this.processResults = this.processResults.bind(this);
        this.createOption = this.createOption.bind(this);
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

    public getSelection(): SearchResult[] {
        return $(this.ele.el).select2("data");
    }

    /**
     * Does the contact field match. This should be the same contract as the remote
     * endpoint serving up contact field searches.
     */
    private contactFieldMatches(field: ContactFieldResult, term: string): boolean {
        return (field.name.toLowerCase().indexOf(term) > -1);
    }

    private sortResults(a: SearchResult, b: SearchResult): number {
        return a.name.localeCompare(b.name);
    }

    /**
     * Takes our results from our endpoint, merges them with our additional options
     * and then filters it by the search term, sorting the results
     */
    private processResults (data: any, params: SearchParams) {
        
        var results = []

        // iterate over endpoint results and additional options
        for (let result of data.results.concat(this.props.additionalOptions)) {
            if (params.term) {
                let term = params.term.toLowerCase()
                if (result.type == "field") {
                    if (this.contactFieldMatches(result as ContactFieldResult, term)) {
                        results.push(result);
                    }
                }
            } else {
                results.push(result);
            }
        }

        // add any created option if there aren't matches
        var createSearch: Function;
        if (this.props.addSearchOption) {
            if (params.term && params.term[0] != "@" && results.length == 0) {
                let added = this.createOption(this.props.addSearchOption, params.term);
                if (added) {
                    results.push(added);
                }
            }
        }

        // sort our final results
        results.sort(this.sortResults);

        // TODO: sort results alpha with contact name at top
        params.page = params.page || 1;
        return {
            results: results,
            pagination: {
                more: (params.page * 30) < data.total_count
            }
        };
    }

    private createOption(type: string, term: string) {
        if (type == "field") {
            return {
                id: UUID.v4(),
                name: term,
                type: type,
                prefix: "Add field:",
                created: true
            }
        }
        return null;
    }

    render() {
        return (
            <div>
                <Select2
                    className="method"
                    ref={(ele: any) => {this.ele = ele}} 
                    options={
                        {
                            data: this.props.additionalOptions,
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