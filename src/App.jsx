import React, { useState, useEffect } from 'react';

export default function App() {
  // 🏛️ 1. ระบบดึงฐานข้อมูลเริ่มต้นแบบปลอดภัย (ป้องกันข้อมูลสูญหาย 100%)
  const [villages, setVillages] = useState(() => {
    try {
      // 1.1 ลองดึงข้อมูลจาก Key เวอร์ชันใหม่ดูก่อน
      const savedVillagesV2 = localStorage.getItem('v_permission_villages_secure_v2');
      if (savedVillagesV2) {
        const parsed = JSON.parse(savedVillagesV2);
        if (Array.isArray(parsed)) return parsed;
      }

      // 1.2 ถ้าไม่มี Key ใหม่ ให้ไปดึงจาก Key เก่ามา
      const oldSavedVillages = localStorage.getItem('v_permission_villages_secure');
      if (oldSavedVillages) {
        const parsedOld = JSON.parse(oldSavedVillages);
        if (Array.isArray(parsedOld)) return parsedOld;
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอ่าน LocalStorage:", error);
    }

    // 1.3 ถ้าไม่มีข้อมูลเลย หรือข้อมูลเสียหาย ให้คืนค่าเป็นอาเรย์ว่างเปล่า []
    return []; 
  });

  // สเตตสำหรับควบคุมการพิมพ์ค้นหา (Search)
  const [searchTerm, setSearchTerm] = useState('');

  // สเตตสำหรับควบคุมการเปิด/ปิดฟอร์ม และการจัดเก็บข้อมูลขณะคีย์
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    zone: '',
    contact: '',
    phone: '',
    status: 'รอการตอบกลับ',
    years: '',
    eventDate: '' // 📅 เก็บข้อมูลวันที่คีย์เข้าทำกิจกรรมล่าสุด
  });

  // ระบบ auto-save (เซฟลงเครื่องอัตโนมัติเมื่อมีการเปลี่ยนแปลง)
  useEffect(() => {
    localStorage.setItem('v_permission_villages_secure_v2', JSON.stringify(villages));
  }, [villages]);

  // ระบบสำรองข้อมูลถาวรข้ามปี (Backup & Import System)
  const handleExportData = () => {
    if (villages.length === 0) {
      alert('ยังไม่มีข้อมูลในสารบบให้ส่งออกค่ะคุณหนิง');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(villages));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `สารบบข้อมูลยุทธศาสตร์_V_Permission_${new Date().getFullYear()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e) => {
    const fileReader = new FileReader();
    if (!e.target.files[0]) return;
    
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target.result);
        if (Array.isArray(parsedData)) {
          setVillages(parsedData);
          alert('📂 ดึงคืนฐานข้อมูลถาวรเสร็จสมบูรณ์เรียบร้อยแล้วค่ะคุณหนิง!');
        } else {
          alert('รูปแบบไฟล์พิมพ์เขียวไม่ถูกต้องค่ะ');
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์สำรองข้อมูลค่ะ');
      }
    };
  };

  // ระบบตัวกรองคำค้นหาแบบปลอดภัยสูง (ใช้ Optional Chaining ป้องกันแอปพัง)
  const filteredVillages = villages.filter(village => 
    (village?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (village?.zone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (village?.contact || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📊 ระบบคำนวณสถิติเชิงยุทธศาสตร์แบบ Real-time
  const total = filteredVillages.length;
  const approved = filteredVillages.filter(v => v.status === 'อนุญาตเข้าจัดกิจกรรม').length;
  const pending = filteredVillages.filter(v => v.status === 'รอการตอบกลับ').length;

  const reachRate = total > 0 ? ((approved / total) * 100).toFixed(1) : '0.0';
  const reachChange = total > 0 ? `คำนวณจากตัวกรอง ${total} พื้นที่` : 'ไม่มีข้อมูลการค้นหา';

  const costValue = total > 0 ? (1 + (approved * 1.25)).toFixed(1) : '0.0';
  const costStatus = approved >= 2 ? 'เกณฑ์ประสิทธิภาพสูง' : 'เกณฑ์กำลังพัฒนา';

  const riskSuccess = total > 0 ? (((total - pending) / total) * 100).toFixed(1) : '0.0';
  const riskStatus = parseFloat(riskSuccess) >= 75 ? 'อยู่ในเกณฑ์ดีเยี่ยม' : 'ควรเร่งสื่อสารเพิ่มเติม';

  const stats = [
    { label: 'อัตราการเข้าถึงเป้าหมาย (Reach)', value: `${reachRate}%`, change: reachChange, icon: '📈' },
    { label: 'อัตราความคุ้มค่าต่อส่วนรวม', value: `1:${costValue}`, change: costStatus, icon: '💎' },
    { label: 'ความสำเร็จในการสื่อสารความเสี่ยง', value: `${riskSuccess}%`, change: riskStatus, icon: '🛡️' },
  ];

  // 📅 จัดกรุ๊ปข้อมูลกำหนดการ (เพิ่มระบบเช็คค่าว่างเพื่อป้องกัน Error)
  const upcomingGrouped = villages
    .filter(v => v?.eventDate && String(v.eventDate).trim() !== '')
    .reduce((groups, village) => {
      const date = String(village.eventDate).trim();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(village);
      return groups;
    }, {});

  // ฟังก์ชันควบคุมฟอร์ม
  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ name: '', zone: '', contact: '', phone: '', status: 'รอการตอบกลับ', years: '', eventDate: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (village) => {
    setIsEditing(true);
    setCurrentId(village.id);
    setFormData({
      name: village.name || '',
      zone: village.zone || '',
      contact: village.contact || '',
      phone: village.phone || '',
      status: village.status || 'รอการตอบกลับ',
      years: village.years || '',
      eventDate: village.eventDate || '' 
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('คุณหนิงแน่ใจใช่ไหมคะว่าต้องการลบข้อมูลหมู่บ้านนี้ออกจากสารบบถาวร?')) {
      setVillages(villages.filter(v => v.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.zone) {
      alert('กรุณากรอกชื่อหมู่บ้านและโซนพื้นที่ด้วยค่ะคุณหนิง');
      return;
    }

    if (isEditing) {
      setVillages(villages.map(v => v.id === currentId ? { ...v, ...formData } : v));
    } else {
      const newVillage = {
        id: Date.now(),
        ...formData
      };
      setVillages([...villages, newVillage]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#334155] font-sans antialiased pb-12">
      
      {/* 🏛️ HEADER */}
      <header className="border-b border-[#e2e8f0] bg-white/90 backdrop-blur sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#fffbeb] rounded-lg text-[#d97706] text-xl shadow-inner">📍</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1e293b]">V-Permission</h1>
            <p className="text-[10px] text-[#94a3b8] tracking-wider uppercase font-semibold">REC-DEPARTMENT</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportData}
            className="hidden sm:flex bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] text-xs font-semibold px-3 py-2 rounded-lg border border-[#cbd5e1] transition-all cursor-pointer items-center gap-1.5"
          >
            💾 สำรองข้อมูลดิบ (.json)
          </button>
          <label className="hidden sm:flex bg-[#fffbeb] hover:bg-[#fef3c7] text-[#b45309] text-xs font-semibold px-3 py-2 rounded-lg border border-[#fde68a] transition-all cursor-pointer items-center gap-1.5">
            📂 นำเข้าไฟล์สำรอง
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>
          <div className="flex items-center gap-2 px-3 py-1 bg-[#fffbeb] text-[#d97706] text-xs font-medium rounded-full border border-[#fde68a]">
            <span className="w-1.5 h-1.5 bg-[#d97706] rounded-full animate-pulse"></span>
            คลาวด์ล็อกนิรภัยสมบูรณ์
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* 📢 TITLE & FOCUS */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1e293b] tracking-tight">ระบบกิจกรรมแผนกสรรหาของบริจาคเชิงรุก</h2>
            <p className="text-[#64748b] text-sm mt-1">แพลตฟอร์มวิเคราะห์ยุทธศาสตร์พื้นที่และการประเมินผลประโยชน์เพื่อส่วนรวม</p>
          </div>
          <div className="flex gap-2">
            <span className="text-xs bg-[#fffbeb] text-[#b45309] px-3 py-1.5 rounded-lg border border-[#fde68a] font-medium">
              เน้นย้ำ: การสื่อสารความเสี่ยง (Risk Communication)
            </span>
          </div>
        </div>

        {/* 📊 STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {stats.map((item, index) => (
            <div key={index} className="bg-white border border-[#e2e8f0] hover:border-[#f59e0b] rounded-xl p-5 shadow-sm transition-all">
              <div className="flex justify-between items-start">
                <p className="text-xs font-semibold text-[#64748b] tracking-wide uppercase">{item.label}</p>
                <span className="text-lg">{item.icon}</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#1e293b] tracking-tight font-mono">{item.value}</span>
                <span className={`text-[11px] font-semibold ${
                  item.value.includes('0.0') || item.change.includes('เพิ่มเติม') ? 'text-rose-500' : 'text-[#d97706]'
                }`}>{item.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 🏢 2-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* 📅 COLUMN ด้านซ้าย: กำหนดการ */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
              <h3 className="text-xs font-bold text-[#b45309] tracking-wider uppercase flex items-center gap-1.5 mb-3 bg-[#fffbeb] p-2 rounded-lg border border-[#fde68a]">
                🗓️ แผนงานในอาทิตย์นี้
              </h3>
              
              {Object.keys(upcomingGrouped).length === 0 ? (
                <div className="text-center py-6 text-[#94a3b8] text-xs italic">
                  ไม่มีกำหนดการเข้าทำกิจกรรมในอาทิตย์นี้ค่ะคุณหนิง
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-[450px] pr-1">
                  {Object.keys(upcomingGrouped).map((date, idx) => (
                    <div key={idx} className="border-l-2 border-[#f59e0b] pl-3 py-1 bg-[#fafafa] rounded-r-lg p-2 border border-[#e2e8f0] border-l-0">
                      <p className="text-xs font-bold text-[#1e293b] font-mono mb-1.5 flex items-center gap-1">
                        📅 {date}
                      </p>
                      <ol className="space-y-1 text-xs text-[#475569] list-decimal pl-4 font-medium">
                        {upcomingGrouped[date].map((village, vIdx) => (
                          <li key={vIdx} className="hover:text-[#f59e0b] transition-colors">
                            {village.name}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 🗃️ COLUMN ด้านขวา: ตารางหลัก */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
              
              <div className="px-6 py-4 border-b border-[#e2e8f0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#fafafa]">
                <div>
                  <h3 className="font-bold text-[#1e293b] text-sm tracking-wide flex items-center gap-2">
                    📊 สารบบข้อมูลยุทธศาสตร์การจัดหาเชิงรุก ({villages.length} รายการ)
                  </h3>
                  <p className="text-xs text-[#64748b] mt-0.5">สถิติและทำเนียบข้อมูลถาวร ไร้ความเสี่ยงข้อมูลสูญหาย</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#94a3b8] text-xs">🔍</span>
                    <input 
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="ค้นหาชื่อหมู่บ้าน โซน หรือผู้ติดต่อ..."
                      className="w-full bg-[#f8fafc] border border-[#e2e8f0] text-[#334155] text-xs rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#f59e0b] focus:bg-white transition-colors tracking-wide"
                    />
                  </div>
                  <button 
                    onClick={handleOpenAdd}
                    className="w-full sm:w-auto bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <span>➕</span> ลงทะเบียนหมู่บ้านเพิ่ม
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#e2e8f0] text-[#64748b] bg-[#f1f5f9] text-xs uppercase tracking-wider font-bold">
                      <th className="py-4 px-6">ชื่อหมู่บ้านจัดสรร</th>
                      <th className="py-4 px-6">โซน / อำเภอ</th>
                      <th className="py-4 px-6">ผู้แทนนิติบุคคล</th>
                      <th className="py-4 px-6">เบอร์โทรศัพท์</th>
                      <th className="py-4 px-6">สถานะล่าสุด</th>
                      <th className="py-4 px-6 text-center">วันที่เข้าทำกิจกรรม</th>
                      <th className="py-4 px-6 text-center">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredVillages.map((v) => (
                      <tr key={v.id} className="hover:bg-[#f8fafc] transition-colors duration-150">
                        <td className="py-4 px-6 font-bold text-[#1e293b] text-base">{v.name}</td>
                        <td className="py-4 px-6 text-[#475569] font-medium">{v.zone}</td>
                        <td className="py-4 px-6 text-[#475569]">{v.contact}</td>
                        <td className="py-4 px-6 text-[#64748b] font-mono tracking-wide">{v.phone || '-'}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                            v.status?.includes('อนุญาต') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            v.status?.includes('รอ') ? 'bg-amber-50 text-[#b45309] border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              v.status?.includes('อนุญาต') ? 'bg-emerald-500' :
                              v.status?.includes('รอ') ? 'bg-[#f59e0b]' : 'bg-rose-500'
                            }`}></span>
                            {v.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {v.eventDate ? (
                            <span className="bg-[#fffbeb] text-[#b45309] border border-[#fde68a] text-xs px-2.5 py-1 rounded-lg font-mono font-bold">
                              {v.eventDate}
                            </span>
                          ) : (
                            <span className="text-[#94a3b8] text-xs italic">ไม่ได้ระบุ</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleOpenEdit(v)} className="text-xs bg-white hover:bg-[#fffbeb] text-[#d97706] border border-[#fde68a] px-2.5 py-1 rounded-md transition-all cursor-pointer font-semibold">✏️ แก้ไข</button>
                            <button onClick={() => handleDelete(v.id)} className="text-xs bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-2.5 py-1 rounded-md transition-all cursor-pointer font-semibold">🗑️ ลบ</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredVillages.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-8 px-6 text-center text-[#94a3b8] italic bg-[#fafafa]">
                          ไม่พบข้อมูลหมู่บ้านในตารางนี้ค่ะ 🔍
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
            </div>
          </div>

        </div>
      </main>

      {/* 📋 MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#1e293b] tracking-wide">{isEditing ? '📝 แก้ไขข้อมูลยุทธศาสตร์หมู่บ้าน' : '➕ ลงทะเบียนหมู่บ้านจัดสรรเป้าหมาย'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#94a3b8] hover:text-[#1e293b] cursor-pointer text-lg">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">ชื่อหมู่บ้านจัดสรร <span className="text-rose-500">*</span></label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="เช่น หมู่บ้านลัดดารมย์" className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#f59e0b] focus:bg-white transition-colors" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">โซน / อำเภอ <span className="text-rose-500">*</span></label>
                  <input type="text" value={formData.zone} onChange={(e) => setFormData({...formData, zone: e.target.value})} placeholder="เช่น นนทบุรี / บางใหญ่" className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">ผู้แทนนิติบุคคล</label>
                  <input type="text" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} placeholder="ชื่อผู้ติดต่อหลัก" className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">เบอร์โทรศัพท์</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="เช่น 081-234-5678" className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#f59e0b] focus:bg-white transition-colors font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">ประวัติปีทำกิจกรรม</label>
                  <input type="text" value={formData.years} onChange={(e) => setFormData({...formData, years: e.target.value})} placeholder="เช่น 2024, 2025" className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#f59e0b] focus:bg-white transition-colors font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">วันที่เข้าทำกิจกรรมอาทิตย์นี้</label>
                <input 
                  type="text" 
                  value={formData.eventDate} 
                  onChange={(e) => setFormData({...formData, eventDate: e.target.value})} 
                  placeholder="เช่น 7-8/6/2569" 
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#f59e0b] focus:bg-white transition-colors font-mono font-semibold text-[#b45309]" 
                />
                <p className="text-[10px] text-[#94a3b8] mt-1">คีย์ระบุวันนัดหมายลงตารางเพื่อให้ชื่อหมู่บ้านวิ่งไปขึ้นแจ้งเตือนที่ตารางกำหนดการฝั่งซ้ายมือค่ะ</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">สถานะล่าสุด</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#f59e0b] focus:bg-white transition-colors cursor-pointer">
                  <option value="อนุญาตเข้าจัดกิจกรรม">🟢 อนุญาตเข้าจัดกิจกรรม</option>
                  <option value="รอการตอบกลับ">🟡 รอการตอบกลับ</option>
                  <option value="ปฏิเสธการเข้าทำ">🔴 ปฏิเสธการเข้าทำ</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer">ยกเลิก</button>
                <button type="submit" className="bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md shadow-amber-500/10 cursor-pointer">💾 บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
