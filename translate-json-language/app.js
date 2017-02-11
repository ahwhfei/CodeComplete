(function() {
    'use strict';
    const translate = require('google-translate-api');
    const fs = require('fs');

    let targetLanguage = ['zh-cn', 'zh-tw', 'fr', 'ja', 'ko'];
    const sourceLanguageFile = 'en.json';

    console.time('Translated Time');
    console.log('Translating...');
    let data = fs.readFileSync(sourceLanguageFile, 'utf-8');

    // workaround for fs.readFile and readFileSync doesn't strip BOM markers
    data = data.replace(/^\uFEFF/, '');
    let languageObject = JSON.parse(data);
    fs.writeFile('en-us.json', JSON.stringify(languageObject));

    targetLanguage.map(e => {
        fs.writeFileSync(e+'.json', '');

        for (let key in languageObject) {
            if (!languageObject.hasOwnProperty(key)) {
                continue;
            }

            // if (languageObject[key].indexOf('{{') >= 0
            //     || languageObject[key].indexOf('http') >= 0) {
            //     let r = languageObject[key].replace(/"/g, '\\\"');
            //     let lanStr = '"' + key + '": "' + r + '", ';
            //     fs.appendFileSync(e+'.json', lanStr);
            //     continue;
            // }

            translate(languageObject[key], {to: e})
                .then(data => {
                    let r = data.text.replace(/"/g, '\\\"');
                    let lanStr = '"' + key + '": "' + r + '", ';
                    fs.appendFileSync(e+'.json', lanStr);
                });
        }
    });

    console.timeEnd('Translated Time');
})();