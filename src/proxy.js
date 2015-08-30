var config = require('../config/config.js'),
    nock = require('nock'),
    http = require('http'),
    httpProxy = require('http-proxy'),
    utils = require('./modules/utils'),
    Recorder = require('./modules/recorder');

global.debug = config.debug || false;
global.logger = utils.logger;

var mode = process.argv[2];

if (!mode || -1 === ['rec', 'play'].indexOf(mode)) {
    logger('You need to pass a mode [rec|play], "%s" given'.replace('%s', mode));
    return;
}

logger('[MODE] "%s" mode on!'.replace('%s', mode));

var proxy = httpProxy.createProxyServer({});

var target = '%s:%d'.replace('%s', config.target.host).replace('%d', config.target.port);
logger('Target is: "%s"'.replace('%s', target));

var recorder = new Recorder(nock, config.recorder);
recorder.insertCassette(config.recorder.cassette);

// in play mode, insert existing cassette and let nock do the rest!
if (config.recorder && 'play' === mode) {
    recorder.play();
}

// in rec mode, create rec cassette, listen to http calls (nock)
// and catch termination signals to write into cassette before exit
if (config.recorder && 'rec' === mode) {
    recorder.record();
}

var server = http.createServer(function (req, res) {

    // logger(req.headers);
    logger('Called "[%s] %s"'.replace('%s', req.method).replace('%s', req.url));
    proxy.web(req, res, { target: target });

    proxy.on('proxyRes', function (proxyRes, req, res) {
        // recorder.record(nock.recorder.play());
    });

});

logger('Proxy listening on port %d'.replace('%d', config.proxy.port));
server.listen(config.proxy.port);
