const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Import execution functions from CC directory
const { executeCpp } = require(path.join(__dirname, './CC/executeCpp'));
const { executePy } = require(path.join(__dirname, './CC/executePy'));

const app = express();
app.use(bodyParser.json());
app.post('/run', async (req, res) => {
  const { code, language, input } = req.body;
  console.log('Received language:', language, typeof language); // <-- Move here
  try {
    let result;
    if (language === 'cpp') {
      result = await executeCpp(code, input);
    } else if (language === 'python') {
      result = await executePy(code, input);
    } else {
      return res.status(400).json({ error: 'Unsupported language' });
    }
    res.json({ output: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Compiler server running on port ${PORT}`)); 