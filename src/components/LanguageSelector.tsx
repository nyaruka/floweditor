import * as React from 'react';
import Select from 'react-select';
import { Languages } from '../services/EditorConfig';

const styles = require('./LanguageSelector.scss');

export interface Language {
    name: string;
    iso: string;
}

export interface LanguageSelectorProps {
    iso: string;
    languages: Languages;
    onChange(language: Language): void;
}

export default class LanguageSelectorComp extends React.PureComponent<LanguageSelectorProps, {}> {
    private options: Language[] = [];

    constructor(props: LanguageSelectorProps) {
        super(props);
        /** Config stores languages as shape { iso, name } */
        this.options = Object.keys(this.props.languages).map(iso => {
            const name = this.props.languages[iso];
            return {
                name,
                iso
            }
        });
    }

    render() {
        return (
            <div className={`${styles.ele} select-small`}>
                <Select
                    value={this.props.iso}
                    onChange={this.props.onChange}
                    valueKey="iso"
                    labelKey="name"
                    searchable={false}
                    clearable={false}
                    options={this.options}
                />
            </div>
        );
    }
};
