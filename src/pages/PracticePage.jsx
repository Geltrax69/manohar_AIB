import { useState, useEffect } from 'react'
import Split from 'react-split'
import confetti from 'canvas-confetti'
import Layout from '../components/Layout'
import CodeEditor from '../components/CodeEditor'
import CodeExecutor from '../components/CodeExecutor'
import { Save, Zap, Trophy, Target, Flame, Star, Sparkles, Code2, Terminal, BookOpen, ChevronRight, BrainCircuit, Loader2 } from 'lucide-react'
import { useToast } from '../components/Toast'
import { useAuthStore } from '../store/authStore'
import { useLocalAITutor } from '../hooks/useLocalAITutor'

export default function PracticePage() {
  const { user } = useAuthStore()
  const toast = useToast()

  // Local language state to allow dynamic switching within the page
  const [practiceLang, setPracticeLang] = useState(user?.selectedLanguage || 'hi')

  // Get multilingual content based on selected language
  // Get multilingual scenarios based on selected language
  const getScenarios = () => {
    const lang = practiceLang || 'en'

    // Scenario 1: Chai Shop (if/else)
    const chaiShop = {
      'hi': {
        title: 'Interactive Practice: चाय की दुकान ☕',
        subtitle: 'अपनी भाषा में लॉजिक समझें, Python में कोड करें! 🚀',
        scenarioTitle: 'चाय का बिल कैलकुलेटर',
        description: 'आप एक चाय की दुकान चलाते हैं। एक कप चाय की कीमत ₹15 है। अगर कोई ग्राहक 5 कप से ज्यादा चाय खरीदता है, तो उसे 10% का डिस्काउंट (छूट) मिलता है। चलिए इसके लिए एक प्रोग्राम लिखते हैं!',
        pseudoCodeHeading: 'अपनी भाषा में समझें (Pseudo-code):',
        pseudoCode: `कीमत = 15\nकप_की_संख्या = 6\nकुल_बिल = कीमत * कप_की_संख्या\n\nअगर (कप_की_संख्या > 5):\n    डिस्काउंट = कुल_बिल * 0.10\n    कुल_बिल = कुल_बिल - डिस्काउंट\n\nप्रिंट("आपका बिल है: ₹" + कुल_बिल)`,
        mission: 'Mission: Python में इस लॉजिक को लिखें और Run करें।',
        hint: 'Hint: if स्टेटमेंट का इस्तेमाल करें और total_bill को 0.10 से गुणा करके डिस्काउंट निकालें।',
        editorInitial: '# One cup of chai costs ₹15\nprice = 15\ncups = 6\n\n# Write your logic below:\ntotal_bill = price * cups\n\nif cups > 5:\n    # Write discount logic here\n    pass\n\nprint(f"Total bill: ₹{total_bill}")\n',
        nativeInitial: '# एक कप चाय की कीमत ₹15 है\ndaam = 15\ncup_ki_sankhya = 6\n\n# अपना लॉजिक नीचे लिखें:\nkul_bill = daam * cup_ki_sankhya\n\nif cup_ki_sankhya > 5:\n    # डिस्काउंट लॉजिक यहाँ लिखें\n    pass\n\nprint(f"Aapka bill: ₹{kul_bill}")\n',
        executions: 'Executions',
        streak: 'Streak',
        xpEarned: 'XP'
      },
      'ta': {
        title: 'Interactive Practice: தேநீர் கடை ☕',
        subtitle: 'உங்கள் மொழியில் தர்க்கத்தைப் புரிந்துகொள்ளுங்கள், பைத்தானில் குறியீடு! 🚀',
        scenarioTitle: 'தேநீர் பில் கால்குலேட்டர்',
        description: 'நீங்கள் ஒரு தேநீர் கடை நடத்துகிறீர்கள். ஒரு கப் தேநீர் ₹15. வாடிக்கையாளர் 5 கப்களுக்கு மேல் வாங்கினால், 10% தள்ளுபடி கிடைக்கும். இதற்கான ஒரு நிரலை எழுதுவோம்!',
        pseudoCodeHeading: 'உங்கள் மொழியில் புரிந்து கொள்ளுங்கள்:',
        pseudoCode: `விலை = 15\nகப்களின்_எண்ணிக்கை = 6\nமொத்த_பில் = விலை * கப்களின்_எண்ணிக்கை\n\nஎன்றால் (கப்களின்_எண்ணிக்கை > 5):\n    தள்ளுபடி = மொத்த_பில் * 0.10\n    மொத்த_பில் = மொத்த_பில் - தள்ளுபடி\n\nஅச்சிடு("உங்கள் பில்: ₹" + மொத்த_பில்)`,
        mission: 'முயற்சி: பைத்தானில் இந்த தர்க்கத்தை எழுதி இயக்கவும்.',
        hint: 'Hint: if நிபந்தனையைப் பயன்படுத்தி total_bill ஐ 0.10 ஆல் பெருக்கி தள்ளுபடியைக் கணக்கிடுங்கள்.',
        editorInitial: '# One cup of chai costs ₹15\nprice = 15\ncups = 6\n\n# Write your logic below:\ntotal_bill = price * cups\n\nif cups > 5:\n    # Write discount logic here\n    pass\n\nprint(f"Total bill: ₹{total_bill}")\n',
        nativeInitial: '# ஒரு கப் தேநீர் ₹15\nvilai = 15\ncups = 6\n\n# உங்கள் தர்க்கத்தை கீழே எழுதவும்:\nmotha_bill = vilai * cups\n\nif cups > 5:\n    # தள்ளுபடி தர்க்கத்தை இங்கே எழுதவும்\n    pass\n\nprint(f"Ungal bill: ₹{motha_bill}")\n',
        executions: 'Executions',
        streak: 'Streak',
        xpEarned: 'XP'
      },
      'te': {
        title: 'Interactive Practice: టీ షాప్ ☕',
        subtitle: 'మీ భాషలో లాజిక్ అర్థం చేసుకోండి, పైథాన్‌లో కోడ్! 🚀',
        scenarioTitle: 'టీ బిల్లు కాలిక్యులేటర్',
        description: 'మీరు ఒక టీ షాప్ నడుపుతున్నారు. ఒక కప్పు టీ ధర ₹15. ఒక కస్టమర్ 5 కప్పుల కంటే ఎక్కువ కొనుగోలు చేస్తే, వాళ్లకు 10% డిస్కౌంట్ వస్తుంది. దీని కోసం ఒక ప్రోగ్రామ్ రాద్దాం!',
        pseudoCodeHeading: 'మీ భాషలో అర్థం చేసుకోండి:',
        pseudoCode: `ధర = 15\nకప్పుల_సంఖ్య = 6\nమొత్తం_బిల్లు = ధర * కప్పుల_సంఖ్య\n\nఒకవేళ (కప్పుల_సంఖ్య > 5):\n    డిస్కౌంట్ = మొత్తం_బిల్లు * 0.10\n    మొత్తం_బిల్లు = మొత్తం_బిల్లు - డిస్కౌంట్\n\nప్రింట్("మీ బిల్లు: ₹" + మొత్తం_బిల్లు)`,
        mission: 'మిషన్: పైథాన్‌లో ఈ లాజిక్‌ను వ్రాసి రన్ చేయండి.',
        hint: 'Hint: if కండిషన్ వాడి total_bill ను 0.10 తో గుణించి డిస్కౌంట్ లెక్కించండి.',
        editorInitial: '# One cup of chai costs ₹15\nprice = 15\ncups = 6\n\n# Write your logic below:\ntotal_bill = price * cups\n\nif cups > 5:\n    # Write discount logic here\n    pass\n\nprint(f"Total bill: ₹{total_bill}")\n',
        nativeInitial: '# ఒక కప్పు టీ ధర ₹15\ndhara = 15\ncups = 6\n\n# మీ లాజిక్‌ను క్రింద వ్రాయండి:\nmotham_billu = dhara * cups\n\nif cups > 5:\n    # డిస్కౌంట్ లాజిక్‌ను ఇక్కడ వ్రాయండి\n    pass\n\nprint(f"Mee billu: ₹{motham_billu}")\n',
        executions: 'Executions',
        streak: 'Streak',
        xpEarned: 'XP'
      },
      'en': {
        title: 'Interactive Practice: The Chai Shop ☕',
        subtitle: 'Understand logic visually, write code practically! 🚀',
        scenarioTitle: 'Chai Bill Calculator',
        description: 'You run a Chai shop. One cup of chai costs ₹15. If a customer buys more than 5 cups, they get a 10% discount. Let\'s write a program to calculate the total bill!',
        pseudoCodeHeading: 'Understand the Logic (Pseudo-code):',
        pseudoCode: `price = 15\nnumber_of_cups = 6\ntotal_bill = price * number_of_cups\n\nif (number_of_cups > 5):\n    discount = total_bill * 0.10\n    total_bill = total_bill - discount\n\nprint("Your bill is: ₹" + total_bill)`,
        mission: 'Mission: Write this logic in Python and hit Run!',
        hint: 'Hint: Use an if statement and multiply the total_bill by 0.10 to calculate the discount.',
        editorInitial: '# One cup of chai costs ₹15\nprice = 15\ncups = 6\n\n# Write your logic below:\ntotal_bill = price * cups\n\nif cups > 5:\n    # Write discount logic here\n    pass\n\nprint(f"Total bill: ₹{total_bill}")\n',
        nativeInitial: '# One cup of chai costs ₹15\nprice = 15\ncups = 6\n\n# Write your logic below:\ntotal_bill = price * cups\n\nif cups > 5:\n    # Write discount logic here\n    pass\n\nprint(f"Total bill: ₹{total_bill}")\n',
        executions: 'Executions',
        streak: 'Streak',
        xpEarned: 'XP'
      }
    };

    // Scenario 2: Counting loop
    const countingLoop = {
      'hi': {
        title: 'Interactive Practice: लूप्स का जादू 🔢',
        subtitle: 'अपनी भाषा में लूप समझें! 🚀',
        scenarioTitle: '1 से 5 तक गिनती',
        description: 'हमें 1 से 5 तक गिनती गिननी है। बार-बार लिखने के बजाय, हम एक `while` लूप का इस्तेमाल करेंगे। चलिए इसे बनाते हैं!',
        pseudoCodeHeading: 'अपनी भाषा में समझें:',
        pseudoCode: `संख्या = 1\n\nजब_तक (संख्या <= 5):\n    छापो("गिनती " + संख्या)\n    संख्या = संख्या + 1`,
        mission: 'Mission: Python में while लूप लिखें और Run करें।',
        hint: 'Hint: while लूप में number <= 5 की शर्त लगाएं और हर बार number को 1 से बढ़ाएं।',
        editorInitial: '# Print numbers from 1 to 5\nnumber = 1\n\n# Write your loop below:\nwhile number <= 5:\n    # Print the number and increment\n    pass\n',
        nativeInitial: '# 1 se 5 tak ginti chapo\nsankhya = 1\n\n# Apna loop yahan likhen:\nwhile sankhya <= 5:\n    # Sankhya chapo aur badhao\n    pass\n',
        executions: 'Executions',
        streak: 'Streak',
        xpEarned: 'XP'
      },
      'ta': {
        title: 'Interactive Practice: சுழல்கள் (Loops) 🔢',
        subtitle: 'சுழல்களை தமிழில் கற்றுக்கொள்ளுங்கள்! 🚀',
        scenarioTitle: '1 முதல் 5 வரை எண்ணுதல்',
        description: 'நாம் 1 முதல் 5 வரை எண்ண வேண்டும். மீண்டும் மீண்டும் எழுதுவதற்கு பதிலாக, நாம் ஒரு `while` சுழலை பயன்படுத்துவோம்.',
        pseudoCodeHeading: 'உங்கள் மொழியில் புரிந்து கொள்ளுங்கள்:',
        pseudoCode: `எண் = 1\n\nவரை (எண் <= 5):\n    அச்சிடு("எண்ணிக்கை " + எண்)\n    எண் = எண் + 1`,
        mission: 'முயற்சி: பைத்தானில் while சுழலை எழுதி இயக்கவும்.',
        hint: 'Hint: while சுழலில் number <= 5 நிபந்தனையை வைத்து ஒவ்வொரு முறையும் number ஐ 1 ஆல் அதிகரிக்கவும்.',
        editorInitial: '# Print numbers from 1 to 5\nnumber = 1\n\n# Write your loop below:\nwhile number <= 5:\n    # Print the number and increment\n    pass\n',
        nativeInitial: '# 1 muthal 5 varai yennu\nen = 1\n\n# Ungal loop aiyee kizhe ezhuthavum:\nwhile en <= 5:\n    # Ennai achittu, pin kootavum\n    pass\n',
        executions: 'Executions',
        streak: 'Streak',
        xpEarned: 'XP'
      },
      'te': {
        title: 'Interactive Practice: లూప్స్ మ్యాజిక్ 🔢',
        subtitle: 'మీ భాషలో లూప్స్ అర్థం చేసుకోండి! 🚀',
        scenarioTitle: '1 నుండి 5 వరకు లెక్కించడం',
        description: 'మనం 1 నుండి 5 వరకు లెక్కించాలి. మళ్లీ మళ్లీ వ్రాయడానికి బదులుగా, మనం `while` లూప్ ఉపయోగిస్తాము. దీన్ని సృష్టిద్దాం!',
        pseudoCodeHeading: 'మీ భాషలో అర్థం చేసుకోండి:',
        pseudoCode: `సంఖ్య = 1\n\nవరకు (సంఖ్య <= 5):\n    ప్రింట్("లెక్కింపు " + సంఖ్య)\n    సంఖ్య = సంఖ్య + 1`,
        mission: 'మిషన్: పైథాన్‌లో while లూప్ వ్రాసి రన్ చేయండి.',
        hint: 'Hint: while లూప్‌లో number <= 5 కండిషన్ పెట్టి ప్రతిసారీ number ని 1 పెంచండి.',
        editorInitial: '# Print numbers from 1 to 5\nnumber = 1\n\n# Write your loop below:\nwhile number <= 5:\n    # Print the number and increment\n    pass\n',
        nativeInitial: '# 1 nundi 5 varaku lekkincu\nsankhya = 1\n\n# Mee loop ikkada vrayandi:\nwhile sankhya <= 5:\n    # Sankhyanu print chesi penchandi\n    pass\n',
        executions: 'Executions',
        streak: 'Streak',
        xpEarned: 'XP'
      },
      'en': {
        title: 'Interactive Practice: Loop Magic 🔢',
        subtitle: 'Understand loops visually! 🚀',
        scenarioTitle: 'Counting from 1 to 5',
        description: 'We need to count from 1 to 5. Instead of writing print 5 times, we\'ll use a `while` loop to easily do this. Let\'s build it!',
        pseudoCodeHeading: 'Understand the Logic:',
        pseudoCode: `number = 1\n\nwhile (number <= 5):\n    print("Count " + number)\n    number = number + 1`,
        mission: 'Mission: Write a while loop in Python and hit Run!',
        hint: "Hint: Use number <= 5 as your while condition and don't forget to increment number by 1.",
        editorInitial: '# Print numbers from 1 to 5\nnumber = 1\n\n# Write your loop below:\nwhile number <= 5:\n    # Print the number and increment\n    pass\n',
        nativeInitial: '# Print numbers from 1 to 5\nnumber = 1\n\n# Write your loop below:\nwhile number <= 5:\n    # Print the number and increment\n    pass\n',
        executions: 'Executions',
        streak: 'Streak',
        xpEarned: 'XP'
      }
    };

    const allScenarios = {
      'hi': [chaiShop['hi'], countingLoop['hi']],
      'ta': [chaiShop['ta'], countingLoop['ta']],
      'te': [chaiShop['te'], countingLoop['te']],
      'en': [chaiShop['en'], countingLoop['en']]
    };

    return allScenarios[lang] || allScenarios['en']
  }

  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0)
  const [scenarios, setScenarios] = useState(getScenarios())
  const [content, setContent] = useState(scenarios[currentScenarioIndex])
  const [code, setCode] = useState(content.nativeInitial)
  const [language, setLanguage] = useState('python')
  const [showOutput, setShowOutput] = useState(false)
  const [executions, setExecutions] = useState(0)
  const [streak, setStreak] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [vernacularMode, setVernacularMode] = useState(true)
  const [isCompiling, setIsCompiling] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [dynamicHint, setDynamicHint] = useState('')
  const [hintLanguage, setHintLanguage] = useState(practiceLang)

  // Offline WebLLM AI Tutor
  const { isLoaded, loadingProgress, loadingText, isThinking, initLocalModels, getHint } = useLocalAITutor()

  // Update content when language or scenario index changes
  useEffect(() => {
    const newScenarios = getScenarios()
    setScenarios(newScenarios)
    const newContent = newScenarios[currentScenarioIndex]
    setContent(newContent)
    setHintLanguage(practiceLang) // Sync hint language with practice language by default
    setDynamicHint('') // Clear dynamic hint when scenario or language changes

    // Set initial code for the new language/scenario if user hasn't modified it extensively
    setCode(prevCode => {
      // Find the old content to check if code matches its template
      const oldScenarios = getScenarios(); // This isn't perfect for tracking previous lang, but good enough for simple resets
      const isOriginalCode = prevCode.trim() === '' ||
        prevCode === newContent.editorInitial ||
        prevCode === newContent.nativeInitial ||
        prevCode === content.editorInitial ||
        prevCode === content.nativeInitial;

      return isOriginalCode ? (vernacularMode ? newContent.nativeInitial : newContent.editorInitial) : prevCode
    })
  }, [practiceLang, currentScenarioIndex])

  // Simple, reliable vernacular mode toggle - just swaps templates directly OR live transpiles
  const handleVernacularToggle = (isNative) => {
    setVernacularMode(isNative)

    // Check if code perfectly matches an initial template to avoid messy regex edges
    if (code === content.editorInitial || code === content.nativeInitial || code.trim() === '') {
      setCode(isNative ? content.nativeInitial : content.editorInitial)
      return
    }

    let tCode = code
    if (!isNative) {
      // Native -> English
      tCode = tCode.replace(/अगर/g, 'if')
      tCode = tCode.replace(/वरना|अन्यथा/g, 'else')
      tCode = tCode.replace(/छापो|लिखो/g, 'print')
      tCode = tCode.replace(/जब_तक/g, 'while')
      tCode = tCode.replace(/हर/g, 'for')
      tCode = tCode.replace(/फंक्शन/g, 'def')
      tCode = tCode.replace(/सच/g, 'True')
      tCode = tCode.replace(/झूठ/g, 'False')

      tCode = tCode.replace(/என்றால்/g, 'if')
      tCode = tCode.replace(/இல்லையென்றால்/g, 'else')
      tCode = tCode.replace(/அச்சிடு/g, 'print')
      tCode = tCode.replace(/வரை/g, 'while')
      tCode = tCode.replace(/உண்மை/g, 'True')
      tCode = tCode.replace(/தவறு/g, 'False')

      tCode = tCode.replace(/ఒకవేళ/g, 'if')
      tCode = tCode.replace(/లేకపోతే/g, 'else')
      tCode = tCode.replace(/ప్రింట్/g, 'print')
      tCode = tCode.replace(/వరకు/g, 'while')
      tCode = tCode.replace(/నిజం/g, 'True')
      tCode = tCode.replace(/అబద్ధం/g, 'False')
    } else {
      // English -> Native
      if (practiceLang === 'hi') {
        tCode = tCode.replace(/\bif\b/g, 'अगर')
        tCode = tCode.replace(/\belse\b/g, 'वरना')
        tCode = tCode.replace(/\bprint\b/g, 'छापो')
        tCode = tCode.replace(/\bwhile\b/g, 'जब_तक')
        tCode = tCode.replace(/\bfor\b/g, 'हर')
        tCode = tCode.replace(/\bdef\b/g, 'फंक्शन')
        tCode = tCode.replace(/\bTrue\b/g, 'सच')
        tCode = tCode.replace(/\bFalse\b/g, 'झूठ')
      } else if (practiceLang === 'ta') {
        tCode = tCode.replace(/\bif\b/g, 'என்றால்')
        tCode = tCode.replace(/\belse\b/g, 'இல்லையென்றால்')
        tCode = tCode.replace(/\bprint\b/g, 'அச்சிடு')
        tCode = tCode.replace(/\bwhile\b/g, 'வரை')
        tCode = tCode.replace(/\bTrue\b/g, 'உண்மை')
        tCode = tCode.replace(/\bFalse\b/g, 'தவறு')
      } else if (practiceLang === 'te') {
        tCode = tCode.replace(/\bif\b/g, 'ఒకవేళ')
        tCode = tCode.replace(/\belse\b/g, 'లేకపోతే')
        tCode = tCode.replace(/\bprint\b/g, 'ప్రింట్')
        tCode = tCode.replace(/\bwhile\b/g, 'వరకు')
        tCode = tCode.replace(/\bTrue\b/g, 'నిజం')
        tCode = tCode.replace(/\bFalse\b/g, 'అబద్ధం')
      }
    }
    setCode(tCode)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Enter or Cmd+Enter to run
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleRun()
      }
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [code, vernacularMode, isCompiling])

  const [transpiledCode, setTranspiledCode] = useState('')

  const handleRun = async () => {
    let finalCodeToRun = code

    if (vernacularMode) {
      setIsCompiling(true)
      toast.info('Transpiling local language syntax to AST...', { duration: 1500 })
      await new Promise(resolve => setTimeout(resolve, 1500))

      // The Magic Hackathon Vernacular Engine (Regex Transpiler)
      let tCode = code

      // Hindi mapping
      tCode = tCode.replace(/अगर/g, 'if')
      tCode = tCode.replace(/वरना|अन्यथा/g, 'else')
      tCode = tCode.replace(/छापो|लिखो/g, 'print')
      tCode = tCode.replace(/जब_तक/g, 'while')
      tCode = tCode.replace(/हर/g, 'for')
      tCode = tCode.replace(/फंक्शन/g, 'def')
      tCode = tCode.replace(/सच/g, 'True')
      tCode = tCode.replace(/झूठ/g, 'False')

      // Tamil mapping
      tCode = tCode.replace(/என்றால்/g, 'if')
      tCode = tCode.replace(/இல்லையென்றால்/g, 'else')
      tCode = tCode.replace(/அச்சிடு/g, 'print')
      tCode = tCode.replace(/வரை/g, 'while')
      tCode = tCode.replace(/உண்மை/g, 'True')
      tCode = tCode.replace(/தவறு/g, 'False')

      // Telugu mapping
      tCode = tCode.replace(/ఒకవేళ/g, 'if')
      tCode = tCode.replace(/లేకపోతే/g, 'else')
      tCode = tCode.replace(/ప్రింట్/g, 'print')
      tCode = tCode.replace(/వరకు/g, 'while')
      tCode = tCode.replace(/నిజం/g, 'True')
      tCode = tCode.replace(/అబద్ధం/g, 'False')

      finalCodeToRun = tCode
      setIsCompiling(false)
    }

    setTranspiledCode(finalCodeToRun)
    setShowOutput(true)
    setExecutions(prev => prev + 1)

    // Don't give XP yet — wait for CodeExecutor to report success or failure
    toast.info('▶ Running your code...', { duration: 1000 })
  }

  // Called by CodeExecutor when code runs successfully
  const handleCodeSuccess = () => {
    // 🎊 Gamification WOW Feature: Fire Confetti on Success! 🎊
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#4ade80', '#fbbf24', '#a855f7', '#ec4899']
    })

    setXpEarned(prev => prev + 10)
    // Update streak
    const lastRun = localStorage.getItem('lastCodeRun')
    const today = new Date().toDateString()
    if (lastRun !== today) {
      setStreak(prev => prev + 1)
      localStorage.setItem('lastCodeRun', today)
    }
    toast.success('✅ Code executed! +10 XP')
  }

  // Called by CodeExecutor when code throws an error
  const handleCodeError = () => {
    toast.error('❌ Error in your code — check the console!')
  }

  const handleSave = () => {
    localStorage.setItem('practice-code', code)
    localStorage.setItem('practice-language', language)
    toast.success('💾 Code saved successfully!')
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-12">
        {/* Epic Header */}
        <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-purple-600 to-pink-600 p-8">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
              <h1 className="text-4xl font-bold">{content.title}</h1>
              <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-lg opacity-90">{content.subtitle}</p>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-600/50">
                <span className="text-sm font-medium text-gray-300">Story Language:</span>
                <select
                  value={practiceLang}
                  onChange={(e) => setPracticeLang(e.target.value)}
                  className="bg-transparent border-none text-sm font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="en" className="bg-dark text-white">🇬🇧 English</option>
                  <option value="hi" className="bg-dark text-white">🇮🇳 Hindi</option>
                  <option value="ta" className="bg-dark text-white">🇮🇳 Tamil</option>
                  <option value="te" className="bg-dark text-white">🇮🇳 Telugu</option>
                </select>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="font-bold">{executions} {content.executions}</span>
              </div>
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-bold">{streak} {content.streak}</span>
              </div>
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Star className="w-5 h-5 text-yellow-300" />
                <span className="font-bold">{xpEarned} {content.xpEarned}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Challenge Navigation */}
        <div className="flex justify-between items-center mb-8 px-2">
          <button
            onClick={() => setCurrentScenarioIndex(Math.max(0, currentScenarioIndex - 1))}
            disabled={currentScenarioIndex === 0}
            className="px-5 py-2.5 bg-gray-800 text-white font-semibold rounded-xl border border-gray-700 disabled:opacity-40 hover:bg-gray-700 hover:border-gray-500 transition-all shadow-lg active:scale-95"
          >
            ← Previous Challenge
          </button>

          <div className="flex gap-2">
            {scenarios.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentScenarioIndex ? 'bg-primary scale-125 shadow-[0_0_10px_rgba(235,52,101,0.6)]' : 'bg-gray-700'}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentScenarioIndex(Math.min(scenarios.length - 1, currentScenarioIndex + 1))}
            disabled={currentScenarioIndex === scenarios.length - 1}
            className="px-5 py-2.5 bg-gradient-to-r from-primary to-purple-600 text-white font-bold rounded-xl disabled:opacity-40 hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            Next Challenge →
          </button>
        </div>

        {/* Resizable 50/50 Split View */}
        <Split
          className="flex lg:flex-row flex-col gap-8 h-full min-h-[600px]"
          sizes={[45, 55]}
          minSize={300}
          expandToMin={false}
          gutterSize={10}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          cursor="col-resize"
        >

          {/* Left Panel: The Story Mode Lesson */}
          <div className="space-y-6 flex-1 overflow-auto pr-2 pb-4">
            <div className="bg-dark-card border border-gray-700 rounded-2xl overflow-hidden shadow-xl h-full">
              <div className="p-6 bg-gradient-to-b from-gray-800 to-dark-card border-b border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{content.scenarioTitle}</h2>
                </div>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {content.description}
                </p>
              </div>

              {/* Vernacular Pseudo-Code Block */}
              <div className="p-6">
                <h3 className="font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  {content.pseudoCodeHeading}
                </h3>
                <div className="bg-dark rounded-xl p-5 border border-primary/30 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2">
                    <span className="text-[10px] uppercase font-bold text-primary/70 bg-primary/10 px-2 py-1 rounded">Visual Concept</span>
                  </div>
                  <pre className="text-[15px] font-mono leading-relaxed text-blue-300 whitespace-pre-wrap">
                    {content.pseudoCode}
                  </pre>
                  {/* Subtle highlight effect to make it look active */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform pointer-events-none" />
                </div>

                {/* Mission Footer */}
                <div className="mt-6 flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <Target className="w-6 h-6 text-green-400" />
                  <p className="font-semibold text-green-400">{content.mission}</p>
                </div>

                {/* ✨ WOW Feature: Animated Integrated AI Tutor Hint Box ✨ */}
                {showHint && (
                  <div className="mt-6 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-purple-500/40 rounded-xl p-5 shadow-[0_0_25px_rgba(168,85,247,0.15)] backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center shrink-0 border border-purple-400/50">
                          {isThinking ? <Loader2 className="w-5 h-5 text-purple-300 animate-spin" /> : <BrainCircuit className="w-5 h-5 text-purple-300" />}
                        </div>
                        <h4 className="font-bold text-white tracking-wide">
                          {isLoaded ? 'AI Tutor' : 'Initializing Tutor...'}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {isLoaded && (
                          <div className="flex bg-gray-900/50 p-1 rounded-lg border border-purple-500/20 mr-2">
                            <button
                              onClick={() => setHintLanguage('en')}
                              className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded transition-all ${hintLanguage === 'en' ? 'bg-purple-500 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                              EN
                            </button>
                            <button
                              onClick={() => setHintLanguage(practiceLang === 'en' ? 'hi' : practiceLang)}
                              className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded transition-all ${hintLanguage !== 'en' ? 'bg-purple-500 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                              {practiceLang === 'en' ? 'HI' : practiceLang.toUpperCase()}
                            </button>
                          </div>
                        )}
                        {!isLoaded && loadingProgress > 0 && (
                          <span className="text-xs font-mono text-purple-300 bg-purple-900/50 px-2 py-1 rounded">
                            {loadingProgress}%
                          </span>
                        )}
                      </div>
                    </div>

                    {!isLoaded ? (
                      <div className="ml-11">
                        <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2 overflow-hidden">
                          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${loadingProgress}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-400 animate-pulse">{loadingText || 'Fetching intelligence...'}</p>
                      </div>
                    ) : (
                      <div className="ml-11">
                        {isThinking ? (
                          <div className="flex items-center gap-2 text-purple-300/70 border-l-2 border-primary/40 pl-3 py-1">
                            <div className="flex gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                            <span className="text-sm italic">Tutor is thinking...</span>
                          </div>
                        ) : (
                          <p className="text-gray-200 leading-relaxed text-[15px] font-medium border-l-2 border-primary/40 pl-3 py-1 whitespace-pre-wrap">
                            {dynamicHint || content.hint || "Try breaking the problem down step by step!"}
                          </p>
                        )}

                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={async () => {
                              const reply = await getHint(transpiledCode, hintLanguage, content.hint);
                              setDynamicHint(reply);
                            }}
                            disabled={isThinking}
                            className="text-xs font-semibold px-3 py-1.5 rounded bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 transition-colors border border-purple-500/30 disabled:opacity-50"
                          >
                            Refresh Hint 🔄
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: The Code Workspace */}
          <div className="flex flex-col h-full flex-1 overflow-visible pl-2 pb-4 gap-4" style={{ minHeight: '600px' }}>
            {/* Editor Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-dark-card p-3 rounded-xl border border-gray-700 shrink-0">
              <div className="flex items-center gap-3">
                <Code2 className="w-5 h-5 text-gray-400" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-1.5 bg-dark border border-gray-600 rounded-lg focus:outline-none focus:border-primary text-sm font-semibold"
                >
                  <option value="python">🐍 Python</option>
                  <option value="javascript">⚡ JavaScript</option>
                </select>
                <div className="h-4 w-px bg-gray-600 mx-2" />
                <div className="flex items-center gap-2 bg-dark px-3 py-1.5 rounded-lg border border-gray-600">
                  <span className="text-sm font-medium text-gray-400">Vernacular Engine:</span>
                  <div className="flex bg-gray-800 rounded-md p-0.5">
                    <button
                      onClick={() => handleVernacularToggle(false)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!vernacularMode
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => handleVernacularToggle(true)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${vernacularMode
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      Native
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    setShowHint(!showHint)
                    if (!showHint) {
                      // We just opened it
                      if (!isLoaded) {
                        setDynamicHint('') // Clear old text
                        await initLocalModels() // Begin downloading/loading WebGPU model
                      }
                      if (isLoaded && !dynamicHint && !isThinking) {
                        // Automatically fetch a hint if we're loaded and empty
                        const reply = await getHint(transpiledCode, hintLanguage, content.hint)
                        setDynamicHint(reply)
                      }
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border font-semibold ${showHint ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600'}`}
                >
                  {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                  {showHint ? 'Hide AI Tutor' : '💡 AI Tutor'}
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-600 font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleRun}
                  disabled={isCompiling}
                  className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-opacity-90 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/25 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCompiling ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {isCompiling ? 'Running...' : 'Run Code'}
                </button>
              </div>
            </div>

            {/* Nested Vertical Split for Editor and Console */}
            {/* Setting absolute height of 65vh to ensure react-split has boundaries */}
            <div className="w-full" style={{ height: 'calc(100vh - 240px)', minHeight: '580px' }}>
              <Split
                className="h-full flex flex-col"
                sizes={[60, 40]}
                minSize={150}
                expandToMin={false}
                gutterSize={10}
                gutterAlign="center"
                snapOffset={30}
                dragInterval={1}
                direction="vertical"
                cursor="row-resize"
              >
                {/* Top: Code Editor */}
                <div className="h-full w-full rounded-xl border border-gray-700 shadow-xl overflow-hidden min-h-0 bg-dark-card flex flex-col">
                  {/* Subtle Label */}
                  <div className="bg-gray-800/50 px-3 py-1 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-700 shrink-0">
                    Workspace
                  </div>
                  <div className="flex-1 min-h-0 relative">
                    <CodeEditor
                      code={code}
                      onChange={setCode}
                      language={language}
                    />
                  </div>
                </div>

                {/* Bottom: LeetCode Style Console */}
                <div className="h-full w-full flex flex-col rounded-xl border border-gray-700 shadow-xl bg-dark-card min-h-0 overflow-hidden">
                  <div className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 flex justify-between items-center select-none shrink-0 cursor-default">
                    <h3 className="font-semibold text-gray-300 flex items-center gap-2 text-sm tracking-wide">
                      <Terminal className="w-4 h-4 text-primary" />
                      Console
                    </h3>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                  </div>
                  <div className="bg-[#1E1E1E] flex-1 min-h-0 relative">
                    <div className="absolute inset-0 overflow-auto custom-scrollbar">
                      {showOutput ? (
                        <CodeExecutor
                          code={transpiledCode}
                          language={language}
                          lang={practiceLang}
                          onSuccess={handleCodeSuccess}
                          onError={handleCodeError}
                        />
                      ) : (
                        <div className="h-full p-4 flex items-center justify-center text-gray-500 font-mono text-[13px] opacity-70">
                          Click "Run Code" to view terminal output and AI complexity analysis.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Split>
            </div>

            {/* Gamification Notification (shows when XP > 0) */}
            {xpEarned > 0 && (
              <div className="mt-4 flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl animate-fade-in shadow-lg shrink-0">
                <Trophy className="w-8 h-8 text-yellow-500 flex-shrink-0 animate-bounce" />
                <div>
                  <h4 className="font-bold text-yellow-500">Great job! 🌟</h4>
                  <p className="text-sm text-yellow-500/80">You're making excellent progress today!</p>
                </div>
              </div>
            )}
          </div>
        </Split>
      </div>
    </Layout>
  )
}
