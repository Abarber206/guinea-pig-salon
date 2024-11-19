const express = require('express');
const path = require('path');
const app = express();
const port = 4000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route for the main game page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'guinea-pig-salon.html'));
});

app.listen(port, () => {
    console.log(`Guinea Pig Salon game running at http://localhost:${port}`);
});
