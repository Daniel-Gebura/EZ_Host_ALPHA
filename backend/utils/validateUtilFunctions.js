const fs = require('fs');
const path = require('path');

/**
 * Checks if a file exists in the given directory.
 * @param {string} dir - The directory path.
 * @param {string} filename - The name of the file to check for.
 * @returns {Promise<boolean>} - True if the file exists, false otherwise.
 */
const fileExists = (dir, filename) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(dir, filename);
        fs.access(filePath, fs.constants.F_OK, (err) => {
            resolve(!err);
        });
    });
};

module.exports = {
    fileExists,
};
