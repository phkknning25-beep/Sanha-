import React, { useState } from 'react';

export default function App() {
  // 1. ฐานข้อมูลยุทธศาสตร์การจัดหาเชิงรุก (หมู่บ้านจัดสรรเป้าหมาย)
  const [villages] = useState([
    { 
      id: 1, 
      name: 'หมู่บ้านแสนสิริ สุขุมวิท 77', 
      zone: 'กรุงเทพฯ ตะวันออก', 
      contact: 'คุณสมศักดิ์ รักสงบ', 
      phone: '081-234-5678', 
      status: 'อนุญาตเข้าจัดกิจกรรม', 
      years: ['2024', '2025'] 
    },
    { 
      id: 2, 
      name: 'หมู่บ้านลัดดารมย์ ปิ่นเกล้า', 
      zone: 'นนทบุรี / บางใหญ่', 
      contact: 'คุณหญิงวรรณา รุ่งเรือง', 
      phone: '089-876-5432', 
      status: 'รอการตอบกลับ', 
      years: ['2024'] 
    },
    { 
      id: 3, 
      name: 'หมู่บ้านพฤกษา วิลล์ ดอนเมือง', 
      zone: 'กรุงเทพฯ เหนือ', 
      contact: 'คุณประดิษฐ์ มั่นคง', 
      phone: '02-345-6789', 
      status: 'ปฏิเสธการเข้าทำ', 
      years: [] 
    },
    { 
      id: 4, 
      name: 'หมู่บ้านเพอร์เฟค เพลส รัตนาธิเบศร์', 
      zone: 'นนทบุรี / เมืองนนทบุรี', 
      contact: 'คุณอัญชลี มีสุข', 
      phone: '085-111-2233', 
      status: 'อนุญาตเข้าจัดกิจกรรม', 
      years: ['2025'] 
    }
  ]);

  // 2. ข้อมูลสถิติภาพรวมสำหรับใช้ในงานวิเคราะห์และสื่อสารความเสี่ยง (Risk Communication Overview)
  const stats = [
    { label: 'อัตราการเข้าถึงเป้าหมาย (Reach)', value: '82.5%', change: '+4.2% เดือนนี้', icon: '📈' },
    { label: 'อัตราความคุ้มค่าต่อส่วนรวม', value: '1:4.8', change: 'เกณฑ์ประสิทธิภาพสูง', icon: '💎' },
    { label: 'ความสำเร็จในการสื่อสารความเสี่ยง', value: '94.1%', change: 'อยู่ในเกณฑ์ดีเยี่ยม', icon: '🛡️' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans antialiased pb-12">
      
      {/* 🏛️ HEADER: ส่วนหัวระดับ Premium Luxury (สไตล์ Apple Minimal) */}
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
        
        {/* 📢 TITLE & CORE FOCUS: มุ่งเน้นการสื่อสารความเสี่ยงอย่างทรงพลัง */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">ระบบขออนุญาตเข้าทำกิจกรรมจัดหาผู้บริจาคโลหิตเชิงรุก</h2>
            <p className="text-slate-400 text-sm mt-1">แพลตฟอร์มวิเคราะห์ยุทธศาสตร์พื้นที่และการประเมินผลประโยชน์เพื่อส่วนรวม</p>
          </div>
          <div className="flex gap-2">
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 font-medium">
              เน้นย้ำ: การสื่อสารความเสี่ยง (Risk Communication)
            </span>
          </div>
        </div>

        {/* 🚨 ALERT: แถบแจ้งเตือนความล่าช้าเด่นชัด ป้องกันงานตกหล่น */}
        <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 items-start backdrop-blur-sm">
          <span className="text-xl text-amber-400 mt-0.5">🔔</span>
          <div>
            <h4 className="font-semibold text-amber-400 text-sm tracking-wide">ระบบตรวจพบความล่าช้าในการขออนุมัติพื้นที่</h4>
            <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">
              นิติบุคคลหมู่บ้าน <span className="text-white font-medium">"หมู่บ้านลัดดารมย์ ปิ่นเกล้า"</span> ค้างสถานะรอการตอบกลับนานกว่า <span className="text-amber-400 font-semibold font-mono">74</span> วันแล้ว กรุณาเร่งติดตามผลและสื่อสารความเสี่ยงเพิ่มเติมค่ะ
            </p>
          </div>
        </div>

        {/* 📊 STATS CARDS: บล็อกรายงานสถิติภาพรวมระดับผู้บริหาร */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {stats.map((item, index) => (
            <div key={index} className="bg-[#111827] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/80 transition-all shadow-lg">
              <div className="flex justify-between items-start">
                <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">{item.label}</p>
                <span className="text-lg">{item.icon}</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight font-mono">{item.value}</span>
                <span className={`text-[11px] font-medium ${item.change.includes('+') ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {item.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 🗃️ TABLE CONTAINER: สารบบข้อมูลยุทธศาสตร์สี Graphite Dark Mode */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          
          {/* หัวตารางเรียบหรู */}
          <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141c2c]">
            <div>
              <h3 className="font-semibold text-white text-sm tracking-wide flex items-center gap-2">
                📊 สารบบข้อมูลยุทธศาสตร์การจัดหาเชิงรุก ({villages.length} รายการ)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">สถิติและทำเนียบข้อมูลการขออนุญาตเข้าทำกิจกรรมภายในหมู่บ้านจัดสรร</p>
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-600/10 flex items-center gap-1.5 self-end sm:self-auto cursor-pointer">
              <span>➕</span> ลงทะเบียนหมู่บ้านเพิ่ม
            </button>
          </div>
          
          {/* ตัวตารางข้อมูลแบบคลีน (ตัดช่องความเสี่ยงออกแล้ว) */}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {villages.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/30 transition-colors duration-150">
                    <td className="py-4 px-6 font-semibold text-white text-base">{v.name}</td>
                    <td className="py-4 px-6 text-slate-300 font-medium">{v.zone}</td>
                    <td className="py-4 px-6 text-slate-300">{v.contact}</td>
                    <td className="py-4 px-6 text-slate-400 font-mono tracking-wide">{v.phone}</td>
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
                        {v.years.length > 0 ? (
                          v.years.map(y => (
                            <span key={y} className="bg-slate-800/80 text-slate-300 text-xs px-2 py-0.5 rounded border border-slate-700 font-mono font-medium">
                              {y}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-xs italic">ไม่มีประวัติ</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
        </div>
      </main>
    </div>
  );
}