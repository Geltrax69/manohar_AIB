/**
 * Google Gemini AI Service
 * Free alternative to AWS Bedrock for AI chat responses
 * Get your free API key at: https://aistudio.google.com/app/apikey
 */

const { GoogleGenerativeAI } = require('@google/generative-ai')

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

let genAI = null

if (GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
}

const isGeminiConfigured = () => !!GEMINI_API_KEY && !!genAI

/**
 * Generate AI response in the user's chosen language
 */
const generateGeminiResponse = async (message, language = 'en', fileContext = '') => {
    if (!isGeminiConfigured()) {
        throw new Error('Gemini API not configured')
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const languageInstructions = {
        'hi': 'आप एक expert coding tutor हैं। सभी explanations हिंदी में दें। Code comments भी हिंदी में लिखें। Simple और clear भाषा use करें जो beginner समझ सके।',
        'ta': 'நீங்கள் ஒரு expert coding tutor. அனைத்து விளக்கங்களையும் தமிழில் கொடுங்கள். Code comments ஐயும் தமிழில் எழுதுங்கள். Beginners புரிந்துகொள்ளும் வகையில் எளிமையான மொழியில் பேசுங்கள்.',
        'te': 'మీరు ఒక expert coding tutor. అన్ని వివరణలు తెలుగులో ఇవ్వండి. Code comments కూడా తెలుగులో రాయండి. Beginners అర్థం చేసుకోగలిగే విధంగా సరళమైన భాషలో మాట్లాడండి.',
        'kn': 'ನೀವು ಒಬ್ಬ expert coding tutor. ಎಲ್ಲಾ ವಿವರಣೆಗಳನ್ನು ಕನ್ನಡದಲ್ಲಿ ನೀಡಿ. Code comments ಕೂಡ ಕನ್ನಡದಲ್ಲಿ ಬರೆಯಿರಿ.',
        'bn': 'আপনি একজন expert coding tutor। সকল ব্যাখ্যা বাংলায় দিন। Code comments ও বাংলায় লিখুন।',
        'mr': 'तुम्ही एक expert coding tutor आहात. सर्व स्पष्टीकरणे मराठीत द्या. Code comments पण मराठीत लिहा.',
        'ml': 'നിങ്ങൾ ഒരു expert coding tutor ആണ്. എല്ലാ വിശദീകരണങ്ങളും മലയാളത്തിൽ നൽകുക.',
        'en': 'You are an expert coding tutor. Give clear, beginner-friendly explanations with practical examples.'
    }

    const systemPrompt = languageInstructions[language] || languageInstructions['en']

    const fullPrompt = `${systemPrompt}

Student's question: ${message}
${fileContext ? `\nContext from uploaded files:\n${fileContext}` : ''}

Respond with:
1. A clear explanation
2. A code example if relevant (wrap in \`\`\`python or \`\`\`javascript)
3. A helpful follow-up tip

Keep the response concise and encouraging.`

    const result = await model.generateContent(fullPrompt)
    const responseText = result.response.text()

    // Parse code blocks out of the response
    const codeMatch = responseText.match(/```(?:python|javascript|js|py)?\n([\s\S]*?)```/)
    const code = codeMatch ? codeMatch[1].trim() : null

    // Get text without code blocks
    const textOnly = responseText.replace(/```[\s\S]*?```/g, '').trim()

    // Split at follow-up tip markers
    const parts = textOnly.split(/\n(?:tip:|follow-up:|note:|pro tip:)/i)
    const mainText = parts[0].trim()
    const followUp = parts[1] ? parts[1].trim() : null

    return {
        text: mainText,
        code,
        followUp,
        language,
        powered_by: 'Gemini AI'
    }
}

module.exports = {
    generateGeminiResponse,
    isGeminiConfigured
}
