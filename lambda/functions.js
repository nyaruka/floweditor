const functions = [
    {
        signature: 'abs(number)',
        summary: 'Returns the absolute value of `number`.',
        detail: '',
        examples: [
            {
                template: '@(abs(-10))',
                output: '10'
            },
            {
                template: '@(abs(10.5))',
                output: '10.5'
            },
            {
                template: '@(abs("foo"))',
                output: 'ERROR'
            }
        ]
    },
    {
        signature: 'and(values...)',
        summary: 'Returns whether all the given `values` are truthy.',
        detail: '',
        examples: [
            {
                template: '@(and(true))',
                output: 'true'
            },
            {
                template: '@(and(true, false, true))',
                output: 'false'
            }
        ]
    }
];
const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) => cb(null, getOpts({ body: JSON.stringify(functions) }));
