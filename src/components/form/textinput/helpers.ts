import { GSM } from 'components/form/textinput/constants';
import { split } from 'split-sms';

export interface UnicodeCharMap {
  [char: string]: boolean;
}

interface MsgStats {
  value: string;
  parts: string[];
  characterCount: number;
  unicodeChars: UnicodeCharMap;
}

export const isUnicode = (char: string): boolean => {
  if (GSM.hasOwnProperty(char)) {
    return false;
  }
  return true;
};

export const getUnicodeChars = (msg: string): UnicodeCharMap => {
  const chars = {};

  for (const char of msg) {
    if (isUnicode(char)) {
      (chars as any)[char] = true;
    }
  }

  return chars;
};

/**
 * Replaces unicode characters commonly inserted by text editors like MSWord with their GSM equivalents
 * @param {string} msg - msg to be cleaned
 * @returns {string} Cleaned msg
 */
export const cleanMsg = (msg: string): string =>
  msg
    .replace(/[\u2018\u2019]/g, "'") // Smart single quotes
    .replace(/[\u201C\u201D]/g, '"') // Smart double quotes
    .replace(/[\u2013\u2014]/g, '-') // En/em dash
    .replace(/\u2026/g, '...') // Horizontal ellipsis
    .replace(/\u2002/g, ' '); // En space

/**
 * First pass at providing the user with an accurate character count for their SMS messages.
 * Determines encoding, segments, max character limit per message and calculates character count.
 * Optionally replaces common unicode 'gotcha characters' with their GSM counterparts.
 * @param value
 * @param replace
 */
export const getMsgStats = (value: string | string[], replace?: boolean): MsgStats => {
  let newVal = value as string;

  // Localized values are stored as string arrays
  if (newVal.constructor === Array) {
    newVal = newVal[0];
  }

  if (replace) {
    newVal = cleanMsg(newVal);
  }

  const stats = split(newVal);

  return {
    value: newVal,
    parts: stats.parts,
    characterCount: stats.length,
    unicodeChars: getUnicodeChars(newVal)
  };
};
