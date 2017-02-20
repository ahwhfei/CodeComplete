(function() {
    'use strict';
    const translate = require('google-translate-api');
    const fs = require('fs');
    const xml2js = require('xml2js');
    const parseString = xml2js.parseString;
    const builder = new xml2js.Builder();

    let targetLanguage = ['zh-cn', 'zh-tw', 'fr', 'ja', 'ko', 'de'];
    
    const xmlSourceLanguageFile = 'Resources.resx';
    const jsonSourceLanguageFile = 'Resources.json';

    console.log('Translating...');

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

    let rawData = fs.readFileSync(xmlSourceLanguageFile, 'utf-8');

    parseString(rawData, {
        explicitArray: false,
        trim: true
    }, (err, result) => {
        fs.writeFile(jsonSourceLanguageFile, JSON.stringify(result));

        targetLanguage.map(e => {
            console.time(`Language ${e} Translated Time`);
            let languageList = [];
            let copiedJson = JSON.parse(JSON.stringify(result)); // Deep copy
            let promises = [];

            if (!!copiedJson['root'] && !!copiedJson['root']['data']) {
                languageList = copiedJson['root']['data'];
            }

            languageList.map(language => {
                let translatePromise = translate(language['value'], {to: e})
                    .then(data => data.text);

                promises.push(translatePromise);
            });

            let promiseObservable = Rx.Observable.fromPromiseList(promises, (err) => {
                return Rx.Observable.throw(err);
            });

            let i = 0;
            promiseObservable.subscribe(
                data => {
                    languageList[i++]['value'] = data;
                },
                err => console.log(err),
                () => {
                    fs.appendFileSync(e+'.json', JSON.stringify(copiedJson));

                    if (i !== languageList.length) {
                        console.error('ERROR: translation exist error.');
                    }

                    let xmlLanguage = builder.buildObject(copiedJson);
                    let filename = xmlSourceLanguageFile.split('.');
                    fs.appendFileSync(filename[0] + '_' + e + '.' + filename[1], xmlLanguage);

                    console.timeEnd(`Language ${e} Translated Time`);
                }
            );
        });
    });  
})();