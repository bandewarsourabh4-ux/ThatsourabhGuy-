// Dashboard Page Logic

let studentData = null;
let attendanceData = null;
let assignmentData = null;

document.addEventListener('DOMContentLoaded', function() {
    if (!app.checkAuth()) return;

    loadDashboardData();
    displayUserInfo();
    displayStats();
    displayUpcomingAssignments();
    displayTodayClasses();
    displayLatestNotices();
    initCharts();
});

function loadDashboardData() {
    const user = app.getUser();

    // Get student data
    const students = SmartHubData.getStudents();
    studentData = students.find(s => s.id === user.id) || students[0];

    // Get attendance data
    attendanceData = SmartHubData.getAttendance();

    // Get assignment data
    assignmentData = SmartHubData.getAssignments();
}

function displayUserInfo() {
    const user = app.getUser();
    document.getElementById('userName').textContent = user.name || 'Student';
    document.getElementById('studentName').textContent = studentData.name;
}

function displayStats() {
    // Attendance percentage
    const avgAttendance = Math.round(attendanceData.reduce((sum, a) => sum + a.percentage, 0) / attendanceData.length);
    document.getElementById('attendancePercentage').textContent = avgAttendance + '%';

    // Assignment completion
    const submitted = assignmentData.filter(a => a.status === 'Submitted').length;
    document.getElementById('assignmentCount').textContent = submitted + '/' + assignmentData.length;

    // CGPA
    document.getElementById('avgGPA').textContent = studentData.cgpa + '/10';

    // Classes today
    const today = getToday();
    const todayTimetable = SmartHubData.getTimetable().find(t => t.day === today);
    const classCount = todayTimetable ? todayTimetable.classes.length : 0;
    document.getElementById('upcomingCount').textContent = classCount;
}

function displayUpcomingAssignments() {
    const container = document.getElementById('upcomingAssignments');
    const upcomingAssignments = assignmentData
        .filter(a => a.status === 'Pending')
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 3);

    if (upcomingAssignments.length === 0) {
        container.innerHTML = '<div class="empty-state">No upcoming assignments</div>';
        return;
    }

    container.innerHTML = upcomingAssignments.map(assignment => `
        <div class="assignment-item ${isOverdue(assignment.dueDate) ? 'urgent' : ''}">
            <div class="assignment-title">${assignment.title}</div>
            <div class="assignment-meta">
                <span>📚 ${assignment.subject}</span>
                <span>📅 ${formatDate(assignment.dueDate)}</span>
                <span class="badge ${getAssignmentBadgeClass(isOverdue(assignment.dueDate) ? 'Overdue' : 'Pending')}">
                    ${isOverdue(assignment.dueDate) ? 'Overdue' : 'Pending'}
                </span>
            </div>
        </div>
    `).join('');
}

function displayTodayClasses() {
    const container = document.getElementById('todayClasses');
    const today = getToday();
    const todayTimetable = SmartHubData.getTimetable().find(t => t.day === today);

    if (!todayTimetable || todayTimetable.classes.length === 0) {
        container.innerHTML = '<div class="empty-state">No classes today</div>';
        return;
    }

    container.innerHTML = todayTimetable.classes.map(cls => `
        <div class="class-item">
            <div class="class-name">${cls.subject}</div>
            <div class="class-meta">
                <span>⏰ ${cls.time}</span>
                <span>👨‍🏫 ${cls.faculty}</span>
                <span>🚪 ${cls.room}</span>
            </div>
        </div>
    `).join('');
}

function displayLatestNotices() {
    const container = document.getElementById('latestNotices');
    const notices = SmartHubData.getNotices().slice(0, 3);

    if (notices.length === 0) {
        container.innerHTML = '<div class="empty-state">No new notices</div>';
        return;
    }

    container.innerHTML = notices.map(notice => `
        <div class="notice-item ${notice.priority === 'High' ? 'important' : ''}">
            <div class="notice-title">${notice.title}</div>
            <div class="notice-meta">
                <span>${notice.category}</span>
                <span>${formatDate(notice.date)}</span>
                ${notice.priority === 'High' ? '<span class="badge danger">🔴 High Priority</span>' : ''}
            </div>
        </div>
    `).join('');
}

// Chart initialization using Chart.js
function initCharts() {
    // Attendance Chart
    const attendanceCtx = document.getElementById('attendanceChart');
    if (attendanceCtx) {
        new Chart(attendanceCtx, {
            type: 'doughnut',
            data: {
                labels: ['Present', 'Absent'],
                datasets: [{
                    data: [
                        attendanceData.reduce((sum, a) => sum + a.present, 0),
                        attendanceData.reduce((sum, a) => sum + a.absent, 0)
                    ],
                    backgroundColor: ['#16a34a', '#dc2626'],
                    borderColor: ['#15803d', '#991b1b'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 12 },
                            padding: 15
                        }
                    }
                }
            }
        });
    }

    // Assignment Chart
    const assignmentCtx = document.getElementById('assignmentChart');
    if (assignmentCtx) {
        const statusCounts = {
            'Submitted': assignmentData.filter(a => a.status === 'Submitted').length,
            'Pending': assignmentData.filter(a => a.status === 'Pending').length
        };

        new Chart(assignmentCtx, {
            type: 'bar',
            data: {
                labels: ['Submitted', 'Pending'],
                datasets: [{
                    label: 'Assignments',
                    data: [statusCounts['Submitted'], statusCounts['Pending']],
                    backgroundColor: ['#16a34a', '#ea580c'],
                    borderColor: ['#15803d', '#c2410c'],
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: Math.max(statusCounts['Submitted'], statusCounts['Pending']) + 2
                    }
                }
            }
        });
    }
}
