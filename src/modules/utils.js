module.exports = {
    logger: function () {
        if (true !== debug) return;
        console.log.apply(null, arguments);
    }
};
