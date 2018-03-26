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

var validate = __webpack_require__(1);
var signBunny = __webpack_require__(2);
var flowsResp = __webpack_require__(4);
var colorsFlowResp = __webpack_require__(5);
var customerServiceFlowResp = __webpack_require__(6);
var fieldsResp = __webpack_require__(7);
var groupsResp = __webpack_require__(8);

var baseOpts = {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' }
};
var flows = [colorsFlowResp, customerServiceFlowResp];
var getOpts = function getOpts() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return Object.assign({}, baseOpts, opts);
};
var isValidUUID = function isValidUUID(uuid) {
    return validate(uuid, 4);
};
var getFlow = function getFlow(uuid) {
    var flowResp = void 0;
    flows.forEach(function (flow) {
        if (flow.results[0].uuid === uuid) {
            flowResp = flow;
        }
    });
    return flowResp ? flowResp : false;
};

var notFoundHandler = function notFoundHandler(cb) {
    return cb(null, getOpts({ statusCode: 404, body: signBunny('howdy') }));
};
var flowsHandler = function flowsHandler() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        query = _ref.queryStringParameters;

    var cb = arguments[1];

    if (Object.keys(query).length > 0) {
        if (query.uuid && isValidUUID(query.uuid)) {
            var flow = getFlow(query.uuid);
            if (flow) {
                return cb(null, getOpts({ body: JSON.stringify(flow) }));
            }
        }
        return notFoundHandler(cb);
    }
    return cb(null, getOpts({ body: JSON.stringify(flowsResp) }));
};
var fieldsHandler = function fieldsHandler(cb) {
    return cb(null, getOpts({ body: JSON.stringify(fieldsResp) }));
};
var groupsHandler = function groupsHandler(cb) {
    return cb(null, getOpts({ body: JSON.stringify(groupsResp) }));
};

var assetService = function assetService(evt, cb) {
    switch (evt.path) {
        case '/lambda/assets/flows.json':
            return flowsHandler(evt, cb);
        case '/lambda/assets/fields.json':
            return fieldsHandler(cb);
        case '/lambda/assets/groups.json':
            return groupsHandler(cb);
        default:
            return notFoundHandler(cb);
    }
};

exports.handler = function (evt, ctx, cb) {
    return assetService(evt, cb);
};
;

var _temp = function () {
    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
        return;
    }

    __REACT_HOT_LOADER__.register(baseOpts, 'baseOpts', '/Users/ycleptkellan/Code/Nyaruka/floweditor/lambda-src/lambda.js');

    __REACT_HOT_LOADER__.register(flows, 'flows', '/Users/ycleptkellan/Code/Nyaruka/floweditor/lambda-src/lambda.js');

    __REACT_HOT_LOADER__.register(getOpts, 'getOpts', '/Users/ycleptkellan/Code/Nyaruka/floweditor/lambda-src/lambda.js');

    __REACT_HOT_LOADER__.register(isValidUUID, 'isValidUUID', '/Users/ycleptkellan/Code/Nyaruka/floweditor/lambda-src/lambda.js');

    __REACT_HOT_LOADER__.register(getFlow, 'getFlow', '/Users/ycleptkellan/Code/Nyaruka/floweditor/lambda-src/lambda.js');

    __REACT_HOT_LOADER__.register(notFoundHandler, 'notFoundHandler', '/Users/ycleptkellan/Code/Nyaruka/floweditor/lambda-src/lambda.js');

    __REACT_HOT_LOADER__.register(flowsHandler, 'flowsHandler', '/Users/ycleptkellan/Code/Nyaruka/floweditor/lambda-src/lambda.js');

    __REACT_HOT_LOADER__.register(fieldsHandler, 'fieldsHandler', '/Users/ycleptkellan/Code/Nyaruka/floweditor/lambda-src/lambda.js');

    __REACT_HOT_LOADER__.register(groupsHandler, 'groupsHandler', '/Users/ycleptkellan/Code/Nyaruka/floweditor/lambda-src/lambda.js');

    __REACT_HOT_LOADER__.register(assetService, 'assetService', '/Users/ycleptkellan/Code/Nyaruka/floweditor/lambda-src/lambda.js');
}();

;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

// Regular expression used for basic parsing of the uuid.
var pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-4][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Unparses a UUID buffer to a string. From node-uuid:
 * https://github.com/defunctzombie/node-uuid/blob/master/uuid.js
 *
 * Copyright (c) 2010-2012 Robert Kieffer
 * MIT License - http://opensource.org/licenses/mit-license.php
 *
 * @param  {Buffer} buf
 * @param  {Number=0} offset
 * @return {String}
 */
var _byteToHex = [];
for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function unparse(buf, offset) {
  var i = offset || 0, bth = _byteToHex;
  return  bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]];
}

/**
 * Determines whether the uuid is valid, converting
 * it from a buffer if necessary.
 *
 * @param  {String|Buffer}  uuid
 * @param  {Number=}  version
 * @return {Boolean}
 */
module.exports = function (uuid, version) {
    var parsedUuid;
    // If the uuid is a biffer, parse it...
    if (Buffer.isBuffer(uuid)) {
        parsedUuid = unparse(uuid);
    }
    // If it's a string, it's already good.
    else if (Object.prototype.toString.call(uuid) === '[object String]') {
        parsedUuid = uuid;
    }
    // Otherwise, it's not valid.
    else {
        return false;
    }

    parsedUuid = parsedUuid.toLowerCase();

    // All UUIDs fit a basic schema. Match that.
    if (!pattern.test(parsedUuid)) {
        return false;
    }

    // Now extract the version...
    if (version === undefined) {
        version = extractVersion(parsedUuid);
    } else if (extractVersion(parsedUuid) !== version) {
        return false;
    }

    switch (version) {
        // For certain versions, the checks we did up to this point are fine.
        case 1:
        case 2:
            return true;

        // For versions 3 and 4, they must specify a variant.
        case 3:
        case 4:
            return ['8', '9', 'a', 'b'].indexOf(parsedUuid.charAt(19)) !== -1;

        default:
            // We should only be able to reach this if the consumer explicitly
            // provided an invalid version. Prior to extractVersion we check
            // that it's 1-4 in the regex.
            throw new Error('Invalid version provided.');
    }
};

/**
 * Extracts the version from the UUID, which is (by definition) the M in
 * xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
 *
 * @param  {String} uuid
 * @return {Number}
 */
var extractVersion = module.exports.version = function (uuid) {
    return uuid.charAt(14)|0;
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const buildSign = __webpack_require__(3);

function signBunny(input) {
  const inputArr = input.toUpperCase().split(' ');

  return buildSign(inputArr);
}

module.exports = signBunny;


/***/ }),
/* 3 */
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
/* 4 */
/***/ (function(module, exports) {

module.exports = {"total":2,"results":[{"uuid":"a4f64f1b-85bc-477e-b706-de313a022979","name":"Colors","type":"flow"},{"uuid":"9ecc8e84-6b83-442b-a04a-8094d5de997b","name":"Customer Service","type":"flow"}],"more":null}

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = {"results":[{"name":"Colors","uuid":"a4f64f1b-85bc-477e-b706-de313a022979","definition":{"name":"Colors","language":"eng","uuid":"a4f64f1b-85bc-477e-b706-de313a022979","localization":{"spa":{"64378fc1-19e4-4c8a-be27-aee49ebc728a":{"text":"¿Cuál es tu color favorito?"},"55855afc-f612-4ef9-9288-dcb1dd136052":{"name":["rojo"]},"668ca2ab-8d49-47f5-82a1-e3a82a58e5fb":{"name":["naranja"]},"14806949-d583-49e2-aa55-03aa16ee5a3a":{"name":["amarillo"]},"77394377-f6b8-4366-9bef-d468621258ef":{"name":["verde"]},"92d429d8-c275-4306-9360-93f4b9c7acb1":{"name":["azul"]},"fa0a9b24-5f19-4b8e-b287-27af5811de1d":{"arguments":["rojo, r"]},"b5f900b9-ad13-479a-8ad3-1f1ad5ac88f2":{"arguments":["naranja, n"]},"e9c842e8-f1c5-4f07-97e7-50a4f93b22e5":{"arguments":["amarillo, a"]}}},"nodes":[{"uuid":"4fac7935-d13b-4b36-bf15-98075dca822a","actions":[{"uuid":"64378fc1-19e4-4c8a-be27-aee49ebc728a","type":"send_msg","text":"What's your favorite color, (r)ed, (o)range, (y)ellow, (g)reen, (b)lue, (i)ndigo or (v)iolet?"}],"exits":[{"name":null,"uuid":"445fc64c-2a18-47cc-89d0-15172826bfcc","destination_node_uuid":"46e8d603-8e5d-4435-97dd-1333291aafca"}]},{"uuid":"46e8d603-8e5d-4435-97dd-1333291aafca","router":{"type":"switch","default_exit_uuid":"326a41b7-9bce-453b-8783-1113f649663c","cases":[{"uuid":"fa0a9b24-5f19-4b8e-b287-27af5811de1d","type":"has_any_word","exit_uuid":"55855afc-f612-4ef9-9288-dcb1dd136052","arguments":["red, r"]},{"uuid":"b5f900b9-ad13-479a-8ad3-1f1ad5ac88f2","type":"has_any_word","exit_uuid":"668ca2ab-8d49-47f5-82a1-e3a82a58e5fb","arguments":["orange, o"]},{"uuid":"e9c842e8-f1c5-4f07-97e7-50a4f93b22e5","type":"has_any_word","exit_uuid":"14806949-d583-49e2-aa55-03aa16ee5a3a","arguments":["yellow, y"]},{"uuid":"cc5894af-5dce-454e-a525-3d7c5c41d21d","type":"has_any_word","exit_uuid":"77394377-f6b8-4366-9bef-d468621258ef","arguments":["green, g"]},{"uuid":"590d13e3-7b47-44e3-b8a0-ba9bd41d75d2","type":"has_any_word","exit_uuid":"92d429d8-c275-4306-9360-93f4b9c7acb1","arguments":["blue, b"]},{"uuid":"2a7cbed1-6597-4545-b145-14a2e9282e6c","type":"has_any_word","exit_uuid":"2de9af80-1bd9-4f37-839f-073edbd14369","arguments":["indigo, i"]},{"uuid":"ab99e18c-433f-436e-9278-08bcf506f433","type":"has_any_word","exit_uuid":"5760ec2f-04d4-492b-817b-9f395633ec79","arguments":["violet, v"]}],"operand":"@input","result_name":"color"},"exits":[{"name":"Red","uuid":"55855afc-f612-4ef9-9288-dcb1dd136052","destination_node_uuid":"bc978e00-2f3d-41f2-87c1-26b3f14e5925"},{"name":"Orange","uuid":"668ca2ab-8d49-47f5-82a1-e3a82a58e5fb","destination_node_uuid":"bc978e00-2f3d-41f2-87c1-26b3f14e5925"},{"name":"Yellow","uuid":"14806949-d583-49e2-aa55-03aa16ee5a3a","destination_node_uuid":"bc978e00-2f3d-41f2-87c1-26b3f14e5925"},{"name":"Green","uuid":"77394377-f6b8-4366-9bef-d468621258ef","destination_node_uuid":"bc978e00-2f3d-41f2-87c1-26b3f14e5925"},{"name":"Blue","uuid":"92d429d8-c275-4306-9360-93f4b9c7acb1","destination_node_uuid":"bc978e00-2f3d-41f2-87c1-26b3f14e5925"},{"name":"Indigo","uuid":"2de9af80-1bd9-4f37-839f-073edbd14369","destination_node_uuid":"bc978e00-2f3d-41f2-87c1-26b3f14e5925"},{"name":"Violet","uuid":"5760ec2f-04d4-492b-817b-9f395633ec79","destination_node_uuid":"bc978e00-2f3d-41f2-87c1-26b3f14e5925"},{"uuid":"326a41b7-9bce-453b-8783-1113f649663c","name":"Other","destination_node_uuid":"4fac7935-d13b-4b36-bf15-98075dca822a"}],"wait":{"type":"msg"}},{"uuid":"bc978e00-2f3d-41f2-87c1-26b3f14e5925","router":{"type":"switch","default_exit_uuid":"a8bdc1c5-0283-4656-b932-4f4094f4cc7e","cases":[{"uuid":"87173eee-5270-4233-aede-ca88e14b672a","type":"has_any_word","exit_uuid":"7b245d49-e9e3-4387-b4ad-48deb03528cd","arguments":["red, r"]}],"operand":"@run.results.color "},"exits":[{"name":"Red","uuid":"7b245d49-e9e3-4387-b4ad-48deb03528cd","destination_node_uuid":"e2ecc8de-9774-4b74-a0dc-ca8aea123227"},{"uuid":"a8bdc1c5-0283-4656-b932-4f4094f4cc7e","name":"Other","destination_node_uuid":"533b64e2-5906-4d33-a8e9-64f1cb6c20dd"}],"wait":{"type":"exp"}},{"uuid":"e2ecc8de-9774-4b74-a0dc-ca8aea123227","actions":[{"uuid":"cd19e588-3383-4d54-b5df-8dbbc2b0d297","type":"send_msg","text":"Mine too!"}],"exits":[{"uuid":"6f78b6f2-e8a4-4fa0-9277-3e60d9bf2dbf","destination_node_uuid":"059a8daa-0697-44a6-9486-2386cc417e9d","name":null}]},{"uuid":"533b64e2-5906-4d33-a8e9-64f1cb6c20dd","actions":[{"uuid":"28b9e295-1102-4f13-bd9d-4a7b11f4fcdc","type":"send_msg","text":"Yuck"}],"exits":[{"uuid":"9de30522-db84-4471-bce6-99f6d0a200e0","destination_node_uuid":"882f8022-7256-4b1c-abf3-7b180f5e7e24","name":null}]},{"uuid":"882f8022-7256-4b1c-abf3-7b180f5e7e24","router":{"type":"switch","default_exit_uuid":"0dcd0320-2a3b-4c41-97b3-45e147682cfa","cases":[{"uuid":"a2e446bf-7181-40f9-8996-5d2453486218","type":"has_group","exit_uuid":"ae0b5c58-222f-4722-9fd4-faf32dec5f2b","arguments":["cdbf9e01-aaa7-4381-8259-ee042447bcac"]},{"uuid":"fa8d0d3a-067e-4460-9cff-0474ecc4e8ca","type":"has_group","exit_uuid":"7571ef74-35b3-4090-ac7a-c4531a500806","arguments":["33b28bac-b588-43e4-90de-fda77aeaf7c0"]}],"operand":"@contact.groups"},"exits":[{"name":"Early Adopters","uuid":"ae0b5c58-222f-4722-9fd4-faf32dec5f2b","destination_node_uuid":null},{"name":"Subscribers","uuid":"7571ef74-35b3-4090-ac7a-c4531a500806","destination_node_uuid":"059a8daa-0697-44a6-9486-2386cc417e9d"},{"uuid":"0dcd0320-2a3b-4c41-97b3-45e147682cfa","name":"Other","destination_node_uuid":null}],"wait":{"type":"group"}},{"uuid":"059a8daa-0697-44a6-9486-2386cc417e9d","router":{"type":"switch","operand":"@child","cases":[{"uuid":"2d247ecc-1d5d-4381-914a-3195b1888f04","type":"has_run_status","arguments":["C"],"exit_uuid":"8c867b8f-f311-4b02-b36b-3688964bdc69"},{"uuid":"b46ffd80-1b85-44bf-b3f2-01550d4ff302","type":"has_run_status","arguments":["E"],"exit_uuid":"1a81edc4-5f8c-4115-92ef-834dac61c2e7"}],"default_exit_uuid":null},"exits":[{"uuid":"8c867b8f-f311-4b02-b36b-3688964bdc69","name":"Complete","destination_node_uuid":null},{"uuid":"1a81edc4-5f8c-4115-92ef-834dac61c2e7","name":"Expired","destination_node_uuid":null}],"actions":[{"uuid":"dbcccd07-9966-460a-9fcd-4db5a2f921ab","type":"start_flow","flow_name":"Customer Service","flow_uuid":"9ecc8e84-6b83-442b-a04a-8094d5de997b"}],"wait":{"type":"flow","flow_uuid":"9ecc8e84-6b83-442b-a04a-8094d5de997b"}}],"_ui":{"languages":[{"eng":"English"},{"spa":"Spanish"}],"nodes":{"4fac7935-d13b-4b36-bf15-98075dca822a":{"position":{"x":40,"y":80},"dimensions":{"width":200,"height":95}},"46e8d603-8e5d-4435-97dd-1333291aafca":{"position":{"x":420,"y":260},"type":"wait_for_response","dimensions":{"width":489,"height":59}},"bc978e00-2f3d-41f2-87c1-26b3f14e5925":{"position":{"x":540,"y":500},"type":"split_by_expression","dimensions":{"width":200,"height":59}},"e2ecc8de-9774-4b74-a0dc-ca8aea123227":{"position":{"x":40,"y":400},"dimensions":{"width":200,"height":65}},"533b64e2-5906-4d33-a8e9-64f1cb6c20dd":{"position":{"x":760,"y":660},"dimensions":{"width":200,"height":65}},"059a8daa-0697-44a6-9486-2386cc417e9d":{"position":{"x":300,"y":800},"type":"subflow","dimensions":{"width":200,"height":91}},"882f8022-7256-4b1c-abf3-7b180f5e7e24":{"position":{"x":580,"y":780},"type":"split_by_group","dimensions":{"width":247,"height":59}}}}}}]}

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = {"results":[{"name":"Customer Service","uuid":"9ecc8e84-6b83-442b-a04a-8094d5de997b","definition":{"name":"Customer Service","language":"eng","uuid":"9ecc8e84-6b83-442b-a04a-8094d5de997b","localization":{"spa":{"360a28a1-6741-4f16-9421-f6f313cf753e":{"text":"Hola, como te llamas?"}}},"nodes":[{"uuid":"24afc61e-e528-4ac0-b887-78cebd39f12b","actions":[{"uuid":"360a28a1-6741-4f16-9421-f6f313cf753e","type":"send_msg","text":"Hi there, what is your name?"},{"uuid":"d5293394-c6d4-407c-97da-8149faea24cf","type":"add_contact_groups","groups":[{"uuid":"2429d573-80d7-47f8-879f-f2ba442a1bfd","name":"Unsatisfied Customers"}]}],"exits":[{"name":null,"uuid":"445fc64c-2a18-47cc-89d0-15172826bfcc","destination_node_uuid":"d642b014-3c91-418f-ad5b-0fb4f8c5ee60"}]},{"uuid":"d642b014-3c91-418f-ad5b-0fb4f8c5ee60","router":{"type":"switch","default_exit_uuid":"984fefee-3bf3-4e7b-bf84-e6e650253b2b","cases":[],"operand":"@input","result_name":"Name"},"exits":[{"uuid":"984fefee-3bf3-4e7b-bf84-e6e650253b2b","name":"All Responses","destination_node_uuid":"7a19060d-6d93-4217-a4e5-9cbd479be051"}],"wait":{"type":"msg"}},{"uuid":"7a19060d-6d93-4217-a4e5-9cbd479be051","actions":[{"uuid":"505e8da9-0b73-4cf4-84a7-ce2a58d70f3e","type":"set_contact_field","field_name":"Full Name","field_uuid":"9c9c46de-0ddf-4d26-b834-a67ae56ef618","value":"@run.results.name"},{"uuid":"21541123-ab0f-4c2f-9835-5c97e9be133f","type":"send_msg","text":"Thanks @run.results.name, what can we help you with?"}],"exits":[{"uuid":"890ec71a-edaa-47a0-90ac-09f6f8d0d5b0","destination_node_uuid":"fc349688-3589-42ac-b61c-d5ef54cedaa5","name":null}]},{"uuid":"fc349688-3589-42ac-b61c-d5ef54cedaa5","router":{"type":"switch","default_exit_uuid":"28adcb5e-8208-4e35-82c3-f377cbba5a7c","cases":[],"operand":"@input","result_name":"This can be something that is really long"},"exits":[{"uuid":"28adcb5e-8208-4e35-82c3-f377cbba5a7c","name":"All Responses","destination_node_uuid":"a8a09d00-7cab-4375-9d44-58f6783732f6"}],"wait":{"type":"msg"}},{"uuid":"a8a09d00-7cab-4375-9d44-58f6783732f6","actions":[{"uuid":"9c10156e-aec0-45a3-a144-da84e87222c2","type":"set_run_result","result_name":"Phone","value":"@contact.urns.tel","category":""},{"uuid":"225a67f4-28b5-4819-a25b-eb9a0ecea11d","type":"send_email","body":"@run.results.name says: \n\n@run.results.issue \n\nPlease reach out to them at @run.results.phone","subject":"New Issue","emails":["support@acme.co"]},{"uuid":"71c026a5-7c1c-4e79-8421-21b8c3689510","type":"send_msg","text":"Thanks! We'll be in touch shortly 👍"}],"exits":[{"name":null,"uuid":"b319dff7-cdb6-4ce4-9f48-5e72818bae77","destination_node_uuid":"471f6f94-c683-48f9-8e27-ece1d7604315"}]},{"uuid":"471f6f94-c683-48f9-8e27-ece1d7604315","router":{"type":"switch","operand":"@webhook","cases":[{"uuid":"379eed12-fe01-44b4-85c5-a1f2816e3557","type":"has_webhook_status","arguments":["S"],"exit_uuid":"f783f0b5-1d08-4981-9547-bae6d35e84c2"}],"default_exit_uuid":"c1432a6b-0fe4-435f-915a-15d55e269147"},"exits":[{"uuid":"f783f0b5-1d08-4981-9547-bae6d35e84c2","name":"Success","destination_node_uuid":null},{"uuid":"c1432a6b-0fe4-435f-915a-15d55e269147","name":"Failure","destination_node_uuid":null}],"actions":[{"uuid":"b29914f6-94f4-44ab-be48-55a51a76afdf","type":"call_webhook","url":"http://example.com","headers":{},"method":"POST","body":"{\n    \"contact\": @(to_json(contact.uuid)),\n    \"contact_urn\": @(to_json(contact.urns)),\n    \"message\": @(to_json(input.text)),\n    \"flow\": @(to_json(run.flow.uuid)),\n    \"flow_name\": @(to_json(run.flow.name))\n}"}]}],"_ui":{"languages":[{"eng":"English"},{"spa":"Spanish"}],"nodes":{"24afc61e-e528-4ac0-b887-78cebd39f12b":{"position":{"x":80,"y":120}},"d642b014-3c91-418f-ad5b-0fb4f8c5ee60":{"position":{"x":500,"y":280},"type":"wait_for_response"},"7a19060d-6d93-4217-a4e5-9cbd479be051":{"position":{"x":80,"y":360}},"fc349688-3589-42ac-b61c-d5ef54cedaa5":{"position":{"x":500,"y":540},"type":"wait_for_response"},"a8a09d00-7cab-4375-9d44-58f6783732f6":{"position":{"x":80,"y":640}},"471f6f94-c683-48f9-8e27-ece1d7604315":{"position":{"x":500,"y":800},"type":"webhook"}}}}}]}

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = {"total":3,"results":[{"name":"Expected Delivery Date","uuid":"23ff7152-b588-43e4-90de-fda77aeaf7c0","type":"field"},{"name":"National ID","uuid":"2429d573-80d7-47f8-879f-f2ba442a1bfd","type":"field"},{"name":"Number of Children","uuid":"5510bddf-01bd-45b5-a519-33b28bac48d0","type":"field"}],"more":null}

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = {"total":5,"results":[{"name":"Customers","uuid":"23ff7152-b588-43e4-90de-fda77aeaf7c0"},{"name":"Unsatisfied Customers","uuid":"2429d573-80d7-47f8-879f-f2ba442a1bfd"},{"name":"Early Adopters","uuid":"cdbf9e01-aaa7-4381-8259-ee042447bcac"},{"name":"Testers","uuid":"afaba971-8943-4dd8-860b-3561ed4f1fe1"},{"name":"Subscribers","uuid":"33b28bac-b588-43e4-90de-fda77aeaf7c0"}],"more":null}

/***/ })
/******/ ])));