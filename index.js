const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const logger = require('./logger');
const antigravity = require('./antigravity');
const ai = require('./ai');
const jobManager = require('./jobManager');

const app = express();
app.use(express.json()); // middleware needed to parse JSON POST bodies

const bot = new TelegramBot(config.botToken, { polling: true });

function isOwner(msg) {
    return msg.from.id === config.ownerId;
}

bot.on('message', async (msg) => {
    if (!msg.text || !msg.text.startsWith('/')) return;

    if (!isOwner(msg)) {
        logger.log(`Unauthorized access attempt by ID: ${msg.from.id}`);
        return;
    }

    const commandParts = msg.text.trim().split(/\s+/);
    const command = commandParts[0];
    const args = commandParts.slice(1).join(' ');

    switch (command) {
        case '/status':
            if (args) {
                const jobId = args.trim();
                const job = jobManager.getJobStatus(jobId);

                if (!job) {
                    bot.sendMessage(msg.chat.id, `Error: Job ID ${jobId} not found.`);
                } else {
                    let responseText = `Job ID: ${job.id}\nStatus: ${job.status}\nCreated: ${job.createdAt}`;
                    if (job.updatedAt) responseText += `\nUpdated: ${job.updatedAt}`;

                    if (job.status === 'completed') {
                        responseText += `\n\nSummary:\n${job.summary}`;
                        if (job.files) {
                            responseText += `\n\nFiles Produced: ${job.files.length}`;
                        }
                    } else if (job.status === 'failed') {
                        responseText += `\n\nError:\n${job.error}`;
                    }

                    bot.sendMessage(msg.chat.id, responseText);
                }
            } else {
                const currentGravity = antigravity.getState();
                bot.sendMessage(msg.chat.id, `Current system gravity: ${currentGravity}`);
            }
            break;

        case '/set':
            if (!args) {
                bot.sendMessage(msg.chat.id, 'Error: No value provided. Usage: /set <value>');
                return;
            }

            const newValue = Number(args);
            if (Number.isNaN(newValue) || newValue < 0 || newValue > 10) {
                bot.sendMessage(msg.chat.id, 'Error: Gravity must be a number between 0 and 10.');
                logger.log(`Invalid /set attempt with value: ${args}`);
                return;
            }

            const success = antigravity.setState(newValue);
            if (success) {
                bot.sendMessage(msg.chat.id, `Success: Gravity updated to ${newValue}`);
            } else {
                bot.sendMessage(msg.chat.id, 'Error: Failed to update gravity (internal error).');
            }
            break;

        case '/logs':
            const recentLogs = logger.getLogs();
            if (recentLogs.length === 0) {
                bot.sendMessage(msg.chat.id, 'No logs available.');
            } else {
                bot.sendMessage(msg.chat.id, recentLogs.join('\n'));
            }
            logger.log('Logs requested');
            break;

        case '/build':
            if (!args) {
                bot.sendMessage(msg.chat.id, 'Error: No prompt provided. Usage: /build <text>');
                return;
            }

            const jobId = jobManager.createJob(args, msg.chat.id);
            bot.sendMessage(msg.chat.id, `Job queued. ID: ${jobId}`);
            break;

        case '/help':
            const helpText = `Available commands:\n/status - returns system gravity\n/status <jobId> - view specific job\n/set <value> - updates gravity\n/build <text> - request AI build\n/logs - returns last 10 logs\n/help - list commands`;
            bot.sendMessage(msg.chat.id, helpText);
            logger.log('Help requested');
            break;

        default:
            bot.sendMessage(msg.chat.id, 'Unknown command. Use /help');
            logger.log(`Unknown command used: ${command}`);
            break;
    }
});

// -------------- REST API ROUTES -------------- //

// Middleware for agent authentication
const agentAuth = (req, res, next) => {
    const token = req.header('AGENT_SECRET');
    if (!token || token !== config.agentSecret) {
        logger.log('Unauthorized access attempt to /agent API.');
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

app.get('/agent/jobs', agentAuth, (req, res) => {
    const { status } = req.query;
    if (!status) {
        return res.status(400).json({ error: '?status query parameter is required' });
    }

    // Using string matching for equality based on query params (e.g., status=queued)
    const jobs = jobManager.getJobsByStatus(status);
    return res.json({ jobs });
});

app.post('/agent/jobs/:id/start', agentAuth, (req, res) => {
    const jobId = req.params.id;
    const job = jobManager.updateJobStatus(jobId, 'running');

    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
});

app.post('/agent/jobs/:id/complete', agentAuth, (req, res) => {
    const jobId = req.params.id;
    const { summary, files } = req.body;

    const job = jobManager.updateJobStatus(jobId, 'completed', { summary, files });
    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    const fileCount = Array.isArray(files) ? files.length : 0;
    bot.sendMessage(config.ownerId, `✅ Build Completed\n\nJob ID: ${job.id}\nSummary: ${summary}\nFiles created: ${fileCount}`);

    res.json(job);
});

app.post('/agent/jobs/:id/fail', agentAuth, (req, res) => {
    const jobId = req.params.id;
    const { error } = req.body;

    const job = jobManager.updateJobStatus(jobId, 'failed', { error });
    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    bot.sendMessage(config.ownerId, `❌ Build Failed\n\nJob ID: ${job.id}\nError: ${error}`);

    res.json(job);
});

// --------------------------------------------- //

app.listen(config.port, () => {
    logger.log(`Server started on port ${config.port}`);
});
