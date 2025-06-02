import ChatSession from "../models/AIModel.js";
import translate from '@vitalets/google-translate-api';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import express from 'express';
const router = express.Router();
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function translateText(text, targetLang = 'hi') {
  try {
    const result = await translate.translate(text, { to: targetLang });
    return result.text;
  } catch (error) {
    console.error('Translation error:', error);
    return 'Translation failed.';
  }
}

//sessionI genereation
router.post('/start-chat', async (req, res) => {
  try {
    const sessionId = uuidv4();

    // Create and save a new chat session document with this sessionId
    const newSession = new ChatSession({ sessionId, inputs: [] });
    await newSession.save();

    return res.status(200).json({ sessionId });
  } catch (error) {
    console.error('Failed to start chat session:', error);
    return res.status(500).json({ error: 'Failed to start chat session' });
  }
});

router.post('/chat', async (req, res) => {
  const { sessionId ,message, imagePath, language } = req.body;
   //console.log("Received data:", req.body);
  if(!sessionId) return res.status(404).json({error:"sessionId is required"});

  if (!message && !imagePath) {
    return res.status(400).json({ error: "Message or image is required." });
  }

  let extractedText = '';
  let fullPrompt = message || '';
   console.log("Full Prompt after OCR:", fullPrompt);
  try {

    let chatSession = await ChatSession.findOne({sessionId});
    if(!chatSession){
      chatSession = new ChatSession({sessionId, inputs:[]});
    }

    if (imagePath) {
        const fullImagePath = path.join(process.cwd(), 'uploads', imagePath);
      //const fullImagePath = path.join(__dirname, 'uploads',imagePath);
      const imageBuffer = fs.readFileSync(fullImagePath);
      const base64Image = imageBuffer.toString('base64');

      const fileExtension = path.extname(imagePath).toLowerCase();
      let mimeType = 'image/jpeg'; // default fallback

      if (fileExtension === '.png') mimeType = 'image/png';
      else if (fileExtension === '.jpg' || fileExtension === '.jpeg') mimeType = 'image/jpeg';
      else if (fileExtension === '.pdf') mimeType = 'application/pdf';

      const ocrResponse = await axios.post(
        'https://api.ocr.space/parse/image',
        new URLSearchParams({
          language: 'eng',
          isOverlayRequired: 'false',
          base64Image: `data:${mimeType};base64,${base64Image}`, 
        }),
        {
          headers: {
            apikey: process.env.OCR_KEY,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
        extractedText = ocrResponse.data?.ParsedResults?.[0]?.ParsedText || '';
        fullPrompt = `The following text was extracted from an image:\n\n"${extractedText}"\n\nUser's question: ${message || ''}`;
        //console.log(fullPrompt);
    }

    chatSession.inputs.push({role:'user', content:fullPrompt});

    // AI request
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: fullPrompt }],
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AI_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.choices && response.data.choices[0]){
    let aiReply = response.data.choices[0].message.content.trim();

    chatSession.inputs.push({role:"assistant", content:aiReply,});
    await chatSession.save();

     const chatHistory = chatSession.inputs.map(msg => ({
      role:msg.role,
      content:msg.content,
    }));

    let finalReplay = aiReply;

    if (language && language !== 'en') {
    finalReplay = await translateText(aiReply, language);
    //console.log("Translated reply:", finalReplay);
  }

    return res.status(200).json({ reply: finalReplay, extractedText: extractedText,history:chatHistory, });
  }else{
    console.error('Invalid AI response:', response.data);
      return res.status(500).json({ error: 'Invalid AI response' });
  }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);

    return res.status(500).json({
      error: 'Failed to process the image or fetch AI response',
      details: error.response ? error.response.data : error.message,
    });
  }
});
  
const chatHistories = {}; 
async function getChatHistory(sessionId) {
  return chatHistories[sessionId] || [];
}

async function saveChatHistory(sessionId, chatHistory) {
  chatHistories[sessionId] = chatHistory;
}

router.get('/history/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  try {
    const chatSession = await ChatSession.findOne({ sessionId });

    if (!chatSession) {
      return res.status(404).json({ error: 'Chat session not found.' });
    }

    res.status(200).json(chatSession.inputs);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.delete('/chat/:sessionId/message/:messageId', async (req, res) => {
  const { sessionId, messageId } = req.params;

  try {
    const session = await ChatSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    const idx = session.inputs.findIndex(input => input._id.toString() === messageId);

    if (idx === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }

    let deleteIndexes = [idx];

    if (session.inputs[idx].role === 'user' && session.inputs[idx + 1]?.role === 'assistant') {

      deleteIndexes.push(idx + 1);
    } else if (session.inputs[idx].role === 'assistant' && session.inputs[idx - 1]?.role === 'user') {

      deleteIndexes.push(idx - 1);
    } else {
      // If no pair found, just delete the single message
      // (optional: handle this case differently)
    }

    deleteIndexes.sort((a, b) => b - a).forEach(i => session.inputs.splice(i, 1));

    await session.save();

    res.status(200).json({ message: 'Messages deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;