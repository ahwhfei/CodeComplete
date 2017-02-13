(function() {
    'use strict';
    const translate = require('google-translate-api');
    const fs = require('fs');

    let targetLanguage = ['zh-cn', 'zh-tw', 'fr', 'ja', 'ko'];
    const sourceLanguageFile = 'en.json';

    console.log('Translating...');
    let data = fs.readFileSync(sourceLanguageFile, 'utf-8');

    let Rx = require('rx');
    Rx.Observable.fromPromiseList = function (promises, errorHandle) {
        return Rx.Observable.fromArray(promises)
            .concatMap(p => {
                let source = Rx.Observable.fromPromise(p);
                if (errorHandle) {
                    source.catch(errorHandle);
                }

                return source;
            });
    };

    // workaround for fs.readFile and readFileSync doesn't strip BOM markers
    data = data.replace(/^\uFEFF/, '');
    let languageObject = JSON.parse(data);
    fs.writeFile('en-us.json', JSON.stringify(languageObject));

    let promises = [];

    targetLanguage.map(e => {
        console.time(`Language ${e} Translated Time`);
        
        let translated = {};

        fs.writeFileSync(e+'.json', '');

        for (let key in languageObject) {
            if (!languageObject.hasOwnProperty(key)) {
                continue;
            }

            let translatePromise = translate(languageObject[key], {to: e})
                .then(data => {
                    let languageObject = {};
                    languageObject['originLanguage'] = key;
                    languageObject['translatedLanguage'] = data.text;
                    return languageObject;
                });

            promises.push(translatePromise);
        }

        let count = 0;
        let promiseObservable = Rx.Observable.fromPromiseList(promises, (err) => {
            return (++count < (promises.length/3)) ? Rx.Observable.empty() : Rx.Observable.throw(err);
        });

        promiseObservable.subscribe(
            data => {
                translated[data.originLanguage] = data.translatedLanguage;
            },
            err => console.log(err),
            () => {
                fs.appendFileSync(e+'.json', JSON.stringify(translated));
                console.timeEnd(`Language ${e} Translated Time`);
            }
        );
    });
})();