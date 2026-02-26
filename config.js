require('dotenv').config();

const requiredEnvVars = [
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_OWNER_ID',
    'DEEPSEEK_API_KEY',
    'DEEPSEEK_BASE_URL',
    'DEEPSEEK_MODEL',
    'AGENT_SECRET'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Error: Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

module.exports = {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    ownerId: Number(process.env.TELEGRAM_OWNER_ID),
    port: process.env.PORT || 3000,
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    deepseekBaseUrl: process.env.DEEPSEEK_BASE_URL,
    deepseekModel: process.env.DEEPSEEK_MODEL,
    agentSecret: process.env.AGENT_SECRET
};
