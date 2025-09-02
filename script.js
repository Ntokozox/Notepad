document.addEventListener('DOMContentLoaded', () => {
    const noteInput = document.getElementById('note-input');
    const reminderInput = document.getElementById('reminder-input');
    const saveBtn = document.getElementById('save-btn');
    const notesList = document.getElementById('notes-list');

    // Load existing notes from local storage
    const getNotes = () => {
        const notes = localStorage.getItem('notes');
        return notes ? JSON.parse(notes) : [];
    };

    // Save notes to local storage
    const saveNotes = (notes) => {
        localStorage.setItem('notes', JSON.stringify(notes));
    };

    // Render notes to the screen
    const renderNotes = () => {
        const notes = getNotes();
        notesList.innerHTML = ''; // Clear the list before rendering
        if (notes.length === 0) {
            notesList.innerHTML = '<p>No notes yet. Add one above!</p>';
            return;
        }

        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('note-item');

            const contentElement = document.createElement('div');
            contentElement.classList.add('content');
            contentElement.textContent = note.text;

            if (note.reminder) {
                const reminderElement = document.createElement('div');
                reminderElement.classList.add('reminder');
                // Format date for better readability
                const reminderDate = new Date(note.reminder);
                reminderElement.textContent = `🔔 Reminder: ${reminderDate.toLocaleString()}`;
                contentElement.appendChild(reminderElement);
            }
            
            noteElement.appendChild(contentElement);

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.innerHTML = '&times;';
            deleteBtn.addEventListener('click', () => {
                deleteNote(note.id);
            });

            noteElement.appendChild(deleteBtn);
            notesList.appendChild(noteElement);
        });
    };

    // Add a new note
    const addNote = () => {
        const text = noteInput.value.trim();
        const reminder = reminderInput.value;

        if (text === '') {
            alert('Please write a note before saving.');
            return;
        }

        const notes = getNotes();
        const newNote = {
            id: Date.now(), // Simple unique ID
            text: text,
            reminder: reminder || null, // Store reminder if set
            reminderFired: false // To prevent duplicate notifications
        };

        notes.unshift(newNote); // Add new note to the beginning of the array
        saveNotes(notes);

        // Clear input fields
        noteInput.value = '';
        reminderInput.value = '';

        renderNotes();
    };

    // Delete a note
    const deleteNote = (id) => {
        let notes = getNotes();
        notes = notes.filter(note => note.id !== id);
        saveNotes(notes);
        renderNotes();
    };

    // Check for reminders
    const checkReminders = () => {
        const notes = getNotes();
        const now = new Date();

        notes.forEach(note => {
            if (note.reminder && !note.reminderFired) {
                const reminderTime = new Date(note.reminder);
                if (now >= reminderTime) {
                    // Trigger notification
                    notifyUser(note.text);
                    // Mark as fired
                    note.reminderFired = true;
                }
            }
        });

        saveNotes(notes); // Save the updated 'reminderFired' status
    };

    // Function to show a browser notification
    const notifyUser = (noteText) => {
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        } else if (Notification.permission === "granted") {
            new Notification("Note Reminder!", {
                body: noteText,
                icon: "https://cdn-icons-png.flaticon.com/512/1041/1041834.png" // A generic notification icon
            });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("Note Reminder!", { body: noteText });
                }
            });
        }
    };
    
    // Event Listeners
    saveBtn.addEventListener('click', addNote);

    // Initial setup
    renderNotes();
    // Check for reminders every 10 seconds
    setInterval(checkReminders, 10000);
    // Ask for notification permission on load
    Notification.requestPermission();
});