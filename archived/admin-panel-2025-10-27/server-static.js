const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;

// Archived server-static (originally served frontend)
app.use('/', express.static(path.join(__dirname, 'frontend')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(PORT, () => console.log(`Archived admin static server listening on http://localhost:${PORT}`));
