const fs = require('fs');

// A simple function for getting the name and extenstion for a given string.
const getFileEx = fileName => {
    const fileEx = fileName.match(/\.[0-9a-z]+$/i);

    if (!fileEx)
        throw new Error("Error... :'(");

    if (fileEx) {
        const ex = fileEx[0];
        return {
            name: fileName.replace(ex, ''),
            ex: ex.replace('.', '')
        }
    }
}

// Constructor
function File(path, filename, stats) {

    if (!path)
        throw new Error("A file path is required.");
    if (!filename)
        throw new Error("A file name is required.");

    const fullpath = path + '/' + filename;

    fs.exists(fullpath, exists => {
        this.exists = exists
    });

    const prop = getFileEx(filename);

    this.filePath = path;
    this.fileName = filename;
    this.fullPath = fullpath;
    this.extension = prop.ex;
    this.name = prop.name;

    if (stats)
        this.stats = this.statsSync();
}

// ---------------------------------------------------------------
// Stats
// ---------------------------------------------------------------

File.prototype.statsSync = function () {

    if (!this.exists) throw new Error("File doesn't exist. ");

    return fs.statSync(this.fullPath);
}

File.prototype.getStats = function (callback) {

    if (!this.exists) throw new Error("File doesn't exist. ");

    if (typeof callback != 'function')
        throw new Error("File.getStats expects a callback got :" + callback);

    const {
        fullPath
    } = this;

    fs.stat(fullPath, (err, stats) => {
        if (err)
            throw err;

        callback(stats);
    });

}

// ---------------------------------------------------------------
// Renaming of a file
// ---------------------------------------------------------------

File.prototype.rename = function (newName, callback) {

    if (!this.exists) throw new Error("File doesn't exist. ");

    if (typeof newName != 'string')
        throw new Error("File.rename expects a string got :" + newName);

    const oldpath = this.fullPath;
    const newpath = this.filePath + '/' + newName;

    fs.rename(oldpath, newpath, err => {
        if (err)
            throw err;

        if (typeof callback === 'function')
            callback(newpath);
    });

}


// ---------------------------------------------------------------
// File deletion
// ---------------------------------------------------------------

File.prototype.delete = function (callback) {

    const {
        fullPath,
        exists
    } = this;

    if (!exists) throw new Error("File doesn't exist. ");

    fs.unlink(fullPath, err => {
        if (err)
            throw err;

        if (typeof callback === 'function')
            callback(fullPath);
    });

}

// ---------------------------------------------------------------
// Reading a file
// ---------------------------------------------------------------

File.prototype.read = function (callback, encoding = 'utf8') {

    if (!this.exists) throw new Error("File doesn't exist. ");

    if (typeof callback != 'function')
        throw new Error("File.getStats expects a callback got :" + callback);

    fs.readFile(this.fullPath, encoding, (err, data) => {
        if (err)
            throw err;

        callback(data);
    });

}

File.prototype.readSync = function (encoding = 'utf8') {

    if (!this.exists) throw new Error("File doesn't exist. ");

    return fs.readFileSync(this.fullPath, encoding);
}

// ---------------------------------------------------------------
// Write to a file
// ---------------------------------------------------------------

File.prototype.write = function (data, callback) {

    if (typeof data != 'string')
        throw new Error("File.write expects data as a string, got : " + data);

    fs.writeFile(this.fullPath, data, err => {
        if (err)
            throw err;

        if (typeof callback === 'function') {
            this.exists = true;
            callback(data);
        }
    })
}

// ---------------------------------------------------------------
// Append to a file
// ---------------------------------------------------------------

File.prototype.append = function (data, callback) {

    if (typeof data != 'string')
        throw new Error("File.appned expects data as a string, got : " + data);

    fs.appendFile(this.fullPath, data, err => {
        if (err)
            throw err;

        if (typeof callback === 'function')
            callback(data);
    })

}

// ---------------------------------------------------------------
// Duplication
// ---------------------------------------------------------------

File.prototype.duplicate = function (name, callback) {

    if (typeof name != 'string')
        throw new Error("File.duplicate expects name as a string, got : " + name);

    fs.copyFile(this.fullPath, name, err => {
        if (err)
            throw err;

        if (typeof callback === 'function')
            callback();
    });
}

// Export
module.exports = File;
