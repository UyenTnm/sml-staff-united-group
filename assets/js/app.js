function updateBudget(val) {
    const v = parseInt(val);
    document.getElementById('budget-value').textContent = '$' + v.toLocaleString();
    const pct = ((v - 500) / (5000 - 500)) * 100;
    document.getElementById('budget-slider').style.background =
        `linear-gradient(to right, #1A264A 0%, #1A264A ${pct}%, #d5dadf ${pct}%)`;
}

/* checkbox visual state */
document.querySelectorAll('.option-item input').forEach(inp => {
    inp.addEventListener('change', () => {
        if (inp.type === 'radio') {
            document.querySelectorAll(`input[name="${inp.name}"]`).forEach(r => {
                r.closest('.option-item').classList.toggle('checked', r.checked);
            });
        } else {
            inp.closest('.option-item').classList.toggle('checked', inp.checked);
        }
    });
});

/* scroll-reveal */
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            updateProgress();
        }
    });
}, { threshold: 0.12 });
document.querySelectorAll('.section').forEach(s => observer.observe(s));

function updateProgress() {
    const total = document.querySelectorAll('.section').length;
    const visible = document.querySelectorAll('.section.visible').length;
    document.getElementById('progress-label').textContent = `${visible} of ${total} sections`;
    document.getElementById('progress-fill').style.width = ((visible / total) * 100) + '%';
}

/* drag-to-rank */
let dragSrc = null;
const list = document.getElementById('priority-list');
list.querySelectorAll('.priority-item').forEach(item => {
    item.addEventListener('dragstart', () => { dragSrc = item; item.classList.add('dragging'); });
    item.addEventListener('dragend', () => { item.classList.remove('dragging'); updatePriorityNumbers(); });
    item.addEventListener('dragover', e => { e.preventDefault(); if (item !== dragSrc) list.insertBefore(dragSrc, item); });
});
function updatePriorityNumbers() {
    const items = list.querySelectorAll('.priority-item');
    const order = [];
    items.forEach((item, i) => {
        item.querySelector('.priority-num').textContent = i + 1;
        order.push(item.dataset.value);
    });
    document.getElementById('priorities-input').value = order.join(',');
}
updatePriorityNumbers();

/* submit */
async function handleSubmit() {
    const form = document.getElementById('questionnaire');
    const btn = document.querySelector('.submit-btn');

    // Collect all form data
    const data = new FormData(form);
    const payload = { _replyto: data.get('email') || '', _subject: 'SML Brand Discovery Questionnaire — Stacey Martin Lifestyle' };

    // Text inputs & textareas
    form.querySelectorAll('input[name], textarea[name], select[name]').forEach(el => {
        if (el.type === 'checkbox' || el.type === 'radio') return;
        if (el.value) payload[el.name] = el.value;
    });

    // Checkboxes — group by name
    const checkGroups = {};
    form.querySelectorAll('input[type="checkbox"]:checked').forEach(el => {
        if (!checkGroups[el.name]) checkGroups[el.name] = [];
        checkGroups[el.name].push(el.value);
    });
    Object.assign(payload, checkGroups);

    // Priority order
    const priorities = [];
    document.querySelectorAll('.priority-item').forEach(item => {
        priorities.push(item.dataset.value || item.querySelector('.priority-text')?.textContent?.trim());
    });
    if (priorities.length) payload['priorities'] = priorities.join(' → ');

    // Budget slider
    const budgetEl = document.getElementById('budget-display');
    if (budgetEl) payload['budget'] = budgetEl.textContent;

    btn.textContent = 'Sending…';
    btn.style.opacity = '0.6';
    btn.disabled = true;

    try {
        const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzbumZ2nCNNvsFKAd0QxhokoLbtqAGQAn_zNfphAiR47Mmi1TJ-nGOPHGsdqXX-M0cD5g/exec';

        const res = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload),
        });

        if (res.ok || res.type === 'opaque') {
            form.style.display = 'none';
            document.getElementById('success').style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            throw new Error('Server error');
        }
    } catch (err) {
        btn.textContent = 'Send to STAFF United team →';
        btn.style.opacity = '1';
        btn.disabled = false;
        alert('There was a problem sending your answers. Please try again or contact info@staffunitedgroup.com.');
    }
}

/* init budget display */
updateBudget(1000);