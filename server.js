require('dotenv').config();

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require("fs");
// const path = require("path");
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Expanded list of idioms and informal phrases
const idioms = [
    "A blessing in disguise",
    "Break the ice",
    "Hit the nail on the head",
    "Speak of the devil",
    "Once in a blue moon",
  
];


// Function to introduce random spelling/grammar errors
const introduceErrors = (text) => {
    const errors = [
        { pattern: /their/g, replacement: "there" },
        { pattern: /it's/g, replacement: "its" },
        { pattern: /affect/g, replacement: "effect" },
        { pattern: /too/g, replacement: "to" },
        { pattern: /lose/g, replacement: "loose" },
        
    ];
    return errors.reduce((result, { pattern, replacement }) => result.replace(pattern, replacement), text);
};


// Function to add slight conversational filler
const addFillerWords = (text) => {
    const fillers = [
       "you know,", "well,", "basically,", "to be honest,", "like I said,", 
       "I guess,", "sort of,", "actually,", "you see,", "just saying,", 
       "I mean,", "kind of,", "right?", "to be fair,", "honestly,", 
       "if you ask me,", "so,", "anyway,", "you know what I mean?", 
       "let’s be real,", "truth be told,", "the thing is,", "at the end of the day,", 
    ];

    const sentences = text.split('.');
    return sentences.map(sentence => {
        if (Math.random() < 0.35) {
            const randomFiller = fillers[Math.floor(Math.random() * fillers.length)];
            return `${randomFiller} ${sentence}`;
        }
        return sentence;
    }).join('. ');
};

// More aggressive sentence randomization
const adjustSentenceStructure = (text) => {
    let sentences = text.split('.');
    sentences = sentences.map(sentence => {
        if (Math.random() > 0.6) {
            return sentence + '. ' + sentences[Math.floor(Math.random() * sentences.length)];  // Insert random sentences from other parts of the text
        }
        if (sentence.length > 15 && Math.random() < 0.5) {
            return sentence.slice(0, sentence.length / 2) + '. ' + sentence.slice(sentence.length / 2);  // Split long sentences
        }
        return sentence;
    });
    return sentences.join('. ');
};

// Insert idioms and informal phrases at random positions
const addIdiomsAndPhrases = (text) => {
    const randomIdiom = idioms[Math.floor(Math.random() * idioms.length)];
    const sentences = text.split('.');
    const insertIndex = Math.floor(Math.random() * sentences.length);
    sentences.splice(insertIndex, 0, randomIdiom);
    return sentences.join('. ');
};

// Stronger paraphrasing with more variability
const aggressiveParaphrase = (text) => {
    return text
        .replace(/important/g, "crucial")
        .replace(/difficult/g, "challenging")
        .replace(/think/g, "believe")
        .replace(/result/g, "outcome")
        .replace(/shows/g, "demonstrates")
        .replace(/However,/g, "Nonetheless,")
        .replace(/Furthermore,/g, "Moreover,")
        .replace(/Moreover,/g, "In addition,")
        .replace(/benefits/g, "advantages")
        .replace(/utilize/g, "use")
        .replace(/obtain/g, "get")
        .replace(/start/g, "begin")
        .replace(/end/g, "conclude")
        .replace(/suggest/g, "propose")
        .replace(/happy/g, "content")
        .replace(/sad/g, "unhappy");
};
// Function to split long input text into smaller chunks
const splitIntoChunks = (text, chunkSize) => {
    const words = text.split(/\s+/);
    let chunks = [];
    for (let i = 0; i < words.length; i += chunkSize) {
        chunks.push(words.slice(i, i + chunkSize).join(' '));
    }
    return chunks;
};

// Function to process each chunk and concatenate the final result
const processInChunks = async (inputText, keywords) => {
    const chunks = splitIntoChunks(inputText, 150);
    let finalResult = '';

    for (const chunk of chunks) {
        let chunkHumanized = humanizeTextLocally(chunk);
        let refinedChunk = await fetchValidatedText(chunkHumanized, keywords);
        finalResult += ' ' + refinedChunk;
    }

    return finalResult.trim();
};

// Applying all transformations for humanization
const humanizeTextLocally = (inputText) => {
    let text = introduceErrors(inputText);            // Step 1: Introduce random errors
    text = addFillerWords(text);                      // Step 2: Add conversational fillers
    text = adjustSentenceStructure(text);             // Step 3: Randomize sentence structure
    text = aggressiveParaphrase(text);                // Step 4: Aggressively paraphrase content
    text = addIdiomsAndPhrases(text);                 // Step 5: Insert idioms and phrases
    return text;
};

// OpenAI API function for final refinements with corrected randomness
const fetchValidatedText = async (inputText,keywords = []) => {
    const url = 'https://api.openai.com/v1/chat/completions';
    const headers = {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
    };

    const requestData = {
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'user',
                content: `Refine this text to sound natural, professional, and human-like. Ensure AI detection tools find it indistinguishable from human writing. ${
                    keywords.length > 0 ? ` strictly Integrate the following keywords naturally into the content, maintaining coherence and flow: ${keywords.join(', ')}.` : ''
                }\n\n${inputText}`
            }
        ],
        max_tokens: 3048,
        temperature: Math.random() * 0.5 + 0.7,
        top_p: Math.min(Math.random() * 0.4 + 0.6, 1),
        frequency_penalty: 1.5,
        presence_penalty: 1.7
    };

    try {
        const response = await axios.post(url, requestData, { headers });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch validated text');
    }
};

// Function to calculate AI-generated content percentage
const calculateAIGeneratedPercentage = (originalText, humanizedText) => {
    const originalWords = originalText.split(/\s+/);
    const humanizedWords = humanizedText.split(/\s+/);
    let unchangedWords = 0;

    // Count how many words remained the same
    for (let i = 0; i < Math.min(originalWords.length, humanizedWords.length); i++) {
        if (originalWords[i] === humanizedWords[i]) {
            unchangedWords++;
        }
    }

    // Calculate percentage of AI-generated (unchanged) content
    const aiGeneratedPercentage = (unchangedWords / originalWords.length) * 100;
    return aiGeneratedPercentage.toFixed(2); // Return a percentage with 2 decimal places
};

app.post('/humanize', async (req, res) => {
    const { inputText, keywords = [] } = req.body; // Ensure keywords is always an array

    if (!inputText || inputText.trim() === '') {
        return res.status(400).json({ error: 'Input text cannot be empty' });
    }

    try {
        let humanizedText = humanizeTextLocally(inputText);
        const finalText = await fetchValidatedText(humanizedText, keywords);

        const aiGeneratedPercentage = calculateAIGeneratedPercentage(inputText, finalText);
        const humanizedPercentage = (100 - aiGeneratedPercentage).toFixed(2);

        res.json({ 
            transformedText: finalText,
            aiGeneratedPercentage,
            humanizedPercentage
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to humanize text' });
    }
});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// ==========================


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

