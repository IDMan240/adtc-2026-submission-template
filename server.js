import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { LlamaModel, LlamaContext, LlamaChatSession } from "node-llama-cpp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

// Serve static frontend files (HTML/CSS/JS) from a 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const MODEL_PATH = path.join(__dirname, "model", "SmolLM2-135M-Instruct-Q4_K_M.gguf");

if (!fs.existsSync(MODEL_PATH)) {
    console.error(`[-] Model weight file missing at ${MODEL_PATH}. Run download_model.sh first.`);
    process.exit(1);
}

// Initialize llama.cpp model inside the 8GB RAM laptop profile constraints
console.log("[+] Loading offline SmolLM2 engine...");
const model = new LlamaModel({ modelPath: MODEL_PATH });
const context = new LlamaContext({ model, contextSize: 2048 });
const session = new LlamaChatSession({
    contextSequence: context.getSequence(),
    systemPrompt: "You are a concise, brilliant programming assistant. Provide clean code snippets and direct optimization explanations."
});

// API endpoint for your JavaScript frontend to call
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        const response = await session.prompt(prompt, { maxTokens: 400 });
        res.json({ text: response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`[+] Interface ready! Open http://localhost:${PORT} in your browser.`));
