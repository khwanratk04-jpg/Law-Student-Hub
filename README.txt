LAW & LIFE PLANNER
==================

ไฟล์ในโปรเจกต์
- index.html   โครงสร้างเว็บไซต์
- style.css    รูปแบบและการแสดงผล
- script.js    การทำงานของเว็บไซต์และการเชื่อมต่อ Supabase
- schema.sql   คำสั่งสร้างตารางและนโยบายความปลอดภัยของฐานข้อมูล

ส่วนที่ทำงานได้
- สมัครสมาชิก / เข้าสู่ระบบด้วย Supabase Auth
- Gantt Chart: เพิ่ม แก้ไข ลบงาน และเปลี่ยนสถานะ
- Law Exam: เพิ่ม แก้ไข ลบโจทย์ ธงคำตอบ และคำแนะนำ
- Planner: เพิ่ม แก้ไข ลบกิจกรรม และทำเครื่องหมายเสร็จ
- Pomodoro: จับเวลา Focus / Short break / Long break และบันทึกรอบโฟกัส
- Sound Library: สร้างเสียงบรรยากาศด้วย Web Audio API
- Dashboard: สรุปงานและกิจกรรม

เริ่มต้นใช้งาน
1. สร้างโปรเจกต์ที่ https://supabase.com/
2. เปิด SQL Editor ใน Supabase แล้วรันไฟล์ schema.sql ทั้งหมด
3. ไปที่ Project Settings > API (หรือ Data API / API Keys ตามหน้าตา Dashboard)
4. คัดลอก Project URL และ anon / publishable key
5. เปิด script.js แล้วแทนที่:
   YOUR_SUPABASE_URL
   YOUR_SUPABASE_ANON_KEY
   ด้วยค่าจากโปรเจกต์ของคุณ
   ห้ามนำ service_role key มาใส่ในเว็บไซต์
6. สร้าง GitHub repository แล้วอัปโหลดไฟล์ทั้ง 4 ไฟล์ไว้ที่ root ของ repository
7. ไปที่ Settings > Pages > Build and deployment
8. เลือก Deploy from a branch, branch main, folder /(root), แล้ว Save
9. รอ GitHub Pages เผยแพร่เว็บไซต์ จากนั้นเปิด URL ที่ GitHub แสดงให้

ตั้งค่า Supabase Auth สำหรับ GitHub Pages
- ไปที่ Supabase > Authentication > URL Configuration
- Site URL: ใส่ URL เว็บไซต์ GitHub Pages เช่น https://USERNAME.github.io/REPOSITORY/
- Redirect URLs: เพิ่ม URL เดียวกัน
- หากสมัครสมาชิกแล้วระบบแจ้งให้ยืนยันอีเมล ให้เปิดอีเมลและกดยืนยันก่อนเข้าสู่ระบบ

ข้อควรรู้
- งาน ข้อสอบ กิจกรรม และประวัติ Pomodoro จัดเก็บใน Supabase ออนไลน์
- โน้ตประจำวันในเวอร์ชันนี้จัดเก็บใน Local Storage ของเบราว์เซอร์เครื่องนั้น
- เสียงใน Sound Library เป็นเสียงสังเคราะห์จากเบราว์เซอร์ ไม่ใช่ไฟล์เพลงที่สตรีมจากอินเทอร์เน็ต
- ธงคำตอบและคำแนะนำเป็นข้อมูลที่ผู้ใช้เพิ่มเอง ควรตรวจสอบความถูกต้องของหลักกฎหมายกับเอกสารการเรียนและแหล่งกฎหมายที่เชื่อถือได้
- อย่าแชร์ anon/publishable key พร้อมรหัสผ่านหรือ service_role key; ตารางถูกป้องกันด้วย Row Level Security ใน schema.sql
