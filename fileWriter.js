const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const WORKSPACE_DIR = path.join(__dirname, 'workspace');

if (!fs.existsSync(WORKSPACE_DIR)) {
    fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
}

function writeFiles(files) {
    const writtenPaths = [];

    for (const file of files) {
        if (!file.path || typeof file.path !== 'string') {
            throw new Error(`Invalid file path: ${JSON.stringify(file)}`);
        }
        if (typeof file.content !== 'string') {
            throw new Error(`Invalid content for file: ${file.path}`);
        }
        if (file.path.includes('..')) {
            throw new Error(`Path traversal detected: ${file.path}`);
        }

        const normalizedPath = path.normalize(file.path);
        const absolutePath = path.resolve(WORKSPACE_DIR, normalizedPath);

        if (!absolutePath.startsWith(WORKSPACE_DIR)) {
            throw new Error(`Path escapes workspace: ${file.path}`);
        }

        const dirPath = path.dirname(absolutePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        fs.writeFileSync(absolutePath, file.content, 'utf8');
        logger.log(`Wrote file: ${normalizedPath}`);
        writtenPaths.push(normalizedPath);
    }

    return writtenPaths;
}

module.exports = { writeFiles };
