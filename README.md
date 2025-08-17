# BotBuilder_Game2Lab

## Features

1. Bot Configuration: Customize bot name, persona, model selection, and safety rules
2. Real-time Chat: Smooth chat interface with typing indicators and message timestamps
3. Chat History: View recent conversation logs with truncated summaries
4. Multiple Models: Support for Llama3 and Mistral models via Ollama

## Tech Stack
### Frontend

React 

### Backend Integration

1. Ollama API 
2. REST API

## Prerequisites
Before running this application, make sure you have:

1. Node.js (version 16 or higher)
2. npm
3. Ollama installed and running on your system

### Installing Ollama

1. Visit [Ollama's official website](https://ollama.ai).
2. Download and install Ollama for your operating system.
3. Pull the required models:
   ```bash
   ollama pull llama3
   ollama pull mistral

4. Start the Ollama service:
```bash
ollama serve```


1. Download Node.js: https://nodejs.org/
2. Verify Installation: 
node --version
npm --version
3. Run the application:
   npm run dev
