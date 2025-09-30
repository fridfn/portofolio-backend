import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import Subscription from './api/subscription.js'
import Notification from './api/notification.js'
import Checkemail from './api/checkemail.js';
import Broadcast from './api/broadcast.js';
import Feedback from './api/feedback.js';
import Message from './api/user/message.js';
import Register from './api/user/register.js';
import Activity from './api/user/activity.js';
import Role from './api/user/role.js';
//import Role from './api/user/[uid]/role.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/api/feedback', Feedback);
app.post('/api/broadcast', Broadcast);
app.post('/api/checkemail', Checkemail);
app.post('/api/user/register', Register);
app.post('/api/user/activity', Activity);
app.patch('/api/user/:uid/role', Role);
app.post('/api/subscription', Subscription);
app.post('/api/notification', Notification);
app.post('/api/user/:uid/message', Message);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));