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
     - Callback URL: "https://YOUR_USERNAME.github.io/fitbit-steps-tracker" (replace YOUR_USERNAME with your GitHub username)
     - Default Access Type: "Read-Only"

2. After registering your app, you'll receive a Client ID. You'll need to add this as a GitHub Secret:
   - Go to your GitHub repository
   - Click on "Settings"
   - Click on "Secrets and variables" → "Actions"
   - Click "New repository secret"
   - Name: `FITBIT_CLIENT_ID`
   - Value: Your Fitbit Client ID
   - Click "Add secret"

3. Enable GitHub Pages:
   - Go to your repository's "Settings"
   - Scroll down to "GitHub Pages" section
   - Under "Source", select "gh-pages" branch
   - Click "Save"

4. The application will automatically deploy to GitHub Pages when you push to the main branch.

## Local Development

To run the application locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/fitbit-steps-tracker.git
   cd fitbit-steps-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `config.js` file with your Fitbit Client ID:
   ```javascript
   const config = {
       CLIENT_ID: 'YOUR_CLIENT_ID',
       REDIRECT_URI: 'http://localhost:8000'
   };
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open your browser and navigate to `http://localhost:8000`

## Features

- Displays today's step count
- Mobile-friendly design
- Simple and clean interface
- Automatic token management
- Error handling and user feedback
- Secure client ID storage using GitHub Secrets

## Security Notes

- The Client ID is securely stored as a GitHub Secret
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
- GitHub Pages
- GitHub Actions

## Customizing the App Icon

The app includes a PWA icon generator that allows you to customize the app icon:

1. Open `generate-icons.html` in your browser
2. Enter any emoji you'd like to use as your app icon
3. Click "Generate Icons" to create your PWA icons
4. The icons will automatically download
5. Move the downloaded icons to your project's `icons` directory
6. The new icons will be used when users install the PWA

Note: Some emojis may not render correctly. If this happens, try a different emoji. 