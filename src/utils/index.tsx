import * as React from 'react';
import { Language } from '../component/LanguageSelector';
import { Action, Case, Exit, Languages, LocalizationMap, ContactProperties } from '../flowTypes';
import Localization, { LocalizedObject } from '../services/Localization';
import { SearchResult } from '../store';
import * as variables from '../variables.scss';

export const V4_UUID = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

const SNAKED_CHARS = /\s+(?=\S)/g;

export const GRID_SIZE: number = parseInt(variables.grid_size, 10) || 20;
export const NODE_SPACING: number = parseInt(variables.node_spacing, 10) || 10;
export const NODE_PADDING: number = parseInt(variables.node_padding, 10) || 10;

interface BoolMap {
    [key: string]: boolean;
}

interface Bounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

/**
 * Adjusts the left and top offsets to a grid
 * @param left horizontal offset
 * @param top vertical offset
 */
export const snapToGrid = (left: number, top: number): { left: number; top: number } => {
    let leftAdjust = left % GRID_SIZE;
    let topAdjust = top % GRID_SIZE;

    if (leftAdjust > GRID_SIZE / 3) {
        leftAdjust = GRID_SIZE - leftAdjust;
    } else {
        leftAdjust = leftAdjust * -1;
    }

    if (topAdjust > GRID_SIZE / 3) {
        topAdjust = GRID_SIZE - topAdjust;
    } else {
        topAdjust = topAdjust * -1;
    }

    return {
        left: Math.max(left + leftAdjust, GRID_SIZE),
        top: Math.max(top + topAdjust, GRID_SIZE)
    };
};

/**
 * Turns a string array into a bool map for constant lookup
 * @param {string[]} array - an array of strings, e.g. contact fields
 * @returns {object} A map of each string
 */
export const toBoolMap = (array: string[]): BoolMap =>
    array.reduce(
        (map: BoolMap, item: string) => ({
            ...map,
            [item]: true
        }),
        {}
    );

/**
 * Inserts commas into numbers where appropriate for better readability
 * @param {number} value - A number, e.g. 10000
 * @returns {string} A comma-separated string, e.g. 10,000
 */
export const addCommas = (value: number): string =>
    value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/**
 * Replaces spaces with underscores
 * @param {string} value - A space-separated string to be snaked, e.g. a raw flow field name ('my flow field')
 * @returns {string} A snaked string, e.g. 'my_flow_field'
 */
export const snakify = (value: string): string =>
    value
        .toLowerCase()
        .trim()
        .replace(SNAKED_CHARS, '_');
/**
 * Returns true if a given UUID matches v4 format
 * @param {string} uuid - A version 4 UUID (no braces, uppercase OK)
 * @returns {boolean}
 */
export const validUUID = (uuid: string): boolean => V4_UUID.test(uuid);

/**
 * Returns a given string in title case, e.g. 'full name' becomes 'Full Name'
 * @param {string} str - string to be title-cased
 * @returns {string} Title-cased string
 */
export const titleCase = (str: string): string =>
    str.replace(/\b\w+/g, s => s.charAt(0).toUpperCase() + s.substr(1).toLowerCase());

export const getSelectClass = (errors: number): string => {
    if (errors === 0) {
        return '';
    }
    // We use a global selector here for react-select
    return 'select-invalid';
};

export const reorderList = (list: any[], startIndex: number, endIndex: number): any[] => {
    const [removed] = list.splice(startIndex, 1);

    list.splice(endIndex, 0, removed);

    return list;
};

/**
 * Compares basic objects (no methods and DOM nodes; property order important)
 * @param {object} objA - basic object
 * @param {object} objB - basic object
 * @returns {boolean}
 */
export const jsonEqual = (objA: {}, objB: {}): boolean =>
    JSON.stringify(objA) === JSON.stringify(objB);

/**
 * Checks whether any of a list of error strings contain one or more queries.
 * Used to determine whether a particular error has been encountered.
 */
export const hasErrorType = (errors: string[], exps: RegExp[]): boolean => {
    if (!errors.length) {
        return false;
    }
    for (const error of errors) {
        for (const exp of exps) {
            if (error.match(exp)) {
                return true;
            }
        }
    }
    return false;
};

export const getLocalizedObject = (localizations: LocalizedObject[]) => {
    if (localizations && localizations.length) {
        return localizations[0];
    }
};

export interface ClickHandler {
    onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
    onMouseUp: (event: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * Creates a simple click handler via onMouseDown and onMouseUp.
 * This is a necessity in order to let jsPlumb manage our element dragging.
 * @param onClick
 */
export const createClickHandler = (
    onClick: (event: React.MouseEvent<HTMLDivElement>) => void
): ClickHandler => {
    return {
        onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => {
            this._clicked = true;
        },
        onMouseUp: (event: React.MouseEvent<HTMLDivElement>) => {
            if (this._clicked) {
                onClick(event);
            }
            this._clicked = false;
        }
    };
};

/**
 * Callback to pass to Array.prototype.map to return SearchResult[].
 * Use on 'results' property of payload returned from an endpoint returning
 * groups, fields.
 */
export const resultsToSearchOpts = ({ name, uuid, type }: any): SearchResult => ({
    name,
    id: uuid,
    type
});

/**
 * Get the first language in a Languages map
 */
export const getBaseLanguage = (languages: Languages): Language => {
    const [iso] = Object.keys(languages);
    const name = languages[iso];
    return {
        name,
        iso
    };
};

/**
 * Get a language from a Languages map in Language format
 */
export const getLanguage = (languages: Languages, iso: string): Language => ({
    name: languages[iso],
    iso
});

export const getLocalization = (
    obj: Action | Exit | Case,
    localization: LocalizationMap,
    iso: string,
    languages: Languages
) => Localization.translate(obj, iso, languages, localization[iso]);

export const dump = (thing: any) => console.log(JSON.stringify(thing, null, 2));

/**
 * Apply emphasis style
 */
export const emphasize = (text: string) => <span className="emph">{text}</span>;

/**
 * Does property exist in our ContactProperties enum?
 * @param {string} propertyToCheck - 'name' key on react-select AutoCompleteOption
 */
export const propertyExists = (propertyToCheck: string) => {
    for (const property of Object.keys(ContactProperties)) {
        if (property.toLowerCase() === propertyToCheck.toLowerCase().trim()) {
            return true;
        }
    }
    return false;
};

/**
 * Should x element be rendered?
 */
export const renderIf = (condition: boolean) => (elem: JSX.Element) => (condition ? elem : null);
