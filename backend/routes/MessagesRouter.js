import express from 'express';
import { SendMessage, getMessages, DeleteMessage, DeleteAllMessages } from '../controllers/MessagesController.js';
const router = express.Router();

router.post('/SendMessage', SendMessage);
router.get('/getMessages/:otherUserId', getMessages);
router.delete('/DeleteMessage/:messageId', DeleteMessage);
router.delete('/DeleteAllMessages/:userId', DeleteAllMessages);

export default router;