import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np

# Set style
plt.style.use('seaborn-v0_8-darkgrid')

# ============ ARCHITECTURE DIAGRAM ============
fig, ax = plt.subplots(figsize=(16, 12))
ax.set_xlim(0, 10)
ax.set_ylim(0, 10)
ax.axis('off')

# Title
ax.text(5, 9.5, 'LinguaDev AI - System Architecture', 
        fontsize=20, fontweight='bold', ha='center')

# Color scheme
color_frontend = '#FF6B6B'
color_backend = '#4ECDC4'
color_ai = '#FFE66D'
color_data = '#95E1D3'
color_integration = '#C7CEEA'

# FRONTEND LAYER
ax.add_patch(FancyBboxPatch((0.2, 7.5), 2.5, 1.2, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor=color_frontend, linewidth=2))
ax.text(1.45, 8.3, 'FRONTEND', fontsize=11, fontweight='bold', ha='center')
ax.text(1.45, 7.95, 'React Native', fontsize=9, ha='center')
ax.text(1.45, 7.65, 'Web & Mobile', fontsize=8, ha='center', style='italic')

# BACKEND LAYER
ax.add_patch(FancyBboxPatch((3.5, 7.5), 2.5, 1.2, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor=color_backend, linewidth=2))
ax.text(4.75, 8.3, 'BACKEND', fontsize=11, fontweight='bold', ha='center')
ax.text(4.75, 7.95, 'AWS Lambda', fontsize=9, ha='center')
ax.text(4.75, 7.65, 'API Gateway', fontsize=8, ha='center', style='italic')

# AUTH LAYER
ax.add_patch(FancyBboxPatch((6.8, 7.5), 2.5, 1.2, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor=color_integration, linewidth=2))
ax.text(8.05, 8.3, 'SECURITY', fontsize=11, fontweight='bold', ha='center')
ax.text(8.05, 7.95, 'AWS Cognito', fontsize=9, ha='center')
ax.text(8.05, 7.65, 'IAM & KMS', fontsize=8, ha='center', style='italic')

# AI/ML CORE LAYER
ax.add_patch(FancyBboxPatch((0.2, 5.5), 2.2, 1.5, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor=color_ai, linewidth=2))
ax.text(1.3, 6.7, 'AI/ML CORE', fontsize=11, fontweight='bold', ha='center')
ax.text(1.3, 6.35, 'AWS Bedrock', fontsize=8, ha='center')
ax.text(1.3, 6.05, 'Claude, Code Llama', fontsize=7, ha='center')
ax.text(1.3, 5.75, 'SageMaker', fontsize=8, ha='center')

# NLP LAYER
ax.add_patch(FancyBboxPatch((2.8, 5.5), 2.2, 1.5, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor=color_ai, linewidth=2))
ax.text(3.9, 6.7, 'NLP SERVICES', fontsize=11, fontweight='bold', ha='center')
ax.text(3.9, 6.35, 'Comprehend', fontsize=8, ha='center')
ax.text(3.9, 6.05, 'Translate', fontsize=8, ha='center')
ax.text(3.9, 5.75, 'Polly (TTS)', fontsize=8, ha='center')

# HUGGING FACE
ax.add_patch(FancyBboxPatch((5.4, 5.5), 2.2, 1.5, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor=color_ai, linewidth=2))
ax.text(6.5, 6.7, 'CUSTOM MODELS', fontsize=11, fontweight='bold', ha='center')
ax.text(6.5, 6.35, 'Hugging Face', fontsize=8, ha='center')
ax.text(6.5, 6.05, 'Fine-tuned for', fontsize=7, ha='center')
ax.text(6.5, 5.75, 'Indian Languages', fontsize=7, ha='center')

# OFFLINE
ax.add_patch(FancyBboxPatch((8, 5.5), 1.8, 1.5, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor=color_ai, linewidth=2))
ax.text(8.9, 6.7, 'OFFLINE', fontsize=11, fontweight='bold', ha='center')
ax.text(8.9, 6.35, 'Ollama', fontsize=8, ha='center')
ax.text(8.9, 6.05, 'Lightweight', fontsize=7, ha='center')
ax.text(8.9, 5.75, 'Models', fontsize=7, ha='center')

# DATABASE LAYER
ax.add_patch(FancyBboxPatch((0.2, 3.2), 2.2, 1.5, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor=color_data, linewidth=2))
ax.text(1.3, 4.4, 'NOSQL DB', fontsize=11, fontweight='bold', ha='center')
ax.text(1.3, 4.05, 'DynamoDB', fontsize=9, ha='center')
ax.text(1.3, 3.7, 'User Data', fontsize=8, ha='center')
ax.text(1.3, 3.4, 'Progress', fontsize=8, ha='center')

# STORAGE LAYER
ax.add_patch(FancyBboxPatch((2.8, 3.2), 2.2, 1.5, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor=color_data, linewidth=2))
ax.text(3.9, 4.4, 'STORAGE', fontsize=11, fontweight='bold', ha='center')
ax.text(3.9, 4.05, 'S3', fontsize=9, ha='center')
ax.text(3.9, 3.7, 'Content', fontsize=8, ha='center')
ax.text(3.9, 3.4, 'Offline Cache', fontsize=8, ha='center')

# ANALYTICS
ax.add_patch(FancyBboxPatch((5.4, 3.2), 2.2, 1.5, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor=color_data, linewidth=2))
ax.text(6.5, 4.4, 'ANALYTICS', fontsize=11, fontweight='bold', ha='center')
ax.text(6.5, 4.05, 'RDS', fontsize=9, ha='center')
ax.text(6.5, 3.7, 'CloudWatch', fontsize=8, ha='center')
ax.text(6.5, 3.4, 'Metrics', fontsize=8, ha='center')

# CDN
ax.add_patch(FancyBboxPatch((8, 3.2), 1.8, 1.5, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor=color_data, linewidth=2))
ax.text(8.9, 4.4, 'CDN', fontsize=11, fontweight='bold', ha='center')
ax.text(8.9, 4.05, 'CloudFront', fontsize=9, ha='center')
ax.text(8.9, 3.7, 'Low-latency', fontsize=8, ha='center')
ax.text(8.9, 3.4, 'Delivery', fontsize=8, ha='center')

# DEPLOYMENT
ax.add_patch(FancyBboxPatch((0.2, 0.8), 4.3, 1.5, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor=color_integration, linewidth=2))
ax.text(2.35, 2.0, 'DEPLOYMENT & INTEGRATION', fontsize=11, fontweight='bold', ha='center')
ax.text(2.35, 1.6, 'AWS Amplify | Lambda | CloudFormation', fontsize=9, ha='center')
ax.text(2.35, 1.2, 'GitHub Actions | Docker | Monitoring', fontsize=8, ha='center')

# USERS
ax.add_patch(FancyBboxPatch((5.5, 0.8), 4.3, 1.5, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor='#A8E6CF', linewidth=2))
ax.text(7.65, 2.0, 'END USERS', fontsize=11, fontweight='bold', ha='center')
ax.text(7.65, 1.6, 'Students | Developers | Educators', fontsize=9, ha='center')
ax.text(7.65, 1.2, 'Mobile App | Web Browser | Offline Mode', fontsize=8, ha='center')

# ARROWS - Frontend to Backend
arrow1 = FancyArrowPatch((2.7, 8.1), (3.5, 8.1), 
                        arrowstyle='->', mutation_scale=30, linewidth=2, color='black')
ax.add_patch(arrow1)

# Arrows - Backend to AI/ML
arrow2 = FancyArrowPatch((4.75, 7.5), (3.9, 7.0), 
                        arrowstyle='<->', mutation_scale=20, linewidth=1.5, color='gray')
ax.add_patch(arrow2)

# Arrows - Backend to Database
arrow3 = FancyArrowPatch((4.75, 7.5), (1.3, 4.7), 
                        arrowstyle='<->', mutation_scale=20, linewidth=1.5, color='gray')
ax.add_patch(arrow3)

# Arrows - AI to Database
arrow4 = FancyArrowPatch((3.9, 5.5), (3.9, 4.7), 
                        arrowstyle='<->', mutation_scale=20, linewidth=1.5, color='gray')
ax.add_patch(arrow4)

# Arrows - Backend to CDN
arrow5 = FancyArrowPatch((6.0, 8.1), (8.9, 4.7), 
                        arrowstyle='<->', mutation_scale=20, linewidth=1.5, color='gray')
ax.add_patch(arrow5)

# Arrows - Deployment to Users
arrow6 = FancyArrowPatch((4.5, 1.55), (5.5, 1.55), 
                        arrowstyle='->', mutation_scale=30, linewidth=2, color='black')
ax.add_patch(arrow6)

# Add legend
legend_y = 0.2
ax.text(0.2, legend_y, '🌐 AWS Region: Mumbai (ap-south-1)', fontsize=9, style='italic')
ax.text(3.5, legend_y, '🔒 Data Residency: India', fontsize=9, style='italic')
ax.text(6.5, legend_y, '⚡ Latency: <100ms for rural areas', fontsize=9, style='italic')

plt.tight_layout()
plt.savefig('LinguaDev_Architecture.png', dpi=300, bbox_inches='tight', facecolor='white')
print("✓ Architecture diagram saved as LinguaDev_Architecture.png")
plt.close()


# ============ USER FLOW DIAGRAM ============
fig, ax = plt.subplots(figsize=(14, 10))
ax.set_xlim(0, 10)
ax.set_ylim(0, 10)
ax.axis('off')

ax.text(5, 9.5, 'LinguaDev AI - User Journey Flow', 
        fontsize=20, fontweight='bold', ha='center')

# Step 1: Onboarding
ax.add_patch(FancyBboxPatch((0.5, 7.5), 2, 1.2, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor='#FFB6C1', linewidth=2))
ax.text(1.5, 8.3, '1. ONBOARDING', fontsize=10, fontweight='bold', ha='center')
ax.text(1.5, 7.9, 'Sign Up', fontsize=8, ha='center')
ax.text(1.5, 7.65, 'Select Language', fontsize=8, ha='center')

# Arrow
arrow = FancyArrowPatch((2.5, 8.1), (3.2, 8.1), 
                       arrowstyle='->', mutation_scale=25, linewidth=2, color='black')
ax.add_patch(arrow)

# Step 2: Assessment
ax.add_patch(FancyBboxPatch((3.2, 7.5), 2, 1.2, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor='#FFD700', linewidth=2))
ax.text(4.2, 8.3, '2. ASSESSMENT', fontsize=10, fontweight='bold', ha='center')
ax.text(4.2, 7.9, 'Skill Quiz', fontsize=8, ha='center')
ax.text(4.2, 7.65, 'Goal Setting', fontsize=8, ha='center')

# Arrow
arrow = FancyArrowPatch((5.2, 8.1), (5.9, 8.1), 
                       arrowstyle='->', mutation_scale=25, linewidth=2, color='black')
ax.add_patch(arrow)

# Step 3: Personalization
ax.add_patch(FancyBboxPatch((5.9, 7.5), 2, 1.2, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor='#98FB98', linewidth=2))
ax.text(6.9, 8.3, '3. PERSONALIZE', fontsize=10, fontweight='bold', ha='center')
ax.text(6.9, 7.9, 'AI Generates', fontsize=8, ha='center')
ax.text(6.9, 7.65, 'Learning Path', fontsize=8, ha='center')

# Arrow
arrow = FancyArrowPatch((7.9, 8.1), (8.6, 8.1), 
                       arrowstyle='->', mutation_scale=25, linewidth=2, color='black')
ax.add_patch(arrow)

# Step 4: Dashboard
ax.add_patch(FancyBboxPatch((8.6, 7.5), 1.2, 1.2, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor='#87CEEB', linewidth=2))
ax.text(9.2, 8.3, '4. HOME', fontsize=10, fontweight='bold', ha='center')
ax.text(9.2, 7.8, 'Dashboard', fontsize=8, ha='center')

# Main Loop - Learning
ax.add_patch(FancyBboxPatch((0.5, 5.5), 2.2, 1.5, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor='#DDA0DD', linewidth=2))
ax.text(1.6, 6.7, 'LEARNING LOOP', fontsize=10, fontweight='bold', ha='center')
ax.text(1.6, 6.3, '📚 Read Lesson', fontsize=8, ha='center')
ax.text(1.6, 5.95, '💬 Chat with AI', fontsize=8, ha='center')
ax.text(1.6, 5.6, '🔍 Get Hints', fontsize=8, ha='center')

# Arrow down
arrow = FancyArrowPatch((1.6, 7.5), (1.6, 7.0), 
                       arrowstyle='->', mutation_scale=25, linewidth=2, color='black')
ax.add_patch(arrow)

# Practice & Challenges
ax.add_patch(FancyBboxPatch((3.2, 5.5), 2.2, 1.5, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor='#F0E68C', linewidth=2))
ax.text(4.3, 6.7, 'PRACTICE', fontsize=10, fontweight='bold', ha='center')
ax.text(4.3, 6.3, '🎯 Solve Challenges', fontsize=8, ha='center')
ax.text(4.3, 5.95, '🏆 Earn Badges', fontsize=8, ha='center')
ax.text(4.3, 5.6, '📊 Track Progress', fontsize=8, ha='center')

# Arrow
arrow = FancyArrowPatch((2.7, 6.25), (3.2, 6.25), 
                       arrowstyle='->', mutation_scale=25, linewidth=2, color='black')
ax.add_patch(arrow)

# Feedback & Optimization
ax.add_patch(FancyBboxPatch((5.9, 5.5), 2.2, 1.5, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor='#FFB6C1', linewidth=2))
ax.text(7.0, 6.7, 'AI FEEDBACK', fontsize=10, fontweight='bold', ha='center')
ax.text(7.0, 6.3, '✅ Code Review', fontsize=8, ha='center')
ax.text(7.0, 5.95, '💡 Suggestions', fontsize=8, ha='center')
ax.text(7.0, 5.6, '📈 Adapt Path', fontsize=8, ha='center')

# Arrow
arrow = FancyArrowPatch((5.4, 6.25), (5.9, 6.25), 
                       arrowstyle='->', mutation_scale=25, linewidth=2, color='black')
ax.add_patch(arrow)

# Deployment
ax.add_patch(FancyBboxPatch((8.2, 5.5), 1.6, 1.5, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor='#90EE90', linewidth=2))
ax.text(9.0, 6.7, 'DEPLOY', fontsize=10, fontweight='bold', ha='center')
ax.text(9.0, 6.3, '🚀 AWS', fontsize=8, ha='center')
ax.text(9.0, 5.95, 'Lambda', fontsize=8, ha='center')
ax.text(9.0, 5.6, 'Amplify', fontsize=8, ha='center')

# Arrow back to learning (loop)
arrow = FancyArrowPatch((7.0, 5.5), (4.3, 5.5), 
                       arrowstyle='->', mutation_scale=20, linewidth=1.5, 
                       color='red', linestyle='dashed')
ax.add_patch(arrow)
ax.text(5.5, 5.2, 'Continuous Improvement Loop', fontsize=8, ha='center', 
        style='italic', color='red')

# Developer Path (Alternative)
ax.add_patch(FancyBboxPatch((0.5, 3.2), 2.2, 1.2, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor='#87CEEB', linewidth=2))
ax.text(1.6, 4.0, 'FOR DEVELOPERS', fontsize=10, fontweight='bold', ha='center')
ax.text(1.6, 3.6, '🤖 Code Generation', fontsize=8, ha='center')

# Arrow
arrow = FancyArrowPatch((2.7, 3.8), (3.2, 3.8), 
                       arrowstyle='->', mutation_scale=25, linewidth=2, color='black')
ax.add_patch(arrow)

ax.add_patch(FancyBboxPatch((3.2, 3.2), 2.2, 1.2, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor='#87CEEB', linewidth=2))
ax.text(4.3, 4.0, 'DEBUGGING', fontsize=10, fontweight='bold', ha='center')
ax.text(4.3, 3.6, '🐛 AI Fixes Bugs', fontsize=8, ha='center')

# Arrow
arrow = FancyArrowPatch((5.4, 3.8), (5.9, 3.8), 
                       arrowstyle='->', mutation_scale=25, linewidth=2, color='black')
ax.add_patch(arrow)

ax.add_patch(FancyBboxPatch((5.9, 3.2), 2.2, 1.2, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor='#87CEEB', linewidth=2))
ax.text(7.0, 4.0, 'OPTIMIZATION', fontsize=10, fontweight='bold', ha='center')
ax.text(7.0, 3.6, '⚡ Performance', fontsize=8, ha='center')

# Arrow
arrow = FancyArrowPatch((8.1, 3.8), (8.2, 3.8), 
                       arrowstyle='->', mutation_scale=25, linewidth=2, color='black')
ax.add_patch(arrow)

ax.add_patch(FancyBboxPatch((8.2, 3.2), 1.6, 1.2, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor='#87CEEB', linewidth=2))
ax.text(9.0, 4.0, 'SHIP', fontsize=10, fontweight='bold', ha='center')
ax.text(9.0, 3.6, '✅ Deploy', fontsize=8, ha='center')

# Outcomes
ax.add_patch(FancyBboxPatch((0.5, 0.5), 9.2, 1.8, 
             boxstyle="round,pad=0.1", edgecolor='black', 
             facecolor='#E6E6FA', linewidth=2))
ax.text(5.1, 2.0, 'OUTCOMES & IMPACT', fontsize=11, fontweight='bold', ha='center')
ax.text(2.0, 1.5, '📈 40% faster learning', fontsize=9, ha='center')
ax.text(5.1, 1.5, '⏱️ 40% less dev time', fontsize=9, ha='center')
ax.text(8.2, 1.5, '🎓 Job placement', fontsize=9, ha='center')
ax.text(2.0, 1.0, '🌍 500M+ reach', fontsize=9, ha='center')
ax.text(5.1, 1.0, '💰 $2B+ economic value', fontsize=9, ha='center')
ax.text(8.2, 1.0, '🏆 UN SDG aligned', fontsize=9, ha='center')

plt.tight_layout()
plt.savefig('LinguaDev_UserFlow.png', dpi=300, bbox_inches='tight', facecolor='white')
print("✓ User flow diagram saved as LinguaDev_UserFlow.png")
plt.close()


# ============ APP WIREFRAME MOCKUP ============
fig = plt.figure(figsize=(16, 10))
gs = fig.add_gridspec(2, 3, hspace=0.3, wspace=0.3)

# Title
fig.suptitle('LinguaDev AI - App Wireframes', fontsize=18, fontweight='bold', y=0.98)

# ---- Screen 1: Home Dashboard ----
ax1 = fig.add_subplot(gs[0, 0])
ax1.set_xlim(0, 10)
ax1.set_ylim(0, 14)
ax1.axis('off')

# Phone frame
rect = mpatches.Rectangle((0.5, 0.5), 9, 13, linewidth=3, edgecolor='black', facecolor='white')
ax1.add_patch(rect)

# Status bar
ax1.add_patch(mpatches.Rectangle((0.5, 12.5), 9, 0.8, facecolor='#333333'))
ax1.text(5, 12.9, '9:41  🔋', fontsize=8, ha='center', color='white', fontweight='bold')

# Header
ax1.add_patch(mpatches.Rectangle((0.5, 11.5), 9, 1, facecolor='#FF6B6B'))
ax1.text(5, 12.2, 'LinguaDev AI', fontsize=11, ha='center', fontweight='bold', color='white')
ax1.text(5, 11.8, 'हिंदी', fontsize=9, ha='center', color='white')

# Welcome
ax1.text(1.5, 11.0, 'नमस्ते, Priya! 👋', fontsize=9, fontweight='bold')

# Progress bars
ax1.add_patch(mpatches.Rectangle((1, 10.2), 8, 0.3, facecolor='#E0E0E0'))
ax1.add_patch(mpatches.Rectangle((1, 10.2), 6.4, 0.3, facecolor='#4ECDC4'))
ax1.text(1, 9.8, 'Python Basics: 8/12', fontsize=8)

ax1.add_patch(mpatches.Rectangle((1, 9.2), 8, 0.3, facecolor='#E0E0E0'))
ax1.add_patch(mpatches.Rectangle((1, 9.2), 1.6, 0.3, facecolor='#FFE66D'))
ax1.text(1, 8.8, 'Web Dev: 2/10', fontsize=8)

# Challenges
ax1.text(1, 8.2, '🎮 Challenges', fontsize=9, fontweight='bold')
ax1.add_patch(mpatches.Rectangle((1, 6.5), 2.5, 1.3, facecolor='#FFE66D', edgecolor='black', linewidth=1))
ax1.text(2.25, 7.5, '🌾 Smart', fontsize=8, ha='center', fontweight='bold')
ax1.text(2.25, 7.1, 'Village', fontsize=7, ha='center')

ax1.add_patch(mpatches.Rectangle((4, 6.5), 2.5, 1.3, facecolor='#FFB6C1', edgecolor='black', linewidth=1))
ax1.text(5.25, 7.5, '🎄 Diwali', fontsize=8, ha='center', fontweight='bold')
ax1.text(5.25, 7.1, 'E-Shop', fontsize=7, ha='center')

ax1.add_patch(mpatches.Rectangle((6.5, 6.5), 2.5, 1.3, facecolor='#90EE90', edgecolor='black', linewidth=1))
ax1.text(7.75, 7.5, '🏆 Quiz', fontsize=8, ha='center', fontweight='bold')
ax1.text(7.75, 7.1, 'Master', fontsize=7, ha='center')

# Buttons
ax1.add_patch(mpatches.Rectangle((1, 5.5), 8, 0.6, facecolor='#4ECDC4', edgecolor='black', linewidth=1))
ax1.text(5, 5.8, 'Continue Learning', fontsize=9, ha='center', fontweight='bold', color='white')

ax1.add_patch(mpatches.Rectangle((1, 4.7), 8, 0.6, facecolor='#E0E0E0', edgecolor='black', linewidth=1))
ax1.text(5, 5.0, 'View All Courses', fontsize=9, ha='center', fontweight='bold')

# Bottom nav
ax1.add_patch(mpatches.Rectangle((0.5, 0.5), 9, 0.8, facecolor='#F0F0F0', edgecolor='black', linewidth=1))
ax1.text(2, 0.9, '🏠', fontsize=12, ha='center')
ax1.text(5, 0.9, '📚', fontsize=12, ha='center')
ax1.text(8, 0.9, '👤', fontsize=12, ha='center')

ax1.text(5, 3.5, 'HOME DASHBOARD', fontsize=10, ha='center', fontweight='bold', style='italic')

# ---- Screen 2: AI Tutor Chat ----
ax2 = fig.add_subplot(gs[0, 1])
ax2.set_xlim(0, 10)
ax2.set_ylim(0, 14)
ax2.axis('off')

# Phone frame
rect = mpatches.Rectangle((0.5, 0.5), 9, 13, linewidth=3, edgecolor='black', facecolor='white')
ax2.add_patch(rect)

# Status bar
ax2.add_patch(mpatches.Rectangle((0.5, 12.5), 9, 0.8, facecolor='#333333'))
ax2.text(5, 12.9, '9:41  🔋', fontsize=8, ha='center', color='white', fontweight='bold')

# Header
ax2.add_patch(mpatches.Rectangle((0.5, 11.5), 9, 1, facecolor='#4ECDC4'))
ax2.text(5, 12.2, 'AI Tutor', fontsize=11, ha='center', fontweight='bold', color='white')
ax2.text(5, 11.8, 'Python Basics', fontsize=8, ha='center', color='white')

# Chat bubbles
ax2.add_patch(mpatches.FancyBboxPatch((1, 10.2), 7, 0.8, boxstyle="round,pad=0.1", 
                                      facecolor='#E0E0E0', edgecolor='black', linewidth=1))
ax2.text(1.3, 10.6, '🤖 नमस्ते! मैं आपका सहायक हूँ', fontsize=7)

ax2.add_patch(mpatches.FancyBboxPatch((1, 9.0), 7, 0.8, boxstyle="round,pad=0.1", 
                                      facecolor='#FFE66D', edgecolor='black', linewidth=1))
ax2.text(1.3, 9.4, '👤 List कैसे बनाते हैं?', fontsize=7)

ax2.add_patch(mpatches.FancyBboxPatch((1, 7.2), 7, 1.4, boxstyle="round,pad=0.1", 
                                      facecolor='#E0E0E0', edgecolor='black', linewidth=1))
ax2.text(1.3, 8.3, '🤖 बहुत अच्छा सवाल!', fontsize=7)
ax2.text(1.3, 7.95, 'fruits = ["आम", "केला"]', fontsize=6, family='monospace')
ax2.text(1.3, 7.6, 'क्या समझ गए?', fontsize=7)

# Input box
ax2.add_patch(mpatches.Rectangle((1, 1.5), 7, 0.8, facecolor='#F0F0F0', edgecolor='black', linewidth=1))
ax2.text(1.3, 1.9, 'Type your question...', fontsize=7, style='italic', color='gray')

# Buttons
ax2.text(1.5, 1.0, '🎤', fontsize=10, ha='center')
ax2.text(5, 1.0, '📎', fontsize=10, ha='center')
ax2.text(8.5, 1.0, '➤', fontsize=10, ha='center')

ax2.text(5, 3.5, 'AI TUTOR CHAT', fontsize=10, ha='center', fontweight='bold', style='italic')

# ---- Screen 3: Code Editor ----
ax3 = fig.add_subplot(gs[0, 2])
ax3.set_xlim(0, 10)
ax3.set_ylim(0, 14)
ax3.axis('off')

# Phone frame
rect = mpatches.Rectangle((0.5, 0.5), 9, 13, linewidth=3, edgecolor='black', facecolor='white')
ax3.add_patch(rect)

# Status bar
ax3.add_patch(mpatches.Rectangle((0.5, 12.5), 9, 0.8, facecolor='#333333'))
ax3.text(5, 12.9, '9:41  🔋', fontsize=8, ha='center', color='white', fontweight='bold')

# Header
ax3.add_patch(mpatches.Rectangle((0.5, 11.5), 9, 1, facecolor='#FFE66D'))
ax3.text(5, 12.2, 'Code Editor', fontsize=11, ha='center', fontweight='bold')
ax3.text(5, 11.8, 'Farmer App', fontsize=8, ha='center')

# Code area
ax3.add_patch(mpatches.Rectangle((1, 7.5), 8, 3.5, facecolor='#1E1E1E', edgecolor='black', linewidth=1))
ax3.text(1.3, 10.5, '1  crops = ["गेहूँ"]', fontsize=6, family='monospace', color='#90EE90')
ax3.text(1.3, 10.1, '2  for crop in crops:', fontsize=6, family='monospace', color='#90EE90')
ax3.text(1.3, 9.7, '3    print(crop)', fontsize=6, family='monospace', color='#90EE90')

# Suggestions
ax3.add_patch(mpatches.Rectangle((1, 5.5), 8, 1.8, facecolor='#F5F5F5', edgecolor='black', linewidth=1))
ax3.text(1.3, 7.0, '💡 Suggestion:', fontsize=7, fontweight='bold')
ax3.text(1.3, 6.6, 'Use set() for faster lookup', fontsize=6)
ax3.text(1.3, 6.2, '✅ Syntax correct', fontsize=6, color='green')

# Buttons
ax3.add_patch(mpatches.Rectangle((1, 4.5), 3.5, 0.6, facecolor='#4ECDC4', edgecolor='black', linewidth=1))
ax3.text(2.75, 4.8, '▶️ Run', fontsize=8, ha='center', fontweight='bold', color='white')

ax3.add_patch(mpatches.Rectangle((5.5, 4.5), 3.5, 0.6, facecolor='#FFE66D', edgecolor='black', linewidth=1))
ax3.text(7.25, 4.8, '💾 Save', fontsize=8, ha='center', fontweight='bold')

ax3.text(5, 3.5, 'CODE EDITOR', fontsize=10, ha='center', fontweight='bold', style='italic')

# ---- Screen 4: Challenges ----
ax4 = fig.add_subplot(gs[1, 0])
ax4.set_xlim(0, 10)
ax4.set_ylim(0, 14)
ax4.axis('off')

# Phone frame
rect = mpatches.Rectangle((0.5, 0.5), 9, 13, linewidth=3, edgecolor='black', facecolor='white')
ax4.add_patch(rect)

# Status bar
ax4.add_patch(mpatches.Rectangle((0.5, 12.5), 9, 0.8, facecolor='#333333'))
ax4.text(5, 12.9, '9:41  🔋', fontsize=8, ha='center', color='white', fontweight='bold')

# Header
ax4.add_patch(mpatches.Rectangle((0.5, 11.5), 9, 1, facecolor='#FFB6C1'))
ax4.text(5, 12.2, 'Challenges', fontsize=11, ha='center', fontweight='bold', color='white')
ax4.text(5, 11.8, 'Leaderboard', fontsize=8, ha='center', color='white')

# Leaderboard
ax4.text(1, 10.8, '🥇 Raj - 2,450 pts', fontsize=8, fontweight='bold')
ax4.text(1, 10.3, '🥈 Priya - 2,180 pts', fontsize=8, fontweight='bold')
ax4.text(1, 9.8, '🥉 Amit - 1,920 pts', fontsize=8, fontweight='bold')
ax4.text(1, 9.3, '4️⃣ You - 1,650 pts', fontsize=8, fontweight='bold', color='#FF6B6B')

# Challenge card
ax4.add_patch(mpatches.Rectangle((1, 6.5), 8, 2.3, facecolor='#FFE66D', edgecolor='black', linewidth=1))
ax4.text(1.3, 8.4, '🌾 Smart Village App', fontsize=9, fontweight='bold')
ax4.text(1.3, 8.0, 'Build IoT monitoring app', fontsize=7)
ax4.text(1.3, 7.6, 'Difficulty: ⭐⭐⭐', fontsize=7)
ax4.text(1.3, 7.2, '⏱️ 2 days left | 🎁 500 pts', fontsize=7)

ax4.add_patch(mpatches.Rectangle((1, 5.5), 8, 0.8, facecolor='#4ECDC4', edgecolor='black', linewidth=1))
ax4.text(5, 5.9, 'Start Challenge', fontsize=9, ha='center', fontweight='bold', color='white')

ax4.text(5, 3.5, 'CHALLENGES', fontsize=10, ha='center', fontweight='bold', style='italic')

# ---- Screen 5: Developer Tools ----
ax5 = fig.add_subplot(gs[1, 1])
ax5.set_xlim(0, 10)
ax5.set_ylim(0, 14)
ax5.axis('off')

# Phone frame
rect = mpatches.Rectangle((0.5, 0.5), 9, 13, linewidth=3, edgecolor='black', facecolor='white')
ax5.add_patch(rect)

# Status bar
ax5.add_patch(mpatches.Rectangle((0.5, 12.5), 9, 0.8, facecolor='#333333'))
ax5.text(5, 12.9, '9:41  🔋', fontsize=8, ha='center', color='white', fontweight='bold')

# Header
ax5.add_patch(mpatches.Rectangle((0.5, 11.5), 9, 1, facecolor='#90EE90'))
ax5.text(5, 12.2, 'Dev Tools', fontsize=11, ha='center', fontweight='bold')
ax5.text(5, 11.8, 'Productivity', fontsize=8, ha='center')

# Quick actions
ax5.add_patch(mpatches.Rectangle((1, 10.2), 2.3, 0.8, facecolor='#4ECDC4', edgecolor='black', linewidth=1))
ax5.text(2.15, 10.6, '🤖 Generate', fontsize=7, ha='center', fontweight='bold', color='white')

ax5.add_patch(mpatches.Rectangle((3.8, 10.2), 2.3, 0.8, facecolor='#FFE66D', edgecolor='black', linewidth=1))
ax5.text(5.0, 10.6, '🐛 Debug', fontsize=7, ha='center', fontweight='bold')

ax5.add_patch(mpatches.Rectangle((6.5, 10.2), 2.3, 0.8, facecolor='#FFB6C1', edgecolor='black', linewidth=1))
ax5.text(7.65, 10.6, '⚡ Optimize', fontsize=7, ha='center', fontweight='bold')

# Projects
ax5.text(1, 9.3, 'Recent Projects', fontsize=8, fontweight='bold')

ax5.add_patch(mpatches.Rectangle((1, 7.5), 8, 1.5, facecolor='#F0F0F0', edgecolor='black', linewidth=1))
ax5.text(1.3, 8.7, 'E-Commerce API', fontsize=8, fontweight='bold')
ax5.text(1.3, 8.3, 'Django | 85% complete', fontsize=7)
ax5.text(1.3, 7.9, '[Open] [Share] [Deploy]', fontsize=6)

# Stats
ax5.add_patch(mpatches.Rectangle((1, 5.5), 8, 1.8, facecolor='#E6E6FA', edgecolor='black', linewidth=1))
ax5.text(1.3, 7.0, '📊 This Week', fontsize=8, fontweight='bold')
ax5.text(1.3, 6.6, '2,450 lines generated', fontsize=7)
ax5.text(1.3, 6.2, '12 hours saved', fontsize=7)
ax5.text(1.3, 5.8, '8 bugs fixed', fontsize=7)

ax5.text(5, 3.5, 'DEVELOPER TOOLS', fontsize=10, ha='center', fontweight='bold', style='italic')

# ---- Screen 6: Offline Mode ----
ax6 = fig.add_subplot(gs[1, 2])
ax6.set_xlim(0, 10)
ax6.set_ylim(0, 14)
ax6.axis('off')

# Phone frame
rect = mpatches.Rectangle((0.5, 0.5), 9, 13, linewidth=3, edgecolor='black', facecolor='white')
ax6.add_patch(rect)

# Status bar
ax6.add_patch(mpatches.Rectangle((0.5, 12.5), 9, 0.8, facecolor='#333333'))
ax6.text(5, 12.9, '9:41  🔋', fontsize=8, ha='center', color='white', fontweight='bold')

# Header
ax6.add_patch(mpatches.Rectangle((0.5, 11.5), 9, 1, facecolor='#FF6B6B'))
ax6.text(5, 12.2, 'Offline Mode', fontsize=11, ha='center', fontweight='bold', color='white')
ax6.text(5, 11.8, '📡 No Connection', fontsize=8, ha='center', color='white')

# Status
ax6.add_patch(mpatches.Rectangle((1, 10.5), 8, 0.8, facecolor='#FFE66D', edgecolor='black', linewidth=1))
ax6.text(1.3, 10.9, '⚠️ Using cached content', fontsize=7)

# Available content
ax6.text(1, 9.8, 'Available Offline', fontsize=8, fontweight='bold')

ax6.text(1.3, 9.3, '✓ Python Basics (45 MB)', fontsize=7)
ax6.text(1.3, 8.9, '✓ Web Dev (38 MB)', fontsize=7)
ax6.text(1.3, 8.5, '✓ Data Structures (52 MB)', fontsize=7)
ax6.text(1.3, 8.1, '✓ AI Tutor Lite (12 MB)', fontsize=7)

# Storage
ax6.text(1, 7.4, 'Storage Usage', fontsize=8, fontweight='bold')
ax6.add_patch(mpatches.Rectangle((1, 6.8), 8, 0.4, facecolor='#E0E0E0', edgecolor='black', linewidth=1))
ax6.add_patch(mpatches.Rectangle((1, 6.8), 3.1, 0.4, facecolor='#4ECDC4'))
ax6.text(5.5, 7.0, '155 MB / 500 MB', fontsize=7, ha='center')

# Sync status
ax6.add_patch(mpatches.Rectangle((1, 5.5), 8, 1.0, facecolor='#F0F0F0', edgecolor='black', linewidth=1))
ax6.text(1.3, 6.2, 'Last synced: 2 hours ago', fontsize=7)
ax6.text(1.3, 5.8, 'Pending: 3 files', fontsize=7)

ax6.add_patch(mpatches.Rectangle((1, 4.2), 8, 0.8, facecolor='#90EE90', edgecolor='black', linewidth=1))
ax6.text(5, 4.6, 'Sync Now (when online)', fontsize=8, ha='center', fontweight='bold')

ax6.text(5, 3.5, 'OFFLINE MODE', fontsize=10, ha='center', fontweight='bold', style='italic')

plt.savefig('LinguaDev_Wireframes.png', dpi=300, bbox_inches='tight', facecolor='white')
print("✓ Wireframes saved as LinguaDev_Wireframes.png")
plt.close()

print("\n✅ All diagrams generated successfully!")
print("📁 Files created:")
print("   1. LinguaDev_Architecture.png")
print("   2. LinguaDev_UserFlow.png")
print("   3. LinguaDev_Wireframes.png")
