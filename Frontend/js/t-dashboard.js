// teacher/teacher.js
// Shared JS for Teacher pages (state, persistence, render helpers, modals, import/export)
// Place this file at teacher/teacher.js and ensure every teacher/*.html includes: <script src="teacher.js"></script>

(function () {
  // ---- Config / Storage ----
  const STORAGE_KEY = 'smartedu_data_v1';

  // Default demo data (only used if localStorage empty or corrupt)
  const DEMO = {
    classes: [
      { id: 'c1', name: 'Math 101', meta: { nextClass: '2025-09-10 10:00' } },
      { id: 'c2', name: 'Physics 2', meta: { nextClass: '2025-09-11 14:00' } }
    ],
    students: [
      { id: 's1', name: 'Aisha Khan', roll: 'M101-01', classId: 'c1', grade: 'A-' },
      { id: 's2', name: 'Rohit Sharma', roll: 'M101-02', classId: 'c1', grade: 'B+' },
      { id: 's3', name: 'Meera Patel', roll: 'P002-01', classId: 'c2', grade: 'A' }
    ],
    attendance: {},          // { 'YYYY-MM-DD': { studentId: 'present'|'absent'|'late' } }
    attendanceNotes: {},     // { 'YYYY-MM-DD': { studentId: 'note' } }
    timetable: [
      { id: 't1', classId: 'c1', day: 'Monday', start: '10:00', end: '11:00', subject: 'Algebra', note: 'Room 101' },
      { id: 't2', classId: 'c2', day: 'Tuesday', start: '14:00', end: '16:00', subject: 'Mechanics', note: 'Lab B' }
    ],
    assignments: [
      { id: 'a1', title: 'Algebra HW 3', due: '2025-09-15', classId: 'c1', status: 'Open' }
    ],
    announcements: [
      { id: 'ann1', title: 'Exam Schedule Released', date: '2025-09-08', text: 'Midterm schedule uploaded to portal.' }
    ]
  };

  // ---- Utilities ----
  function el(q) { return document.querySelector(q); }
  function els(q) { return Array.from(document.querySelectorAll(q)); }
  function uid(prefix = 'id') { return prefix + Math.random().toString(36).slice(2, 9); }

  // ---- Persistence ----
  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO));
      return JSON.parse(JSON.stringify(DEMO));
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn('corrupt storage, resetting to demo');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO));
      return JSON.parse(JSON.stringify(DEMO));
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // If pages have render functions, call them (renderAll will attempt safely)
    renderAll();
  }

  // Exposed global state
  window.state = loadState();
  window.saveData = saveState;    // pages call saveData()
  window.resetData = function () {
    if (!confirm('Reset local demo data? This will remove local changes.')) return;
    localStorage.removeItem(STORAGE_KEY);
    window.state = loadState();
    renderAll();
  };

  // default selected class id for page-level components
  window.activeClassId = window.state.classes[0]?.id || null;

  // ---- Export / Download helpers ----
  function downloadCSV(rows, filename = 'export.csv') {
    const csv = rows.map(r => r.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function downloadJSON(obj, filename = 'export.json') {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  // Expose export helpers
  window.downloadCSV = downloadCSV;
  window.downloadJSON = downloadJSON;

  // ---- Render orchestration ----
  // renderAll tries to call page-specific renderers if present.
  window.renderAll = function () {
    try { if (typeof renderStudentsTable === 'function') renderStudentsTable(); } catch (e) { /* ignore */ }
    try { if (typeof renderAttendanceTable === 'function') renderAttendanceTable(el('#attendanceDate')?.value || new Date().toISOString().slice(0, 10)); } catch (e) { /* ignore */ }
    try { if (typeof renderTimetable === 'function') renderTimetable(); } catch (e) { /* ignore */ }
    try { if (typeof renderAssignments === 'function') renderAssignments(); } catch (e) { /* ignore */ }
    try { if (typeof renderAnnouncements === 'function') renderAnnouncements(); } catch (e) { /* ignore */ }
  };

  // ---- Students table (used by students.html and others) ----
  window.renderStudentsTable = function (filter = '') {
    const tbody = el('#studentsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const rows = state.students.filter(s =>
      !filter ||
      s.name.toLowerCase().includes(filter.toLowerCase()) ||
      (s.roll && s.roll.toLowerCase().includes(filter.toLowerCase()))
    );

    rows.forEach(s => {
      const cls = state.classes.find(c => c.id === s.classId);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><div style="font-weight:600">${s.name}</div><div class="small-muted">${s.classId}</div></td>
        <td>${s.roll || '-'}</td>
        <td>${cls ? cls.name : '-'}</td>
        <td><div contenteditable class="editable grade" data-id="${s.id}">${s.grade || ''}</div></td>
        <td>
          <button class="btn ghost btnEditStudent" data-id="${s.id}">Edit</button>
          <button class="btn btnDeleteStudent" data-id="${s.id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // grade blur -> save
    els('.grade').forEach(g => g.onblur = (e) => {
      const id = e.target.dataset.id;
      const st = state.students.find(x => x.id === id);
      if (st) {
        st.grade = e.target.innerText.trim();
        saveState();
      }
    });

    // edit handlers
    els('.btnEditStudent').forEach(btn => btn.onclick = function () {
      const id = this.dataset.id;
      const s = state.students.find(x => x.id === id);
      if (!s) return;
      openModal('Edit Student', `
        <div class="form-row"><label>Name</label><input id="m_stuName" value="${escapeHtml(s.name)}" /></div>
        <div class="form-row"><label>Roll</label><input id="m_stuRoll" value="${escapeHtml(s.roll || '')}" /></div>
        <div class="form-row"><label>Class</label><select id="m_stuClass">${state.classes.map(c => `<option value="${c.id}" ${c.id === s.classId ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}</select></div>
        <div style="text-align:right"><button class="btn" id="m_saveStu">Save</button></div>
      `);
      el('#m_saveStu').onclick = () => {
        s.name = el('#m_stuName').value;
        s.roll = el('#m_stuRoll').value;
        s.classId = el('#m_stuClass').value;
        saveState();
        closeModal();
      };
    });

    // delete handlers
    els('.btnDeleteStudent').forEach(btn => btn.onclick = function () {
      const id = this.dataset.id;
      if (!confirm('Delete student?')) return;
      state.students = state.students.filter(x => x.id !== id);
      // remove attendance references
      for (const d of Object.keys(state.attendance || {})) {
        if (state.attendance[d]) delete state.attendance[d][id];
        if (state.attendanceNotes && state.attendanceNotes[d]) delete state.attendanceNotes[d][id];
      }
      saveState();
    });
  };

  // ---- Attendance helpers ----
  // Renders attendance table for currently activeClassId (or fallback)
  window.renderAttendanceTable = function (dateStr) {
    const tbody = el('#attendanceTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!dateStr) dateStr = new Date().toISOString().slice(0, 10);
    if (el('#attendanceDate')) el('#attendanceDate').value = dateStr;

    const rec = state.attendance[dateStr] || {};
    const classId = window.activeClassId || state.classes[0]?.id;
    const list = state.students.filter(s => s.classId === classId);

    list.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.roll || '-')}</td>
        <td>
          <select data-student="${s.id}" class="attendanceSelect">
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </td>
        <td><input data-student="${s.id}" class="attendanceNote" placeholder="note" /></td>
      `;
      tbody.appendChild(tr);
      tr.querySelector('.attendanceSelect').value = rec[s.id] || 'absent';
      tr.querySelector('.attendanceNote').value = (state.attendanceNotes[dateStr] || {})[s.id] || '';
    });
  };

  // Reads table rows and saves attendance into state
  window.saveAttendanceFromTable = function () {
    const date = el('#attendanceDate')?.value || new Date().toISOString().slice(0, 10);
    if (!date) { alert('Invalid date'); return; }
    state.attendance[date] = state.attendance[date] || {};
    state.attendanceNotes = state.attendanceNotes || {};
    state.attendanceNotes[date] = state.attendanceNotes[date] || {};

    const rows = el('#attendanceTable tbody')?.querySelectorAll('tr') || [];
    rows.forEach(row => {
      const sel = row.querySelector('.attendanceSelect');
      const note = row.querySelector('.attendanceNote');
      if (!sel) return;
      const sid = sel.dataset.student;
      state.attendance[date][sid] = sel.value;
      if (!state.attendanceNotes[date]) state.attendanceNotes[date] = {};
      state.attendanceNotes[date][sid] = note ? note.value : '';
    });

    saveState();
  };

  // Export attendance for given date
  window.exportAttendanceCsv = function (date) {
    if (!date) date = new Date().toISOString().slice(0, 10);
    const rec = state.attendance[date] || {};
    const rows = [['date', 'studentId', 'name', 'roll', 'status', 'note']];
    for (const sid of Object.keys(rec)) {
      const s = state.students.find(x => x.id === sid);
      const note = (state.attendanceNotes && state.attendanceNotes[date] && state.attendanceNotes[date][sid]) || '';
      rows.push([date, sid, s?.name || '', s?.roll || '', rec[sid], note]);
    }
    downloadCSV(rows, `attendance-${date}.csv`);
  };

  // ---- Timetable ----
  window.renderTimetable = function () {
    const tbody = el('#ttTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const classId = window.activeClassId || state.classes[0]?.id;
    const rows = state.timetable.filter(t => t.classId === classId);
    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input value="${escapeHtml(r.day)}" data-id="${r.id}" data-field="day" /></td>
        <td><input value="${escapeHtml(r.start)}" data-id="${r.id}" data-field="start" /></td>
        <td><input value="${escapeHtml(r.end)}" data-id="${r.id}" data-field="end" /></td>
        <td><input value="${escapeHtml(r.subject)}" data-id="${r.id}" data-field="subject" /></td>
        <td><input value="${escapeHtml(r.note || '')}" data-id="${r.id}" data-field="note" /></td>
        <td><button class="btn btnDeleteSlot" data-id="${r.id}">Delete</button></td>
      `;
      tbody.appendChild(tr);
    });

    // attach blur handlers to inputs -> update model
    els('#ttTable tbody input').forEach(inp => {
      inp.onblur = function () {
        const id = this.dataset.id;
        const field = this.dataset.field;
        const row = state.timetable.find(x => x.id === id);
        if (row) {
          row[field] = this.value;
          saveState();
        }
      };
    });

    // delete handlers
    els('.btnDeleteSlot').forEach(btn => btn.onclick = function () {
      const id = this.dataset.id;
      if (!confirm('Delete this slot?')) return;
      state.timetable = state.timetable.filter(x => x.id !== id);
      saveState();
    });
  };

  // ---- Assignments ----
  window.renderAssignments = function () {
    const tbody = el('#assignmentsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    state.assignments.forEach(a => {
      const cls = state.classes.find(c => c.id === a.classId);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(a.title)}</td>
        <td>${escapeHtml(a.due || '')}</td>
        <td>${cls ? escapeHtml(cls.name) : '-'}</td>
        <td>${escapeHtml(a.status || '')}</td>
        <td>
          <button class="btn ghost btnEditAssign" data-id="${a.id}">Edit</button>
          <button class="btn btnDeleteAssign" data-id="${a.id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // edit handlers
    els('.btnEditAssign').forEach(btn => btn.onclick = function () {
      const id = this.dataset.id;
      openEditAssignmentModal(id);
    });

    // delete
    els('.btnDeleteAssign').forEach(btn => btn.onclick = function () {
      const id = this.dataset.id;
      if (!confirm('Delete assignment?')) return;
      state.assignments = state.assignments.filter(x => x.id !== id);
      saveState();
    });
  };

  // ---- Announcements ----
  window.renderAnnouncements = function () {
    const node = el('#annList');
    if (!node) return;
    node.innerHTML = '';
    (state.announcements || []).slice().reverse().forEach(a => {
      const c = document.createElement('div');
      c.className = 'card';
      c.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><div style="font-weight:700">${escapeHtml(a.title)}</div><div class="small-muted">${escapeHtml(a.date)}</div></div>
          <div style="display:flex;gap:8px">
            <button class="btn ghost btnEditAnn" data-id="${a.id}">Edit</button>
            <button class="btn btnDeleteAnn" data-id="${a.id}">Delete</button>
          </div>
        </div>
        <div style="margin-top:8px">${escapeHtml(a.text)}</div>
      `;
      node.appendChild(c);
    });

    // edit/delete handlers
    els('.btnEditAnn').forEach(btn => btn.onclick = function () {
      openEditAnnouncementModal(this.dataset.id);
    });
    els('.btnDeleteAnn').forEach(btn => btn.onclick = function () {
      const id = this.dataset.id;
      if (!confirm('Delete announcement?')) return;
      state.announcements = state.announcements.filter(x => x.id !== id);
      saveState();
    });
  };

  // ---- Modals & small UI helpers ----
  function ensureModalRoot() {
    let root = el('#modalRoot');
    if (!root) {
      root = document.createElement('div');
      root.id = 'modalRoot';
      document.body.appendChild(root);
    }
    return root;
  }

  // openModal(title, innerHTML) - simple centered modal
  window.openModal = function (title, innerHTML) {
    const root = ensureModalRoot();
    root.style.display = 'flex';
    root.style.position = 'fixed';
    root.style.inset = '0';
    root.style.alignItems = 'center';
    root.style.justifyContent = 'center';
    root.style.zIndex = '9999';
    root.innerHTML = `
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.35)"></div>
      <div style="position:relative;max-width:760px;width:92%;margin:auto;background:var(--page,white);border-radius:12px;padding:16px;z-index:10000;box-shadow:0 10px 30px rgba(0,0,0,0.12)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-weight:700">${escapeHtml(title)}</div>
          <div><button class="btn ghost" id="modalCloseBtn">Close</button></div>
        </div>
        <div style="margin-top:12px">${innerHTML}</div>
      </div>
    `;
    const close = () => closeModal();
    const btn = el('#modalCloseBtn');
    if (btn) btn.onclick = close;
  };

  window.closeModal = function () {
    const root = el('#modalRoot');
    if (root) {
      root.style.display = 'none';
      root.innerHTML = '';
    }
  };

  // Convenience modals used across pages:
  window.openAddStudentModal = function () {
    openModal('Add student', `
      <div class="form-row"><label>Name</label><input id="m_stuName" /></div>
      <div class="form-row"><label>Roll</label><input id="m_stuRoll" /></div>
      <div class="form-row"><label>Class</label><select id="m_stuClass">${state.classes.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}</select></div>
      <div style="text-align:right"><button class="btn" id="m_createStu">Create</button></div>
    `);
    el('#m_createStu').onclick = () => {
      const name = el('#m_stuName').value.trim();
      const roll = el('#m_stuRoll').value.trim();
      const classId = el('#m_stuClass').value;
      if (!name) { alert('Name required'); return; }
      state.students.push({ id: uid('s'), name, roll, classId, grade: '' });
      saveState();
      closeModal();
    };
  };

  window.openImportCsvModal = function () {
    openModal('Import students (CSV)', `
      <div class="small-muted">CSV columns: name,roll,classId</div>
      <div class="form-row"><textarea id="m_csvText" placeholder="Paste CSV here" style="min-height:120px;width:100%"></textarea></div>
      <div style="text-align:right"><button class="btn" id="m_importCsv">Import</button></div>
    `);
    el('#m_importCsv').onclick = () => {
      const raw = el('#m_csvText').value.trim();
      if (!raw) { alert('Paste CSV content'); return; }
      const lines = raw.split('\n').map(r => r.trim()).filter(Boolean);
      let count = 0;
      lines.forEach(line => {
        const cols = line.split(',').map(c => c.trim());
        const name = cols[0] || '';
        const roll = cols[1] || '';
        const classId = cols[2] || state.classes[0]?.id;
        if (name) {
          state.students.push({ id: uid('s'), name, roll, classId, grade: '' });
          count++;
        }
      });
      saveState();
      alert(`Imported ${count} students`);
      closeModal();
    };
  };

  window.openNewAssignmentModal = function () {
    openModal('New assignment', `
      <div class="form-row"><label>Title</label><input id="m_asTitle" /></div>
      <div class="form-row"><label>Due</label><input id="m_asDue" type="date" /></div>
      <div class="form-row"><label>Class</label><select id="m_asClass">${state.classes.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}</select></div>
      <div style="text-align:right"><button class="btn" id="m_createAs">Create</button></div>
    `);
    el('#m_createAs').onclick = () => {
      const title = el('#m_asTitle').value.trim();
      const due = el('#m_asDue').value || '';
      const classId = el('#m_asClass').value;
      if (!title) { alert('Title required'); return; }
      state.assignments.push({ id: uid('a'), title, due, classId, status: 'Open' });
      saveState();
      closeModal();
    };
  };

  window.openEditAssignmentModal = function (id) {
    const a = state.assignments.find(x => x.id === id);
    if (!a) return;
    openModal('Edit assignment', `
      <div class="form-row"><label>Title</label><input id="m_asTitle" value="${escapeHtml(a.title)}" /></div>
      <div class="form-row"><label>Due</label><input id="m_asDue" type="date" value="${escapeHtml(a.due || '')}" /></div>
      <div class="form-row"><label>Status</label><select id="m_asStatus"><option>Open</option><option>Closed</option></select></div>
      <div style="text-align:right"><button class="btn" id="m_saveAs">Save</button></div>
    `);
    el('#m_asStatus').value = a.status || 'Open';
    el('#m_saveAs').onclick = () => {
      a.title = el('#m_asTitle').value.trim();
      a.due = el('#m_asDue').value;
      a.status = el('#m_asStatus').value;
      saveState();
      closeModal();
    };
  };

  window.openNewAnnouncementModal = function () {
    openModal('Post announcement', `
      <div class="form-row"><label>Title</label><input id="m_annTitle" /></div>
      <div class="form-row"><label>Date</label><input id="m_annDate" type="date" value="${new Date().toISOString().slice(0, 10)}" /></div>
      <div class="form-row"><label>Text</label><textarea id="m_annText"></textarea></div>
      <div style="text-align:right"><button class="btn" id="m_createAnn">Post</button></div>
    `);
    el('#m_createAnn').onclick = () => {
      const title = el('#m_annTitle').value.trim();
      const text = el('#m_annText').value.trim();
      const date = el('#m_annDate').value;
      if (!title || !text) { alert('Title & text required'); return; }
      state.announcements.push({ id: uid('ann'), title, text, date });
      saveState();
      closeModal();
    };
  };

  window.openEditAnnouncementModal = function (id) {
    const a = state.announcements.find(x => x.id === id);
    if (!a) return;
    openModal('Edit announcement', `
      <div class="form-row"><label>Title</label><input id="m_annTitle" value="${escapeHtml(a.title)}" /></div>
      <div class="form-row"><label>Date</label><input id="m_annDate" type="date" value="${escapeHtml(a.date || '')}" /></div>
      <div class="form-row"><label>Text</label><textarea id="m_annText">${escapeHtml(a.text)}</textarea></div>
      <div style="text-align:right"><button class="btn" id="m_saveAnn">Save</button></div>
    `);
    el('#m_saveAnn').onclick = () => {
      a.title = el('#m_annTitle').value;
      a.date = el('#m_annDate').value;
      a.text = el('#m_annText').value;
      saveState();
      closeModal();
    };
  };

  // ---- Small helpers ----
  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // convenient global aliases for pages (already used in pages)
  window.el = el;
  window.els = els;
  window.uid = uid;
  window.exportAttendanceCsv = exportAttendanceCsv;

  // initial render when file is loaded
  // delay to allow page-specific onload scripts to set up UI elements (safe call)
  setTimeout(() => {
    try { renderAll(); } catch (e) { /* silent */ }
  }, 50);

})();
