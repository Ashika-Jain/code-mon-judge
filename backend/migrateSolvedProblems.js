const mongoose = require('mongoose');
const User = require('./models/User');
const Problem = require('./models/Problem'); // Adjust path as needed

// Connect to your MongoDB
mongoose.connect('mongodb://localhost:27017/your-db-name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function migrate() {
  const users = await User.find({});
  for (const user of users) {
    // If already migrated, skip
    if (Array.isArray(user.solvedProblems) && user.solvedProblems.length && user.solvedProblems[0].id) continue;

    // If old format is a Map
    if (user.solvedProblems && typeof user.solvedProblems === 'object' && !(user.solvedProblems instanceof Array)) {
      const newSolved = [];
      for (const [probId, value] of Object.entries(user.solvedProblems)) {
        // Fetch problem details
        const prob = await Problem.findById(probId);
        if (!prob) continue;
        newSolved.push({
          id: probId,
          difficulty: prob.difficulty || "unknown",
          tags: prob.tags ? prob.tags.split(',').map(t => t.trim()) : []
        });
      }
      user.solvedProblems = newSolved;
      await user.save();
      console.log(`Migrated user ${user.username}`);
    }
  }
  console.log('Migration complete!');
  mongoose.disconnect();
}

migrate().catch(err => {
  console.error(err);
  mongoose.disconnect();
});