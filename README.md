# Fitbit Steps Tracker

A simple web application that displays your daily Fitbit step count.

## Setup Instructions

1. First, you'll need to create a Fitbit Developer account and register your application:
   - Go to https://dev.fitbit.com/
   - Create an account or log in
   - Go to "Manage Apps" and click "Register an App"
   - Fill in the application details:
     - Application Name: "Steps Tracker" (or any name you prefer)
     - OAuth 2.0 Application Type: "Web Application"
     - Callback URL: "http://localhost:8000" (or your preferred local development URL)
     - Default Access Type: "Read-Only"

2. After registering your app, you'll receive a Client ID. Replace `YOUR_CLIENT_ID` in the `app.js` file with your actual Client ID.

3. To run the application locally, you can use Python's built-in HTTP server:
   ```bash
   python -m http.server 8000
   ```
   Or any other local development server of your choice.

4. Open your browser and navigate to `http://localhost:8000`

5. Click the "Connect with Fitbit" button to authorize the application

## Features

- Displays today's step count
- Mobile-friendly design
- Simple and clean interface
- Automatic token management

## Security Notes

- This is a basic implementation for demonstration purposes
- In a production environment, you should:
  - Implement proper token refresh logic
  - Add error handling for expired tokens
  - Use environment variables for sensitive data
  - Implement proper CORS policies
  - Use HTTPS in production

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Fitbit Web API 