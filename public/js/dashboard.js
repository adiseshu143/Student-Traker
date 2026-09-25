/**
 * Dashboard – client-side JavaScript
 * Handles: task input validation, delete confirm,
 *          Chart.js charts, and the task calendar.
 */

/* ============================================================
   TASK FORM VALIDATION
   ============================================================ */

const taskCreateForm = document.getElementById('taskCreateForm');
const taskTitleInput = document.getElementById('taskTitle');
const taskInputError = document.getElementById('taskInputError');

if (taskCreateForm && taskTitleInput) {
  taskCreateForm.addEventListener('submit', function (e) {
    if (!taskTitleInput.value.trim()) {
      e.preventDefault();
      taskInputError.style.display = 'flex';
      taskTitleInput.style.borderColor = 'var(--error)';
      taskTitleInput.focus();
    }
  });

  taskTitleInput.addEventListener('input', function () {
    if (taskTitleInput.value.trim()) {
      taskInputError.style.display = 'none';
      taskTitleInput.style.borderColor = '';
    }
  });
}

function confirmDelete() {
  return confirm('Delete this task? This cannot be undone.');
}

// Show query-param errors (?error=empty)
(function () {
  const params = new URLSearchParams(window.location.search);
  const err = params.get('error');
  const box = document.getElementById('taskAlert');
  const msg = document.getElementById('taskAlertMsg');
  if (err && box && msg) {
    const messages = {
      empty: 'Please enter a task title.',
      create: 'Something went wrong. Please try again.',
    };
    msg.textContent = messages[err] || 'Something went wrong.';
    box.style.display = 'flex';
    window.history.replaceState({}, document.title, window.location.pathname);
  }
})();

/* ============================================================
   CHART.JS – DAILY PROGRESS (LINE CHART)
   ============================================================ */

const dailyCtx = document.getElementById('dailyChart');
if (dailyCtx && typeof DAILY_LABELS !== 'undefined') {
  new Chart(dailyCtx, {
    type: 'line',
    data: {
      labels: DAILY_LABELS,
      datasets: [{
        label: 'Tasks Completed',
        data: DAILY_COUNTS,
        borderColor: '#16A34A',
        backgroundColor: '#16A34A',   // solid — no gradient
        borderWidth: 2,
        pointBackgroundColor: '#16A34A',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.3,
        fill: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#111827',
          titleColor: '#ffffff',
          bodyColor: '#D1FAE5',
          cornerRadius: 6,
          padding: 10,
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.y} task${ctx.parsed.y !== 1 ? 's' : ''} completed`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: '#F3F4F6' },
          ticks: {
            color: '#6B7280',
            font: { family: 'Inter', size: 11 },
            maxRotation: 30,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#6B7280',
            font: { family: 'Inter', size: 11 },
            stepSize: 1,
            callback: (val) => Number.isInteger(val) ? val : '',
          },
          grid: { color: '#F3F4F6' },
        },
      },
    },
  });
}

/* ============================================================
   CHART.JS – TASK STATUS (DOUGHNUT CHART)
   ============================================================ */

const statusCtx = document.getElementById('statusChart');
if (statusCtx && typeof COMPLETED_COUNT !== 'undefined') {
  const total = COMPLETED_COUNT + PENDING_COUNT;
  new Chart(statusCtx, {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'Pending'],
      datasets: [{
        data: total > 0 ? [COMPLETED_COUNT, PENDING_COUNT] : [1, 0],
        backgroundColor: total > 0 ? ['#16A34A', '#D1D5DB'] : ['#E5E7EB', '#E5E7EB'],
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 3,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#111827',
          titleColor: '#ffffff',
          bodyColor: '#D1FAE5',
          cornerRadius: 6,
          padding: 10,
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.parsed} task${ctx.parsed !== 1 ? 's' : ''}`,
          },
        },
      },
    },
  });
}

/* ============================================================
   CALENDAR
   ============================================================ */

// State
let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth(); // 0-indexed
let selectedDateStr = null; // 'YYYY-MM-DD'

// ALL_TASKS is injected from the EJS template as a global array
// Each item: { _id, title, completed, dueDate }  (dueDate is 'YYYY-MM-DD' or null)

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  const label = document.getElementById('calMonthLabel');
  if (!grid || !label) return;

  label.textContent = `${MONTH_NAMES[calMonth]} ${calYear}`;

  const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const todayStr = new Date().toISOString().slice(0, 10);

  // Build a map: 'YYYY-MM-DD' -> array of tasks
  const tasksByDate = {};
  ALL_TASKS.forEach((task) => {
    if (task.dueDate) {
      if (!tasksByDate[task.dueDate]) tasksByDate[task.dueDate] = [];
      tasksByDate[task.dueDate].push(task);
    }
  });

  let html = '';

  // Empty cells before the first day
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="cal-day cal-day-empty"></div>';
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(calMonth + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateStr = `${calYear}-${mm}-${dd}`;

    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDateStr;
    const dayTasks = tasksByDate[dateStr] || [];
    const pendingCount = dayTasks.filter((t) => !t.completed).length;
    const doneCount = dayTasks.filter((t) => t.completed).length;

    let classes = 'cal-day';
    if (isToday) classes += ' cal-day-today';
    if (isSelected) classes += ' cal-day-selected';

    html += `<div class="${classes}" data-date="${dateStr}" onclick="selectCalDate('${dateStr}')">
      <span class="cal-day-num">${d}</span>`;

    if (dayTasks.length > 0) {
      html += '<div class="cal-day-dots">';
      if (pendingCount > 0) html += `<span class="cal-dot cal-dot-pending" title="${pendingCount} pending"></span>`;
      if (doneCount > 0)   html += `<span class="cal-dot cal-dot-done" title="${doneCount} completed"></span>`;
      html += '</div>';
    }

    html += '</div>';
  }

  grid.innerHTML = html;
}

function selectCalDate(dateStr) {
  selectedDateStr = dateStr;
  renderCalendar(); // re-render to update selected highlight

  // Show selected date label
  const d = new Date(dateStr + 'T00:00:00'); // local time parse
  const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  document.getElementById('calDetailDate').textContent = d.toLocaleDateString('en-US', options);

  // Set due date on the calendar add-form hidden input
  const dueDateInput = document.getElementById('calDueDateInput');
  if (dueDateInput) dueDateInput.value = dateStr;

  // Filter tasks for this date
  const dayTasks = ALL_TASKS.filter((t) => t.dueDate === dateStr);

  const listEl = document.getElementById('calTaskList');
  const emptyEl = document.getElementById('calDetailEmpty');
  const addFormEl = document.getElementById('calAddTaskForm');

  listEl.innerHTML = '';

  if (dayTasks.length === 0) {
    listEl.style.display = 'none';
    emptyEl.style.display = 'flex';
    emptyEl.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <p>No tasks for this date.</p>`;
  } else {
    emptyEl.style.display = 'none';
    listEl.style.display = 'block';
    dayTasks.forEach((task) => {
      const li = document.createElement('li');
      li.className = 'cal-task-item' + (task.completed ? ' cal-task-done' : '');
      li.innerHTML = `
        <span class="cal-task-indicator">${task.completed ? '✓' : '○'}</span>
        <span class="cal-task-text">${escapeHtml(task.title)}</span>`;
      listEl.appendChild(li);
    });
  }

  addFormEl.style.display = 'block';
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Month navigation
document.getElementById('prevMonth').addEventListener('click', function () {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  selectedDateStr = null;
  resetCalDetail();
  renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', function () {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  selectedDateStr = null;
  resetCalDetail();
  renderCalendar();
});

function resetCalDetail() {
  document.getElementById('calDetailDate').textContent = 'Select a date';
  document.getElementById('calTaskList').style.display = 'none';
  document.getElementById('calTaskList').innerHTML = '';
  document.getElementById('calAddTaskForm').style.display = 'none';
  const emptyEl = document.getElementById('calDetailEmpty');
  emptyEl.style.display = 'flex';
  emptyEl.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
    <p>Click a date to see tasks</p>`;
}

// Initial render
renderCalendar();
