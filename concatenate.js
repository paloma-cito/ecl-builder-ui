const fs = require('fs-extra');
const concat = require('concat');

concatenate = async () =>{
    const files = [
        './dist/ecl-builder-component/runtime.js',
        './dist/ecl-builder-component/polyfills.js',
        './dist/ecl-builder-component/main.js'
    ];

    await fs.ensureDir('output');
    await concat(files, 'output/ecl-builder.js');
}
concatenate();
