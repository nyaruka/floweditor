import {
  Action,
  Case,
  Category,
  ContactProperties,
  FlowPosition,
  LocalizationMap
} from 'flowTypes';
import { Query } from 'immutability-helper';
import * as React from 'react';
import Localization, { LocalizedObject } from 'services/Localization';
import { Asset } from 'store/flowContext';
import { FormEntry } from 'store/nodeEditor';
import { v4 as generateUUID } from 'uuid';
import variables from 'variables.module.scss';

export const V4_UUID = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
const LABEL_CHARS = /^[a-zA-Z0-9-][a-zA-Z0-9- ]*$/;
const MAX_LABEL_LENGTH = 36;
const SNAKED_CHARS = /\s+(?=\S)/g;

export const MAX_REFLOW_ATTEMPTS = 100;
export const ACTIVITY_INTERVAL = 5000;
export const COLLISION_FUDGE = 5;
export const GRID_SIZE: number = parseInt(variables.grid_size, 10) || 20;
export const NODE_SPACING: number = parseInt(variables.node_spacing, 10) || 10;
export const NODE_PADDING: number = parseInt(variables.node_padding, 10) || 10;
export const QUIET_NOTE = 2000;
export const CONFIRMATION_TIME = 2000;

export interface BoolMap {
  [key: string]: boolean;
}

interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export type LabelIdCb = (label?: string, labelKey?: string, valueKey?: string) => string;

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
    left: Math.max(left + leftAdjust, 0),
    top: Math.max(top + topAdjust, 0)
  };
};

/**
 * Adjusts the position offsets to a grid
 */
export const snapPositionToGrid = (position: FlowPosition): FlowPosition => {
  let leftAdjust = position.left % GRID_SIZE;
  let topAdjust = position.top % GRID_SIZE;

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

  const left = Math.max(position.left + leftAdjust, 0);
  const top = Math.max(position.top + topAdjust, 0);
  const right = left + position.right - position.left;
  const bottom = top + position.bottom - position.top;

  return {
    left,
    top,
    right,
    bottom
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

export const getSelectClassForEntry = (entry: FormEntry): string => {
  if (entry && entry.validationFailures && entry.validationFailures.length > 0) {
    return 'select-invalid';
  }
  return '';
};

export const getSelectClass = (errors: number): string => {
  if (errors === 0) {
    return 'react-select select-base';
  }
  // We use a global selector here for react-select
  return 'react-select select-base select-invalid';
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
  // onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: (event: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * Creates a simple click handler via onMouseDown and onMouseUp.
 * This is a necessity in order to let jsPlumb manage our element dragging.
 * @param onClick
 */
export const createClickHandler = (
  onClick: (event: React.MouseEvent<HTMLElement>) => void,
  shouldCancelClick: () => boolean = null,
  onMouseDown?: (event: React.MouseEvent<HTMLElement>) => void
): any => {
  return {
    onMouseDown: (event: React.MouseEvent<HTMLElement>) => {
      if (onMouseDown) {
        onMouseDown(event);
      }
    },
    onMouseUp: (event: React.MouseEvent<HTMLElement>) => {
      if (!shouldCancelClick || !shouldCancelClick()) {
        onClick(event);
      }
    }
  };
};

export const getLocalization = (
  obj: Action | Category | Case,
  localization: LocalizationMap,
  language: Asset
) => Localization.translate(obj, language, localization[language.id]);

/** istanbul ignore next */
export const dump = (thing: any) => console.log(JSON.stringify(thing, null, 4));

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
export const renderIf = (predicate: boolean) => (then: JSX.Element, otherwise?: JSX.Element) =>
  predicate ? then : otherwise ? otherwise : null;

/**
 * Does the label meet our length requirements?
 * @param {string} label - label created by react-select
 */
export const properLabelLength = (label: string = '') =>
  label.length > 0 && label.length <= MAX_LABEL_LENGTH;

/**
 * Does the label meet our character requirements?
 * @param {string} label
 */
export const containsOnlyLabelChars = (label: string = '') => LABEL_CHARS.test(label);

/**
 * Does the label meet our length, character requirements?
 * @param {string} label - label created by react-select
 */
export const isValidLabel = (label: string) =>
  properLabelLength(label) && containsOnlyLabelChars(label);

export const isRealValue = (obj: any) => obj !== null && obj !== undefined;

/* istanbul ignore next */
export const timeStart = (name: string) =>
  process.env.NODE_ENV === 'development' && console.time(name);

/* istanbul ignore next */
export const timeEnd = (name: string) =>
  process.env.NODE_ENV === 'development' && console.timeEnd(name);

export const capitalize = (str: string) =>
  str.replace(/(?:^|\s)\S/g, captured => captured.toUpperCase());

export const set = (val: any): Query<any> => ({ $set: val });

export const setTrue = (): Query<true> => set(true);

export const setFalse = (): Query<false> => set(false);

export const setNull = (): Query<null> => set(null);

export const setEmpty = (): Query<string> => set('');

export const merge = (val: any): Query<any> => ({ $merge: val });

export const unset = (val: any): Query<any> => ({ $unset: val });

export const push = (arr: any[]): Query<any[]> => ({ $push: arr });

// tslint:disable-next-line:array-type
export const splice = (arr: Array<Array<any>>): Query<Array<Array<any>>> => ({
  $splice: arr
});

export const optionExists = (newOptName: string, options: any[]) =>
  options.find(({ name }) => name.toLowerCase().trim() === newOptName.toLowerCase().trim())
    ? true
    : false;

/* export const isOptionUnique: IsOptionUniqueHandler = ({ option, options, labelKey, valueKey }) =>
    !propertyExists(option.name) && !optionExists(option.name, options);

export const isValidNewOption: IsValidNewOptionHandler = ({ label }) => isValidLabel(label);
*/
/* export const composeCreateNewOption = ({
    idCb,
    type
}: {
    idCb: LabelIdCb;
    type: AssetType;
}): NewOptionCreatorHandler => ({ label, labelKey, valueKey }) => ({
    id: idCb(label, labelKey, valueKey),
    name: label,
    type,
    isNew: true
});*/

/**
 * Deduplicate values in an array.
 * Pass it a key to deduplicate based on obj key.
 */
export const uniqueBy = (a: any[], key: string): any[] => {
  const seen: any = {};
  return a.filter((item: any) => {
    const k = item[key];
    return seen.hasOwnProperty(k) ? false : (seen[k] = true);
  });
};

export const downloadJSON = (obj: any, name: string): void => {
  const dataStr =
    'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', name + '.json');
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export let createUUID = (): string => {
  return generateUUID();
};

export const seededUUIDs = (seed: number = 1): any => {
  let current = seed;
  const randomNext = () => {
    const x = Math.sin(current++) * 10000;
    return x - Math.floor(x);
  };

  const random = (min: number, max: number): number => {
    return Math.floor(randomNext() * (max - min) + min);
  };

  return () => {
    const randomSeed: number[] = [];
    for (let idx = 0; idx < 16; idx++) {
      randomSeed.push(random(0, 250));
    }
    return generateUUID({ random: randomSeed });
  };
};

export const range = (start: number, end: number) =>
  Array.from({ length: end - start }, (v: number, k: number) => k + start);

export const pluralize = (count: number, noun: string, suffix: string = 's'): string =>
  `${noun}${count !== 1 ? suffix : ''}`;

export const hasString = (names: string[], key: string): boolean =>
  !!names.find((item: string) => item === key);

export const scalarArrayEquals = (a: any[], b: any[]) =>
  a.every((value, index) => value === b[index]);

export const getURNPath = (urn: string) => {
  return urn.split(':')[1];
};
