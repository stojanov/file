const fs = require('fs');
const path = require('path');

/**
 * Utility Functions
 */

// A simple function for getting the name and extenstion for a given string.
const getFileEx = fileName => {
    const fileEx = fileName.match(/\.[0-9a-z]+$/i)[0];
    return {
        name: fileName.replace(fileEx, ''),
        ex: fileEx.replace('.', '')
    }
}

// Wrapper for returning promises
const resolveFunction = (res, rej) => (err, data) => !!err ? rej(err) : res(data);

const newPromise = fn => new Promise((resolve, reject) => {
    fn(resolveFunction(resolve, reject));
});

/**
 * Main file function
 */

function File(filepath, filename) {

    if (!filepath)
        throw new Error("A file path is required.");
    if (!filename)
        throw new Error("A file name is required.");
    
    const fullpath = path.join(filepath, filename);

    fs.exists(fullpath, exists => {
        this.exists = exists;
    });

    let prop = {
        name : filename,
        ex : ''
    };
    
    if (filename.indexOf('.') != -1)
        prop = getFileEx(filename);

    this.filePath = filepath;
    this.fileName = filename;
    this.fullPath = fullpath;
    this.extension = prop.ex;
    this.name = prop.name;
}

// ---------------------------------------------------------------
// Stats
// ---------------------------------------------------------------

File.prototype.getStatsSync = function () {

    if (!this.exists) throw new Error("File doesn't exist. ");

    return fs.statSync(this.fullPath);
}

File.prototype.getStats = function () {

    if (!this.exists) throw new Error("File doesn't exist. ");

    return newPromise(resolver => {
        fs.stats(this.fullPath, resolver);
    });
}

// ---------------------------------------------------------------
// Renaming of a file
// ---------------------------------------------------------------

File.prototype.rename = function (newName) {

    const {
        exists,
        fullPath,
        filePath
    } = this;

    if (!exists) throw new Error("File doesn't exist. ");

    if (typeof newName != 'string')
        throw new Error("File.rename expects a string got :" + newName);

    const oldpath = fullPath;
    const newpath = filePath + '/' + newName;

    return newPromise(resolver => {
        fs.rename(oldpath, newpath, resolver);
    });
}


// ---------------------------------------------------------------
// File deletion
// ---------------------------------------------------------------

File.prototype.delete = function () {

    const {
        fullPath,
        exists
    } = this;

    if (!exists) throw new Error("File doesn't exist. ");

    return newPromise(resolver => {
        fs.unlink(fullPath, resolver);
    });
}

// ---------------------------------------------------------------
// Reading a file
// ---------------------------------------------------------------

File.prototype.read = function (encoding = 'utf8') {

    if (!this.exists) throw new Error("File doesn't exist. ");

    return newPromise(resolver => {
        fs.readFile(this.fullPath, ecnoding, resolver);
    });
}

File.prototype.readSync = function (encoding = 'utf8') {

    if (!this.exists) throw new Error("File doesn't exist. ");

    return fs.readFileSync(this.fullPath, encoding);
}

File.prototype.getLines = function () {
    return newPromise(resolver => {
        const ReadStream = this.getReadStream();

        if(!ReadStream) 
            throw new Error("Cannot get readstream from file:", this.fullPath);

        let currentBuffer = '';
        let lines = [];

        ReadStream.on('data', data => {
            try {
                currentBuffer += data;
                
                let indexOfNewLine = currentBuffer.indexOf('\n');
    
                while(indexOfNewLine != -1) {
                    const line = currentBuffer.substring(0, indexOfNewLine);
                    currentBuffer = currentBuffer.substring(indexOfNewLine + 1);
                    indexOfNewLine = currentBuffer.indexOf('\n');
                    lines.push(line);
                }
            } catch (err) {
                resolver(err, lines)
            }
        });

        ReadStream.on('end', () => {
            if(currentBuffer.length > 0)
                lines.push(currentBuffer);
            resolver(false, lines);
        });
    })
}

File.prototype.getReadStream = function () {
    return fs.createReadStream(this.fullPath);
}

// ---------------------------------------------------------------
// Write to a file
// ---------------------------------------------------------------

File.prototype.write = function (data) {

    if (typeof data != 'string')
        throw new Error("File.write expects data as a string, got : " + data);

    return newPromise(resolver => {
        fs.writeFile(this.fullPath, data, (err) => {
            this.exists = true;
            resolver(err, data);
        });
    });
}

File.prototype.getWriteStream = function () {
    return fs.createWriteStream(this.fullPath);
}

// ---------------------------------------------------------------
// Append to a file
// ---------------------------------------------------------------

File.prototype.append = function (data) {

    if (typeof data != 'string')
        throw new Error("File.appned expects data as a string, got : " + data);

    const { fullPath } = this;
        
    return newPromise(resolver => {
        fs.appendFile(fullPath, data, resolver)
    });
}

File.prototype.appendNewLine = function (data) {
    this.append('\n' + data);
}

// ---------------------------------------------------------------
// Duplication
// ---------------------------------------------------------------

File.prototype.duplicate = function (name) {

    if (typeof name != 'string')
        throw new Error("File.duplicate expects name as a string, got : " + name);

    return newPromise(resolver => {
        fs.copyFile(this.fullPath, name, resolver)
    });
}

// Export
module.exports = File;