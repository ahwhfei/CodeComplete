function getJSONP(url, callback) {
    var cbnum = 'cb' + getJSONP.counter ++;
    var cbname = 'getJSONP.' + cbnum;

    if (url.indexOf('?') === -1) {
        url += '?jsonp=' + cbname;
    } else {
        url += '&jsonp=' + cbname;
    }

    var script = document.createElement('script');
    getJSONP[cbnum] = function(response) {
        try {
            callback(response);
        } finally {
            delete getJSONP[cbnum];
            script.partentNode.removeChild(script);
        }
    };

    script.src = url;
    document.body.appendChild(script);
}

getJSONP.counter = 0;

getJSONP('http://en.wikipedia.org/w/api.php?search=apple&action=opensearch&format=json',
    data => console.log(data));
