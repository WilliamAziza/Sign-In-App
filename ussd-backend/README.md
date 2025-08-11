# USSD Backend Service for Employee Sign-In

This is a simple Node.js Express backend service that implements a USSD application for employee sign-in.

## Features

- Prompts users to enter their name via USSD.
- Records sign-in with timestamp and phone number.
- Stores sign-in data in a JSON file (`data.json`).
- Responds with appropriate USSD messages.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

The server will run on port 3000 by default.

## USSD Gateway Integration

Configure your USSD gateway (e.g., Africa's Talking, Twilio, or others) to send USSD requests to:

```
POST http://your-server-address:3000/ussd
```

The request body should include:

- `sessionId`: Unique session identifier.
- `serviceCode`: The USSD code dialed.
- `phoneNumber`: The user's phone number.
- `text`: The user input text, with inputs separated by `*`.

The backend responds with USSD response messages starting with `CON` (continue) or `END` (end session).

## Example USSD Flow

1. User dials the USSD code.
2. Backend responds: "Welcome to Employee Sign-In. Please enter your name:"
3. User enters their name.
4. Backend responds: "Thank you, [name]. Your sign-in is recorded at [timestamp]." and ends the session.

## Notes

- This is a basic implementation for demonstration.
- For production, consider using a database for persistent storage.
- Add authentication and error handling as needed.
- Customize USSD menus and flows as per your requirements.

## License

MIT
