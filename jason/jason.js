(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {

const { promisify } = __webpack_require__(1);
const { readFile } = __webpack_require__(2);
const signBunny = __webpack_require__(3);
const flowsResp = __webpack_require__(5);
const fieldsResp = __webpack_require__(6);
const groupsResp = __webpack_require__(7);

// Setup
const basePath = '/jason';
const baseOpts = {
    statusCode: 200,
    headers: { ['Content-Type']: 'application/json' }
};
const getOpts = (opts = {}) => Object.assign({}, baseOpts, opts);
const readFileAsync = promisify(readFile);
const isValidUUID = uuid => validate(uuid, 4);

// Handlers
const flows = async ({ queryStringParameters: query } = {}, cb) => {
    if (Object.keys(query).length > 0) {
        if (query.uuid) {
            if (isValidUUID(query.uuid)) {
                try {
                    const contents = await readFileAsync(`${__dirname}/flows/${query.uuid}.json`, {
                        encoding: 'utf8'
                    });
                    return cb(null, getOpts({ body: contents }));
                } catch (err) {
                    return notFound(cb);
                }
            }
        }
    }
    return cb(null, getOpts({ body: JSON.stringify(flowsResp) }));
};
const fields = cb => cb(null, getOpts({ body: JSON.stringify(fieldsResp) }));
const groups = cb => cb(null, getOpts({ body: JSON.stringify(groupsResp) }));
const notFound = cb => cb(null, getOpts({ statusCode: 404, body: signBunny('howdy') }));

const assetService = (evt, cb) => {
    switch (evt.path) {
        case `${basePath}/assets/flows.json`:
            return flows(evt, cb);
        case `${basePath}/assets/fields.json`:
            return fields(cb);
        case `${basePath}/assets/groups.json`:
            return groups(cb);
        default:
            return notFound(cb);
    }
};

exports.handler = (evt, ctx, cb) => assetService(evt, cb);
/* WEBPACK VAR INJECTION */}.call(exports, "/"))

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const buildSign = __webpack_require__(4);

function signBunny(input) {
  const inputArr = input.toUpperCase().split(' ');

  return buildSign(inputArr);
}

module.exports = signBunny;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const MAX_SIGN_WIDTH = 13;
const LINE_DELIMITER = '\n';

function buildBunny() {
  return '(\\__/) ||\n(•ㅅ•) ||\n/ 　 づ';
}

function buildSignBoundary() {
  return `|${'-'.repeat(MAX_SIGN_WIDTH - 2)}|`;
}

function buildMiddleOfSign(inputArr) {
  const lines = inputArr.map((word) => {
    if (word.length > (MAX_SIGN_WIDTH - 3)) throw 'One of your words is too long.'
    return `| ${word}${' '.repeat(MAX_SIGN_WIDTH - 3 - word.length)}|`;
  });
  return lines.join(LINE_DELIMITER);
}

function buildSign(inputArr) {
    return [
            buildSignBoundary(),
            buildMiddleOfSign(inputArr),
            buildSignBoundary(),
            buildBunny()
           ].join(LINE_DELIMITER);
}

module.exports = buildSign;


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = {"total":2,"results":[{"uuid":"a4f64f1b-85bc-477e-b706-de313a022979","name":"Colors","type":"flow"},{"uuid":"9ecc8e84-6b83-442b-a04a-8094d5de997b","name":"Customer Service","type":"flow"}],"more":null}

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = {"total":3,"results":[{"name":"Expected Delivery Date","uuid":"23ff7152-b588-43e4-90de-fda77aeaf7c0","type":"field"},{"name":"National ID","uuid":"2429d573-80d7-47f8-879f-f2ba442a1bfd","type":"field"},{"name":"Number of Children","uuid":"5510bddf-01bd-45b5-a519-33b28bac48d0","type":"field"}],"more":null}

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = {"total":5,"results":[{"name":"Customers","uuid":"23ff7152-b588-43e4-90de-fda77aeaf7c0"},{"name":"Unsatisfied Customers","uuid":"2429d573-80d7-47f8-879f-f2ba442a1bfd"},{"name":"Early Adopters","uuid":"cdbf9e01-aaa7-4381-8259-ee042447bcac"},{"name":"Testers","uuid":"afaba971-8943-4dd8-860b-3561ed4f1fe1"},{"name":"Subscribers","uuid":"33b28bac-b588-43e4-90de-fda77aeaf7c0"}],"more":null}

/***/ })
/******/ ])));