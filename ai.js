const config = require('./config');
const logger = require('./logger');

async function promptAI(text) {
    if (text.length > 1000) {
        return "Error: Prompt cannot exceed 1000 characters.";
    }

    logger.log(`AI Prompt sent: ${text}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch(`${config.deepseekBaseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.deepseekApiKey}`
            },
            body: JSON.stringify({
                model: config.deepseekModel,
                messages: [
                    { role: "system", content: "You are an artificial intelligence assistant." },
                    { role: "user", content: text }
                ]
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorBody = '';
            try {
                errorBody = await response.text();
            } catch (e) { }

            logger.log(`AI API Error: HTTP ${response.status} - ${errorBody}`);

            if (response.status >= 400 && response.status < 500) {
                return `API Error: Client error occurred (HTTP ${response.status}).`;
            } else if (response.status >= 500) {
                return `API Error: Server error occurred on the AI service (HTTP ${response.status}).`;
            } else {
                return `API Error: Unexpected HTTP status ${response.status}.`;
            }
        }

        let data;
        try {
            data = await response.json();
        } catch (err) {
            logger.log(`AI API Error: Invalid JSON response format`);
            return "API Error: Received invalid response format from AI service.";
        }

        if (data && data.choices && data.choices.length > 0 && data.choices[0].message) {
            const reply = data.choices[0].message.content;
            logger.log(`AI Response generated.`);
            return reply;
        } else {
            logger.log(`AI API Error: Malformed response structure ${JSON.stringify(data)}`);
            return "API Error: Malformed response structure.";
        }
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            logger.log(`AI API Error: Request timed out (15s limit)`);
            return "Error: Request to AI service timed out after 15 seconds.";
        }
        logger.log(`AI API Error: ${error.message}`);
        return `Error: Failed to communicate with AI service.`;
    }
}

module.exports = {
    promptAI
};
