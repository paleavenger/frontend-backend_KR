const express    = require('express');
const https      = require('https');
const socketIo   = require('socket.io');
const webpush    = require('web-push');
const bodyParser = require('body-parser');
const cors       = require('cors');
const path       = require('path');
const fs         = require('fs');

const vapidKeys = {
    publicKey:  'BIISz2hm10yKw84Wb2e-dTLcQJllX57DTFOdsXgmtypIni75UOpzO0PkJ4W994zFwudBBTSBOn5WVEk3nKrl5Cw',
    privateKey: 'nWbzKesgDTXjKvEBC3mlTm7wvdQ6W3O8ZmtxGEFnIzI'
};

webpush.setVapidDetails(
    'mailto:admin@tasks.app',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './')));

let subscriptions = [];

const reminders = new Map();

const sslOptions = {
    key:  fs.readFileSync(path.join(__dirname, 'localhost+2-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'localhost+2.pem'))
};

const server = https.createServer(sslOptions, app);
const io = socketIo(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

function sendPush(payload) {
    subscriptions.forEach(sub => {
        webpush.sendNotification(sub, payload)
            .catch(err => console.error('Push error:', err.statusCode));
    });
}

io.on('connection', (socket) => {
    console.log('Клиент подключён:', socket.id);

    socket.on('newTask', (task) => {
        socket.broadcast.emit('taskAdded', task);
        sendPush(JSON.stringify({ title: 'Новая задача', body: task.text }));
    });

    socket.on('newReminder', (reminder) => {
        const { id, text, reminderTime } = reminder;
        const delay = reminderTime - Date.now();
        if (delay <= 0) return;

        const timeoutId = setTimeout(() => {
            sendPush(JSON.stringify({ title: '!!! Напоминание', body: text, reminderId: id }));
            reminders.delete(id);
        }, delay);

        reminders.set(id, { timeoutId, text, reminderTime });
        console.log(`Напоминание запланировано: "${text}" через ${Math.round(delay / 1000)}с`);
    });

    socket.on('disconnect', () => {
        console.log('Клиент отключён:', socket.id);
    });
});

app.post('/subscribe', (req, res) => {
    subscriptions = subscriptions.filter(s => s.endpoint !== req.body.endpoint);
    subscriptions.push(req.body);
    console.log(`Подписка сохранена. Всего: ${subscriptions.length}`);
    res.status(201).json({ message: 'Подписка сохранена' });
});

app.post('/unsubscribe', (req, res) => {
    const { endpoint } = req.body;
    subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
    res.status(200).json({ message: 'Подписка удалена' });
});

app.get('/vapid-public-key', (req, res) => {
    res.json({ key: vapidKeys.publicKey });
});

app.post('/snooze', (req, res) => {
    const reminderId = parseInt(req.query.reminderId, 10);

    if (!reminderId || !reminders.has(reminderId)) {
        return res.status(404).json({ error: 'Reminder not found' });
    }

    const reminder = reminders.get(reminderId);
    clearTimeout(reminder.timeoutId);

    const newDelay    = 5 * 60 * 1000; // 5 минут
    const newTimeoutId = setTimeout(() => {
        const payload = JSON.stringify({
            title:      'Напоминание отложено',
            body:       reminder.text,
            reminderId: reminderId
        });

        sendPush(payload);
        reminders.delete(reminderId);
    }, newDelay);

    reminders.set(reminderId, {
        timeoutId:    newTimeoutId,
        text:         reminder.text,
        reminderTime: Date.now() + newDelay
    });

    console.log(`Напоминание ${reminderId} отложено на 5 минут`);
    res.status(200).json({ message: 'Reminder snoozed for 5 minutes' });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на https://localhost:${PORT}`);
});
