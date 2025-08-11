const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const DATA_FILE = path.join(__dirname, 'data.json');

// Load sign-in data from file or initialize empty array
let signIns = [];
if (fs.existsSync(DATA_FILE)) {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    signIns = JSON.parse(data);
  } catch (err) {
    console.error('Error reading data file:', err);
  }
}

// Save sign-in data to file
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(signIns, null, 2));
}

// USSD response helper
function ussdResponse(message, end = false) {
  return (end ? 'END ' : 'CON ') + message;
}

// USSD session handler
app.post('/ussd', (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  // text contains user input separated by '*', e.g. "" (new session), or "John", or "1*John"
  const textValue = text.trim();

  if (textValue === '') {
    // Initial menu
    const response = ussdResponse('Welcome to Employee Sign-In.\nPlease enter your name:');
    res.send(response);
  } else {
    // User input received
    const inputs = textValue.split('*');

    if (inputs.length === 1) {
      // User entered name, confirm sign-in
      const name = inputs[0].trim();
      if (!name) {
        const response = ussdResponse('Invalid input. Please enter your name:');
        res.send(response);
        return;
      }
      // Save sign-in
      const timestamp = new Date().toISOString();
      signIns.push({ id: signIns.length + 1, name, phoneNumber, timestamp });
      saveData();

      const response = ussdResponse(`Thank you, ${name}. Your sign-in is recorded at ${new Date(timestamp).toLocaleString()}.`, true);
      res.send(response);
    } else {
      // For now, no multi-level menu implemented
      const response = ussdResponse('Invalid input. Please enter your name:');
      res.send(response);
    }
  }
});

app.listen(PORT, () => {
  console.log(`USSD backend service running on port ${PORT}`);
});
