import * as React from "react";

import {FormElement, FormElementProps} from './FormElement';
import {FormWidget, FormValueState} from './FormWidget';

var forms = require("./FormElement.scss");
var styles = require("./InputElement.scss")

interface InputElementProps extends FormElementProps {
    value: string;
    placeholder?: string;
    url?: boolean;
}

export class InputElement extends FormWidget<InputElementProps, FormValueState> {

    constructor(props: any) {
        super(props);

        this.state = {
            value: this.props.value,
            errors: []
        };

        this.onChange = this.onChange.bind(this);
    }

    private isValidURL(string: string) {
        var pattern = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/; // fragment locater
        if(!pattern.test(string)) {
            return false;
        } else {
            return true;
        }
    }

    onChange(event: any) {
        this.setState({
            value: event.target.value            
        });
    }
    
    validate(): boolean {
        var errors: string[] = []
        
        // see if we are required
        if (this.props.required){
            if (!this.state.value) {
                errors.push(this.props.name + " is required");
            }
        }

        // see if it should be a valid url
        if (errors.length == 0) {
            if (this.props.url) {
                if (!this.isValidURL(this.state.value)) {
                    errors.push("Enter a valid URL");
                }
            }
        }

        this.setState({errors: errors});
        return errors.length == 0;
    }

    render() {
        var classes = [styles.input];
        if (this.state.errors.length > 0) {
            classes.push(forms.invalid);
        }

        return (
            <FormElement name={this.props.name} required={this.props.required} showLabel={this.props.showLabel} helpText={this.props.helpText} errors={this.state.errors}>
                <input placeholder={this.props.placeholder} className={classes.join(" ")} defaultValue={this.state.value} onChange={this.onChange}/>
            </FormElement>
        )
    }
}
