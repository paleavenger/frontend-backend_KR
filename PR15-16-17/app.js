const contentDiv = document.getElementById('app-content');
const homeBtn    = document.getElementById('home-btn');
const aboutBtn   = document.getElementById('about-btn');
const banner     = document.getElementById('offline-banner');
const toast      = document.getElementById('ws-toast');
const enableBtn  = document.getElementById('enable-push');
const disableBtn = document.getElementById('disable-push');

// Офлайн-баннер
window.addEventListener('online',  () => banner.style.display = 'none');
window.addEventListener('offline', () => banner.style.display = 'block');
if (!navigator.onLine) banner.style.display = 'block';

// Навигация
function setActive(activeBtn) {
    [homeBtn, aboutBtn].forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

// Скелетон пока грузится контент
function showSkeleton() {
    contentDiv.innerHTML = `
        <div class="skeleton" style="width:60%; height:16px;"></div>
        <div class="skeleton" style="height:44px;"></div>
        <div class="skeleton" style="height:52px;"></div>
        <div class="skeleton" style="height:52px;"></div>
        <div class="skeleton" style="width:80%; height:52px;"></div>
    `;
}

async function loadContent(page) {
    showSkeleton();
    try {
        const res  = await fetch(`/content/${page}.html`);
        const html = await res.text();
        contentDiv.innerHTML = html;
        if (page === 'home') initNotes();
    } catch (err) {
        console.error('loadContent error:', err);
        contentDiv.innerHTML = `<p style="color:#f87171; text-align:center; margin-top:40px;">Ошибка загрузки страницы</p>`;
    }
}

homeBtn.addEventListener('click', () => {
    setActive(homeBtn);
    loadContent('home');
});

aboutBtn.addEventListener('click', () => {
    setActive(aboutBtn);
    loadContent('about');
});

loadContent('home');

const socket = io('https://localhost:3000');

socket.on('connect', () => console.log('WS подключён:', socket.id));

socket.on('taskAdded', task => {
    showToast(`Новая задача: ${task.text}`);
    const list = document.getElementById('notes-list');
    if (list) addNoteToStorage(task.text, null);
});

function showToast(msg) {
    toast.textContent = msg;
    toast.style.display = 'block';
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => { toast.style.display = 'none'; }, 3500);
}

function addNoteToStorage(text, reminderTimestamp) {
    const notes   = JSON.parse(localStorage.getItem('notes') || '[]');
    const newNote = { id: Date.now(), text, reminder: reminderTimestamp };
    notes.push(newNote);
    localStorage.setItem('notes', JSON.stringify(notes));
    return newNote;
}

function initNotes() {
    const form         = document.getElementById('note-form');
    const input        = document.getElementById('note-input');
    const reminderForm = document.getElementById('reminder-form');
    const reminderText = document.getElementById('reminder-text');
    const reminderTime = document.getElementById('reminder-time');
    const list         = document.getElementById('notes-list');
    const emptyMsg     = document.getElementById('empty-msg');

    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        list.innerHTML = notes.map((note, i) => {
            // Поддержка старого формата (строка) и нового (объект)
            const text     = typeof note === 'string' ? note : note.text;
            const reminder = typeof note === 'object'  ? note.reminder : null;
            let reminderBadge = '';
            if (reminder) {
                const d = new Date(reminder);
                reminderBadge = `<span style="font-size:12px; color:#34d399; margin-left:10px;">⏰ ${d.toLocaleString()}</span>`;
            }
            return `
            <li>
                <span>${text}${reminderBadge}</span>
                <button class="btn-delete" data-index="${i}">&times;</button>
            </li>`;
        }).join('');
        if (emptyMsg) emptyMsg.style.display = notes.length === 0 ? 'block' : 'none';

        list.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const notes = JSON.parse(localStorage.getItem('notes') || '[]');
                notes.splice(Number(btn.dataset.index), 1);
                localStorage.setItem('notes', JSON.stringify(notes));
                loadNotes();
            });
        });
    }

    // Обычная заметка
    form.addEventListener('submit', e => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        addNoteToStorage(text, null);
        input.value = '';
        loadNotes();
        socket.emit('newTask', { text, timestamp: Date.now() });
    });

    // Заметка с напоминанием
    reminderForm.addEventListener('submit', e => {
        e.preventDefault();
        const text     = reminderText.value.trim();
        const datetime = reminderTime.value;
        if (!text || !datetime) return;
        const timestamp = new Date(datetime).getTime();
        if (timestamp <= Date.now()) {
            alert('Дата напоминания должна быть в будущем');
            return;
        }
        const newNote = addNoteToStorage(text, timestamp);
        reminderText.value = '';
        reminderTime.value = '';
        loadNotes();
        socket.emit('newReminder', {
            id:           newNote.id,
            text:         text,
            reminderTime: timestamp
        });
    });

    loadNotes();
}

let swReg = null;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            swReg = await navigator.serviceWorker.register('/sw.js');
            console.log('SW зарегистрирован:', swReg.scope);
            updatePushButtons();
        } catch (err) {
            console.error('Ошибка регистрации SW:', err);
        }
    });
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

async function getVapidKey() {
    const res = await fetch('/vapid-public-key');
    const { key } = await res.json();
    return key;
}

async function updatePushButtons() {
    if (!swReg) return;
    const sub = await swReg.pushManager.getSubscription();
    enableBtn.style.display  = sub ? 'none'         : 'inline-block';
    disableBtn.style.display = sub ? 'inline-block' : 'none';
}

enableBtn.addEventListener('click', async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            alert('Разрешение на уведомления отклонено');
            return;
        }
        const vapidKey = await getVapidKey();
        const sub = await swReg.pushManager.subscribe({
            userVisibleOnly:      true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });
        await fetch('/subscribe', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(sub)
        });
        console.log('Push-подписка оформлена');
        updatePushButtons();
    } catch (err) {
        console.error('Ошибка подписки:', err);
    }
});

disableBtn.addEventListener('click', async () => {
    try {
        const sub = await swReg.pushManager.getSubscription();
        if (sub) {
            await fetch('/unsubscribe', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ endpoint: sub.endpoint })
            });
            await sub.unsubscribe();
        }
        console.log('Push-подписка отменена');
        updatePushButtons();
    } catch (err) {
        console.error('Ошибка отписки:', err);
    }
});
