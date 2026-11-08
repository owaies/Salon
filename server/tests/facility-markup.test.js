const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const scriptPath = path.resolve(__dirname, '../../client/facilities.js');
const source = fs.readFileSync(scriptPath, 'utf8');

function createTextElement() {
    let text = '';
    return {
        set textContent(value) { text = String(value); },
        get innerHTML() {
            return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        },
    };
}

function createContext(facilities) {
    const container = { innerHTML: '' };
    const context = {
        URL,
        document: {
            getElementById: () => container,
            createElement: createTextElement,
        },
        fetch: async () => ({ ok: true, json: async () => facilities }),
        console: { error() {} },
        encodeURIComponent,
        decodeURIComponent,
    };
    vm.runInNewContext(source, context, { filename: scriptPath });
    return { context, container };
}

test('facility image sources accept HTTP(S) and relative URLs only', () => {
    const { context } = createContext([]);
    const safeImageSource = vm.runInNewContext('safeImageSource', context);

    assert.equal(safeImageSource('/images/sauna.jpg'), '/images/sauna.jpg');
    assert.equal(safeImageSource('https://cdn.example.com/sauna.jpg'), 'https://cdn.example.com/sauna.jpg');
    assert.equal(safeImageSource('javascript:alert(1)'), 'https://via.placeholder.com/300');
    assert.equal(safeImageSource('data:text/html,unsafe'), 'https://via.placeholder.com/300');
});

test('facility image and alt attributes cannot inject markup', async () => {
    const { context, container } = createContext([{
        id: 1,
        name: 'Sauna" onerror="alert(1)',
        description: '<script>alert(1)</script>',
        image: 'javascript:alert(1)',
    }]);

    await vm.runInNewContext('loadFacilities()', context);

    assert.match(container.innerHTML, /src="https:\/\/via\.placeholder\.com\/300"/);
    assert.match(container.innerHTML, /alt="Sauna&quot; onerror=&quot;alert\(1\)"/);
    assert.doesNotMatch(container.innerHTML, /alt="[^"]*" onerror=/);
    assert.doesNotMatch(container.innerHTML, /src="javascript:/);
    assert.doesNotMatch(container.innerHTML, /<script>/);
});
