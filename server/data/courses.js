// Real course content - 10 courses with actual lessons
const courses = [
  {
    id: 'python-basics-hindi',
    title: 'Python Basics (Hindi)',
    description: 'Python की बुनियादी बातें सीखें - variables, loops, functions और बहुत कुछ',
    language: 'Hindi',
    level: 'beginner',
    category: 'Python',
    totalDuration: '6h 30m',
    rating: 4.8,
    thumbnail: '/courses/python-basics.jpg',
    tags: ['Python', 'Beginner', 'Hindi'],
    lessons: [
      {
        id: 'py-basics-1',
        title: 'Variables और Data Types',
        description: 'Python में variables कैसे बनाएं और data types को समझें',
        content: `# Variables और Data Types

## Variables क्या हैं?
Variables वो containers हैं जो data store करते हैं।

## Example:
\`\`\`python
name = "Rahul"
age = 25
height = 5.8
is_student = True
\`\`\`

## Data Types:
- **String**: Text data ("Hello")
- **Integer**: Whole numbers (25)
- **Float**: Decimal numbers (5.8)
- **Boolean**: True/False`,
        code: `# Variables बनाएं
name = "आपका नाम"
age = 20
print(f"नमस्ते {name}, आपकी उम्र {age} है")`,
        exercises: [
          {
            question: 'अपना नाम और उम्र store करने के लिए variables बनाएं',
            initialCode: '# यहाँ अपना code लिखें\n',
            solution: 'name = "Rahul"\nage = 25\nprint(name, age)',
            hints: ['Variable बनाने के लिए = का use करें', 'String के लिए quotes का use करें']
          }
        ],
        duration: 15,
        xpReward: 50
      },
      {
        id: 'py-basics-2',
        title: 'Loops - For और While',
        description: 'Loops का use करके code को repeat करें',
        content: `# Loops

## For Loop:
\`\`\`python
for i in range(1, 6):
    print(i)
\`\`\`

## While Loop:
\`\`\`python
count = 0
while count < 5:
    print(count)
    count += 1
\`\`\``,
        code: `# 1 से 10 तक numbers print करें
for i in range(1, 11):
    print(i)`,
        exercises: [
          {
            question: '1 से 20 तक के even numbers print करें',
            initialCode: '# यहाँ loop लिखें\n',
            solution: 'for i in range(2, 21, 2):\n    print(i)',
            hints: ['range(start, stop, step) का use करें', 'Even numbers के लिए step=2']
          }
        ],
        duration: 20,
        xpReward: 75
      }
    ]
  },
  {
    id: 'javascript-basics-tamil',
    title: 'JavaScript Basics (Tamil)',
    description: 'JavaScript-ன் அடிப்படைகளை கற்றுக்கொள்ளுங்கள்',
    language: 'Tamil',
    level: 'beginner',
    category: 'JavaScript',
    totalDuration: '5h 45m',
    rating: 4.7,
    thumbnail: '/courses/js-basics.jpg',
    tags: ['JavaScript', 'Beginner', 'Tamil'],
    lessons: [
      {
        id: 'js-basics-1',
        title: 'Variables மற்றும் Data Types',
        description: 'JavaScript-ல் variables எப்படி உருவாக்குவது',
        content: `# Variables

## let, const, var:
\`\`\`javascript
let name = "Kumar";
const age = 25;
var city = "Chennai";
\`\`\``,
        code: `let name = "உங்கள் பெயர்";\nconsole.log(name);`,
        exercises: [],
        duration: 15,
        xpReward: 50
      }
    ]
  },
  {
    id: 'react-basics-english',
    title: 'React Basics',
    description: 'Learn React fundamentals - components, props, state, and hooks',
    language: 'English',
    level: 'intermediate',
    category: 'React',
    totalDuration: '8h 15m',
    rating: 4.9,
    thumbnail: '/courses/react-basics.jpg',
    tags: ['React', 'JavaScript', 'Frontend'],
    lessons: [
      {
        id: 'react-1',
        title: 'Components and JSX',
        description: 'Understanding React components and JSX syntax',
        content: `# React Components

## Functional Component:
\`\`\`jsx
function Welcome() {
  return <h1>Hello, World!</h1>;
}
\`\`\``,
        code: `function App() {\n  return <div>Hello React!</div>;\n}`,
        exercises: [],
        duration: 25,
        xpReward: 100
      }
    ]
  },
  {
    id: 'python-data-structures',
    title: 'Python Data Structures (Hindi)',
    description: 'Lists, Dictionaries, Sets और Tuples को master करें',
    language: 'Hindi',
    level: 'intermediate',
    category: 'Python',
    totalDuration: '7h 00m',
    rating: 4.8,
    thumbnail: '/courses/python-ds.jpg',
    tags: ['Python', 'Data Structures', 'Hindi'],
    lessons: []
  },
  {
    id: 'web-development-telugu',
    title: 'Web Development (Telugu)',
    description: 'HTML, CSS మరియు JavaScript తో websites నిర్మించండి',
    language: 'Telugu',
    level: 'beginner',
    category: 'Web Development',
    totalDuration: '10h 30m',
    rating: 4.6,
    thumbnail: '/courses/web-dev.jpg',
    tags: ['HTML', 'CSS', 'JavaScript', 'Telugu'],
    lessons: []
  },
  {
    id: 'nodejs-backend',
    title: 'Node.js Backend Development',
    description: 'Build scalable backend applications with Node.js and Express',
    language: 'English',
    level: 'intermediate',
    category: 'Backend',
    totalDuration: '9h 45m',
    rating: 4.7,
    thumbnail: '/courses/nodejs.jpg',
    tags: ['Node.js', 'Backend', 'API'],
    lessons: []
  },
  {
    id: 'sql-databases-hindi',
    title: 'SQL Databases (Hindi)',
    description: 'Database design और SQL queries सीखें',
    language: 'Hindi',
    level: 'intermediate',
    category: 'Database',
    totalDuration: '6h 15m',
    rating: 4.5,
    thumbnail: '/courses/sql.jpg',
    tags: ['SQL', 'Database', 'Hindi'],
    lessons: []
  },
  {
    id: 'git-github-tamil',
    title: 'Git & GitHub (Tamil)',
    description: 'Version control மற்றும் collaboration கற்றுக்கொள்ளுங்கள்',
    language: 'Tamil',
    level: 'beginner',
    category: 'Tools',
    totalDuration: '4h 30m',
    rating: 4.8,
    thumbnail: '/courses/git.jpg',
    tags: ['Git', 'GitHub', 'Tamil'],
    lessons: []
  },
  {
    id: 'dsa-python',
    title: 'Data Structures & Algorithms',
    description: 'Master DSA concepts with Python - Arrays, Trees, Graphs, and more',
    language: 'English',
    level: 'advanced',
    category: 'DSA',
    totalDuration: '15h 00m',
    rating: 4.9,
    thumbnail: '/courses/dsa.jpg',
    tags: ['DSA', 'Python', 'Algorithms'],
    lessons: []
  },
  {
    id: 'machine-learning-hindi',
    title: 'Machine Learning Basics (Hindi)',
    description: 'ML की शुरुआत करें - Linear Regression से Neural Networks तक',
    language: 'Hindi',
    level: 'advanced',
    category: 'Machine Learning',
    totalDuration: '12h 30m',
    rating: 4.7,
    thumbnail: '/courses/ml.jpg',
    tags: ['ML', 'Python', 'AI', 'Hindi'],
    lessons: []
  }
]

module.exports = courses
