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
        const languages = Config.get().languages;
        /** Config stores languages as shape { iso, name } */
        Object.keys(languages).forEach(iso => {
            const name = languages[iso]; 
            this.options = [...this.options, { name, iso }]; 
        }); 
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