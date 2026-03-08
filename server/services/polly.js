const { PollyClient, SynthesizeSpeechCommand } = require("@aws-sdk/client-polly");

// Initialize Polly client
const client = new PollyClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
});

/**
 * Convert text to speech using AWS Polly
 * @param {string} text - Text to convert
 * @param {string} languageCode - Language code (hi-IN, ta-IN, etc.)
 * @returns {Promise<string>} - Base64 encoded audio
 */
async function textToSpeech(text, languageCode = 'en-US') {
  try {
    // Voice ID mapping for Indian languages
    const voiceMap = {
      'hi-IN': 'Aditi',      // Hindi (Female)
      'ta-IN': 'Aditi',      // Tamil (use Hindi voice)
      'te-IN': 'Aditi',      // Telugu (use Hindi voice)
      'kn-IN': 'Aditi',      // Kannada (use Hindi voice)
      'bn-IN': 'Aditi',      // Bengali (use Hindi voice)
      'mr-IN': 'Aditi',      // Marathi (use Hindi voice)
      'ml-IN': 'Aditi',      // Malayalam (use Hindi voice)
      'en-US': 'Joanna',     // English (Female)
      'en-IN': 'Aditi'       // Indian English
    };

    const voiceId = voiceMap[languageCode] || 'Joanna';

    const command = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: 'mp3',
      VoiceId: voiceId,
      Engine: 'neural',
      LanguageCode: languageCode.startsWith('hi') ? 'hi-IN' : 'en-US'
    });

    const response = await client.send(command);
    
    // Convert stream to buffer
    const audioBuffer = await streamToBuffer(response.AudioStream);
    
    // Convert to base64
    return audioBuffer.toString('base64');
  } catch (error) {
    console.error('Polly error:', error);
    throw error;
  }
}

/**
 * Convert stream to buffer
 * @param {ReadableStream} stream
 * @returns {Promise<Buffer>}
 */
async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Check if AWS Polly is configured
 * @returns {boolean}
 */
function isPollyConfigured() {
  return !!(process.env.AWS_REGION && (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE));
}

module.exports = { 
  textToSpeech,
  isPollyConfigured
};
