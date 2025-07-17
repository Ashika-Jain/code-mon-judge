const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GOOGLE_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const aiCodeReview = async (code) => {
    try {
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
        return response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No review generated.';
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.error?.message || 'Gemini API error');
        } else {
            throw new Error(error.message);
        }
    }
};

const aiHint = async (problem) => {
    try {
        const response = await axios.post(url, {
            contents: [
                {
                    parts: [
                        { text: `Give a helpful hint for the following coding problem, but do not reveal the full solution.\n\n${problem}` }
                    ]
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No hint generated.';
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.error?.message || 'Gemini API error');
        } else {
            throw new Error(error.message);
        }
    }
};

const aiBoilerplate = async (problem, language) => {
    try {
        const response = await axios.post(url, {
            contents: [
                {
                    parts: [
                        { text: `For the following problem, provide ONLY:
- The function signature (no implementation)
- The input/output format as comments
- A main function stub that calls the function, but DO NOT process input/output or solve the problem.
- Insert a TODO comment where the logic should go.

DO NOT include any problem-solving logic, implementation, or hints.
DO NOT solve the problem or process the input/output.

Example (for a sum of two numbers in Python):
# Input: two integers a and b
# Output: their sum

def add(a, b):
    # TODO: implement logic
    pass

def main():
    # TODO: read input and call add()
    pass

Now, for this problem in ${language}:
${problem}
` }
                    ]
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No boilerplate generated.';
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
    aiHint,
    aiBoilerplate
};
