import React, { useState } from 'react';

export default function App() {
  // 1. ฐานข้อมูลยุทธศาสตร์การจัดหาเชิงรุก (State หลักที่ใช้คำนวณสถิติเรียลไทม์)
  const [villages, setVillages] = useState([
    { id: 1, name: 'หมู่บ้านแสนสิริ สุขุมวิท 77', zone: 'กรุงเทพฯ ตะวันออก', contact: 'คุณสมศักดิ์ รักสงบ', phone: '081-234-5678', status: 'อนุญาตเข้าจัดกิจกรรม', years: '2024, 2025' },
    { id: 2, name: 'หมู่บ้านลัดดารมย์ ปิ่นเกล้า', zone: 'นนทบุรี / บางใหญ่', contact: 'คุณหญิงวรรณา รุ่งเรือง', phone: '089-876-5432', status: 'รอการตอบกลับ', years: '2024' },
    { id: 3, name: 'หมู่บ้านพฤกษา วิลล์ ดอนเมือง', zone: 'กรุงเทพฯ เหนือ', contact: 'คุณประดิษฐ์ มั่นคง', phone: '02-345-6789', status: 'ปฏิเสธการเข้าทำ', years: '' },
    { id: 4, name: 'หมู่บ้านเพอร์เฟค เพลส รัตนาธิเบศร์', zone: 'นนทบุรี / เมืองนนทบุรี', contact: 'คุณอัญชลี มีสุข', phone: '085-111-2233', status: 'อนุญาตเข้าจัดกิจกรรม', years: '2025' }
  ]);

  // สเตตควบคุมฟอร์มและการแก้ไขข้อมูล
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

  // ==========================================
  // 📊ระบบสูตรคำนวณสถิติแบบ REAL-TIME (Dynamic Calculation)
  // ==========================================
  const totalCount = villages.length;
  const approvedCount = villages.filter(v => v.status === 'อนุญาตเข้าจัดกิจกรรม').length;
  const pendingCount = villages.filter(v => v.status === 'รอการตอบกลับ').length;

  // สูตรที่ 1: อัตราการเข้าถึงเป้าหมาย (Reach %)
  const reachValue = totalCount > 0 ? ((approvedCount / totalCount) * 100).toFixed(1) : '0.0';
  const reachChange = totalCount > 0 ? `แปรผันตามสารบบ ${totalCount} พื้นที่` : 'ไม่มีข้อมูลในระบบ';

  // สูตรที่ 2: อัตราความคุ้มค่าต่อส่วนรวม (สเกลผลประโยชน์เชิงรุก 1 : X)
  const valueMultiplier = totalCount > 0 ? (1 + (approvedCount * 1.25)).toFixed(1) : '0.0';
  const valueText = approvedCount >= 2 ? 'เกณฑ์ประสิทธิภาพสูง' : 'เกณฑ์กำลังพัฒนา';

  // สูตรที่ 3: ความสำเร็จในการสื่อสารความเสี่ยง (หักลบเคสค้างสถานะ รอการตอบกลับออก)
  const riskCommunicationSuccess = totalCount > 0 
    ? (((totalCount - pendingCount) / totalCount) * 100).toFixed(1) 
    : '0.0';
  const riskText = parseFloat(riskCommunicationSuccess) >= 80 ? 'อยู่ในเกณฑ์ดีเยี่ยม' : 'ควรเร่งสื่อสารเพิ่มเติม';

  // มัดรวมเข้ากล่องสถิติเพื่อไป Render บนหน้าจอ
  const dynamicStats = [
    { label: 'อัตราการเข้าถึงเป้าหมาย (Reach)', value: `${reachValue}%`, change: reachChange, icon: '📈' },
    { label: 'อัตราความคุ้มค่าต่อส่วนรวม', value: `1:${valueMultiplier}`, change: valueText, icon: '💎' },
    { label: 'ความสำเร็จในการสื่อสารความเสี่ยง', value: `${riskCommunicationSuccess}%`, change: riskText, icon: '🛡️' },
  ];
  // ==========================================

  // ฟังก์ชันเปิดฟอร์มเพิ่มข้อมูลใหม่
  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ name: '', zone: '', contact: '', phone: '', status: 'รอการตอบกลับ', years: '' });
    setIsModalOpen(true);
  };

  // ฟังก์ชันเปิดฟอร์มแก้ไขข้อมูลเดิม
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

  // ฟังก์ชันลบข้อมูล
  const handleDelete = (id) => {
    if (window.confirm('คุณหนิงแน่ใจใช่ไหมคะว่าต้องการลบสารบบข้อมูลหมู่บ้านนี้ออกถาวร?')) {
      setVillages(villages.filter(v => v.id !== id));
    }
  };

  // ฟังก์ชันบันทึกข้อมูลแบบ Submit
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            ระบบออนไลน์สมบูรณ์
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* 📢 TITLE & CORE FOCUS */}
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

        {/* 🚨 ALERT: แถบแจ้งเตือนความล่าช้าเด่นชัด */}
        {villages.some(v => v.id === 2 && v.status === 'รอการตอบกลับ') && (
          <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 items-start backdrop-blur-sm">
            <span className="text-xl text-amber-400 mt-0.5">🔔</span>
            <div>
              <h4 className="font-semibold text-amber-400 text-sm tracking-wide">ระบบตรวจพบความล่าช้าในการขออนุมัติพื้นที่</h4>
              <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">
                นิติบุคคลหมู่บ้าน <span className="text-white font-medium">"หมู่บ้านลัดดารมย์ ปิ่นเกล้า"</span> ค้างสถานะรอการตอบกลับนานกว่า <span className="text-amber-400 font-semibold font-mono">74</span> วันแล้ว กรุณาเร่งติดตามผลและสื่อสารความเสี่ยงเพิ่มเติมค่ะ
              </p>
            </div>
          </div>
        )}

        {/* 📊 STATS CARDS: ปรับใช้ตัวแปรแบบเรียลไทม์ ขยับตามการเพิ่ม/ลบข้อมูลในสารบบทันที */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {dynamicStats.map((item, index) => (
            <div key={index} className="bg-[#111827] border border-slate-800/80 rounded-xl p-5 shadow-lg">
              <div className="flex justify-between items-start">
                <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">{item.label}</p>
                <span className="text-lg">{item.icon}</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight font-mono animate-pulse-once">{item.value}</span>
                <span className={`text-[11px] font-medium ${item.value !== '0.0%' && item.value !== '1:0.0' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.change}
                </span>
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
              <p className="text-xs text-slate-400 mt-0.5">สถิติและทำเนียบข้อมูลการขออนุญาตเข้าทำกิจกรรมภายในหมู่บ้านจัดสรร</p>
            </div>
            <button 
              onClick={handleOpenAdd}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-600/10 flex items-center gap-1.5 cursor-pointer"
            >
              <span>➕</span> ลงทะเบียนหมู่บ้านเพิ่ม
            </button>
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
                {villages.map((v) => (
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
                        <button 
                          onClick={() => handleOpenEdit(v)}
                          className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium"
                        >
                          ✏️ แก้ไข
                        </button>
                        <button 
                          onClick={() => handleDelete(v.id)}
                          className="text-xs bg-slate-800/50 hover:bg-rose-950/40 text-rose-400 border border-rose-900/30 px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium"
                        >
                          🗑️ ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {villages.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-8 px-6 text-center text-slate-500 italic bg-[#111827]/20">
                      ไม่พบสารบบข้อมูลยุทธศาสตร์ในระบบ กรุณากดปุ่มเพิ่มข้อมูลด้านบนค่ะคุณหนิง
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
              <h3 className="text-sm font-bold text-white tracking-wide">
                {isEditing ? '📝 แก้ไขข้อมูลยุทธศาสตร์หมู่บ้าน' : '➕ ลงทะเบียนหมู่บ้านจัดสรรเป้าหมาย'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-lg">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">ชื่อหมู่บ้านจัดสรร <span className="text-rose-400">*</span></label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="เช่น หมู่บ้านแสนสิริ สุขุมวิท 77"
                  className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">โซน / อำเภอ <span className="text-rose-400">*</span></label>
                  <input 
                    type="text" 
                    value={formData.zone}
                    onChange={(e) => setFormData({...formData, zone: e.target.value})}
                    placeholder="เช่น นนทบุรี / บางใหญ่"
                    className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">ผู้แทนนิติบุคคล</label>
                  <input 
                    type="text" 
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    placeholder="ชื่อผู้ติดต่อหลัก"
                    className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">เบอร์โทรศัพท์</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="เช่น 081-234-5678"
                    className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">ประวัติปีทำกิจกรรม</label>
                  <input 
                    type="text" 
                    value={formData.years}
                    onChange={(e) => setFormData({...formData, years: e.target.value})}
                    placeholder="เช่น 2024, 2025"
                    className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">สถานะล่าสุด</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                >
                  <option value="อนุญาตเข้าจัดกิจกรรม">🟢 อนุญาตเข้าจัดกิจกรรม</option>
                  <option value="รอการตอบกลับ">🟡 รอการตอบกลับ</option>
                  <option value="ปฏิเสธการเข้าทำ">🔴 ปฏิเสธการเข้าทำ</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-emerald-600/10 cursor-pointer"
                >
                  💾 บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
