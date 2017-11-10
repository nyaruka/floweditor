import * as React from 'react';
import Select from 'react-select';
import { ILanguages } from '../services/EditorConfig';

const styles = require('./LanguageSelector.scss');

export interface ILanguage {
    name: string;
    iso: string;
}

export interface ILanguageSelectorProps {
    iso: string;
    languages: ILanguages;
    onChange(language: ILanguage): void;
}

class LanguageSelectorComp extends React.PureComponent<ILanguageSelectorProps, {}> {
    private options: ILanguage[] = [];

    constructor(props: ILanguageSelectorProps) {
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
}

export default LanguageSelectorComp;
