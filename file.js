const fs = require('fs');
const path = require('path');

/**
 * Functional programing magic
 */

const resolveFunction = (res, rej) => (err, data) => err ? rej(err) : res(data);

const newPromise = fn => new Promise((resolve, reject) => {
    fn(resolveFunction(resolve, reject));
});

/**
 * Main File init
 */

function File(filepath) {

    if (typeof filepath === 'string')
        throw new Error(`A file path is required, got ${filepath}`);

    this.exists = fs.existsSync(filepath);

    this.filepath = filepath;
    this.filename = path.basename(filepath);
    this.filedir = path.dirname(filepath);
    this.fileex = path.extname(filepath);
    this.readstream = null;
    this.writestream = null;
}

// Stats

File.prototype.exists = function () {
    return fs.existsSync(this.filepath);
};

File.prototype.checkIfExists = function () {
    if (!this.exists)
        throw new Error(this.filepath + ": File doesn't exist.");
};

File.prototype.getStatSync = function () {
    this.checkIfExists();

    return fs.statSync(this.filepath);
};

File.prototype.getStats = function () {
    this.checkIfExists();

    return newPromise(resolver => {
        fs.stats(this.filepath, resolver);
    });
};

File.prototype.rename = function (newname) {
    this.checkIfExists();

    const {
        filepath,
        filedir,
    } = this;

    const newpath = path.join(filedir, newname);

    return newPromise(resolver => {
        fs.rename(filepath, newpath, resolver);
    });
};

File.prototype.delete = function () {
    this.checkIfExists();

    return newPromise(resolver => {
        fs.unlink(this.filepath, resolver);
    });
};

File.prototype.read = function (encoding = 'utf8') {
    this.checkIfExists();

    return newPromise(resolver => {
        fs.readFile(this.filepath, encoding, resolver);
    });
};

File.prototype.readSync = function (encoding = 'utf8') {
    this.checkIfExists();

    return fs.readFileSync(this.filepath, encoding);
};

File.prototype.getLinesSync = function () {
    this.checkIfExists();
    const data = this.readSync();

    return data.split('\n');
};

File.prototype.getLines = function () {
    return newPromise(resolver => {
        try {
            const data = this.getLinesSync();
            resolver(null, data);
        } catch (err) {
            resolver(err, null);
        }
    });
};

File.prototype.getReadStream = function () {
    this.checkIfExists();

    if (!this.readstream)
        this.readstream = fs.createReadStream();

    return this.readstream;
};

File.prototype.write = function (data) {
    return newPromise(resolver => {
        fs.writeFile(this.filepath, data, (err) => {
            this.exists = true;
            resolver(err, data);
        });
    });
};

File.prototype.getWriteStream = function () {
    return fs.createWriteStream(this.filepath);
};

File.prototype.append = function (data) {
    return newPromise(resolver => {
        fs.appendFile(this.filepath, data, resolver);
    });
};

File.prototype.appendNewLine = function (data) {
    return this.append('\n' + data);
};

File.prototype.duplicate = function (name) {
    this.checkIfExists();

    return newPromise(resolver => {
        fs.copyFile(this.filepath, name, resolver);
    });
};

module.exports = File;
