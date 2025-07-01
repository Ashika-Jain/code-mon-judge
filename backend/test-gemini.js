const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GOOGLE_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

async function test() {
  try {
    const response = await axios.post(url, {
      contents: [
        {
          parts: [
            { text: "Explain how AI works in a few words" }
          ]
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Gemini API response:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Gemini API error:', error.response.data);
    } else {
      console.error('Request error:', error.message);
    }
  }
}

test(); 