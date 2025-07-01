const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GOOGLE_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const aiCodeReview = async (code) => {
    try {
        console.log('Gemini URL:', url);
        console.log('GOOGLE_API_KEY:', API_KEY);
        const response = await axios.post(url, {
            contents: [
                {
                    parts: [
                        { text: `Analyze the following code and provide a short and concise review of the code. Also, provide a list of potential improvements and suggestions for the code.\n\n${code}` }
                    ]
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        // Extract the review text from the response
        return response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No review generated.';
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.error?.message || 'Gemini API error');
        } else {
            throw new Error(error.message);
        }
    }
};

module.exports = {
    aiCodeReview,
};
