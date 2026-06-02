import React, { useState, useEffect } from 'react';

export default function App() {
  // 🏛️ 1. ระบบดึงฐานข้อมูลเริ่มต้นแบบปลอดภัย (V4)
  const [villages, setVillages] = useState(() => {
    try {
      const savedVillagesV4 = localStorage.getItem('v_permission_villages_secure_v4');
      if (savedVillagesV4) {
        const parsed = JSON.parse(savedVillagesV4);
        if (Array.isArray(parsed)) return parsed;
      }
      const oldSavedVillages = localStorage.getItem('v_permission_villages_secure_v3');
      if (oldSavedVillages) {
        const parsedOld = JSON.parse(oldSavedVillages);
        if (Array.isArray(parsedOld)) return parsedOld;
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอ่าน LocalStorage:", error);
    }
    return []; 
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // สเตตสำหรับฟอร์มกรอกข้อมูล (ค่าเริ่มต้นเป็น "ยังไม่ได้โทร")
  const [formData, setFormData] = useState({
    name: '',
    zone: '',
    contact: '',
    phone: '',
    status: '📞 ยังไม่ได้โทร',
    years: '',
    households: '', 
    activityLogs: [] 
  });

  // สำหรับฟิลด์ย่อยตอนกรอกประวัติกิจกรรมในฟอร์ม
  const [logInput, setLogInput] = useState({ year: String(new Date().getFullYear()), date: '' });

  // ระบบ auto-save
  useEffect(() => {
    localStorage.setItem('v_permission_villages_secure_v4', JSON.stringify(villages));
  }, [villages]);

  // ลิสต์รายการปีตั้งแต่ 2022 - 2080
  const yearOptions = [];
  for (let y = 2080; y >= 2022; y--) {
    yearOptions.push(String(y));
  }

  // ระบบสำรองข้อมูลถาวร
  const handleExportData = () => {
    if (villages.length === 0) {
      alert('ยังไม่มีข้อมูลในสารบบให้ส่งออกค่ะ');
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
          alert('📂 ดึงคืนฐานข้อมูลถาวรเสร็จสมบูรณ์เรียบร้อยแล้วค่ะ!');
        } else {
          alert('รูปแบบไฟล์พิมพ์เขียวไม่ถูกต้องค่ะ');
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์สำรองข้อมูลค่ะ');
      }
    };
  };

  // ระบบตัวกรองคำค้นหา
  const filteredVillages = villages.filter(village => 
    (village?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (village?.zone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (village?.contact || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (village?.status || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalHouseholds = filteredVillages.reduce((sum, v) => sum + (parseInt(v.households) || 0), 0);

  // 📅 จัดกรุ๊ปข้อมูลกำหนดการ (เฉพาะของปีปัจจุบัน)
  const currentYearStr = String(new Date().getFullYear());
  const upcomingGrouped = villages.reduce((groups, village) => {
    const logs = village?.activityLogs || [];
    logs.forEach(log => {
      if (log.year === currentYearStr && log.date && log.date.trim() !== '') {
        const dateKey = log.date.trim();
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        if (!groups[dateKey].some(v => v.id === village.id)) {
          groups[dateKey].push(village);
        }
      }
    });
    return groups;
  }, {});

  // ฟังก์ชันสไตล์สีกรณีแยกตามสถานะเชิงลึก
  const getStatusStyle = (status) => {
    const s = status || '';
    if (s.includes('อนุมัติแล้ว')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s.includes('ปฏิเสธ')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (s.includes('ขอเลื่อน')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (s.includes('รอเอกสาร') || s.includes('รอประชุม') || s.includes('รอผลอนุมัติ')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    // ยังไม่ได้โทร, ส่งหนังสือแล้ว
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  // ฟังก์ชันควบคุมฟอร์ม
  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ name: '', zone: '', contact: '', phone: '', status: '📞 ยังไม่ได้โทร', years: '', households: '', activityLogs: [] });
    setLogInput({ year: String(new Date().getFullYear()), date: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (village) => {
    setIsEditing(true);
    setCurrentId(village.id);
    
    let initialLogs = [];
    if (Array.isArray(village.activityLogs)) {
      initialLogs = village.activityLogs;
    } else if (village.eventDate) {
      initialLogs = [{ year: String(new Date().getFullYear()), date: village.eventDate }];
    }

    // กรณีข้อมูลเก่าเป็นสถานะเดิม map ให้เข้ากับสเตตัสใหม่เบื้องต้นแบบเนียน ๆ
    let mappedStatus = village.status || '📞 ยังไม่ได้โทร';
    if (mappedStatus === 'อนุญาตเข้าจัดกิจกรรม') mappedStatus = '✅ อนุมัติแล้ว';
    if (mappedStatus === 'ปฏิเสธการเข้าทำ') mappedStatus = '❌ ปฏิเสธ';
    if (mappedStatus === 'รอการตอบกลับ') mappedStatus = '⏳ รอผลอนุมัติ';

    setFormData({
      name: village.name || '',
      zone: village.zone || '',
      contact: village.contact || '',
      phone: village.phone || '',
      status: mappedStatus,
      years: village.years || '',
      households: village.households || '',
      activityLogs: initialLogs
    });
    setLogInput({ year: String(new Date().getFullYear()), date: '' });
    setIsModalOpen(true);
  };

  const handleAddLog = () => {
    if (!logInput.date.trim()) {
      alert('กรุณากรอกวันที่จัดกิจกรรมด้วยค่ะ');
      return;
    }
    setFormData({
      ...formData,
      activityLogs: [...formData.activityLogs, { year: logInput.year, date: logInput.date.trim() }]
    });
    setLogInput({ ...logInput, date: '' }); 
  };

  const handleRemoveLog = (indexToRemove) => {
    setFormData({
      ...formData,
      activityLogs: formData.activityLogs.filter((_, idx) => idx !== indexToRemove)
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('คุณแน่ใจใช่ไหมว่าต้องการลบข้อมูลหมู่บ้านนี้ออกจากสารบบถาวร?')) {
      setVillages(villages.filter(v => v.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.zone) {
      alert('กรุณากรอกชื่อหมู่บ้านและโซนพื้นที่ด้วยค่ะ');
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* 📢 TITLE & FOCUS */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-[#1e293b] tracking-tight">ระบบกิจกรรมแผนกสรรหาของบริจาคเชิงรุก</h2>
            <p className="text-[#64748b] text-sm mt-0.5">แพลตฟอร์มวิเคราะห์ยุทธศาสตร์พื้นที่และการประเมินผลประโยชน์เพื่อส่วนรวม</p>
          </div>
          <div className="flex gap-2">
            <span className="text-xs bg-[#fffbeb] text-[#b45309] px-3 py-1.5 rounded-lg border border-[#fde68a] font-bold">
              🏠 รวมทั้งสิ้น: {totalHouseholds.toLocaleString()} หลังคาเรือนเป้าหมาย
            </span>
          </div>
        </div>

        {/* 🗓️ กำหนดการประจำปีด้านบนสุด */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm mb-6">
          <h3 className="text-xs font-bold text-[#b45309] tracking-wider uppercase flex items-center gap-1.5 mb-3 bg-[#fffbeb] p-2 rounded-lg border border-[#fde68a] w-fit">
            🗓️ กำหนดการเข้าทำกิจกรรมประจำปี {currentYearStr}
          </h3>
          
          {Object.keys(upcomingGrouped).length === 0 ? (
            <div className="py-2 text-[#94a3b8] text-xs italic">
              ไม่มีกำหนดการเข้าทำกิจกรรมในปีนี้ค่ะ
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 overflow-x-auto pb-1">
              {Object.keys(upcomingGrouped).map((date, idx) => (
                <div key={idx} className="border-l-2 border-[#f59e0b] pl-3 py-1 bg-[#fafafa] rounded-r-lg p-3 border border-[#e2e8f0] min-w-[200px] flex-1">
                  <p className="text-xs font-bold text-[#1e293b] font-mono mb-1 flex items-center gap-1">
                    📅 วันที่ {date}
                  </p>
                  <ul className="space-y-0.5 text-xs text-[#475569] list-disc pl-4 font-semibold">
                    {upcomingGrouped[date].map((village, vIdx) => (
                      <li key={vIdx}>
                        {village.name} <span className="text-[10px] text-slate-400 font-mono">({village.households || 0} ครัวเรือน)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🗃️ ส่วนตารางหลัก: ขยายกว้างเต็มร้อยเซนติเมตร อ่านง่ายสบายตา */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
          
          <div className="px-6 py-4 border-b border-[#e2e8f0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#fafafa]">
            <div>
              <h3 className="font-bold text-[#1e293b] text-sm tracking-wide flex items-center gap-2">
                📊 สารบบข้อมูลยุทธศาสตร์การจัดหาเชิงรุก ({villages.length} รายการ)
              </h3>
              <p className="text-xs text-[#64748b] mt-0.5">ระบบลงทะเบียนประวัติและรายละเอียดพื้นที่เป้าหมายทั้งหมด</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#94a3b8] text-xs">🔍</span>
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหาชื่อหมู่บ้าน โซน ผู้ติดต่อ หรือสถานะ..."
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
                  <th className="py-4 px-6 min-w-[160px]">ชื่อหมู่บ้านจัดสรร</th>
                  <th className="py-4 px-4 text-center">หลังคาเรือน</th>
                  <th className="py-4 px-6">โซน / อำเภอ</th>
                  <th className="py-4 px-6">ผู้แทนนิติบุคคล</th>
                  <th className="py-4 px-6">เบอร์โทรศัพท์</th>
                  <th className="py-4 px-6 min-w-[150px]">สถานะดำเนินงานเชิงลึก</th>
                  <th className="py-4 px-6 min-w-[220px]">ประวัติและกำหนดการทำงานรายปี</th>
                  <th className="py-4 px-6 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {filteredVillages.map((v) => (
                  <tr key={v.id} className="hover:bg-[#f8fafc] transition-colors duration-150">
                    <td className="py-4 px-6 font-bold text-[#1e293b] text-base">{v.name}</td>
                    <td className="py-4 px-4 text-center font-bold text-slate-700 font-mono bg-slate-50/50">
                      {v.households ? Number(v.households).toLocaleString() : '-'}
                    </td>
                    <td className="py-4 px-6 text-[#475569] font-medium">{v.zone}</td>
                    <td className="py-4 px-6 text-[#475569]">{v.contact}</td>
                    <td className="py-4 px-6 text-[#64748b] font-mono tracking-wide">{v.phone || '-'}</td>
                    
                    {/* ⚙️ แสดงสเตตัสเชิงลึก 8 รูปแบบพร้อม Badge สีแยกกลุ่มกระบวนการ */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${getStatusStyle(v.status)}`}>
                        {v.status || '📞 ยังไม่ได้โทร'}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1.5 max-w-sm">
                        {Array.isArray(v.activityLogs) && v.activityLogs.length > 0 ? (
                          v.activityLogs.map((log, lIdx) => (
                            <span key={lIdx} className="inline-block bg-[#fffbeb] text-[#b45309] border border-[#fde68a] text-[11px] px-2 py-0.5 rounded font-bold shadow-sm">
                              <span className="opacity-60 font-mono mr-1">{log.year}:</span>
                              {log.date}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#94a3b8] text-xs italic">ไม่มีบันทึกข้อมูล</span>
                        )}
                      </div>
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
                    <td colSpan="8" className="py-8 px-6 text-center text-[#94a3b8] italic bg-[#fafafa]">
                      ไม่พบข้อมูลหมู่บ้านในตารางนี้ค่ะ 🔍
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
        </div>
      </main>

      {/* 📋 MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-lg overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex justify-between items-center shrink-0">
              <h3 className="text-sm font-bold text-[#1e293b] tracking-wide">{isEditing ? '📝 แก้ไขข้อมูลยุทธศาสตร์หมู่บ้าน' : '➕ ลงทะเบียนหมู่บ้านจัดสรรเป้าหมาย'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#94a3b8] hover:text-[#1e293b] cursor-pointer text-lg">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">ชื่อหมู่บ้านจัดสรร <span className="text-rose-500">*</span></label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="เช่น หมู่บ้านลัดดารมย์" className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">หลังคาเรือน</label>
                  <input type="number" min="0" value={formData.households} onChange={(e) => setFormData({...formData, households: e.target.value})} placeholder="เช่น 350" className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#f59e0b] focus:bg-white transition-colors font-mono font-bold" />
                </div>
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
                  <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">ประวัติปีทำกิจกรรมเดิม (พิมพ์แยก)</label>
                  <input type="text" value={formData.years} onChange={(e) => setFormData({...formData, years: e.target.value})} placeholder="เช่น 2024, 2025" className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#f59e0b] focus:bg-white transition-colors font-mono" />
                </div>
              </div>

              {/* บันทึกกิจกรรมรายปี 2022 - 2080 */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider">🗓️ ส่วนบันทึกแผนงานและประวัติกิจกรรมรายปี</label>
                
                <div className="flex gap-2 items-end">
                  <div className="w-28 shrink-0">
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">เลือกปี</label>
                    <select 
                      value={logInput.year} 
                      onChange={(e) => setLogInput({...logInput, year: e.target.value})}
                      className="w-full bg-white border border-[#e2e8f0] rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-[#f59e0b] font-mono font-bold"
                    >
                      {yearOptions.map(yr => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">วันที่เข้าจัดกิจกรรม</label>
                    <input 
                      type="text"
                      value={logInput.date}
                      onChange={(e) => setLogInput({...logInput, date: e.target.value})}
                      placeholder="เช่น 7-8/6 หรือ 12 ธ.ค."
                      className="w-full bg-white border border-[#e2e8f0] rounded-lg px-3 py-2 text-xs text-[#334155] focus:outline-none focus:border-[#f59e0b]"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={handleAddLog}
                    className="bg-[#fffbeb] hover:bg-[#fef3c7] text-[#b45309] border border-[#fde68a] text-xs px-3 py-2 rounded-lg font-bold transition-all shrink-0 cursor-pointer h-[34px]"
                  >
                    ➕ เพิ่มลงประวัติ
                  </button>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] text-slate-400 font-bold mb-1.5 uppercase tracking-wide">รายการประวัติบันทึกในสารบบขณะนี้:</p>
                  {formData.activityLogs.length === 0 ? (
                    <p className="text-xs italic text-slate-400 text-center py-2 bg-white rounded-lg border border-dashed border-slate-200">ยังไม่มีการเพิ่มรายการประวัติสำหรับพื้นที่นี้ค่ะ</p>
                  ) : (
                    <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
                      {formData.activityLogs.map((log, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
                          <span className="text-xs font-medium text-slate-700">
                            <strong className="font-mono text-[#b45309] mr-2">[{log.year}]</strong> {log.date}
                          </span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveLog(idx)}
                            className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer px-1"
                          >
                            ✕ ลบรายการนี้
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ⚙️ ส่วนเลือกสถานะเชิงลึกแบบ Dropdown ครบทั้ง 8 รูปแบบ */}
              <div>
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">สถานะดำเนินงานเชิงลึก</label>
                <select 
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})} 
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#f59e0b] focus:bg-white transition-colors cursor-pointer font-medium"
                >
                  <option value="📞 ยังไม่ได้โทร">📞 ยังไม่ได้โทร</option>
                  <option value="📨 ส่งหนังสือแล้ว">📨 ส่งหนังสือแล้ว</option>
                  <option value="📩 รอเอกสารเพิ่มเติม">📩 รอเอกสารเพิ่มเติม</option>
                  <option value="👨‍💼 รอประชุมกรรมการ">👨‍💼 รอประชุมกรรมการ</option>
                  <option value="⏳ รอผลอนุมัติ">⏳ รอผลอนุมัติ</option>
                  <option value="✅ อนุมัติแล้ว">✅ อนุมัติแล้ว</option>
                  <option value="❌ ปฏิเสธ">❌ ปฏิเสธ</option>
                  <option value="🔄 ขอเลื่อน">🔄 ขอเลื่อน</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 shrink-0">
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
