```javascript
            tableHTML += `</tr>`;
                });
            }

            tableHTML += `
                    </tbody>
                </table>
            `;

            container.innerHTML = tableHTML;
        }

        function renderTasks() {
            const tbody = document.getElementById('tasks-table-body');
            const todayContainer = document.getElementById('today-tasks-container');
            if (!tbody || !todayContainer) return;

            tbody.innerHTML = '';
            todayContainer.innerHTML = '';

            const today = new Date().toISOString().split('T')[0];

            tasks.forEach(task => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-slate-50 transition-all';
                row.innerHTML = `
                    <td class="p-3.5 font-bold text-slate-800">${task.name}</td>
                    <td class="p-3.5 text-slate-600">${task.category}</td>
                    <td class="p-3.5 text-slate-600">${task.start} - ${task.end}</td>
                    <td class="p-3.5">
                        <div class="flex items-center gap-2">
                            <div class="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div class="h-full bg-blue-600 rounded-full" style="width:${task.progress}%"></div>
                            </div>
                            <span class="text-xs font-bold text-slate-600">${task.progress}%</span>
                        </div>
                    </td>
                    <td class="p-3.5 text-right">
                        <button onclick="editTask('${task.id}')" class="text-blue-600 hover:text-blue-800 mr-2">แก้ไข</button>
                        <button onclick="deleteTask('${task.id}')" class="text-red-500 hover:text-red-700">ลบ</button>
                    </td>
                `;
                tbody.appendChild(row);

                if (task.start <= today && task.end >= today) {
                    const item = document.createElement('div');
                    item.className = 'p-3 bg-slate-50 border border-slate-200 rounded-xl';
                    item.innerHTML = `
                        <p class="font-bold text-xs text-slate-800">${task.name}</p>
                        <p class="text-[10px] text-slate-500 mt-1">${task.progress}% complete</p>
                    `;
                    todayContainer.appendChild(item);
                }
            });

            initGanttChart();
        }

        function resetTaskForm() {
            const form = document.getElementById('task-form');
            if (form) form.reset();
            document.getElementById('task-id').value = '';
            document.getElementById('task-progress-val').innerText = '0%';
            document.getElementById('task-submit-btn').querySelector('span').innerText = 'บันทึก Task';
        }

        function editTask(id) {
            const task = tasks.find(t => t.id === id);
            if (!task) return;

            document.getElementById('task-id').value = task.id;
            document.getElementById('task-name').value = task.name;
            document.getElementById('task-category').value = task.category;
            document.getElementById('task-start').value = task.start;
            document.getElementById('task-end').value = task.end;
            document.getElementById('task-progress').value = task.progress;
            document.getElementById('task-progress-val').innerText = task.progress + '%';
            document.getElementById('task-submit-btn').querySelector('span').innerText = 'อัปเดต Task';
            document.getElementById('task-form').scrollIntoView({ behavior: 'smooth' });
        }

        function deleteTask(id) {
            if (!confirm('ต้องการลบภาระงานนี้หรือไม่?')) return;
            tasks = tasks.filter(t => t.id !== id);
            renderTasks();
        }

        document.getElementById('task-form')?.addEventListener('submit', function(e) {
            e.preventDefault();

            const id = document.getElementById('task-id').value;
            const taskData = {
                id: id || Date.now().toString(),
                name: document.getElementById('task-name').value,
                category: document.getElementById('task-category').value,
                start: document.getElementById('task-start').value,
                end: document.getElementById('task-end').value,
                progress: parseInt(document.getElementById('task-progress').value)
            };

            if (id) {
                const index = tasks.findIndex(t => t.id === id);
                if (index !== -1) tasks[index] = taskData;
            } else {
                tasks.push(taskData);
            }

            renderTasks();
            resetTaskForm();
        });

        // AUTHENTICATION SYSTEM
        function switchAuthMode(mode) {
            authMode = mode;
            document.getElementById('auth-login-form').classList.toggle('hidden', mode !== 'login');
            document.getElementById('auth-register-form').classList.toggle('hidden', mode !== 'register');
        }

        function setAuthUserType(type) {
            authUserType = type;
            const studentBtn = document.getElementById('auth-type-student');
            const adminBtn = document.getElementById('auth-type-admin');

            if (studentBtn && adminBtn) {
                studentBtn.className = type === 'student'
                    ? 'flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs'
                    : 'flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs';
                adminBtn.className = type === 'admin'
                    ? 'flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs'
                    : 'flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs';
            }
        }

      
function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-pass').value;

    const uniSelect = document.getElementById('login-uni');
    const uniKey = uniSelect ? uniSelect.value : 'TU';

    if (!email || !password) {
        showAuthError('กรุณากรอกอีเมลและรหัสผ่าน');
        return;
    }

    if (authUserType === 'student') {
        const expected = DOMAINS[uniKey];

        if (!email.endsWith(expected)) {
            showAuthError(`อีเมลนักศึกษาต้องลงท้ายด้วย ${expected}`);
            return;
        }
    }

    const users = JSON.parse(localStorage.getItem('lawHubUsers') || '[]');

    const user = users.find(u =>
        u.email.toLowerCase() === email &&
        u.password === password &&
        u.type === authUserType
    );

    if (!user) {
        showAuthError('ไม่พบบัญชีผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง กรุณาสมัครสมาชิกก่อน');
        return;
    }

    currentUser = user;

    document.getElementById('auth-error-msg').classList.add('hidden');
    showDashboard();
}

function handleRegister(e) {
    e.preventDefault();

    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const password = document.getElementById('reg-pass').value;

    const uniSelect = document.getElementById('reg-uni');
    const uniKey = uniSelect ? uniSelect.value : 'TU';

    if (!email || !password) {
        showAuthError('กรุณากรอกอีเมลและรหัสผ่าน');
        return;
    }

    if (authUserType === 'student') {
        const expected = DOMAINS[uniKey];

        if (!email.endsWith(expected)) {
            showAuthError(`อีเมลสมัครต้องลงท้ายด้วย ${expected}`);
            return;
        }
    }

    if (password.length < 8) {
        showAuthError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
        return;
    }

    const users = JSON.parse(localStorage.getItem('lawHubUsers') || '[]');

    if (users.some(u => u.email.toLowerCase() === email)) {
        showAuthError('อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบ');
        return;
    }

    const newUser = {
        email: email,
        password: password,
        type: authUserType,
        university: authUserType === 'student'
            ? UNI_NAMES[uniKey]
            : 'บุคคลทั่วไป'
    };

    users.push(newUser);
    localStorage.setItem('lawHubUsers', JSON.stringify(users));

    alert('สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ');

    document.getElementById('auth-error-msg').classList.add('hidden');
    switchAuthTab('login');

    document.getElementById('login-email').value = email;
    document.getElementById('login-pass').value = '';
}


        function renderTasks() {
            const tbody = document.getElementById('tasks-table-body');
            if (!tbody) return;
            tbody.innerHTML = '';

            let totalLaw = 0;
            let sumProg = 0;
            let completedCount = 0;
            let inProgressCount = 0;

            const todayStr = new Date().toISOString().split('T')[0];
            const todayContainer = document.getElementById('today-tasks-container');
            if (todayContainer) todayContainer.innerHTML = '';
            let todayTaskFound = false;

            tasks.forEach(t => {
                const prog = parseInt(t.progress);
                sumProg += prog;
                if (t.category === 'Law') totalLaw++;
                if (prog === 100) completedCount++;
                else inProgressCount++;

                if (t.start <= todayStr && t.end >= todayStr && todayContainer) {
                    todayTaskFound = true;
                    const todayCard = document.createElement('div');
                    todayCard.className = "p-3 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1.5";
                    todayCard.innerHTML = `
                        <div class="flex justify-between items-center text-xs">
                            <span class="font-bold text-slate-800 line-clamp-1">${t.name}</span>
                            <span class="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold rounded">${t.progress}%</span>
                        </div>
                        <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-blue-600 h-full" style="width: ${t.progress}%"></div>
                        </div>
                        <p class="text-[10px] text-slate-400">กำหนดส่ง: ${t.end}</p>
                    `;
                    todayContainer.appendChild(todayCard);
                }

                const endDateObj = new Date(t.end);
                const todayObj = new Date(todayStr);
                const diffTime = endDateObj - todayObj;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let dayBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">เหลือ ${diffDays} วัน</span>`;
                if (prog === 100) dayBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">เสร็จสิ้น</span>`;
                else if (diffDays < 0) dayBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">เกินกำหนด</span>`;
                else if (diffDays <= 3) dayBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">เหลือ ${diffDays} วัน (ด่วน)</span>`;

                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50 border-b border-slate-100 text-xs";
                tr.innerHTML = `
                    <td class="p-3 font-semibold text-slate-800">${t.name}</td>
                    <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${t.category === 'Law' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}">${t.category}</span></td>
                    <td class="p-3 text-slate-500 text-[11px]">
                        <div>${t.start} ถึง ${t.end}</div>
                        <div class="mt-0.5">${dayBadge}</div>
                    </td>
                    <td class="p-3">
                        <div class="flex items-center gap-2">
                            <div class="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div class="bg-blue-600 h-full" style="width: ${t.progress}%"></div>
                            </div>
                            <span class="font-bold text-xs text-blue-600">${t.progress}%</span>
                        </div>
                    </td>
                    <td class="p-3 text-right">
                        <button onclick="editTask('${t.id}')" class="text-blue-600 hover:underline text-xs mr-2">แก้ไข</button>
                        <button onclick="deleteTask('${t.id}')" class="text-red-500 hover:underline text-xs">ลบ</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            if (!todayTaskFound && todayContainer) {
                todayContainer.innerHTML = `<p class="text-xs text-slate-400 py-4 text-center">ไม่มีภาระงานที่ต้องทำในวันนี้</p>`;
            }

            const avgProg = tasks.length ? Math.round(sumProg / tasks.length) : 0;
            const headerPercent = document.getElementById('header-total-progress-percent');
            if (headerPercent) headerPercent.innerText = `${avgProg}%`;

            const headerBar = document.getElementById('header-total-progress-bar');
            if (headerBar) headerBar.style.width = `${avgProg}%`;

            const statTotal = document.getElementById('stat-total-tasks');
            if (statTotal) statTotal.innerText = tasks.length;

            const statInProg = document.getElementById('stat-in-progress-tasks');
            if (statInProg) statInProg.innerText = inProgressCount;

            const statComp = document.getElementById('stat-completed-tasks');
            if (statComp) statComp.innerText = completedCount;

            const statLaw = document.getElementById('stat-law-tasks');
            if (statLaw) statLaw.innerText = totalLaw;

            initGanttChart();
        }

        let ganttChartObj = null;

        function saveTask(e) {
            e.preventDefault();
            const id = document.getElementById('task-id').value;
            const name = document.getElementById('task-name').value;
            const category = document.getElementById('task-category').value;
            const start = document.getElementById('task-start').value;
            const end = document.getElementById('task-end').value;
            const progress = document.getElementById('task-progress').value;

            if (id) {
                const idx = tasks.findIndex(t => t.id === id);
                if (idx !== -1) {
                    tasks[idx] = { id, name, category, start, end, progress: parseInt(progress) };
                }
            } else {
                tasks.push({
                    id: Date.now().toString(),
                    name,
                    category,
                    start,
                    end,
                    progress: parseInt(progress)
                });
            }

            resetTaskForm();
            renderTasks();
        }

        function resetTaskForm() {
            document.getElementById('task-id').value = '';
            document.getElementById('task-name').value = '';
            document.getElementById('task-category').value = 'Law';
            document.getElementById('task-start').value = getRelativeDate(0);
            document.getElementById('task-end').value = getRelativeDate(7);
            document.getElementById('task-progress').value = 0;
            document.getElementById('task-progress-val').innerText = '0%';
            document.getElementById('task-submit-btn').innerHTML = `<i data-lucide="save" class="w-4 h-4"></i><span>บันทึก Task</span>`;
            if (window.lucide) lucide.createIcons();
        }

        function editTask(id) {
            const task = tasks.find(t => t.id === id);
            if (!task) return;
            document.getElementById('task-id').value = task.id;
            document.getElementById('task-name').value = task.name;
            document.getElementById('task-category').value = task.category;
            document.getElementById('task-start').value = task.start;
            document.getElementById('task-end').value = task.end;
            document.getElementById('task-progress').value = task.progress;
            document.getElementById('task-progress-val').innerText = task.progress + '%';
            document.getElementById('task-submit-btn').innerHTML = `<i data-lucide="check" class="w-4 h-4"></i><span>อัปเดต Task</span>`;
            if (window.lucide) lucide.createIcons();
        }

        function deleteTask(id) {
            tasks = tasks.filter(t => t.id !== id);
            renderTasks();
        }

        // AUTH & NAVIGATION HANDLERS
        function switchAuthTab(mode) {
            authMode = mode;
            const loginBtn = document.getElementById('tab-login-btn');
            const regBtn = document.getElementById('tab-reg-btn');
            const loginForm = document.getElementById('login-form');
            const regForm = document.getElementById('register-form');

            if (mode === 'login') {
                loginBtn.className = "flex-1 py-3.5 text-xs font-extrabold text-center border-b-2 border-blue-600 text-blue-600 flex items-center justify-center gap-1.5 transition-all";
                regBtn.className = "flex-1 py-3.5 text-xs font-extrabold text-center border-b-2 border-transparent text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1.5 transition-all";
                loginForm.classList.remove('hidden');
                regForm.classList.add('hidden');
            } else {
                regBtn.className = "flex-1 py-3.5 text-xs font-extrabold text-center border-b-2 border-blue-600 text-blue-600 flex items-center justify-center gap-1.5 transition-all";
                loginBtn.className = "flex-1 py-3.5 text-xs font-extrabold text-center border-b-2 border-transparent text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1.5 transition-all";
                regForm.classList.remove('hidden');
                loginForm.classList.add('hidden');
            }
        }
        function handleLogin(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                alert('กรุณากรอกอีเมลและรหัสผ่าน');
                return;
            }

            const domain = Object.values(DOMAINS).find(d => email.endsWith(d));
            if (!domain) {
                alert('กรุณาใช้อีเมลมหาวิทยาลัยที่กำหนด');
                return;
            }

            if (authUserType === 'admin') {
                if (email !== 'admin@lawhub.com' || password !== 'admin123') {
                    alert('อีเมลหรือรหัสผ่านผู้ดูแลระบบไม่ถูกต้อง');
                    return;
                }
                currentUser = { name: 'Administrator', email, role: 'admin' };
            } else {
                const users = JSON.parse(localStorage.getItem('lawHubUsers') || '[]');
                const user = users.find(u => u.email === email && u.password === password);
                if (!user) {
                    alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
                    return;
                }
                currentUser = user;
            }

            document.getElementById('auth-modal').classList.add('hidden');
            updateUserInterface();
        }

        function handleRegister(e) {
            e.preventDefault();
            const name = document.getElementById('register-name').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;

            if (!name || !email || !password || !confirmPassword) {
                alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
                return;
            }

            const domain = Object.values(DOMAINS).find(d => email.endsWith(d));
            if (!domain) {
                alert('กรุณาใช้อีเมลมหาวิทยาลัยที่กำหนด');
                return;
            }

            if (password.length < 6) {
                alert('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
                return;
            }

            if (password !== confirmPassword) {
                alert('รหัสผ่านไม่ตรงกัน');
                return;
            }

            const users = JSON.parse(localStorage.getItem('lawHubUsers') || '[]');
            if (users.some(u => u.email === email)) {
                alert('อีเมลนี้ถูกลงทะเบียนแล้ว');
                return;
            }

            const uniKey = Object.keys(DOMAINS).find(key => DOMAINS[key] === domain);
            users.push({
                name,
                email,
                password,
                university: UNI_NAMES[uniKey],
                role: 'student'
            });
            localStorage.setItem('lawHubUsers', JSON.stringify(users));

            alert('สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ');
            switchAuthTab('login');
            document.getElementById('login-email').value = email;
        }

        function updateUserInterface() {
            if (!currentUser) return;
            const userName = document.getElementById('header-user-name');
            const userEmail = document.getElementById('header-user-email');
            if (userName) userName.innerText = currentUser.name;
            if (userEmail) userEmail.innerText = currentUser.email;

            const adminPanelBtn = document.getElementById('admin-panel-btn');
            if (adminPanelBtn) {
                if (currentUser.role === 'admin') adminPanelBtn.classList.remove('hidden');
                else adminPanelBtn.classList.add('hidden');
            }
        }

        function handleLogout() {
            currentUser = null;
            document.getElementById('auth-modal').classList.remove('hidden');
            switchAuthTab('login');
        }

        function showSection(sectionName) {
            document.querySelectorAll('main section').forEach(section => section.classList.add('hidden'));
            const target = document.getElementById(`section-${sectionName}`);
            if (target) target.classList.remove('hidden');

            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('bg-blue-50', 'text-blue-700');
                item.classList.add('text-slate-600');
            });

            const activeNav = document.querySelector(`[data-section="${sectionName}"]`);
            if (activeNav) {
                activeNav.classList.add('bg-blue-50', 'text-blue-700');
                activeNav.classList.remove('text-slate-600');
            }

            if (sectionName === 'dashboard') renderTasks();
            if (sectionName === 'exambank') renderExams();
            if (sectionName === 'reviews') renderCourseReviews();
            if (sectionName === 'sheets') renderSummarySheets();
        }

        // EXAM BANK & DISCUSSION
        function renderExams() {
            const container = document.getElementById('exams-container');
            if (!container) return;
            container.innerHTML = '';

            const approvedExams = exams.filter(exam => exam.status === 'Approved');
            if (approvedExams.length === 0) {
                container.innerHTML = '<p class="text-center text-slate-400 py-8">ไม่พบข้อสอบที่ค้นหา</p>';
                return;
            }

            approvedExams.forEach(exam => {
                const card = document.createElement('div');
                card.className = 'glass-card-light p-5 rounded-3xl space-y-4';
                card.innerHTML = `
                    <div class="flex flex-wrap justify-between items-start gap-2">
                        <div>
                            <p class="text-xs text-blue-600 font-bold">${exam.code} • ${exam.year}</p>
                            <h3 class="font-bold text-slate-800 text-base">${exam.name}</h3>
                            <p class="text-xs text-slate-500 mt-1">${exam.university} | ${exam.professor}</p>
                        </div>
                        <span class="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">อนุมัติแล้ว</span>
                    </div>
                    <div class="p-4 bg-slate-50 rounded-2xl space-y-2">
                        <p class="text-xs font-bold text-slate-700">โจทย์ข้อสอบ</p>
                        <p class="text-sm text-slate-800 leading-relaxed">${exam.question}</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button onclick="toggleExamAnswer(${exam.id})" class="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">ดูธงคำตอบ</button>
                        <button onclick="toggleExamComments(${exam.id})" class="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">ความคิดเห็น (${exam.comments.length})</button>
                    </div>
                    <div id="answer-${exam.id}" class="hidden p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-2">
                        <p class="text-xs font-bold text-blue-800">ธงคำตอบ / แนวทางการวินิจฉัย</p>
                        <p class="text-sm text-slate-800 leading-relaxed">${exam.answerKey}</p>
                        <p class="text-xs font-bold text-blue-800 mt-2">เกณฑ์การให้คะแนน</p>
                        <p class="text-xs text-slate-700 whitespace-pre-line">${exam.rubric}</p>
                    </div>
                    <div id="comments-${exam.id}" class="hidden space-y-3">
                        <div id="comment-list-${exam.id}" class="space-y-2">
                            ${exam.comments.map(c => `
                                <div class="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                                    <p class="font-bold text-slate-700">${c.user}</p>
                                    <p class="text-slate-600">${c.text}</p>
                                    <div class="flex justify-between items-center text-[10px] text-slate-400">
                                        <span>${c.time}</span>
                                        <span>เห็นด้วย ${c.agrees} คน</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <form onsubmit="addExamComment(event, ${exam.id})" class="flex gap-2">
                            <input id="comment-input-${exam.id}" required placeholder="แสดงความคิดเห็น..." class="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none">
                            <button class="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">ส่ง</button>
                        </form>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function toggleExamAnswer(id) {
            document.getElementById(`answer-${id}`).classList.toggle('hidden');
        }

        function toggleExamComments(id) {
            document.getElementById(`comments-${id}`).classList.toggle('hidden');
        }

        function addExamComment(e, examId) {
            e.preventDefault();
            const input = document.getElementById(`comment-input-${examId}`);
            const exam = exams.find(x => x.id === examId);
            if (!exam || !input.value.trim()) return;

            exam.comments.push({
                id: Date.now().toString(),
                user: currentUser ? currentUser.email : 'ผู้ใช้งาน',
                text: input.value.trim(),
                time: 'เมื่อสักครู่',
                agrees: 0,
                reports: 0,
                reportedBy: []
            });
            renderExams();
            document.getElementById(`comments-${examId}`).classList.remove('hidden');
        }

        function filterExams() {
            const keyword = document.getElementById('search-general').value.toLowerCase();
            const code = document.getElementById('search-code').value.toLowerCase();
            const name = document.getElementById('search-name').value.toLowerCase();
            const prof = document.getElementById('search-prof').value.toLowerCase();
            const uni = document.getElementById('search-uni').value;
            const year = document.getElementById('search-year').value.toLowerCase();

            const filtered = exams.filter(exam => {
                return exam.status === 'Approved' &&
                    (!keyword || `${exam.code} ${exam.name} ${exam.question}`.toLowerCase().includes(keyword)) &&
                    (!code || exam.code.toLowerCase().includes(code)) &&
                    (!name || exam.name.toLowerCase().includes(name)) &&
                    (!prof || exam.professor.toLowerCase().includes(prof)) &&
                    (!uni || exam.university === uni) &&
                    (!year || exam.year.toLowerCase().includes(year));
            });

            const container = document.getElementById('exams-container');
            if (!container) return;
            const oldExams = exams;
            exams = filtered;
            renderExams();
            exams = oldExams;
        }
        function setAuthUserType(type) {
            authUserType = type;
            const studBtn = document.getElementById('type-student-btn');
            const genBtn = document.getElementById('type-general-btn');
            const uniSelectContainer = document.getElementById('login-uni-select-container');
            const regUniSelectContainer = document.getElementById('reg-uni-select-container');
            const loginStudentHint = document.getElementById('login-student-hint');
            const regStudentHint = document.getElementById('reg-student-hint');
            const regDomainBadge = document.getElementById('reg-domain-badge');

            if (type === 'student') {
                studBtn.className = "py-2.5 px-3 text-xs font-bold rounded-xl border-2 border-blue-500 bg-blue-50 text-blue-700 flex items-center justify-center gap-1.5 shadow-sm transition-all";
                genBtn.className = "py-2.5 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-all";
                if (uniSelectContainer) uniSelectContainer.classList.remove('hidden');
                if (regUniSelectContainer) regUniSelectContainer.classList.remove('hidden');
                if (loginStudentHint) loginStudentHint.classList.remove('hidden');
                if (regStudentHint) regStudentHint.classList.remove('hidden');
                if (regDomainBadge) regDomainBadge.classList.remove('hidden');
                updateLoginDomainHint();
                updateRegDomainHint();
            } else {
                genBtn.className = "py-2.5 px-3 text-xs font-bold rounded-xl border-2 border-blue-500 bg-blue-50 text-blue-700 flex items-center justify-center gap-1.5 shadow-sm transition-all";
                studBtn.className = "py-2.5 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-all";
                if (uniSelectContainer) uniSelectContainer.classList.add('hidden');
                if (regUniSelectContainer) regUniSelectContainer.classList.add('hidden');
                if (loginStudentHint) loginStudentHint.classList.add('hidden');
                if (regStudentHint) regStudentHint.classList.add('hidden');
                if (regDomainBadge) regDomainBadge.classList.add('hidden');

                const loginEmail = document.getElementById('login-email');
                const regEmail = document.getElementById('reg-email');
                if (loginEmail) loginEmail.placeholder = 'example@gmail.com';
                if (regEmail) regEmail.placeholder = 'yourname@gmail.com';
            }
        }

        function updateLoginDomainHint() {
            if (authUserType !== 'student') return;
            const uniSelect = document.getElementById('login-uni');
            if (!uniSelect) return;
            const uni = uniSelect.value;
            const loginEmail = document.getElementById('login-email');
            const placeholders = {
                TU: 'student@dome.tu.ac.th',
                CU: 'student@student.chula.ac.th',
                RU: 'student@rumail.ru.ac.th'
            };
            if (loginEmail && placeholders[uni]) {
                loginEmail.placeholder = placeholders[uni];
            }
        }

        function updateRegDomainHint() {
            if (authUserType !== 'student') return;
            const uniSelect = document.getElementById('reg-uni');
            if (!uniSelect) return;
            const uni = uniSelect.value;
            const reqDomainText = document.getElementById('required-domain-text');
            const regEmail = document.getElementById('reg-email');
            const placeholders = {
                TU: 'student@dome.tu.ac.th',
                CU: 'student@student.chula.ac.th',
                RU: 'student@rumail.ru.ac.th'
            };
            if (reqDomainText && DOMAINS[uni]) {
                reqDomainText.innerText = DOMAINS[uni];
            }
            if (regEmail && placeholders[uni]) {
                regEmail.placeholder = placeholders[uni];
            }
        }

        function updateDomainHint() {
            updateRegDomainHint();
        }

        function handleLogin(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const uniSelect = document.getElementById('login-uni');
            const uniKey = uniSelect ? uniSelect.value : 'TU';

            if (authUserType === 'student') {
                const expected = DOMAINS[uniKey];
                if (!email.toLowerCase().endsWith(expected)) {
                    showAuthError(`อีเมลนักศึกษาต้องลงท้ายด้วย ${expected}`);
                    return;
                }
            }

            currentUser = {
                email,
                type: authUserType,
                university: authUserType === 'student' ? UNI_NAMES[uniKey] : 'บุคคลทั่วไป'
            };
            showDashboard();
        }

        function handleRegister(e) {
            e.preventDefault();
            const email = document.getElementById('reg-email').value.trim();
            const uniSelect = document.getElementById('reg-uni');
            const uniKey = uniSelect ? uniSelect.value : 'TU';

            if (authUserType === 'student') {
                const expected = DOMAINS[uniKey];
                if (!email.toLowerCase().endsWith(expected)) {
                    showAuthError(`อีเมลสมัครต้องลงท้ายด้วย ${expected}`);
                    return;
                }
            }

            currentUser = {
                email,
                type: authUserType,
                university: authUserType === 'student' ? UNI_NAMES[uniKey] : 'บุคคลทั่วไป'
            };
            showDashboard();
        }

        function showAuthError(msg) {
            const errBox = document.getElementById('auth-error-msg');
            const errText = document.getElementById('auth-error-text');
            if (errBox && errText) {
                errText.innerText = msg;
                errBox.classList.remove('hidden');
            }
        }

        function showDashboard() {
            document.getElementById('auth-screen').classList.add('hidden');
            document.getElementById('main-app').classList.remove('hidden');

            document.getElementById('nav-user-email').innerText = currentUser.email;
            document.getElementById('nav-user-badge').innerText = currentUser.university;

            renderTasks();
            renderExams();
            renderReviews();
            renderSheets();
            if (window.lucide) lucide.createIcons();
        }

        function handleLogout() {
            currentUser = null;
            document.getElementById('main-app').classList.add('hidden');
            document.getElementById('auth-screen').classList.remove('hidden');
        }

        function switchTab(tabName) {
            const tabs = ['gantt', 'exambank', 'pomodoro', 'course-reviews', 'summary-sheets'];
            tabs.forEach(t => {
                const section = document.getElementById(`section-${t}`);
                const btn = document.getElementById(`nav-tab-${t}`);
                if (section) {
                    if (t === tabName) section.classList.remove('hidden');
                    else section.classList.add('hidden');
                }
                if (btn) {
                    if (t === tabName) {
                        btn.className = "nav-tab-btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-md transition-all";
                    } else {
                        btn.className = "nav-tab-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all";
                    }
                }
            });

            if (tabName === 'gantt') {
                setTimeout(() => {
                    initGanttChart();
                }, 100);
            }
        }

        // EXAM HUB FUNCTIONS
        function switchExamSubTab(sub) {
            ['search', 'upload', 'approval'].forEach(s => {
                const view = document.getElementById(`exam-subtab-${s}`);
                const btn = document.getElementById(`exam-tab-${s}`);
                if (view) {
                    if (s === sub) view.classList.remove('hidden');
                    else view.classList.add('hidden');
                }
                if (btn) {
                    if (s === sub) {
                        btn.className = "px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-blue-600 text-white shadow-md transition-all";
                    } else {
                        btn.className = "px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all border border-slate-200";
                    }
                }
            });
        }

        function renderExams() {
            const container = document.getElementById('exams-container');
            if (!container) return;
            container.innerHTML = '';

            const gen = document.getElementById('search-general')?.value.toLowerCase() || '';
            const code = document.getElementById('search-code')?.value.toLowerCase() || '';
            const name = document.getElementById('search-name')?.value.toLowerCase() || '';
            const prof = document.getElementById('search-prof')?.value.toLowerCase() || '';
            const uni = document.getElementById('search-uni')?.value || '';
            const year = document.getElementById('search-year')?.value.toLowerCase() || '';

            const filtered = exams.filter(e => {
                if (e.status !== 'Approved') return false;
                if (gen && !e.name.toLowerCase().includes(gen) && !e.code.toLowerCase().includes(gen) && !e.question.toLowerCase().includes(gen)) return false;
                if (code && !e.code.toLowerCase().includes(code)) return false;
                if (name && !e.name.toLowerCase().includes(name)) return false;
                if (prof && !e.professor.toLowerCase().includes(prof)) return false;
                if (uni && e.university !== uni) return false;
                if (year && !e.year.toLowerCase().includes(year)) return false;
                return true;
            });

            filtered.forEach(e => {
                const card = document.createElement('div');
                card.className = "glass-card-light p-6 rounded-3xl space-y-4";

                let commentsHTML = e.comments.map(c => `
                    <div class="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                        <div class="flex justify-between items-center text-slate-500">
                            <span class="font-bold text-slate-700">${c.user}</span>
                            <span>${c.time}</span>
                        </div>
                        <p class="text-slate-700 leading-relaxed">${c.text}</p>
                        <div class="flex items-center gap-3 mt-2">
                            <button onclick="agreeComment(${e.id}, '${c.id}')" class="text-blue-600 font-bold hover:underline">👍 เห็นด้วย (${c.agrees})</button>
                            <button onclick="reportComment(${e.id}, '${c.id}')" class="text-red-500 font-bold hover:underline">รายงาน</button>
                        </div>
                    </div>
                `).join('');

                card.innerHTML = `
                    <div class="flex flex-wrap justify-between items-start gap-3">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-xs font-black text-blue-600">${e.code}</span>
                                <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">${e.year}</span>
                            </div>
                            <h3 class="font-bold text-slate-800 text-base">${e.name}</h3>
                            <p class="text-xs text-slate-500 mt-1">${e.university} | ${e.professor}</p>
                        </div>
                        <span class="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100">อนุมัติแล้ว</span>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-2xl space-y-2">
                        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">โจทย์ข้อสอบ (Question)</p>
                        <p class="text-sm text-slate-800 leading-relaxed">${e.question}</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button onclick="toggleExamDetail(${e.id}, 'answer')" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm">เฉลย / ธงคำตอบ</button>
                        <button onclick="toggleExamDetail(${e.id}, 'rubric')" class="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all border border-indigo-100">เกณฑ์การให้คะแนน</button>
                        <button onclick="toggleExamDetail(${e.id}, 'comments')" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all">💬 อภิปราย (${e.comments.length})</button>
                    </div>
                    <div id="exam-detail-${e.id}-answer" class="hidden p-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-slate-800 leading-relaxed whitespace-pre-line">${e.answerKey}</div>
                    <div id="exam-detail-${e.id}-rubric" class="hidden p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-slate-800 leading-relaxed whitespace-pre-line">${e.rubric}</div>
                    <div id="exam-detail-${e.id}-comments" class="hidden space-y-3 pt-2">
                        <div class="space-y-2">${commentsHTML || '<p class="text-xs text-slate-400">ยังไม่มีความคิดเห็น</p>'}</div>
                        <form onsubmit="addComment(event, ${e.id})" class="flex gap-2">
                            <input id="new-comment-${e.id}" type="text" placeholder="แสดงความคิดเห็นหรือถามข้อสงสัย..." class="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500" required>
                            <button type="submit" class="px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl">ส่ง</button>
                        </form>
                    </div>
                `;
                container.appendChild(card);
            });
        }
        function openUploadSheetModal() {
            document.getElementById('upload-sheet-modal').classList.remove('hidden');
        }

        function closeUploadSheetModal() {
            document.getElementById('upload-sheet-modal').classList.add('hidden');
        }

        function saveSummarySheet(e) {
            e.preventDefault();
            summarySheets.push({
                id: 's' + Date.now(),
                title: document.getElementById('sheet-title').value,
                code: document.getElementById('sheet-code').value,
                subject: document.getElementById('sheet-subject').value,
                sec: document.getElementById('sheet-sec').value,
                professor: document.getElementById('sheet-prof').value,
                university: document.getElementById('sheet-uni').value,
                desc: document.getElementById('sheet-desc').value,
                author: currentUser ? currentUser.email : 'Community User',
                downloads: 0,
                fileType: 'PDF'
            });
            closeUploadSheetModal();
            renderSheets();
        }

        function downloadSheet(id) {
            const sheet = summarySheets.find(s => s.id === id);
            if (sheet) {
                sheet.downloads++;
                renderSheets();
                alert(`เปิดพรีวิวไฟล์: ${sheet.title}`);
            }
        }

        // REVIEWS FUNCTIONS
        function renderReviews() {
            const container = document.getElementById('reviews-container');
            if (!container) return;
            container.innerHTML = '';

            const gen = document.getElementById('review-search-text')?.value.toLowerCase() || '';
            const code = document.getElementById('review-search-code')?.value.toLowerCase() || '';
            const name = document.getElementById('review-search-name')?.value.toLowerCase() || '';
            const sec = document.getElementById('review-search-sec')?.value.toLowerCase() || '';
            const prof = document.getElementById('review-search-prof')?.value.toLowerCase() || '';
            const uni = document.getElementById('review-search-uni')?.value || '';

            const filtered = courseReviews.filter(r => {
                if (gen && !r.subject.toLowerCase().includes(gen) && !r.professor.toLowerCase().includes(gen) && !r.comment.toLowerCase().includes(gen)) return false;
                if (code && !r.subject.toLowerCase().includes(code)) return false;
                if (name && !r.subject.toLowerCase().includes(name)) return false;
                if (sec && !r.sec.toLowerCase().includes(sec)) return false;
                if (prof && !r.professor.toLowerCase().includes(prof)) return false;
                if (uni && r.university !== uni) return false;
                return true;
            });

            filtered.forEach(r => {
                const card = document.createElement('div');
                card.className = "glass-card-light p-5 rounded-3xl space-y-3";
                card.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded">${r.sec}</span>
                            <h4 class="font-bold text-sm text-slate-800 mt-1">${r.subject}</h4>
                            <p class="text-xs text-slate-500">อาจารย์ผู้สอน: ${r.professor} (${r.university})</p>
                        </div>
                        <span class="text-amber-500 font-black text-sm">⭐ ${r.rating}/5</span>
                    </div>
                    <p class="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-200 leading-relaxed">${r.comment}</p>
                    <div class="flex justify-between items-center text-[11px] text-slate-400">
                        <span>สไตล์: ${r.style}</span>
                        <span>โดย: ${r.author}</span>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function filterReviews() {
            renderReviews();
        }

        function resetReviewSearch() {
            ['review-search-text', 'review-search-code', 'review-search-name', 'review-search-sec', 'review-search-prof'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            const uni = document.getElementById('review-search-uni');
            if (uni) uni.value = '';
            renderReviews();
        }

        function openReviewModal() {
            document.getElementById('add-review-modal').classList.remove('hidden');
        }

        function closeReviewModal() {
            document.getElementById('add-review-modal').classList.add('hidden');
        }

        function saveCourseReview(e) {
            e.preventDefault();
            const anon = document.getElementById('rev-anon').checked;
            courseReviews.push({
                id: 'r' + Date.now(),
                subject: document.getElementById('rev-subject').value,
                sec: document.getElementById('rev-sec').value || 'Sec 01',
                professor: document.getElementById('rev-prof').value,
                university: document.getElementById('rev-uni').value,
                year: document.getElementById('rev-year').value,
                difficulty: document.getElementById('rev-diff').value,
                rating: parseInt(document.getElementById('rev-rating').value),
                style: document.getElementById('rev-style').value,
                comment: document.getElementById('rev-comment').value,
                author: anon ? 'ไม่ระบุตัวตน (Anonymous)' : (currentUser ? currentUser.email : 'นักศึกษา')
            });
            closeReviewModal();
            renderReviews();
        }

        // TIMER & BRAINWAVES
        let pomoInterval = null;
        let pomoTimeLeft = 25 * 60;

        function updatePomoDisplay() {
            const m = Math.floor(pomoTimeLeft / 60);
            const s = pomoTimeLeft % 60;
            const disp = document.getElementById('pomo-display');
            if (disp) disp.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }

        function startPomodoro() {
            if (pomoInterval) return;
            document.getElementById('timer-start-btn').classList.add('hidden');
            document.getElementById('timer-pause-btn').classList.remove('hidden');
            pomoInterval = setInterval(() => {
                if (pomoTimeLeft > 0) {
                    pomoTimeLeft--;
                    updatePomoDisplay();
                } else {
                    pausePomodoro();
                    alert('🎉 หมดเวลาแล้ว! พักผ่อนสายตาได้เลย');
                }
            }, 1000);
        }

        function pausePomodoro() {
            clearInterval(pomoInterval);
            pomoInterval = null;
            document.getElementById('timer-start-btn').classList.remove('hidden');
            document.getElementById('timer-pause-btn').classList.add('hidden');
        }

        function resetPomodoro() {
            pausePomodoro();
            pomoTimeLeft = 25 * 60;
            updatePomoDisplay();
        }

        function setTimerPreset(mins, label) {
            pausePomodoro();
            pomoTimeLeft = mins * 60;
            document.getElementById('timer-mode-label').innerText = label;
            updatePomoDisplay();
        }

        function openCustomTimerModal() {
            document.getElementById('custom-timer-modal').classList.remove('hidden');
        }

        function closeCustomTimerModal() {
            document.getElementById('custom-timer-modal').classList.add('hidden');
        }

        function applyCustomTimer() {
            const val = parseInt(document.getElementById('custom-timer-input').value);
            if (val && val > 0) {
                setTimerPreset(val, 'Custom Session');
            }
            closeCustomTimerModal();
        }

        // ADMIN PANEL HANDLERS (EXAM APPROVAL & COMMENT MODERATION)
        function switchAdminTab(adminTab) {
            const pendingView = document.getElementById('admin-pending-exams-view');
            const reportedView = document.getElementById('admin-reported-comments-view');
            const examsBtn = document.getElementById('admin-subtab-exams-btn');
            const reportsBtn = document.getElementById('admin-subtab-reports-btn');

            if (adminTab === 'pendingExams') {
                if (pendingView) pendingView.classList.remove('hidden');
                if (reportedView) reportedView.classList.add('hidden');
                if (examsBtn) examsBtn.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white";
                if (reportsBtn) reportsBtn.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200";
                renderPendingExams();
            } else {
                if (pendingView) pendingView.classList.add('hidden');
                if (reportedView) reportedView.classList.remove('hidden');
                if (reportsBtn) reportsBtn.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white";
                if (examsBtn) examsBtn.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200";
                renderReportedComments();
            }
        }

        function renderPendingExams() {
            const listContainer = document.getElementById('pending-exams-list');
            if (!listContainer) return;
            listContainer.innerHTML = '';

            const pendingExams = exams.filter(e => e.status === 'Pending Admin Approval');
            const badge = document.getElementById('pending-count-badge');
            if (badge) badge.innerText = pendingExams.length;

            if (pendingExams.length === 0) {
                listContainer.innerHTML = '<p class="text-xs text-slate-400 py-6 text-center">ไม่มีข้อสอบที่รอการอนุมัติในขณะนี้</p>';
                return;
            }

            pendingExams.forEach(e => {
            pendingExams.forEach(e => {
                const item = document.createElement('div');
                item.className = "p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs";
                item.innerHTML = `
                    <div class="flex justify-between items-center font-bold text-slate-800">
                        <span>[${e.code}] ${e.name} (${e.year})</span>
                        <span class="text-amber-600">Pending Approval</span>
                    </div>
                    <p class="text-slate-600"><strong>ผู้สอน:</strong> ${e.professor}</p>
                    <p class="text-slate-700 font-mono bg-white p-2.5 rounded-xl border border-slate-200">${e.question}</p>
                    <div class="flex justify-end gap-2 pt-2">
                        <button onclick="approveExam(${e.id})" class="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold">✅ อนุมัติ</button>
                        <button onclick="rejectExam(${e.id})" class="px-3 py-1.5 bg-red-600 text-white rounded-xl font-bold">❌ ปฏิเสธ</button>
                    </div>
                `;
                listContainer.appendChild(item);
            });
        }

        function renderReportedComments() {
            const listContainer = document.getElementById('reported-comments-list');
            if (!listContainer) return;
            listContainer.innerHTML = '';

            let reportedItems = [];
            exams.forEach(e => {
                e.comments.forEach(c => {
                    if (c.reports > 0) {
                        reportedItems.push({ examId: e.id, examTitle: e.name, comment: c });
                    }
                });
            });

            if (reportedItems.length === 0) {
                listContainer.innerHTML = '<p class="text-xs text-slate-400 py-6 text-center">ไม่มีความคิดเห็นที่ถูกรายงานในขณะนี้</p>';
                return;
            }

            reportedItems.forEach(item => {
                const c = item.comment;
                const card = document.createElement('div');
                card.className = "p-4 bg-red-50 border border-red-200 rounded-2xl space-y-2 text-xs";
                card.innerHTML = `
                    <div class="flex justify-between items-center font-bold text-red-800">
                        <span>วิชา: ${item.examTitle}</span>
                        <span class="px-2 py-0.5 bg-red-200 text-red-900 rounded">ถูกรายงาน ${c.reports} ครั้ง</span>
                    </div>
                    <p class="text-slate-800"><strong>${c.user}:</strong> ${c.text}</p>
                    <div class="flex justify-end gap-2 pt-2">
                        <button onclick="dismissReport(${item.examId}, '${c.id}')" class="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl font-bold">ยกเลิกรายงาน</button>
                        <button onclick="deleteComment(${item.examId}, '${c.id}')" class="px-3 py-1.5 bg-red-600 text-white rounded-xl font-bold">ลบคอมเมนต์</button>
                    </div>
                `;
                listContainer.appendChild(card);
            });
        }

        function approveExam(id) {
            const exam = exams.find(e => e.id === id);
            if (exam) {
                exam.status = 'Approved';
                renderPendingExams();
                renderExams();
            }
        }

        function rejectExam(id) {
            exams = exams.filter(e => e.id !== id);
            renderPendingExams();
            renderExams();
        }

        function dismissReport(examId, commentId) {
            const exam = exams.find(e => e.id === examId);
            if (exam) {
                const comment = exam.comments.find(c => c.id === commentId);
                if (comment) {
                    comment.reports = 0;
                    renderReportedComments();
                    renderExams();
                }
            }
        }

        function deleteComment(examId, commentId) {
            const exam = exams.find(e => e.id === examId);
            if (exam) {
                exam.comments = exam.comments.filter(c => c.id !== commentId);
                renderReportedComments();
                renderExams();
            }
        }

        let audioCtx = null;
        function playBrainwave(type) {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const badge = document.getElementById('audio-status-badge');
            const title = document.getElementById('current-sound-title');
            if (badge) badge.innerText = 'Playing';
            if (title) title.innerText = `กำลังเล่นคลื่นเสียง: ${type.toUpperCase()}`;
        }

        function stopAudio() {
            const badge = document.getElementById('audio-status-badge');
            const title = document.getElementById('current-sound-title');
            if (badge) badge.innerText = 'Ready';
            if (title) title.innerText = 'เลือกคลื่นเสียงเพื่อเปิดเล่น';
        }

        // SETTINGS MODAL
        function openSettingsModal() {
            document.getElementById('user-settings-modal').classList.remove('hidden');
        }

        function closeSettingsModal() {
            document.getElementById('user-settings-modal').classList.add('hidden');
        }

        function switchSettingsTab(t) {
            ['profile', 'security', 'pref', 'data'].forEach(tab => {
                const view = document.getElementById(`set-view-${tab}`);
                const btn = document.getElementById(`set-tab-${tab}`);
                if (view) {
                    if (tab === t) view.classList.remove('hidden');
                    else view.classList.add('hidden');
                }
                if (btn) {
                    if (tab === t) btn.className = "pb-2 text-blue-600 border-b-2 border-blue-600 font-bold";
                    else btn.className = "pb-2 text-slate-400 border-b-2 border-transparent hover:text-slate-600 font-bold";
                }
            });
        }

        function saveUserSettings() {
            alert('บันทึกข้อมูลการตั้งค่าเรียบร้อยแล้ว!');
            closeSettingsModal();
        }

        function exportUserData() {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ tasks, summarySheets, courseReviews }));
            const dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", "law_hub_user_data.json");
            dlAnchorElem.click();
        }

        function deleteAccount() {
            if (confirm('คุณแน่ใจหรือว่าต้องการลบบัญชีผู้ใช้? ข้อมูลทั้งหมดจะถูกลบถาวร')) {
                handleLogout();
            }
        }

        // INITIALIZATION
        window.onload = function() {
            if (window.lucide) lucide.createIcons();
            setAuthUserType('student');
        };
