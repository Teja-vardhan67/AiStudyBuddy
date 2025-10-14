// server.js
// Import necessary modules
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

// Load environment variables from a .env file
dotenv.config();

// Create a new instance of the OpenAI client, configured for OpenRouter
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

// Create the Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Basic route to check if the server is running
app.get('/api/status', (req, res) => {
    res.json({ message: 'Server is running successfully!' });
});

// A simple, insecure login endpoint for educational purposes
// A simple, insecure login endpoint for demonstration
app.post('/api/login', (req, res) => {
    // For demonstration, we'll always return a successful response
    // In a real application, you would check credentials against a database
    res.json({ success: true, message: 'Login successful!' });
});

// AI Endpoint for explaining a concept
app.post('/api/explain', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    try {
        // Call the OpenRouter API to get a simple explanation
        const completion = await openai.chat.completions.create({
            model: "deepseek/deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful study buddy. Explain complex concepts in simple, easy-to-understand terms. Use analogies and examples relevant to students.",
                },
                {
                    role: "user",
                    content: `Explain the following concept: ${prompt}`,
                },
            ],
            temperature: 0.7,
            max_tokens: 250,
        });

        const aiResponse = completion.choices[0].message.content;

        // Send the AI's response back to the front-end
        res.json({ response: aiResponse });

    } catch (error) {
        console.error('Error calling OpenRouter API:', error.message);
        res.status(500).json({ error: 'Failed to get a response from the AI.' });
    }
});


// AI Endpoint for generating a quiz
app.post('/api/quiz', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Quiz notes are required.' });
    }

    try {
        // Call the OpenRouter API to generate a quiz
        const completion = await openai.chat.completions.create({
            model: "deepseek/deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: "You are a professional quiz creator. Generate a 5-question multiple-choice quiz based on the user's notes. For each question, provide 4 options (A, B, C, D) and then a separate line stating the correct answer. The quiz should be formatted as follows: 'Question 1: [Question Text]\\n[Option A]\\n[Option B]\\n[Option C]\\n[Option D]\\nCorrect Answer: [Answer Letter]'. Do NOT include any extra text, headings, bolding, or emojis.",
                },
                {
                    role: "user",
                    content: `Generate a quiz based on these notes: ${prompt}`,
                },
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        const aiResponse = completion.choices[0].message.content;

        // Send the AI's response back to the front-end
        res.json({ response: aiResponse });

    } catch (error) {
        console.error('Error calling OpenRouter API for quiz:', error.message);
        res.status(500).json({ error: 'Failed to generate quiz.' });
    }
});
// AI Endpoint for summarizing notes
app.post('/api/summarize', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Notes are required for summarization.' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "deepseek/deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: "You are a professional summarizer. Your task is to condense the provided text into a concise and easy-to-read summary. Highlight key points and use a clear, direct style.",
                },
                {
                    role: "user",
                    content: `Summarize the following notes: ${prompt}`,
                },
            ],
            temperature: 0.5,
            max_tokens: 300,
        });

        const aiResponse = completion.choices[0].message.content;

        res.json({ response: aiResponse });

    } catch (error) {
        console.error('Error calling OpenRouter API for summary:', error.message);
        res.status(500).json({ error: 'Failed to generate summary.' });
    }
});
// AI Endpoint for generating flashcards
app.post('/api/flashcards', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Notes are required to generate flashcards.' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "deepseek/deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: "You are a professional flashcard generator. Your task is to create 5 flashcards based on the provided notes. For each flashcard, provide a term and its definition. The format should be 'Term: [Term]\nDefinition: [Definition]'. Do not include any extra text, headings, or bolding.",
                },
                {
                    role: "user",
                    content: `Generate flashcards from these notes: ${prompt}`,
                },
            ],
            temperature: 0.7,
            max_tokens: 350,
        });

        const aiResponse = completion.choices[0].message.content;

        res.json({ response: aiResponse });

    } catch (error) {
        console.error('Error calling OpenRouter API for flashcards:', error.message);
        res.status(500).json({ error: 'Failed to generate flashcards.' });
    }
});
// AI Endpoint for a chat conversation
app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Chat message is required.' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "deepseek/deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: "You are a friendly and knowledgeable AI assistant. Answer user questions concisely and helpfully. You can act as a tutor, a study guide, or a fact-checker.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.8,
            max_tokens: 200,
        });

        const aiResponse = completion.choices[0].message.content;

        res.json({ response: aiResponse });

    } catch (error) {
        console.error('Error calling OpenRouter API for chat:', error.message);
        res.status(500).json({ error: 'Failed to get a response from the AI.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});