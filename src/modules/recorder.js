var fs = require('fs');

var Recorder = function (nock, config) {
    this.nock = nock;
    this.config = config;
    this.cassette = null;
    this.savedOnce = false;
}

Recorder.prototype =  {
    record: function (cassette) {
        // create or truncate existing file ('w' flag)
        fs.open(this.cassette, 'w', function (err, fd) {
            if (err) throw err;
            fs.close(fd, function (err) {
                if (err) throw err;
            }.bind(this));
        }.bind(this));

        this.nock.recorder.rec({
            dont_print: true,
            output_objects: true,
            enable_reqheaders_recording: this.config.enable_reqheaders_recording || false
        });

        process.stdin.resume();
        process.on('SIGINT', this._exitHandler.bind(this, { exit: true }));
        process.on('exit', this._exitHandler.bind(this, { cleanup: true }));
    },

    insertCassette: function (cassette) {
        this.cassette = '%s/%s.json'
            .replace('%s', cassette.path)
            .replace('%s', cassette.name);
    },

    play: function () {
        this.nock.enableNetConnect();
        this.nock.load(this.cassette);
    },

    write: function (nockCallObjects) {
        if (!nockCallObjects.length) return;
        if (this.savedOnce) return;
        this.savedOnce = true;

        if (!this.config.enable_reqbody_recording) {
            nockCallObjects.forEach(function (object, index) {
                if ('' !== object.body) {
                    nockCallObjects[index].body = '*';
                }
            });
        }

        logger('Writting recorded http traffic into cassette!');
        // use sync writting since it would be done on 'exit' signal and that every non async process is not run
        fs.appendFileSync(this.cassette, JSON.stringify(nockCallObjects));
    },

    _exitHandler: function (options, err) {
        if (err) logger('error', err);

        this.write(this.nock.recorder.play());
        process.exit();
    }
};

module.exports = Recorder;
