/* A polyfill for browsers that don't support ligatures. */
/* The script tag referring to this file must be placed before the ending body tag. */

/* To provide support for elements dynamically added, this script adds
   method 'icomoonLiga' to the window object. You can pass element references to this method.
*/
(function () {
    'use strict';
    function supportsProperty(p) {
        var prefixes = ['Webkit', 'Moz', 'O', 'ms'],
            i,
            div = document.createElement('div'),
            ret = p in div.style;
        if (!ret) {
            p = p.charAt(0).toUpperCase() + p.substr(1);
            for (i = 0; i < prefixes.length; i += 1) {
                ret = prefixes[i] + p in div.style;
                if (ret) {
                    break;
                }
            }
        }
        return ret;
    }
    var icons;
    if (!supportsProperty('fontFeatureSettings')) {
        icons = {
            'design': '&#xe90d;',
            'pencil-ruler': '&#xe90d;',
            'image5': '&#xe942;',
            'picture5': '&#xe942;',
            'video-camera2': '&#xe963;',
            'video11': '&#xe963;',
            'folder2': '&#xe9db;',
            'directory11': '&#xe9db;',
            'folder-open': '&#xe9dc;',
            'directory12': '&#xe9dc;',
            'price-tag2': '&#xe9ee;',
            'phone2': '&#xea1d;',
            'telephone2': '&#xea1d;',
            'envelop5': '&#xea34;',
            'mail5': '&#xea34;',
            'bubble13': '&#xead8;',
            'comment8': '&#xead8;',
            'user': '&#xeaf7;',
            'profile2': '&#xeaf7;',
            'users': '&#xeaf8;',
            'group': '&#xeaf8;',
            'tree6': '&#xec65;',
            'branches2': '&#xec65;',
            'tree7': '&#xec66;',
            'branches3': '&#xec66;',
            'cloud-upload2': '&#xec7b;',
            'cloud7': '&#xec7b;',
            'earth2': '&#xec97;',
            'globe7': '&#xec97;',
            'plus-circle2': '&#xed61;',
            'add5': '&#xed61;',
            'cross3': '&#xed6e;',
            'cancel4': '&#xed6e;',
            'checkmark4': '&#xed72;',
            'tick4': '&#xed72;',
            'play4': '&#xed85;',
            'player8': '&#xed85;',
            'pause2': '&#xed86;',
            'player9': '&#xed86;',
            'stop2': '&#xed87;',
            'player10': '&#xed87;',
            'arrow-up': '&#xedb7;',
            'up': '&#xedb7;',
            'arrow-right': '&#xedbb;',
            'right3': '&#xedbb;',
            'arrow-down': '&#xedbf;',
            'down': '&#xedbf;',
            'arrow-left': '&#xedc3;',
            'left4': '&#xedc3;',
            'simulator': '&#xe900;',
          '0': 0
        };
        delete icons['0'];
        window.icomoonLiga = function (els) {
            var classes,
                el,
                i,
                innerHTML,
                key;
            els = els || document.getElementsByTagName('*');
            if (!els.length) {
                els = [els];
            }
            for (i = 0; ; i += 1) {
                el = els[i];
                if (!el) {
                    break;
                }
                classes = el.className;
                if (/icon-/.test(classes)) {
                    innerHTML = el.innerHTML;
                    if (innerHTML && innerHTML.length > 1) {
                        for (key in icons) {
                            if (icons.hasOwnProperty(key)) {
                                innerHTML = innerHTML.replace(new RegExp(key, 'g'), icons[key]);
                            }
                        }
                        el.innerHTML = innerHTML;
                    }
                }
            }
        };
        window.icomoonLiga();
    }
}());
