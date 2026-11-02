const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const scriptPath = path.resolve(__dirname, '../../client/script.js');
const source = fs.readFileSync(scriptPath, 'utf8');
const context = {
    document: { addEventListener() {} },
    window: {},
    console: { log() {}, warn() {}, error() {} },
};
vm.runInNewContext(source, context, { filename: scriptPath });
const escapeAttribute = vm.runInNewContext('escapeAttribute', context);

test('escapes every HTML attribute delimiter in service values', () => {
    assert.equal(
        escapeAttribute(`" onerror='alert(1)' & <image>`),
        '&quot; onerror=&#39;alert(1)&#39; &amp; &lt;image&gt;',
    );
});

test('converts nullish service attribute values to an empty string', () => {
    assert.equal(escapeAttribute(null), '');
    assert.equal(escapeAttribute(undefined), '');
});
