const { TranslateClient, TranslateTextCommand } = require("@aws-sdk/client-translate");

// Initialize Translate client
const client = new TranslateClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
});

/**
 * Translate text from one language to another
 * @param {string} text - Text to translate
 * @param {string} sourceLanguage - Source language code (en, hi, ta, etc.)
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<string>} - Translated text
 */
async function translateText(text, sourceLanguage, targetLanguage) {
  try {
    const command = new TranslateTextCommand({
      Text: text,
      SourceLanguageCode: sourceLanguage,
      TargetLanguageCode: targetLanguage
    });

    const response = await client.send(command);
    return response.TranslatedText;
  } catch (error) {
    console.error('Translate error:', error);
    throw error;
  }
}

/**
 * Translate code comments
 * @param {string} code - Code with comments
 * @param {string} targetLanguage - Target language for comments
 * @returns {Promise<string>} - Code with translated comments
 */
async function translateCodeComments(code, targetLanguage) {
  try {
    // Extract comments (simple regex for # and //)
    const commentRegex = /(#|\/\/)(.+)$/gm;
    const matches = [...code.matchAll(commentRegex)];
    
    if (matches.length === 0) {
      return code;
    }

    let translatedCode = code;
    
    // Translate each comment
    for (const match of matches) {
      const originalComment = match[2].trim();
      const translatedComment = await translateText(originalComment, 'en', targetLanguage);
      translatedCode = translatedCode.replace(match[0], `${match[1]} ${translatedComment}`);
    }
    
    return translatedCode;
  } catch (error) {
    console.error('Code comment translation error:', error);
    return code; // Return original if translation fails
  }
}

/**
 * Detect language of text
 * @param {string} text - Text to analyze
 * @returns {Promise<string>} - Detected language code
 */
async function detectLanguage(text) {
  try {
    // Use 'auto' as source to detect language
    const command = new TranslateTextCommand({
      Text: text,
      SourceLanguageCode: 'auto',
      TargetLanguageCode: 'en'
    });

    const response = await client.send(command);
    return response.SourceLanguageCode;
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // Default to English
  }
}

/**
 * Check if AWS Translate is configured
 * @returns {boolean}
 */
function isTranslateConfigured() {
  return !!(process.env.AWS_REGION && (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE));
}

module.exports = { 
  translateText,
  translateCodeComments,
  detectLanguage,
  isTranslateConfigured
};
