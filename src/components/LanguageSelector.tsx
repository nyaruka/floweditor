import * as React from "react";
import { Config } from "../services/Config";
var Select = require("react-select");
var styles = require("./LanguageSelector.scss")

export interface Language {
    name: string;
    iso: string;
}

interface LanguageSelectorProps {
    iso: string;
    onChange(language: Language): void;
}

export class LanguageSelectorComp extends React.PureComponent<LanguageSelectorProps, {}> {

    private options: Language[] = [];
    constructor(props: LanguageSelectorProps) {
        super(props);
        var languages = Config.get().languages;
        for (let iso of Object.keys(languages)) {
            var name = languages[iso];
            this.options.push({ name: name, iso: iso });
        }
    }

    render() {
        return (
            <div className={styles.ele + " select-small"}>
                <Select
                    value={this.props.iso}
                    onChange={this.props.onChange}
                    valueKey="iso"
                    labelKey="name"
                    searchable={false}
                    clearable={false}
                    options={this.options}
                />
            </div>)
    }
}