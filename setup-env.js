const fs = require('fs');
const path = require('path');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '.env');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('.env file already exists. Please remove it first if you want to create a new one.');
  process.exit(0);
}

console.log('Setting up Supabase environment variables...');
console.log('(You can find these values in your Supabase project settings under Project Settings > API)');

readline.question('Enter your Supabase URL (REACT_APP_SUPABASE_URL): ', (url) => {
  readline.question('Enter your Supabase Anon Key (REACT_APP_SUPABASE_ANON_KEY): ', (key) => {
    const envContent = `# Supabase Configuration
REACT_APP_SUPABASE_URL=${url.trim()}
REACT_APP_SUPABASE_ANON_KEY=${key.trim()}

# Twilio (for future use)
REACT_APP_TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
REACT_APP_TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
REACT_APP_TWILIO_PHONE_NUMBER=your_twilio_phone_number_here`;

    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env file created successfully!');
    console.log('📁 File location:', envPath);
    console.log('\n⚠️  Make sure to add .env to your .gitignore if it\'s not already there!');
    console.log('🚀 Restart your development server for the changes to take effect.');
    
    readline.close();
  });
});
