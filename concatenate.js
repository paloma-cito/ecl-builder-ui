const fs = require('fs-extra');
const concat = require('concat');

concatenate = async () =>{
    const files = [
        './dist/ecl-builder-ui/runtime.js',
        './dist/ecl-builder-ui/polyfills.js',
        './dist/ecl-builder-ui/main.js',
        './dist/ecl-builder-ui/styles.css'
    ];

    await fs.ensureDir('output');
    await concat(files, 'output/ecl-builder.js');
}
concatenate();
