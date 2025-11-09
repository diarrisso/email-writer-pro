# 📧 Email Writer Pro

Professional AI-powered email writing assistant with multilingual support (English, German, French).

## 🚀 Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Configure your API key:**
```bash
cp .env.example .env.local
```
Then edit `.env.local` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Open your browser:**
http://localhost:3000

## ✨ Features

- 🤖 AI-powered email generation with Claude Sonnet 4
- 🌍 Multilingual: English, German, French
- 🎨 6 tone options: Professional, Warm, Concise, Formal, Casual, Persuasive
- 📝 Context-aware responses
- ⚡ Fast server-side generation
- 🎯 Keyboard shortcuts (Cmd/Ctrl + Enter)

## 📦 Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Anthropic Claude API
- Lucide Icons

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

Add your `ANTHROPIC_API_KEY` in the Vercel dashboard.

## 📝 License

MIT

---

**Created with ❤️ by your team**
