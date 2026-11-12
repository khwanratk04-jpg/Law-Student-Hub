const firebaseConfig = {
    apiKey: "AIzaSyBoUZg0HJzZ2cp5Zeh-Tq5tvsKwjWYv5lw",
    authDomain: "law-student-hub-f4ce2.firebaseapp.com",
    projectId: "law-student-hub-f4ce2",
    storageBucket: "law-student-hub-f4ce2.firebasestorage.app",
    messagingSenderId: "870165363239",
    appId: "1:870165363239:web:5d60270c7b57ac2cd16c02",
    measurementId: "G-3R3VX7FN3D"
};

firebase.initializeApp(firebaseConfig);
const firebaseAuth = firebase.auth();
const firestore = firebase.firestore();
let cloudSaveTimer = null;
let isLoadingCloudData = false;

async function loadCloudData() {
    if (!firebaseAuth.currentUser) return;
    isLoadingCloudData = true;
    try {
        const ref = firestore.collection('users').doc(firebaseAuth.currentUser.uid)
            .collection('workspace').doc('main');
        const snap = await ref.get();
        if (snap.exists) {
            const data = snap.data();
            if (Array.isArray(data.tasks)) tasks = data.tasks;
            if (Array.isArray(data.exams)) exams = data.exams;
            if (Array.isArray(data.courseReviews)) courseReviews = data.courseReviews;
            if (Array.isArray(data.summarySheets)) summarySheets = data.summarySheets;
            if (data.userProfileData && typeof data.userProfileData === 'object') {
                userProfileData = data.userProfileData;
            }
        } else {
            await saveCloudDataNow();
        }

        // Load shared course reviews so all signed-in users see the same list.
        const sharedReviewsSnap = await firestore.collection('publicCourseReviews')
            .orderBy('createdAt', 'desc').get();
        if (!sharedReviewsSnap.empty) {
            courseReviews = sharedReviewsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }
    } catch (error) {
        console.error('Firebase load error:', error);
        showAuthError('เข้าสู่ระบบได้ แต่โหลดข้อมูลจาก Firebase ไม่สำเร็จ กรุณาตรวจสอบการตั้งค่า Firestore');
    } finally {
        isLoadingCloudData = false;
    }
}

async function saveCloudDataNow() {
    if (!firebaseAuth.currentUser || isLoadingCloudData) return;
    const data = {
        tasks,
        exams,
        courseReviews,
        summarySheets,
        userProfileData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    try {
        await firestore.collection('users').doc(firebaseAuth.currentUser.uid)
            .collection('workspace').doc('main').set(data, { merge: true });
    } catch (error) {
        console.error('Firebase save error:', error);
        alert('บันทึกข้อมูลออนไลน์ไม่สำเร็จ กรุณาตรวจสอบ Firestore Rules และการเชื่อมต่ออินเทอร์เน็ต');
    }
}

function saveCloudData() {
    if (!firebaseAuth.currentUser || isLoadingCloudData) return;
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = setTimeout(saveCloudDataNow, 500);
}

function firebaseErrorMessage(error) {
    const messages = {
        'auth/email-already-in-use': 'อีเมลนี้ถูกลงทะเบียนแล้ว',
        'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
        'auth/weak-password': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
        'auth/user-not-found': 'ไม่พบบัญชีนี้ กรุณาลงทะเบียนก่อน',
        'auth/wrong-password': 'รหัสผ่านไม่ถูกต้อง',
        'auth/invalid-credential': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        'auth/invalid-login-credentials': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        'auth/too-many-requests': 'มีการลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่',
        'auth/network-request-failed': 'เชื่อมต่ออินเทอร์เน็ตไม่สำเร็จ'
    };
    return messages[error.code] || 'เกิดข้อผิดพลาด: ' + (error.message || 'กรุณาลองใหม่');
}

        // DATA STATE & STORAGE
        const DOMAINS = {
            TU: '@dome.tu.ac.th',
            CU: '@student.chula.ac.th',
            RU: '@rumail.ru.ac.th'
        };

        const UNI_NAMES = {
            TU: 'มหาวิทยาลัยธรรมศาสตร์',
            CU: 'จุฬาลงกรณ์มหาวิทยาลัย',
            RU: 'มหาวิทยาลัยรามคำแหง'
        };

        let currentUser = null;
        let authMode = 'login';
        let authUserType = 'student';

        function getRelativeDate(daysOffset) {
            const d = new Date();
            d.setDate(d.getDate() + daysOffset);
            return d.toISOString().split('T')[0];
        }

        let tasks = [
            { id: '1', name: 'อ่าน ป.พ.พ. ลักษณะนิติกรรมและสัญญา', category: 'Law', start: getRelativeDate(-3), end: getRelativeDate(4), progress: 60 },
            { id: '2', name: 'ทบทวนองค์ประกอบความผิด อาญา 1', category: 'Law', start: getRelativeDate(0), end: getRelativeDate(7), progress: 30 },
            { id: '3', name: 'ทำสไลด์นำเสนอวิชา GE101', category: 'GE', start: getRelativeDate(1), end: getRelativeDate(5), progress: 80 },
            { id: '4', name: 'ซ้อมโต้วางมูลนิธินิติศาสตร์', category: 'Activity', start: getRelativeDate(3), end: getRelativeDate(9), progress: 10 }
        ];

        let exams = [
            {
                id: 101,
                code: 'น. 101',
                name: 'กฎหมายลักษณะนิติกรรมและสัญญา',
                professor: 'ศ.ดร.สมชาย ใจดี',
                university: 'มหาวิทยาลัยธรรมศาสตร์',
                year: '2566',
                question: 'นาย ก ทำสัญญาซื้อขายรถยนต์กับ นาย ข โดยนาย ก ถูก นาย ค ข่มขู่ให้ทำ สัญญานี้มีผลอย่างไรตามกฎหมาย?',
                answerKey: 'การข่มขู่ทำให้นิติกรรมเป็นโมฆียะ ตาม ป.พ.พ. มาตรา 164 นาย ก สามารถบอกลบล้างนิติกรรมได้ภายในอายุความ',
                rubric: '1. อ้างอิง ป.พ.พ. มาตรา 164 (5 คะแนน)\n2. ปรับบทเรื่องโมฆียะและการบอกลบล้าง (5 คะแนน)',
                status: 'Approved',
                comments: [
                    { id: 'c1', user: 'std_tu@dome.tu.ac.th', text: 'ถ้าเป็นกรณีข่มขู่โดยบุคคลภายนอก สัญญาเป็นโมฆียะทันทีเลยใช่ไหมครับ?', time: '2 ชั่วโมงที่แล้ว', agrees: 5, reports: 0, reportedBy: [] },
                    { id: 'c2', user: 'law_expert@dome.tu.ac.th', text: 'ถูกต้องครับ ตามมาตรา 164 การข่มขู่ไม่ว่ากระทำโดยคู่กรณีหรือบุคคลภายนอก ตราบใดที่ทำให้อีกฝ่ายเกิดความกลัว นิติกรรมเป็นโมฆียะทั้งหมด', time: '1 ชั่วโมงที่แล้ว', agrees: 12, reports: 0, reportedBy: [] }
                ]
            },
            {
                id: 102,
                code: '2401102',
                name: 'กฎหมายอาญาภาคทั่วไป',
                professor: 'รศ.ดร.วิชัย นิติศาสตร์',
                university: 'จุฬาลงกรณ์มหาวิทยาลัย',
                year: '2565',
                question: 'นาย A เล็งปืนไปที่ นาย B แต่ปืนขัดข้องยิงไม่ออก นาย A มีความผิดฐานใด?',
                answerKey: 'นาย A มีความผิดฐานพยายามฆ่าผู้อื่น ตาม ป.อ. มาตรา 288 ประกอบมาตรา 80 แม้ปืนขัดข้องก็ถือว่าได้กระทำไปถึงขั้นเป็นขั้นตอนสุดท้ายแล้ว',
                rubric: '1. มาตรา 288 ประกอบ 80 (5 คะแนน)\n2. การวิเคราะห์องค์ประกอบความผิด (5 คะแนน)',
                status: 'Approved',
                comments: []
            }
        ];

        let userProfileData = {
            displayName: 'นักศึกษานิติศาสตร์',
            year: 'ปี 2',
            field: 'กฎหมายแพ่งและพาณิชย์'
        };

        let courseReviews = [
            {
                id: 'r1',
                subject: 'น.101 กฎหมายลักษณะนิติกรรมและสัญญา',
                sec: 'Sec 010001',
                professor: 'ศ.ดร.สมชาย ใจดี',
                university: 'มหาวิทยาลัยธรรมศาสตร์',
                year: 'ปี 1',
                difficulty: 'ยาก',
                rating: 5,
                style: 'เน้นวิเคราะห์ฎีกา มีเช็กชื่อสุ่ม 10 คะแนน',
                comment: 'อาจารย์สอนดีมาก อธิบายมโนทัศน์นิติกรรมเคลียร์สุดๆ ข้อสอบเน้นการวินิจฉัยตามหลักกฎหมายแท้ๆ',
                author: 'นศ.ปี 2 (TU)'
            }
        ];

        let summarySheets = [
            {
                id: 's1',
                title: 'สรุป ป.พ.พ. นิติกรรมสัญญา มาตรา 150-171 (ฉบับสอบไฟนอล)',
                code: 'น.101',
                subject: 'กฎหมายลักษณะนิติกรรมและสัญญา',
                sec: 'Sec 010001',
                professor: 'ศ.ดร.สมชาย ใจดี',
                university: 'มหาวิทยาลัยธรรมศาสตร์',
                desc: 'เน้นมาตราสำคัญ 150, 151, 154, 155 พร้อมโครงสร้างการเขียนตอบข้อสอบกฎหมาย',
                author: 'law_tu_topstudent',
                downloads: 342,
                fileType: 'PDF'
            }
        ];

        // TASK & GANTT MANAGEMENT (DATE-CENTRIC TIMELINE TABLE)
        function initGanttChart() {
            const container = document.getElementById('ganttTableContainer');
            if (!container) return;

            // Compute Date Range (7 Days Range around tasks)
            let minTimestamp = Infinity;
            let maxTimestamp = -Infinity;

            tasks.forEach(t => {
                const s = new Date(t.start).getTime();
                const e = new Date(t.end).getTime();
                if (s < minTimestamp) minTimestamp = s;
                if (e > maxTimestamp) maxTimestamp = e;
            });

            const todayObj = new Date();
            todayObj.setHours(0, 0, 0, 0);
            const todayStr = todayObj.toISOString().split('T')[0];

            if (minTimestamp === Infinity) {
                minTimestamp = new Date(todayObj.getTime() - (2 * 86400000)).getTime();
                maxTimestamp = new Date(todayObj.getTime() + (10 * 86400000)).getTime();
            } else {
                minTimestamp = Math.min(minTimestamp, todayObj.getTime() - (2 * 86400000));
                maxTimestamp = Math.max(maxTimestamp, todayObj.getTime() + (8 * 86400000));
            }

            // Build array of dates
            const dateList = [];
            let currTime = minTimestamp;
            while (currTime <= maxTimestamp) {
                dateList.push(new Date(currTime));
                currTime += 86400000;
            }

            // Render Table HTML
            let tableHTML = `
                <table class="w-full text-xs border-collapse">
                    <thead>
                        <tr class="bg-slate-100/90 border-b border-slate-200">
                            <th class="p-2 text-left font-bold text-slate-700 min-w-[160px] sticky left-0 bg-slate-100 z-10">หัวข้อภาระงาน</th>
                            ${dateList.map(d => {
                                const dStr = d.toISOString().split('T')[0];
                                const isToday = dStr === todayStr;
                                const dayNum = d.getDate();
                                const monthNum = d.getMonth() + 1;
                                return `
                                    <th class="p-2 text-center font-bold min-w-[42px] border-l border-slate-200 ${isToday ? 'bg-blue-600 text-white' : 'text-slate-600'}">
                                        <div class="text-[10px] opacity-80">${monthNum}/${dayNum}</div>
                                        <div class="text-[11px] font-black">${isToday ? 'วันนี้' : ''}</div>
                                    </th>
                                `;
                            }).join('')}
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200">
            `;

            if (tasks.length === 0) {
                tableHTML += `<tr><td colspan="${dateList.length + 1}" class="p-4 text-center text-slate-400">ไม่มีรายการภาระงาน</td></tr>`;
            } else {
                tasks.forEach(t => {
                    const tStart = new Date(t.start).getTime();
                    const tEnd = new Date(t.end).getTime();

                    let categoryBg = 'bg-blue-600';
                    if (t.category === 'GE') categoryBg = 'bg-emerald-500';
                    else if (t.category === 'Activity') categoryBg = 'bg-amber-500';
                    else if (t.category === 'Personal') categoryBg = 'bg-purple-500';

                    tableHTML += `
                        <tr class="hover:bg-slate-50 transition-all">
                            <td class="p-2.5 font-bold text-slate-800 sticky left-0 bg-white shadow-sm border-r border-slate-200 z-10">
                                <div class="line-clamp-1">${t.name}</div>
                                <div class="text-[10px] font-normal text-slate-400">คืบหน้า ${t.progress}%</div>
                            </td>
                    `;

                    dateList.forEach(d => {
                        const dateTime = d.getTime();
                        const dStr = d.toISOString().split('T')[0];
                        const isToday = dStr === todayStr;
                        const isInTaskRange = dateTime >= tStart && dateTime <= tEnd;

                        if (isInTaskRange) {
                            tableHTML += `
                                <td class="p-1 text-center border-l border-slate-100 ${isToday ? 'bg-blue-50/80' : ''}">
                                    <div class="w-full h-6 ${categoryBg} text-white font-black text-[9px] rounded flex items-center justify-center shadow-sm" title="${t.name} (${t.start} ถึง ${t.end})">
                                        ${dStr === t.start ? 'เริ่ม' : (dStr === t.end ? 'จบ' : '•')}
                                    </div>
                                </td>
                            `;
                        } else {
                            tableHTML += `
                                <td class="p-1 border-l border-slate-100 ${isToday ? 'bg-blue-50/40' : ''}"></td>
                            `;
                        }
                    });

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
            saveCloudData();
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
            saveCloudData();
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

        async function sendPasswordReset() {
            const emailInput = document.getElementById('login-email');
            const message = document.getElementById('password-reset-msg');
            const email = emailInput ? emailInput.value.trim() : '';

            if (message) {
                message.className = 'hidden text-[11px] rounded-xl px-3 py-2';
                message.textContent = '';
            }

            if (!email) {
                if (message) {
                    message.className = 'text-[11px] rounded-xl px-3 py-2 bg-amber-50 text-amber-800 border border-amber-200';
                    message.textContent = 'กรุณากรอกอีเมลในช่องอีเมลก่อน แล้วกดลืมรหัสผ่านอีกครั้ง';
                }
                if (emailInput) emailInput.focus();
                return;
            }

            // Let Firebase validate the email format to avoid rejecting valid university addresses.
            if (!email || !email.includes('@')) {
                if (message) {
                    message.className = 'text-[11px] rounded-xl px-3 py-2 bg-amber-50 text-amber-800 border border-amber-200';
                    message.textContent = 'กรุณากรอกอีเมลที่ถูกต้องก่อนส่งคำขอ';
                }
                if (emailInput) emailInput.focus();
                return;
            }

            const resetButton = document.querySelector('button[onclick="sendPasswordReset()"]');
            if (resetButton) {
                resetButton.disabled = true;
                resetButton.textContent = 'กำลังส่งลิงก์...';
            }

            try {
                await firebaseAuth.sendPasswordResetEmail(email);
                if (message) {
                    message.className = 'text-[11px] rounded-xl px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200';
                    message.textContent = 'หากอีเมลนี้ลงทะเบียนไว้ ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้ กรุณาตรวจสอบกล่องจดหมายและอีเมลขยะ';
                }
            } catch (error) {
                console.error('Password reset request failed:', error);
                if (message) {
                    message.className = 'text-[11px] rounded-xl px-3 py-2 bg-amber-50 text-amber-800 border border-amber-200';
                    message.textContent = error.code === 'auth/invalid-email'
                        ? 'รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง'
                        : 'ส่งคำขอไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อและการตั้งค่า Firebase แล้วลองใหม่';
                }
            } finally {
                if (resetButton) {
                    resetButton.disabled = false;
                    resetButton.textContent = 'ลืมรหัสผ่าน?';
                }
            }
        }

        async function handleLogin(e) {
            e.preventDefault();
            hideAuthError();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-pass').value;
            const uniSelect = document.getElementById('login-uni');
            const uniKey = uniSelect ? uniSelect.value : 'TU';

            if (authUserType === 'student') {
                const expected = DOMAINS[uniKey];
                if (!email.toLowerCase().endsWith(expected)) {
                    showAuthError(`อีเมลนักศึกษาต้องลงท้ายด้วย ${expected}`);
                    return;
                }
            }
            try {
                const credential = await firebaseAuth.signInWithEmailAndPassword(email, password);
                const profileSnap = await firestore.collection('users').doc(credential.user.uid).get();
                const profile = profileSnap.exists ? profileSnap.data() : {};
                currentUser = {
                    uid: credential.user.uid,
                    email: credential.user.email,
                    type: profile.type || authUserType,
                    university: profile.university || (authUserType === 'student' ? UNI_NAMES[uniKey] : 'บุคคลทั่วไป')
                };
                await loadCloudData();
                showDashboard();
            } catch (error) {
                showAuthError(firebaseErrorMessage(error));
            }
        }

        async function handleRegister(e) {
            e.preventDefault();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-pass').value;
            const uniSelect = document.getElementById('reg-uni');
            const uniKey = uniSelect ? uniSelect.value : 'TU';

            if (authUserType === 'student') {
                const expected = DOMAINS[uniKey];
                if (!email.toLowerCase().endsWith(expected)) {
                    showAuthError(`อีเมลสมัครต้องลงท้ายด้วย ${expected}`);
                    return;
                }
            }
            if (password.length < 6) {
                showAuthError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
                return;
            }
            try {
                const credential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
                currentUser = {
                    uid: credential.user.uid,
                    email: credential.user.email,
                    type: authUserType,
                    university: authUserType === 'student' ? UNI_NAMES[uniKey] : 'บุคคลทั่วไป'
                };
                await firestore.collection('users').doc(credential.user.uid).set({
                    email: currentUser.email,
                    type: currentUser.type,
                    university: currentUser.university,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                await saveCloudDataNow();
                showDashboard();
            } catch (error) {
                showAuthError(firebaseErrorMessage(error));
            }
        }

        function showAuthError(msg) {
            const errBox = document.getElementById('auth-error-msg');
            const errText = document.getElementById('auth-error-text');
            if (errBox && errText) {
                errText.textContent = msg || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน';
                errBox.classList.remove('hidden');
                errBox.style.display = 'flex';
                errBox.setAttribute('role', 'alert');
            } else {
                alert(msg || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน');
            }
        }

        function hideAuthError() {
            const errBox = document.getElementById('auth-error-msg');
            if (errBox) {
                errBox.classList.add('hidden');
                errBox.style.display = 'none';
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

        async function handleLogout() {
            try { await firebaseAuth.signOut(); } catch (error) { console.error(error); }
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
                        <p class="text-slate-800">${c.text}</p>
                        <div class="flex items-center gap-3 pt-1 text-[11px]">
                            <button onclick="agreeComment(${e.id}, '${c.id}')" class="text-blue-600 font-bold hover:underline">👍 เห็นด้วย (${c.agrees})</button>
                            <button onclick="openReportModal(${e.id}, '${c.id}')" class="text-slate-400 hover:text-red-500">🚩 รายงาน</button>
                        </div>
                    </div>
                `).join('');

                card.innerHTML = `
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-3 gap-2">
                        <div>
                            <span class="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-black mr-2">${e.code}</span>
                            <span class="font-bold text-base text-slate-800">${e.name}</span>
                        </div>
                        <span class="text-xs text-slate-500">${e.university} | ปี ${e.year}</span>
                    </div>
                    <div class="text-xs text-slate-600 space-y-1">
                        <p><strong>อาจารย์ผู้สอน:</strong> ${e.professor}</p>
                        <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800 leading-relaxed">
                            ${e.question}
                        </div>
                    </div>
                    <div class="pt-2">
                        <label class="block text-xs font-semibold text-slate-700 mb-1">พื้นที่ฝึกเขียนตอบข้อสอบ:</label>
                        <textarea rows="3" placeholder="เขียนปรับบทกฎหมายและวินิจฉัย..." class="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    <div class="flex items-center justify-between pt-2">
                        <button onclick="toggleAnswerKey('ans-${e.id}')" class="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                            <span>👁️ แสดง/ซ่อน ธงคำตอบ & Rubric</span>
                        </button>
                    </div>
                    <div id="ans-${e.id}" class="hidden p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-2 text-emerald-900">
                        <h5 class="font-bold text-emerald-800">ธงคำตอบแนวทางวินิจฉัย:</h5>
                        <p class="whitespace-pre-line">${e.answerKey}</p>
                        <h5 class="font-bold text-emerald-800 pt-2">Scoring Rubric:</h5>
                        <p class="whitespace-pre-line">${e.rubric}</p>
                    </div>
                    <div class="pt-3 border-t border-slate-200 space-y-3">
                        <h5 class="font-bold text-xs text-slate-700">Academic Discussion (${e.comments.length})</h5>
                        <div class="space-y-2">${commentsHTML}</div>
                        <div class="flex gap-2">
                            <input type="text" id="comment-input-${e.id}" placeholder="แสดงความเห็นหรือตั้งคำถามกฎหมาย..." class="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none">
                            <button onclick="addComment(${e.id})" class="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow">ส่ง</button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function filterExams() {
            renderExams();
        }

        function resetExamSearch() {
            ['search-general', 'search-code', 'search-name', 'search-prof', 'search-year'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            const uniSelect = document.getElementById('search-uni');
            if (uniSelect) uniSelect.value = '';
            renderExams();
        }

        function toggleAnswerKey(id) {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('hidden');
        }

        function addComment(examId) {
            const input = document.getElementById(`comment-input-${examId}`);
            if (!input || !input.value.trim()) return;

            const exam = exams.find(e => e.id === examId);
            if (exam) {
                exam.comments.push({
                    id: 'c' + Date.now(),
                    user: currentUser ? currentUser.email : 'student@dome.tu.ac.th',
                    text: input.value.trim(),
                    time: 'เมื่อกี้',
                    agrees: 0,
                    reports: 0,
                    reportedBy: []
                });
                renderExams();
                saveCloudData();
            }
        }

        function agreeComment(examId, commentId) {
            const exam = exams.find(e => e.id === examId);
            if (exam) {
                const comment = exam.comments.find(c => c.id === commentId);
                if (comment) {
                    comment.agrees++;
                    renderExams();
                    saveCloudData();
                }
            }
        }

        function openReportModal(examId, commentId) {
            document.getElementById('report-exam-id').value = examId;
            document.getElementById('report-comment-id').value = commentId;
            document.getElementById('report-modal').classList.remove('hidden');
        }

        function closeReportModal() {
            document.getElementById('report-modal').classList.add('hidden');
        }

        function submitCommentReport() {
            const examId = parseInt(document.getElementById('report-exam-id').value);
            const commentId = document.getElementById('report-comment-id').value;
            const exam = exams.find(e => e.id === examId);
            if (exam) {
                const comment = exam.comments.find(c => c.id === commentId);
                if (comment) {
                    comment.reports++;
                }
            }
            closeReportModal();
            renderExams();
            saveCloudData();
        }

        function handleExamUpload(e) {
            e.preventDefault();
            const code = document.getElementById('upload-code').value;
            const name = document.getElementById('upload-name').value;
            const prof = document.getElementById('upload-prof').value;
            const year = document.getElementById('upload-year').value;
            const question = document.getElementById('upload-question').value;
            const answerKey = document.getElementById('upload-answer').value;
            const rubric = document.getElementById('upload-rubric').value;

            exams.push({
                id: Date.now(),
                code,
                name,
                professor: prof,
                university: 'ข้อสอบส่วนบุคคล (Personal / Community Uploads)',
                year,
                question,
                answerKey: answerKey || 'ยังไม่มีเฉลยจากผู้จำลอง',
                rubric: rubric || 'ยังไม่มี Rubric',
                status: 'Pending Admin Approval',
                comments: []
            });

            alert('ส่งข้อสอบสำเร็จแล้ว! อยู่ในสถานะรอการอนุมัติจากผู้ดูแลระบบ');
            switchExamSubTab('search');
            renderExams();
            saveCloudData();
        }

        // SUMMARY SHEETS FUNCTIONS
        function renderSheets() {
            const grid = document.getElementById('sheets-grid');
            if (!grid) return;
            grid.innerHTML = '';

            const gen = document.getElementById('sheet-search-general')?.value.toLowerCase() || '';
            const code = document.getElementById('sheet-search-code')?.value.toLowerCase() || '';
            const name = document.getElementById('sheet-search-name')?.value.toLowerCase() || '';
            const sec = document.getElementById('sheet-search-sec')?.value.toLowerCase() || '';
            const prof = document.getElementById('sheet-search-prof')?.value.toLowerCase() || '';
            const uni = document.getElementById('sheet-search-uni')?.value || '';

            const filtered = summarySheets.filter(s => {
                if (gen && !s.title.toLowerCase().includes(gen) && !s.desc.toLowerCase().includes(gen) && !s.author.toLowerCase().includes(gen) && !s.code.toLowerCase().includes(gen)) return false;
                if (code && !s.code.toLowerCase().includes(code)) return false;
                if (name && !s.subject.toLowerCase().includes(name) && !s.title.toLowerCase().includes(name)) return false;
                if (sec && !s.sec.toLowerCase().includes(sec)) return false;
                if (prof && !s.professor.toLowerCase().includes(prof) && !s.author.toLowerCase().includes(prof)) return false;
                if (uni && s.university !== uni) return false;
                return true;
            });

            filtered.forEach(s => {
                const card = document.createElement('div');
                card.className = "glass-card-light p-5 rounded-3xl space-y-3 flex flex-col justify-between";
                card.innerHTML = `
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black">${s.code}</span>
                            <span class="text-[11px] font-bold text-slate-400">${s.fileType}</span>
                        </div>
                        <h4 class="font-bold text-sm text-slate-800 line-clamp-2">${s.title}</h4>
                        <p class="text-xs text-slate-500 leading-relaxed">${s.desc}</p>
                    </div>
                    <div class="pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
                        <div class="flex justify-between">
                            <span>ผู้สอน: <strong>${s.professor || '-'}</strong></span>
                            <span>เซก: <strong>${s.sec || '-'}</strong></span>
                        </div>
                        <div class="flex justify-between items-center pt-2">
                            <span class="font-semibold text-emerald-600">📥 ดาวน์โหลด (${s.downloads})</span>
                            <button onclick="downloadSheet('${s.id}')" class="px-3 py-1 bg-emerald-600 text-white font-bold rounded-xl shadow text-xs">พรีวิว / โหลด</button>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        function filterSheets() {
            renderSheets();
        }

        function resetSheetSearch() {
            ['sheet-search-general', 'sheet-search-code', 'sheet-search-name', 'sheet-search-sec', 'sheet-search-prof'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            const uni = document.getElementById('sheet-search-uni');
            if (uni) uni.value = '';
            renderSheets();
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
            saveCloudData();
        }

        function downloadSheet(id) {
            const sheet = summarySheets.find(s => s.id === id);
            if (sheet) {
                sheet.downloads++;
                renderSheets();
                saveCloudData();
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

        async function saveCourseReview(e) {
            e.preventDefault();
            if (!firebaseAuth.currentUser) {
                showAuthError('กรุณาเข้าสู่ระบบก่อนเขียนรีวิว');
                return;
            }

            const anon = document.getElementById('rev-anon').checked;
            const review = {
                subject: document.getElementById('rev-subject').value.trim(),
                sec: document.getElementById('rev-sec').value.trim() || 'Sec 01',
                professor: document.getElementById('rev-prof').value.trim(),
                university: document.getElementById('rev-uni').value,
                year: document.getElementById('rev-year').value,
                difficulty: document.getElementById('rev-diff').value,
                rating: parseInt(document.getElementById('rev-rating').value, 10),
                style: document.getElementById('rev-style').value.trim(),
                comment: document.getElementById('rev-comment').value.trim(),
                author: anon ? 'ไม่ระบุตัวตน (Anonymous)' : (currentUser ? currentUser.email : 'นักศึกษา'),
                authorUid: firebaseAuth.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            try {
                const docRef = await firestore.collection('publicCourseReviews').add(review);
                courseReviews.unshift({ id: docRef.id, ...review, createdAt: new Date() });
                closeReviewModal();
                renderReviews();
                alert('เผยแพร่รีวิวแล้ว ผู้ใช้ที่เข้าสู่ระบบคนอื่นจะเห็นรีวิวนี้ด้วย');
            } catch (error) {
                console.error('Shared review save error:', error);
                alert('เผยแพร่รีวิวไม่สำเร็จ กรุณาตรวจสอบ Firestore Rules แล้วลองอีกครั้ง');
            }
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
                saveCloudData();
            }
        }

        // Real ambience audio released into the public domain on Wikimedia Commons.
        // Brainwave Sound Hub: CC0/Public Domain audio + Web Audio binaural tones
        let currentAudio = null;
        let brainwaveContext = null;
        let activeOscillators = [];

        const publicDomainSounds = {
            theta: {
                title: 'Theta Waves (4 Hz) — Public Domain',
                src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Binaural_Beat_(98_%26_102Hz)_30s.ogg'
            }
        };

        const generatedBrainwaves = {
            beta: { title: 'Beta Waves (20 Hz)', left: 210, right: 230 },
            alpha: { title: 'Alpha Waves (10 Hz)', left: 210, right: 220 },
            lofi: { title: 'Lo-fi Chill Ambient', ambient: true }
        };

        async function playBrainwave(type) {
            const badge = document.getElementById('audio-status-badge');
            const title = document.getElementById('current-sound-title');
            stopAudio(false);

            if (type === 'theta') {
                const sound = publicDomainSounds.theta;
                const audio = new Audio(sound.src);
                currentAudio = audio;
                audio.loop = true;
                audio.volume = 0.35;
                audio.preload = 'auto';
                audio.addEventListener('playing', () => {
                    if (badge) badge.innerText = 'Playing';
                    if (title) title.innerText = 'กำลังเล่น: ' + sound.title;
                }, { once: true });
                audio.addEventListener('error', () => {
                    if (currentAudio === audio) currentAudio = null;
                    if (badge) badge.innerText = 'Error';
                    if (title) title.innerText = 'โหลดไฟล์ Theta ไม่สำเร็จ กรุณาลองใหม่';
                }, { once: true });
                try {
                    await audio.play();
                } catch (error) {
                    if (badge) badge.innerText = 'Tap to retry';
                    if (title) title.innerText = 'เบราว์เซอร์ยังไม่อนุญาตให้เล่นเสียง กรุณากดอีกครั้ง';
                }
                return;
            }

            const preset = generatedBrainwaves[type];
            if (!preset) {
                if (badge) badge.innerText = 'Unavailable';
                if (title) title.innerText = 'ไม่พบคลื่นเสียงที่เลือก';
                return;
            }

            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (!AudioContextClass) throw new Error('AudioContext is not supported');
                if (!brainwaveContext || brainwaveContext.state === 'closed') {
                    brainwaveContext = new AudioContextClass();
                }
                await brainwaveContext.resume();

                const master = brainwaveContext.createGain();
                master.gain.value = 0.0001;
                master.connect(brainwaveContext.destination);
                master.gain.setTargetAtTime(0.12, brainwaveContext.currentTime, 0.08);

                if (preset.ambient) {
                    // Soft generated ambient chord for the original Lo-fi option.
                    [130.81, 164.81, 196.00].forEach((frequency, index) => {
                        const oscillator = brainwaveContext.createOscillator();
                        const toneGain = brainwaveContext.createGain();
                        const pan = brainwaveContext.createStereoPanner();
                        oscillator.type = 'triangle';
                        oscillator.frequency.value = frequency;
                        toneGain.gain.value = 0.22;
                        pan.pan.value = index === 0 ? -0.35 : (index === 2 ? 0.35 : 0);
                        oscillator.connect(toneGain).connect(pan).connect(master);
                        oscillator.start();
                        activeOscillators.push(oscillator);
                    });
                } else {
                    const leftPan = brainwaveContext.createStereoPanner();
                    const rightPan = brainwaveContext.createStereoPanner();
                    leftPan.pan.value = -1;
                    rightPan.pan.value = 1;
                    leftPan.connect(master);
                    rightPan.connect(master);

                    [[preset.left, leftPan], [preset.right, rightPan]].forEach(([frequency, destination]) => {
                        const oscillator = brainwaveContext.createOscillator();
                        oscillator.type = 'sine';
                        oscillator.frequency.value = frequency;
                        oscillator.connect(destination);
                        oscillator.start();
                        activeOscillators.push(oscillator);
                    });
                }

                currentAudio = { master };
                if (badge) badge.innerText = 'Playing';
                if (title) title.innerText = preset.ambient
                    ? 'กำลังเล่น: ' + preset.title
                    : 'กำลังเล่น: ' + preset.title + ' (แนะนำให้ใช้หูฟัง)';
            } catch (error) {
                console.error('Brainwave audio error:', error);
                stopAudio(false);
                if (badge) badge.innerText = 'Error';
                if (title) title.innerText = 'เปิดเสียงไม่สำเร็จ กรุณาตรวจสอบการตั้งค่าเสียงของเบราว์เซอร์';
            }
        }

        function stopAudio(resetStatus = true) {
            if (currentAudio instanceof HTMLAudioElement) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                currentAudio.removeAttribute('src');
                currentAudio.load();
            }
            currentAudio = null;

            activeOscillators.forEach(oscillator => {
                try { oscillator.stop(); } catch (error) {}
                try { oscillator.disconnect(); } catch (error) {}
            });
            activeOscillators = [];

            if (brainwaveContext && brainwaveContext.state === 'running') {
                brainwaveContext.suspend().catch(() => {});
            }

            if (resetStatus) {
                const badge = document.getElementById('audio-status-badge');
                const title = document.getElementById('current-sound-title');
                if (badge) badge.innerText = 'Ready';
                if (title) title.innerText = 'เลือกคลื่นเสียงเพื่อเปิดเล่น';
            }
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
            firebaseAuth.onAuthStateChanged(async (user) => {
                if (!user || currentUser) return;
                try {
                    const profileSnap = await firestore.collection('users').doc(user.uid).get();
                    const profile = profileSnap.exists ? profileSnap.data() : {};
                    currentUser = {
                        uid: user.uid,
                        email: user.email,
                        type: profile.type || 'general',
                        university: profile.university || 'บุคคลทั่วไป'
                    };
                    await loadCloudData();
                    showDashboard();
                } catch (error) {
                    console.error('Firebase session restore error:', error);
                }
            });
        };