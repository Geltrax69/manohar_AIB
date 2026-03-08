const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

// Initialize Bedrock client
const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined // Use default credentials if not provided
});

/**
 * Generate AI response using AWS Bedrock
 * @param {string} userMessage - User's message
 * @param {string} language - Language code (hi, ta, te, en, etc.)
 * @param {object} context - Additional context (files, code, etc.)
 * @returns {Promise<object>} - AI response with text, code, and follow-up
 */
async function generateAIResponse(userMessage, language = 'en', context = {}) {
  try {
    // Language-specific system prompts
    const systemPrompts = {
      'hi': 'आप एक expert coding tutor हैं। Hindi में explain करें, code examples दें। Simple language use करें। Code में comments Hindi में लिखें।',
      'ta': 'நீங்கள் ஒரு expert coding tutor. Tamil-ல் விளக்குங்கள், code examples கொடுங்கள். எளிய மொழியைப் பயன்படுத்துங்கள். Code-ல் comments Tamil-ல் எழுதுங்கள்.',
      'te': 'మీరు ఒక expert coding tutor. Telugu లో వివరించండి, code examples ఇవ్వండి. సరళమైన భాషను ఉపయోగించండి. Code లో comments Telugu లో రాయండి.',
      'kn': 'ನೀವು ಒಬ್ಬ expert coding tutor. Kannada ನಲ್ಲಿ ವಿವರಿಸಿ, code examples ಕೊಡಿ. ಸರಳ ಭಾಷೆಯನ್ನು ಬಳಸಿ. Code ನಲ್ಲಿ comments Kannada ನಲ್ಲಿ ಬರೆಯಿರಿ.',
      'bn': 'আপনি একজন expert coding tutor. Bengali তে ব্যাখ্যা করুন, code examples দিন। সহজ ভাষা ব্যবহার করুন। Code এ comments Bengali তে লিখুন।',
      'mr': 'तुम्ही एक expert coding tutor आहात. Marathi मध्ये स्पष्ट करा, code examples द्या. सोपी भाषा वापरा. Code मध्ये comments Marathi मध्ये लिहा.',
      'ml': 'നിങ്ങൾ ഒരു expert coding tutor ആണ്. Malayalam-ൽ വിശദീകരിക്കുക, code examples നൽകുക. ലളിതമായ ഭാഷ ഉപയോഗിക്കുക. Code-ൽ comments Malayalam-ൽ എഴുതുക.',
      'en': 'You are an expert coding tutor. Explain concepts clearly with code examples. Use simple language. Add helpful comments in code.'
    };

    const systemPrompt = systemPrompts[language] || systemPrompts['en'];

    // Add context if provided
    let fullMessage = userMessage;
    if (context.files && context.files.length > 0) {
      fullMessage += '\n\nAttached files:\n' + context.files.join('\n');
    }
    if (context.code) {
      fullMessage += '\n\nCode context:\n```\n' + context.code + '\n```';
    }

    // Prepare the request payload
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: fullMessage
        }
      ],
      temperature: 0.7
    };

    const modelId = process.env.AWS_BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0';

    const command = new InvokeModelCommand({
      modelId: modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload)
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Extract text and code from response
    const fullText = responseBody.content[0].text;
    
    // Parse code blocks if present
    const codeMatch = fullText.match(/```[\w]*\n([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1].trim() : null;
    
    // Remove code blocks from text
    const text = fullText.replace(/```[\w]*\n[\s\S]*?```/g, '').trim();

    // Generate follow-up question based on language
    const followUps = {
      'hi': 'क्या आपको इसमें कोई confusion है? मैं और detail में explain कर सकता हूँ।',
      'ta': 'இதில் ஏதேனும் confusion இருக்கிறதா? நான் மேலும் விரிவாக விளக்க முடியும்.',
      'te': 'దీనిలో ఏదైనా confusion ఉందా? నేను మరింత వివరంగా వివరించగలను.',
      'en': 'Do you have any questions about this? I can explain in more detail.'
    };

    return {
      text,
      code,
      followUp: followUps[language] || followUps['en']
    };
  } catch (error) {
    console.error('Bedrock error:', error);
    
    // Return fallback response if Bedrock fails
    return {
      text: 'I apologize, but I\'m having trouble connecting to the AI service. Please try again in a moment.',
      code: null,
      followUp: null,
      error: true
    };
  }
}

/**
 * Check if AWS Bedrock is configured
 * @returns {boolean}
 */
function isBedrockConfigured() {
  return !!(process.env.AWS_REGION && (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE));
}

module.exports = { 
  generateAIResponse,
  isBedrockConfigured
};
