const express = require('express');
const bodyParser = require('body-parser');

const PORT = 8080;

const app = express();

app.use(express.static('work'));

app.listen(PORT, () => {
  console.log("PWA Tutorial App listening on port", PORT);
});