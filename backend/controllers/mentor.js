const axios = require('axios');

async function getGeminiAIResponse(prompt) {
  // Use the same API URL and key logic as your AI review section
  const url = process.env.GOOGLE_GEMINI_API_URL;
  // If you need to pass an API key, add it here (e.g., as a query param or header)
  // Example for query param:
  // const urlWithKey = `${url}?key=${process.env.GOOGLE_API_KEY}`;
  // Example for header:
  // const headers = { 'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}` };
  const response = await axios.post(url, { prompt });
  return response.data.suggestions || response.data.review || response.data.result || JSON.stringify(response.data);
}

exports.mentorSuggestions = async (req, res) => {
  const { solvedProblems } = req.body;
  const inputText = `A user has solved the following problems: ${JSON.stringify(solvedProblems)}. Based on their progress, suggest 5 new coding problems (by title or topic) they should try next. For each suggestion, explain why it is a good fit for their learning path. Focus on helping them improve their weak areas or build on their strengths.`;
  try {
    const suggestions = await getGeminiAIResponse(inputText);
    res.status(200).json({ suggestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "AI suggestion failed" });
  }
}; 