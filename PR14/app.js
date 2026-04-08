const form = document.getElementById('note-form');
const input = document.getElementById('note-input');
const list = document.getElementById('notes-list');
const banner = document.getElementById('offline-banner');
const emptyMsg = document.getElementById('empty-msg');

window.addEventListener('online',  () => banner.style.display = 'none');
window.addEventListener('offline', () => banner.style.display = 'block');
if (!navigator.onLine) banner.style.display = 'block';

function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    list.innerHTML = notes.map((note, index) => `
        <li>
            <span>${note}</span>
            <button class="btn-delete" data-index="${index}" title="Удалить">&times;</button>
        </li>
    `).join('');
    emptyMsg.style.display = notes.length === 0 ? 'block' : 'none';

    list.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteNote(Number(btn.dataset.index)));
    });
}

function addNote(text) {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    notes.push(text);
    localStorage.setItem('notes', JSON.stringify(notes));
    loadNotes();
}
function deleteNote(index) {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    loadNotes();
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) {
        addNote(text);
        input.value = '';
    }
});

loadNotes();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('./sw.js');
            console.log('ServiceWorker зарегистрирован:', registration.scope);
        } catch (err) {
            console.error('Ошибка регистрации ServiceWorker:', err);
        }
    });
}
