# Activities Management App (AMA)

A compassionate event manager app designed to encourage users to explore and adapt activities, evolving their planning habits.

## Features

- **User Authentication**: Secure sign-up and login
- **Activities Management**: Create, read, update, and delete activities
- **Calendar View**: Visualize scheduled activities
- **Reminders**: Set up reminders for activities
- **Notes**: Keep general notes unrelated to specific activities
- **Mobile-First Design**: Optimized for iPhone and other mobile devices

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router
- **UI Components**: Headless UI, Hero Icons
- **Date/Time**: date-fns, react-datepicker
- **Calendar**: react-big-calendar
- **Backend**: Supabase (Authentication + Database)
- **Notifications**: Twilio (for SMS reminders)

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Supabase account
- Twilio account (for SMS reminders)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd activities-management-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase and Twilio credentials
   ```bash
   cp .env.example .env
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── components/         # Reusable UI components
│   └── activities/     # Activity-related components
├── context/            # React context providers
├── pages/              # Page components
├── services/           # API and service integrations
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Available Scripts

- `npm start` - Start the development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App (not recommended)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Supabase
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Twilio (for SMS reminders)
REACT_APP_TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
REACT_APP_TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
REACT_APP_TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

## Deployment

### Building for Production

```bash
npm run build
# or
yarn build
```

This will create a `build` directory with the production build of your app.

### Deploying to Netlify

1. Push your code to a Git repository
2. Connect the repository to Netlify
3. Set up the build command: `npm run build`
4. Set the publish directory: `build`
5. Add the environment variables from your `.env` file to Netlify

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Create React App](https://create-react-app.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Twilio](https://www.twilio.com/)
- [React Icons](https://react-icons.github.io/react-icons/)
