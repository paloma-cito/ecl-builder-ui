const fs = require('fs-extra');
const concat = require('concat');

concatenate = async () =>{
    const files = [
        './dist/ecl-builder-ui/runtime.js',
        './dist/ecl-builder-ui/polyfills.js',
        './dist/ecl-builder-ui/main.js'
    ];

    await fs.ensureDir('output');
    await concat(files, 'output/ecl-builder.js');

    // pduff
    // await concat(files, '../blank-template/node_modules/snomed-ecl-builder/output/ecl-builder.js');
    
    // await fs.copyFile('./dist/ecl-builder-ui/styles.css', 'output/styles.css');
    // await fs.copy('./dist/ecl-builder-ui/assets/', 'output/assets/');
}
concatenate();
