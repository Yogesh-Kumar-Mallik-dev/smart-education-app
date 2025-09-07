 const yearSelect = document.getElementById('year-select');
    const studentsContainer = document.getElementById('students-container');
    const addStudentBtn = document.getElementById('add-student-btn');
    const attendanceForm = document.getElementById('attendance-form');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');

    // Add a new student input row
    function addStudentRow(name = '', status = 'Present') {
      const div = document.createElement('div');
      div.className = 'student-row';

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.placeholder = 'Student Name';
      nameInput.value = name;
      nameInput.required = true;

      const attendanceSelect = document.createElement('select');
      attendanceSelect.className = 'attendance-select';
      ['Present', 'Absent', 'Late'].forEach(optionText => {
        const option = document.createElement('option');
        option.value = optionText;
        option.textContent = optionText;
        if (optionText === status) option.selected = true;
        attendanceSelect.appendChild(option);
      });

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => {
        studentsContainer.removeChild(div);
      });

      div.appendChild(nameInput);
      div.appendChild(attendanceSelect);
      div.appendChild(removeBtn);

      studentsContainer.appendChild(div);
    }

    // Load attendance history from localStorage
    function loadHistory() {
      const history = JSON.parse(localStorage.getItem('attendanceHistory')) || [];
      if (history.length === 0) {
        historyList.innerHTML = '<p class="text-gray-500">No attendance history available.</p>';
        return;
      }
      historyList.innerHTML = '';
      history.slice().reverse().forEach(record => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
          <div><strong>${record.timestamp}</strong> - <em>${record.year}</em></div>
          <div>Students: ${record.students.length}</div>
          <div>
            Present: ${record.students.filter(s => s.status === 'Present').length} | 
            Absent: ${record.students.filter(s => s.status === 'Absent').length} | 
            Late: ${record.students.filter(s => s.status === 'Late').length}
          </div>
        `;
        historyList.appendChild(div);
      });
    }

    // Clear attendance history
    clearHistoryBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all attendance history?')) {
        localStorage.removeItem('attendanceHistory');
        loadHistory();
      }
    });

    // Add initial student row on page load
    addStudentRow();

    addStudentBtn.addEventListener('click', () => {
      addStudentRow();
    });

    attendanceForm.addEventListener('submit', e => {
      e.preventDefault();

      const year = yearSelect.value;
      if (!year) {
        alert('Please select a year.');
        return;
      }

      const studentRows = studentsContainer.querySelectorAll('.student-row');
      if (studentRows.length === 0) {
        alert('Please add at least one student.');
        return;
      }

      const students = [];
      for (const row of studentRows) {
        const nameInput = row.querySelector('input[type="text"]');
        const attendanceSelect = row.querySelector('select');
        if (!nameInput.value.trim()) {
          alert('Please enter all student names.');
          return;
        }
        students.push({
          name: nameInput.value.trim(),
          status: attendanceSelect.value
        });
      }

      const timestamp = new Date().toLocaleString();

      // Save to localStorage
      let history = JSON.parse(localStorage.getItem('attendanceHistory')) || [];
      history.push({ year, timestamp, students });
      localStorage.setItem('attendanceHistory', JSON.stringify(history));

      alert(`Attendance submitted for ${year} with ${students.length} students.`);

      // Reset form
      yearSelect.value = '';
      studentsContainer.innerHTML = '';
      addStudentRow();

      loadHistory();
    });

    // Load history on page load
    loadHistory();