const logs = [];
const MAX_LOGS = 10;

function log(message) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${message}`;
    console.log(formattedMessage);

    logs.push(formattedMessage);
    if (logs.length > MAX_LOGS) {
        logs.shift();
    }
}

function getLogs() {
    return logs;
}

module.exports = {
    log,
    getLogs
};
