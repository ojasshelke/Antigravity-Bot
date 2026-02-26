const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const crypto = require('crypto');

const jobsFile = path.join(__dirname, 'jobs.json');

if (!fs.existsSync(jobsFile)) {
    fs.writeFileSync(jobsFile, JSON.stringify({}), 'utf8');
}

function loadJobs() {
    try {
        const data = fs.readFileSync(jobsFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        logger.log(`Error reading jobs file: ${error.message}`);
        return {};
    }
}

function saveJobs(jobs) {
    try {
        fs.writeFileSync(jobsFile, JSON.stringify(jobs, null, 2), 'utf8');
    } catch (error) {
        logger.log(`Error writing jobs file: ${error.message}`);
    }
}

function createJob(prompt, chatId) {
    const jobId = crypto.randomUUID().substring(0, 8);
    const jobs = loadJobs();

    jobs[jobId] = {
        id: jobId,
        chatId: chatId,
        prompt: prompt,
        status: 'queued',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    saveJobs(jobs);
    logger.log(`Job ${jobId} created and queued.`);
    return jobId;
}

function getJobsByStatus(status) {
    const jobs = loadJobs();
    return Object.values(jobs).filter(j => j.status === status);
}

function getJobStatus(jobId) {
    const jobs = loadJobs();
    return jobs[jobId] || null;
}

function updateJobStatus(jobId, status, extraFields = {}) {
    const jobs = loadJobs();
    if (!jobs[jobId]) return false;

    jobs[jobId].status = status;
    jobs[jobId].updatedAt = new Date().toISOString();
    Object.assign(jobs[jobId], extraFields);

    saveJobs(jobs);
    logger.log(`Job ${jobId} updated to status: ${status}.`);
    return jobs[jobId];
}

module.exports = {
    createJob,
    getJobsByStatus,
    getJobStatus,
    updateJobStatus
};
