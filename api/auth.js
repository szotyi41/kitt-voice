const bcrypt = require('bcrypt');

// Hash the password securely (this should be done once and stored)
const HASHED_PASSWORD = '$2b$10$YourHashedPasswordHereAfterRunningBcrypt';
const CORRECT_PASSWORD = 'fV5KTuPVw@aF6wa!Td+k';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  try {
    // For now, using direct comparison - in production, use bcrypt
    const isValid = password === CORRECT_PASSWORD;
    
    if (isValid) {
      // Generate a simple session token (in production, use JWT or proper session management)
      const sessionToken = Buffer.from(`valid-session-${Date.now()}`).toString('base64');
      
      return res.status(200).json({ 
        success: true, 
        token: sessionToken,
        message: 'Authentication successful' 
      });
    } else {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid password' 
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}