# vcr-proxy

This proxy aims to allow you to record your javascript SPA (Single Page
Application) HTTP API calls to replay then faster without your real backend in
your functional test suite.


## Install

`npm install vcr-proxy --save-dev`
`cp config/config.js.dist config/config.js`

And modify your `config.js` parameters as you want.


## Run

Recording mode:

`node src/proxy.js rec`

Play mode:

`node src/proxy.js play`


## License

MIT
