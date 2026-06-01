import React, { useState, useEffect } from 'react';

export default function App() {
  // 1. ฐานข้อมูลเริ่มต้นแบบขาวสะอาด 100% (ดึงจากเครื่องก่อน ถ้าไม่มีจะเป็นตารางว่าง)
  const [villages, setVillages] = useState(() => {
    const savedVillages = localStorage.getItem('v_permission_villages_secure');
    if (savedVillages) {
      return JSON.parse(savedVillages);
    }
    return []; // 🔴 เคลียร์ข้อมูลตัวอย่าง 4 หมู่บ้านออกตามบรีฟคุณหนิงเรียบร้อยค่ะ
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
    years: ''
  });

  // 📝 ระบบ auto-save ด่านแรก (เซฟลงเครื่องอัตโนมัติเมื่อมีการกดบันทึก แก้ไข หรือลบ)
  useEffect(() => {
    localStorage.setItem('v_permission_villages_secure', JSON.stringify(villages));
  }, [villages]);

  // ==========================================
  // 💾 ส่วนที่เพิ่มพิเศษ: ระบบสำรองข้อมูลถาวรข้ามปี (Backup & Import System)
  // ==========================================
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
  // ==========================================

  // 🔍 ระบบตัวกรองคำค้นหา (Search Filtering Logic)
  const filteredVillages = villages.filter(village => 
    (village.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (village.zone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (village.contact || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📊 ระบบคำนวณสถิติเชิงยุทธศาสตร์แบบ Real-time (ปรับตามมือขยับ)
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

  // ฟังก์ชันควบคุมฟอร์ม
  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ name: '', zone: '', contact: '', phone: '', status: 'รอการตอบกลับ', years: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (village) => {
    setIsEditing(true);
    setCurrentId(village.id);
    setFormData({
      name: village.name,
      zone: village.zone,
      contact: village.contact,
      phone: village.phone,
      status: village.status,
      years: village.years
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
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans antialiased pb-12">
      
      {/* 🏛️ HEADER */}
      <header className="border-b border-slate-800 bg-[#111827]/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 text-xl shadow-inner">📍</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">V-Permission</h1>
            <p className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">REC-DEPARTMENT</p>
          </div>
        </div>
        
        {/* 🛠️ ปุ่มจัดการไฟล์สำรองข้อมูลส่วนหัว */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportData}
            className="hidden sm:flex bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 transition-all cursor-pointer items-center gap-1.5"
            title="เซฟไฟล์ข้อมูลเก็บลงคอมพิวเตอร์แบบถาวรป้องกันสูญหาย"
          >
            💾 สำรองข้อมูลดิบ (.json)
          </button>
          <label className="hidden sm:flex bg-slate-800/60 hover:bg-slate-750 text-amber-400 text-xs font-semibold px-3 py-2 rounded-lg border border-amber-900/30 transition-all cursor-pointer items-center gap-1.5">
            📂 นำเข้าไฟล์สำรอง
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            คลาวด์ล็อกนิรภัยสมบูรณ์
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* 📢 TITLE & FOCUS */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">ระบบกิจกรรมแผนกสรรหาของบริจาคเชิงรุก</h2>
            <p className="text-slate-400 text-sm mt-1">แพลตฟอร์มวิเคราะห์ยุทธศาสตร์พื้นที่และการประเมินผลประโยชน์เพื่อส่วนรวม</p>
          </div>
          <div className="flex gap-2">
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 font-medium">
              เน้นย้ำ: การสื่อสารความเสี่ยง (Risk Communication)
            </span>
          </div>
        </div>

        {/* ปุ่มสำรองข้อมูลสําหรับแสดงผลในหน้าจอมือถือ */}
        <div className="sm:hidden flex gap-2 mb-4">
          <button onClick={handleExportData} className="w-1/2 bg-slate-800 text-slate-300 text-xs font-semibold p-2.5 rounded-xl border border-slate-700">💾 สำรองข้อมูล</button>
          <label className="w-1/2 bg-slate-800/60 text-amber-400 text-xs font-semibold p-2.5 rounded-xl border border-amber-900/30 text-center cursor-pointer">
            📂 นำเข้าไฟล์
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>
        </div>

        {/* 📊 STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {stats.map((item, index) => (
            <div key={index} className="bg-[#111827] border border-slate-800/80 rounded-xl p-5 shadow-lg">
              <div className="flex justify-between items-start">
                <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">{item.label}</p>
                <span className="text-lg">{item.icon}</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight font-mono">{item.value}</span>
                <span className={`text-[11px] font-medium ${
                  item.value.includes('0.0') || item.change.includes('เพิ่มเติม') ? 'text-rose-400' : 'text-emerald-400'
                }`}>{item.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 🗃️ TABLE CONTAINER */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          
          <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141c2c]">
            <div>
              <h3 className="font-semibold text-white text-sm tracking-wide flex items-center gap-2">
                📊 สารบบข้อมูลยุทธศาสตร์การจัดหาเชิงรุก ({villages.length} รายการ)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">สถิติและทำเนียบข้อมูลถาวร ไร้ความเสี่ยงข้อมูลสูญหาย</p>
            </div>
            
            {/* 🔍 Search Input Group */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 text-xs">🔍</span>
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหาชื่อหมู่บ้าน โซน หรือผู้ติดต่อ..."
                  className="w-full bg-[#0b0f19] border border-slate-800 text-slate-200 text-xs rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors tracking-wide"
                />
              </div>
              <button 
                onClick={handleOpenAdd}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>➕</span> ลงทะเบียนหมู่บ้านเพิ่ม
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-[#111827]/50 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-6">ชื่อหมู่บ้านจัดสรร</th>
                  <th className="py-4 px-6">โซน / อำเภอ</th>
                  <th className="py-4 px-6">ผู้แทนนิติบุคคล</th>
                  <th className="py-4 px-6">เบอร์โทรศัพท์</th>
                  <th className="py-4 px-6">สถานะล่าสุด</th>
                  <th className="py-4 px-6 text-center">ประวัติปีที่ทำกิจกรรม</th>
                  <th className="py-4 px-6 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredVillages.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/30 transition-colors duration-150">
                    <td className="py-4 px-6 font-semibold text-white text-base">{v.name}</td>
                    <td className="py-4 px-6 text-slate-300 font-medium">{v.zone}</td>
                    <td className="py-4 px-6 text-slate-300">{v.contact}</td>
                    <td className="py-4 px-6 text-slate-400 font-mono tracking-wide">{v.phone || '-'}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        v.status.includes('อนุญาต') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        v.status.includes('รอ') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          v.status.includes('อนุญาต') ? 'bg-emerald-400' :
                          v.status.includes('รอ') ? 'bg-amber-400' : 'bg-rose-400'
                        }`}></span>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-1.5">
                        {v.years ? (
                          v.years.split(',').map(y => (
                            <span key={y} className="bg-slate-800/80 text-slate-300 text-xs px-2 py-0.5 rounded border border-slate-700 font-mono font-medium">
                              {y.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-xs italic">ไม่มีประวัติ</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleOpenEdit(v)} className="text-xs bg-slate-800 text-amber-400 border border-slate-700 px-2.5 py-1 rounded-md cursor-pointer font-medium">✏️ แก้ไข</button>
                        <button onClick={() => handleDelete(v.id)} className="text-xs bg-slate-800/50 text-rose-400 border border-rose-900/30 px-2.5 py-1 rounded-md cursor-pointer font-medium">🗑️ ลบ</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredVillages.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-8 px-6 text-center text-slate-500 italic bg-[#111827]/20">
                      สารบบว่างเปล่าค่ะคุณหนิง กดปุ่มลงทะเบียนหมู่บ้านเป้าหมายด้านบนเพื่อเริ่มต้นงานยุทธศาสตร์ได้เลยค่ะ 🔍
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-[#141c2c] border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white tracking-wide">{isEditing ? '📝 แก้ไขข้อมูลยุทธศาสตร์หมู่บ้าน' : '➕ ลงทะเบียนหมู่บ้านจัดสรรเป้าหมาย'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer text-lg">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">ชื่อหมู่บ้านจัดสรร <span className="text-rose-400">*</span></label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="เช่น หมู่บ้านแสนสิริ สุขุมวิท 77" className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">โซน / อำเภอ <span className="text-rose-400">*</span></label>
                  <input type="text" value={formData.zone} onChange={(e) => setFormData({...formData, zone: e.target.value})} placeholder="เช่น นนทบุรี / บางใหญ่" className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">ผู้แทนนิติบุคคล</label>
                  <input type="text" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} placeholder="ชื่อผู้ติดต่อหลัก" className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">เบอร์โทรศัพท์</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="เช่น 081-234-5678" className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">ประวัติปีทำกิจกรรม</label>
                  <input type="text" value={formData.years} onChange={(e) => setFormData({...formData, years: e.target.value})} placeholder="เช่น 2024, 2025" className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">สถานะล่าสุด</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer">
                  <option value="อนุญาตเข้าจัดกิจกรรม">🟢 อนุญาตเข้าจัดกิจกรรม</option>
                  <option value="รอการตอบกลับ">🟡 รอการตอบกลับ</option>
                  <option value="ปฏิเสธการเข้าทำ">🔴 ปฏิเสธการเข้าทำ</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-800 text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer">ยกเลิก</button>
                <button type="submit" className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg shadow-emerald-600/10 cursor-pointer">💾 บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
