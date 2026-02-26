const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const stateFile = path.join(__dirname, 'gravity_state.json');

function getState() {
    try {
        if (fs.existsSync(stateFile)) {
            const data = fs.readFileSync(stateFile, 'utf8');
            const parsed = JSON.parse(data);
            if (typeof parsed.gravity === 'number') {
                return parsed.gravity;
            }
        }
    } catch (error) {
        logger.log(`Error reading state: ${error.message}`);
    }
    return 9.81;
}

function setState(value) {
    try {
        fs.writeFileSync(stateFile, JSON.stringify({ gravity: value }), 'utf8');
        logger.log(`Gravity updated to ${value}`);
        return true;
    } catch (error) {
        logger.log(`Error writing state: ${error.message}`);
        return false;
    }
}

module.exports = {
    getState,
    setState
};
