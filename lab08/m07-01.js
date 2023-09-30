class Stat {
    constructor(sfn = "./static") {
        this.STATIC_FOLDER = sfn
        this.fs = require("fs");
    }

    pathStatic(fn) {
        return this.STATIC_FOLDER + fn.substring(fn.lastIndexOf('/'));
    }

    writeHTTP404 = (res) => {
        res.statusCode = 404;
        res.statusMessage = "Resource not found";
        res.end("Resource not found");
    }

    pipeFile(req, res, headers) {
        res.writeHead(200, headers);
        this.fs.createReadStream(this.pathStatic(req.url)).pipe(res);
    }

    isStatic(ext, fn) {
        let reg = new RegExp(`^/\.+\.${ext}$`); return reg.test(fn);
    }

    sendFile(req, res, headers) {
        this.fs.access(this.pathStatic(req.url), this.fs.constants.R_OK, err => {
            if (err) {
                console.log(req.url);
                this.writeHTTP404(res);
                return;
            }
            this.pipeFile(req, res, headers);
        })
    }
}

module.exports = (parm) => { return new Stat(parm) };