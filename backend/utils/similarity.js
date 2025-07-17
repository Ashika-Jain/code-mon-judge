const axios = require('axios');

async function checkCodeSimilarity(newCode, previousCodes) {
  try {
    const response = await axios.post('https://Ashika05-plag.hf.space/check_similarity', {
      code: newCode,
      previous_codes: previousCodes
    });
    return response.data;
  } catch (err) {
    console.error('Similarity API error:', err.message);
    return null;
  }
}

module.exports = checkCodeSimilarity; 