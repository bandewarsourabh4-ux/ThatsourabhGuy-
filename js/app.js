// SmartHub Application Core

class SmartHub {
    constructor() {
        this.user = null;
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupTheme();
        this.setupEventListeners();
    }

    checkAuth() {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
                window.location.href = 'index.html';
            }
            return false;
        }

        this.user = JSON.parse(userStr);
        return true;
    }

    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateThemeButton();
    }

    setupEventListeners() {
        // Theme toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-theme')) {
                this.toggleTheme();
            }
        });

        // Mobile menu toggle
        const menuBtn = document.querySelector('.btn-menu');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => this.toggleProfileMenu());
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.setupTheme();
    }

    updateThemeButton() {
        const btn = document.querySelector('.btn-theme');
        if (btn) {
            btn.textContent = this.theme === 'dark' ? '☀️' : '🌙';
        }
    }

    toggleProfileMenu() {
        const menu = document.querySelector('.profile-menu');
        if (menu) {
            menu.classList.toggle('active');
        }
    }

    getUser() {
        return this.user;
    }

    isStudent() {
        return this.user?.role === 'student';
    }

    isAdmin() {
        return this.user?.role === 'admin';
    }

    logout() {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

// Initialize app
const app = new SmartHub();

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        app.logout();
    }
}

function toggleTheme() {
    app.toggleTheme();
}

function toggleProfileMenu() {
    app.toggleProfileMenu();
}

// Data Management
class SmartHubData {
    static getStudents() {
        return [
            {
                id: 'STU001',
                name: 'Rahul Kumar Singh',
                email: 'rahul.singh@college.edu',
                phone: '9876543210',
                course: 'BCA',
                semester: '6',
                division: 'A',
                rollNo: '21BCA001',
                department: 'Computer Science',
                attendance: 92,
                cgpa: 7.8,
                dob: '2002-05-15',
                address: '123 Main Street, Delhi'
            },
            {
                id: 'STU002',
                name: 'Priya Sharma',
                email: 'priya.sharma@college.edu',
                phone: '9876543211',
                course: 'BCA',
                semester: '6',
                division: 'A',
                rollNo: '21BCA002',
                department: 'Computer Science',
                attendance: 88,
                cgpa: 8.2,
                dob: '2002-08-22',
                address: '456 Oak Avenue, Delhi'
            },
            {
                id: 'STU003',
                name: 'Arjun Patel',
                email: 'arjun.patel@college.edu',
                phone: '9876543212',
                course: 'BCA',
                semester: '6',
                division: 'B',
                rollNo: '21BCA003',
                department: 'Computer Science',
                attendance: 85,
                cgpa: 7.5,
                dob: '2002-11-10',
                address: '789 Pine Road, Delhi'
            }
        ];
    }

    static getAttendance() {
        return [
            { subject: 'Data Structures', total: 30, present: 28, absent: 2, percentage: 93 },
            { subject: 'Database Management', total: 28, present: 26, absent: 2, percentage: 93 },
            { subject: 'Web Development', total: 25, present: 23, absent: 2, percentage: 92 },
            { subject: 'Software Engineering', total: 22, present: 20, absent: 2, percentage: 91 },
            { subject: 'System Design', total: 20, present: 17, absent: 3, percentage: 85 }
        ];
    }

    static getAssignments() {
        return [
            {
                id: 'A001',
                title: 'Implement Binary Search Tree',
                subject: 'Data Structures',
                faculty: 'Dr. Raj Kumar',
                dueDate: '2024-10-05',
                description: 'Create a complete BST implementation with search, insert, and delete operations.',
                status: 'Submitted',
                submissionStatus: 'On Time'
            },
            {
                id: 'A002',
                title: 'Database Normalization Project',
                subject: 'Database Management',
                faculty: 'Dr. Sonia Singh',
                dueDate: '2024-10-12',
                description: 'Design and normalize a database for an e-commerce system.',
                status: 'Pending',
                submissionStatus: 'Pending'
            },
            {
                id: 'A003',
                title: 'Responsive Web Design',
                subject: 'Web Development',
                faculty: 'Prof. Amit Das',
                dueDate: '2024-10-08',
                description: 'Create a responsive website using HTML, CSS, and JavaScript.',
                status: 'Submitted',
                submissionStatus: 'Late'
            },
            {
                id: 'A004',
                title: 'UML Diagrams for Library System',
                subject: 'Software Engineering',
                faculty: 'Dr. Neha Gupta',
                dueDate: '2024-10-15',
                description: 'Create UML diagrams for a library management system.',
                status: 'Pending',
                submissionStatus: 'Pending'
            },
            {
                id: 'A005',
                title: 'API Development with Node.js',
                subject: 'Web Development',
                faculty: 'Prof. Amit Das',
                dueDate: '2024-10-20',
                description: 'Develop a RESTful API for a task management application.',
                status: 'Pending',
                submissionStatus: 'Pending'
            }
        ];
    }

    static getResults() {
        return [
            {
                subject: 'Data Structures',
                internal: 28,
                external: 82,
                practical: 95,
                total: 89,
                grade: 'A',
                gradePoint: 8.0
            },
            {
                subject: 'Database Management',
                internal: 30,
                external: 78,
                practical: 92,
                total: 85,
                grade: 'A',
                gradePoint: 8.0
            },
            {
                subject: 'Web Development',
                internal: 27,
                external: 75,
                practical: 88,
                total: 81,
                grade: 'B+',
                gradePoint: 7.5
            },
            {
                subject: 'Software Engineering',
                internal: 25,
                external: 70,
                practical: 85,
                total: 77,
                grade: 'B',
                gradePoint: 7.0
            }
        ];
    }

    static getTimetable() {
        return [
            {
                day: 'Monday',
                classes: [
                    { time: '9:00 - 10:00', subject: 'Data Structures', faculty: 'Dr. Raj Kumar', room: 'A101' },
                    { time: '10:15 - 11:15', subject: 'Web Development', faculty: 'Prof. Amit Das', room: 'B201' },
                    { time: '12:00 - 1:00 PM', subject: 'Database Management', faculty: 'Dr. Sonia Singh', room: 'C301' }
                ]
            },
            {
                day: 'Tuesday',
                classes: [
                    { time: '9:00 - 10:00', subject: 'Software Engineering', faculty: 'Dr. Neha Gupta', room: 'A102' },
                    { time: '10:15 - 11:15', subject: 'System Design', faculty: 'Prof. Vikas Sharma', room: 'B202' }
                ]
            },
            {
                day: 'Wednesday',
                classes: [
                    { time: '9:00 - 10:00', subject: 'Data Structures', faculty: 'Dr. Raj Kumar', room: 'A101' },
                    { time: '11:00 - 12:00', subject: 'Database Lab', faculty: 'Dr. Sonia Singh', room: 'C303' },
                    { time: '2:00 - 3:00 PM', subject: 'Web Lab', faculty: 'Prof. Amit Das', room: 'D201' }
                ]
            },
            {
                day: 'Thursday',
                classes: [
                    { time: '9:00 - 10:00', subject: 'Data Structures', faculty: 'Dr. Raj Kumar', room: 'A101' },
                    { time: '10:15 - 11:15', subject: 'Software Engineering', faculty: 'Dr. Neha Gupta', room: 'A102' }
                ]
            },
            {
                day: 'Friday',
                classes: [
                    { time: '9:00 - 10:00', subject: 'System Design', faculty: 'Prof. Vikas Sharma', room: 'B202' },
                    { time: '10:15 - 11:15', subject: 'Web Development', faculty: 'Prof. Amit Das', room: 'B201' }
                ]
            },
            {
                day: 'Saturday',
                classes: []
            }
        ];
    }

    static getNotices() {
        return [
            {
                id: 'N001',
                title: 'Mid-Semester Examination Schedule',
                description: 'The mid-semester exams will be conducted from October 15-25. Download the detailed schedule from the portal.',
                date: '2024-09-28',
                category: 'Examination',
                priority: 'High'
            },
            {
                id: 'N002',
                title: 'Campus Recruitment Drive',
                description: 'Major tech companies will visit for campus recruitment on October 20-22. Interested students can register here.',
                date: '2024-09-27',
                category: 'Placement',
                priority: 'High'
            },
            {
                id: 'N003',
                title: 'Hackathon 2024 Registration Open',
                description: 'Annual college hackathon is open for registration. Teams can register with 2-4 members. Last date: October 10.',
                date: '2024-09-25',
                category: 'Events',
                priority: 'Medium'
            },
            {
                id: 'N004',
                title: 'Library Holiday Notice',
                description: 'The college library will remain closed on October 2nd for annual maintenance.',
                date: '2024-09-24',
                category: 'General',
                priority: 'Low'
            },
            {
                id: 'N005',
                title: 'Assignment Submission Deadline Extended',
                description: 'Due to a server issue, the assignment submission deadline has been extended to October 10.',
                date: '2024-09-23',
                category: 'Academic',
                priority: 'Medium'
            }
        ];
    }

    static getStudyMaterial() {
        return [
            {
                id: 'M001',
                title: 'Data Structures - Complete Notes',
                subject: 'Data Structures',
                category: 'Notes',
                type: 'PDF',
                size: '2.5 MB',
                uploadedBy: 'Dr. Raj Kumar',
                date: '2024-09-15'
            },
            {
                id: 'M002',
                title: 'Binary Search Tree Implementation',
                subject: 'Data Structures',
                category: 'Practical Files',
                type: 'ZIP',
                size: '1.2 MB',
                uploadedBy: 'Prof. Vikas Sharma',
                date: '2024-09-20'
            },
            {
                id: 'M003',
                title: 'Database Design Patterns',
                subject: 'Database Management',
                category: 'E-books',
                type: 'PDF',
                size: '8.5 MB',
                uploadedBy: 'Dr. Sonia Singh',
                date: '2024-09-10'
            },
            {
                id: 'M004',
                title: 'HTML5 & CSS3 Guide',
                subject: 'Web Development',
                category: 'Notes',
                type: 'PDF',
                size: '3.2 MB',
                uploadedBy: 'Prof. Amit Das',
                date: '2024-09-22'
            },
            {
                id: 'M005',
                title: 'Previous Year Paper - 2023',
                subject: 'Data Structures',
                category: 'Previous Year Papers',
                type: 'PDF',
                size: '1.8 MB',
                uploadedBy: 'Dr. Raj Kumar',
                date: '2024-09-01'
            }
        ];
    }
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Format time (for timetable)
function getToday() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
}

// Check if date is upcoming
function isUpcoming(dateString) {
    return new Date(dateString) >= new Date();
}

// Check if date is today
function isToday(dateString) {
    const today = new Date();
    const date = new Date(dateString);
    return date.toDateString() === today.toDateString();
}

// Check if date is overdue
function isOverdue(dateString) {
    return new Date(dateString) < new Date() && !isToday(dateString);
}

// Create assignment status badge
function getAssignmentBadgeClass(status) {
    const statusMap = {
        'Pending': 'warning',
        'Submitted': 'success',
        'Late': 'danger',
        'Overdue': 'danger'
    };
    return statusMap[status] || 'info';
}

// Create attendance warning
function getAttendanceWarning(percentage) {
    if (percentage < 75) {
        return '<div class="alert alert-danger">⚠️ Your attendance is below 75%. Please meet your faculty.</div>';
    }
    if (percentage < 80) {
        return '<div class="alert alert-warning">⚠️ Your attendance is critical. Please ensure regular attendance.</div>';
    }
    return '';
}
