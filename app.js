const $ = (s, r=document) => r.querySelector(s);
const state = { role:"mahasiswa", page:"dashboard", filter:"Semua", detailKas:null };
const STORE = {
  get(k, d){ try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch(e){ return d; } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
};
const people = [
  {name:"Anisa Wahuda",nim:"202543600982",status:"Hadir",cash:"Lunas",amount:"Rp 25.000"},
  {name:"Mahasiswa",nim:"202543600983",status:"Hadir",cash:"Pending",amount:"Rp 20.000"}, // Nama diganti
  {name:"Rangga Pratama",nim:"202543600984",status:"Izin",cash:"Belum Bayar",amount:"Rp 0"},
  {name:"Dinda Aulia",nim:"202543600985",status:"Sakit",cash:"Lunas",amount:"Rp 25.000"},
  {name:"Fajar Ramadhan",nim:"202543600986",status:"Hadir",cash:"Lunas",amount:"Rp 25.000"}
];

/* ====== KURIKULUM R3S ====== */
const KURIKULUM = {
  1: ["Algoritma 1*)","Pemrograman 1#)","Kalkulus Dasar*)","Agama","Pancasila","Bahasa Indonesia","Bahasa Inggris","Pengantar Teknologi Informasi"],
  2: ["Logika Matematika","Kalkulus Lanjut","Bahasa Inggris Informatika","Pemrograman 2*)#)","Sistem Digital##)","Algoritma*)#)","Komputer dan Masyarakat","Kewarganegaraan"],
  3: ["Sistem Informasi","Matematika Diskrit","Statistika Dasar","Struktur Data*)","Praktikum Struktur Data#)","Fisika Komputasi Dasar","Pemrograman Python#)","Jaringan Komputer*)"]
};

const navStudent = [["UTAMA", [["dashboard","▦","Dashboard"]]],["AKTIVITAS KELAS",[["absensi","◷","Absensi"],["kas","＄","Kas"],["cuti","▤","Cuti"],["laporan","⚑","Laporan"]]],["AKUN",[["profil","◎","Profil"]]]];
const navAdmin = [["UTAMA",[["dashboard","▦","Dashboard"]]],["MONITORING",[["monitoring-kas","＄","Monitoring Kas"],["monitoring-absensi","◷","Monitoring Absensi"],["cuti-admin","▤","Pengajuan Cuti"],["mahasiswa","♙","Daftar Mahasiswa"],["laporan-admin","⚑","Monitoring Laporan"]]],["AKUN",[["profil","◎","Profil"]]]];
const navReadOnly = [["UTAMA",[["dashboard","▦","Dashboard"]]],["PANTAU KELAS",[["monitoring-kas","＄","Monitoring Kas"],["monitoring-absensi","◷","Monitoring Absensi"],["cuti-admin","▤","Pengajuan Cuti"],["laporan-admin","⚑","Monitoring Laporan"]]],["AKUN",[["profil","◎","Profil"]]]];
const roleName = () => ({mahasiswa:"Mahasiswa",admin:"Admin Utama",bendahara:"Bendahara",ketua:"Ketua Kelas"}[state.role]);
const isAdmin = () => state.role==="admin";
const isStudent = () => state.role==="mahasiswa";
const canManageKas = () => state.role==="admin" || state.role==="bendahara";

function showToast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600)}

function login(){
  state.role=$("#loginRole").value;state.page="dashboard";state.detailKas=null;
  $("#loginScreen").classList.add("hidden");$("#appShell").classList.remove("hidden");
  $("#sideName").textContent=isStudent()?"Mahasiswa":"Admin R3S";
  $("#sideRole").textContent=roleName()+" · R3S";
  $("#sideAvatar").textContent=isStudent()?"M":"A";
  $("#topAvatar").textContent=isStudent()?"M":"A";
  $("#todayLabel").textContent=new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  renderNav();renderPage();
}

function renderNav(){
  let groups=isStudent()?navStudent:isAdmin()?navAdmin:navReadOnly;
  $("#sideNav").innerHTML=groups.map(([label,items])=>`<div class="nav-group">${label}</div>${items.map(([id,ico,name])=>`<button class="nav-link ${state.page===id?"active":""}" data-page="${id}"><span class="nav-icon">${ico}</span>${name}</button>`).join("")}`).join("");
  $("#sideNav").querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>{state.page=b.dataset.page;state.detailKas=null;renderNav();renderPage()});
}
function heading(title,sub,actions=""){return `<div class="page-heading"><div><span class="eyebrow">R3S CLASS PORTAL</span><h1>${title}</h1><p>${sub}</p></div><div class="heading-actions">${actions}</div></div>`}
function stat(label,value,note,icon){return `<div class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-note">${note}</div></div>`}
function welcome(){return `<section class="welcome-strip"><span class="eyebrow">CLASS MANAGEMENT MADE SIMPLE</span><h2>Selamat datang, ${isStudent()?"Mahasiswa!":"Admin R3S!"}</h2><p>${isStudent()?"Pantau aktivitas perkuliahan dan kebutuhan kelasmu dalam satu tempat.":"Ringkasan kondisi absensi, kas, dan aktivitas mahasiswa kelas R3S."}</p><span class="welcome-meta">SEMESTER 3 · KELAS R3S</span></section>`}
function table(rows,headers){return `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>`}
function personRows(list=people){return list.map((p,i)=>`<tr><td>${i+1}</td><td><div class="student-cell"><span class="tiny-avatar">${p.name.split(" ").map(x=>x[0]).slice(0,2).join("")}</span><strong>${p.name}</strong></div></td><td>${p.nim}</td><td><span class="status ${p.status==="Hadir"?"":p.status==="Izin"?"pending":"rejected"}">${p.status}</span></td><td><span class="status ${p.cash==="Lunas"?"":p.cash==="Pending"?"pending":"rejected"}">${p.cash}</span></td><td>${p.amount}</td></tr>`).join("")}

function dashboard(){return `${heading("Dashboard",isStudent()?"Ringkasan aktivitas dan informasi kelas kamu.":"Ringkasan aktivitas kelas R3S hari ini.")}${welcome()}<div class="stats-grid">${isStudent()?stat("Pertemuan Semester","8 / 16","50% pertemuan terlaksana","◷")+stat("Status Kas Bulan Ini","Pending","Menunggu verifikasi pembayaran","＄")+stat("Pengajuan Cuti","1 pengajuan","Periksa status pengajuanmu","▤")+stat("Total Kehadiran","6 hadir","2 sakit · 0 izin","✓"):stat("Total Mahasiswa","30 orang","Terdaftar di kelas R3S","♙")+stat("Kehadiran Hari Ini","83,3%","25 hadir dari 30 mahasiswa","◷")+stat("Saldo Kas","Rp 608.000","Saldo kas saat ini","＄")+stat("Laporan Aktif","4 laporan","Perlu ditindaklanjuti","⚑")}</div><div class="content-grid"><section class="panel"><div class="panel-head"><div><h3>${isStudent()?"Aktivitas Terbaru":"Statistik Kehadiran"}</h3><p>${isStudent()?"Aktivitas akun kamu belakangan ini.":"Rekap kehadiran kelas dalam beberapa hari terakhir."}</p></div><a class="text-link" href="#" data-go="${isStudent()?"absensi":"monitoring-absensi"}">Lihat detail →</a></div>${isStudent()?activity():`<div class="chart">${[48,68,57,82,70,93,76].map((h,i)=>`<div class="chart-col"><div class="bar-pair"><div class="bar alt" style="height:${h*.65}%"></div><div class="bar" style="height:${h}%"></div></div><small>${["Sen","Sel","Rab","Kam","Jum","Sab","Min"][i]}</small></div>`).join("")}</div><div class="legend"><span><i></i>Hadir</span><span><i class="alt"></i>Izin / Sakit</span></div>`}</section><section class="panel"><div class="panel-head"><div><h3>${isStudent()?"Ringkasan Kehadiran":"Komposisi Kehadiran"}</h3><p>Rekap semester berjalan</p></div></div><div class="donut-wrap"><div class="donut"><div class="donut-center"><strong>${isStudent()?"75%":"83%"}</strong><small>Hadir</small></div></div><div class="legend-list"><div class="legend-row"><span>Hadir</span><b>25</b></div><div class="legend-row"><span>Izin</span><b>3</b></div><div class="legend-row"><span>Sakit</span><b>1</b></div><div class="legend-row"><span>Alpa</span><b>1</b></div></div></div></section></div><section class="panel"><div class="panel-head"><div><h3>${isStudent()?"Riwayat aktivitas":"Mahasiswa terbaru"}</h3><p>${isStudent()?"Informasi terbaru dari portal kelas.":"Contoh data mahasiswa kelas R3S."}</p></div><a class="text-link" href="#" data-go="${isStudent()?"laporan":"mahasiswa"}">Lihat semua →</a></div>${isStudent()?activity():table(personRows(people.slice(0,4)),["No","Nama Mahasiswa","NIM","Absensi","Status Kas","Jumlah"])}</section>`}
function activity(){return `<div class="activity-list"><div class="activity-item"><span class="activity-symbol">✓</span><div><strong>Absensi tercatat</strong><small>Matematika Diskrit · Hadir · Hari ini</small></div><span class="activity-amount">Tercatat</span></div><div class="activity-item"><span class="activity-symbol">＄</span><div><strong>Pembayaran kas</strong><small>Iuran kelas · Menunggu verifikasi</small></div><span class="activity-amount">Rp 20.000</span></div><div class="activity-item"><span class="activity-symbol">▤</span><div><strong>Pengajuan cuti</strong><small>Status pengajuan sedang ditinjau</small></div><span class="activity-amount">Menunggu</span></div></div>`}

/* ====== ABSENSI: Kurikulum + Dropdown Dinamis + Simpan ====== */
function getAbsensiStore(){ return STORE.get("r3s_absensi", []); }
function saveAbsensiStore(list){ STORE.set("r3s_absensi", list); }

function absensiRiwayat(){
  const list = getAbsensiStore();
  if(!list.length) return `<div class="empty-state">Belum ada absensi tersimpan. Simpan absensi pertama kamu di form di atas.</div>`;
  return table(
    list.slice().reverse().map((a,i)=>`<tr><td>${i+1}</td><td>${a.mk}</td><td>Semester ${a.sem}</td><td>Pertemuan ${a.pertemuan}</td><td>${a.tanggal}</td><td><span class="status ${a.status==="Hadir"?"":a.status==="Izin"?"pending":"rejected"}">${a.status}</span></td><td><button class="action-link" data-toast="Detail absensi: ${a.mk} · ${a.status}">Lihat detail</button></td></tr>`),
    ["No","Mata Kuliah","Semester","Pertemuan","Tanggal","Status","Aksi"]
  );
}
function absensiSummary(){
  const list = getAbsensiStore();
  const count = s => list.filter(a=>a.status===s).length;
  return `<div class="detail-list"><div class="detail-row"><span>Total pertemuan tercatat</span><strong>${list.length} pertemuan</strong></div><div class="detail-row"><span>Hadir</span><strong class="positive">${count("Hadir")} pertemuan</strong></div><div class="detail-row"><span>Izin</span><strong>${count("Izin")} pertemuan</strong></div><div class="detail-row"><span>Sakit</span><strong>${count("Sakit")} pertemuan</strong></div><div class="detail-row"><span>Alpa</span><strong>${count("Alpa")} pertemuan</strong></div></div>`;
}

function absensi(){
  // Generate options mata kuliah berdasarkan semester terpilih
  const mkOptions = (sem) => KURIKULUM[sem].map(m=>`<option value="${m}">${m}</option>`).join("");
  const pertemuanOptions = Array.from({length:16},(_,i)=>`<option value="${i+1}">Pertemuan ${i+1}/16</option>`).join("");

  return `${heading("Absensi","Pencatatan kehadiran mahasiswa.")}
  <div class="info-banner">Pilih semester, lalu pilih mata kuliah. Data absensi yang disimpan akan tampil pada riwayat & ringkasan di bawah.</div>
  <div class="two-col">
    <section class="panel form-panel">
      <div class="panel-head">
        <div>
          <h3>Catat Kehadiran</h3>
          <p>Isi form absensi perkuliahan.</p>
        </div>
        <!-- Dropdown Semester dipindahkan ke sini -->
        <select id="absSemester" required style="width: auto; padding: 6px 10px; font-size: 11px; border-radius: 8px; border: 1px solid #dfe8ed; background: #fbfdfe; color: #183449; outline: none; cursor: pointer;">
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
          <option value="3" selected>Semester 3</option>
        </select>
      </div>
      <form id="attendanceForm" class="form-grid">
        <!-- Field Kurikulum R3S dihapus -->
        <div class="field full">
          <label>Mata Kuliah</label>
          <select id="absMk" required>${mkOptions(3)}</select>
        </div>
        <div class="field"><label>Pertemuan</label><select id="absPertemuan">${pertemuanOptions}</select></div>
        <div class="field"><label>Tanggal</label><input id="absTanggal" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
        <div class="field full">
          <label>Status Kehadiran</label>
          <div class="status-options">
            <label><input type="radio" name="att" value="Hadir" checked> Hadir</label>
            <label><input type="radio" name="att" value="Izin"> Izin</label>
            <label><input type="radio" name="att" value="Sakit"> Sakit</label>
            <label><input type="radio" name="att" value="Alpa"> Alpa</label>
          </div>
        </div>
        <div class="field full"><label>Keterangan (opsional)</label><textarea id="absKet" placeholder="Tambahkan keterangan jika diperlukan..."></textarea></div>
        <div class="field full form-actions"><button class="btn btn-primary">Simpan Absensi</button></div>
      </form>
    </section>
    <section class="panel">
      <div class="panel-head"><div><h3>Ringkasan Kehadiran</h3><p>Berdasarkan data tersimpan</p></div></div>
      ${absensiSummary()}
    </section>
  </div>
  <section class="panel" style="margin-top:17px">
    <div class="panel-head"><div><h3>Riwayat Absensi</h3><p>Daftar kehadiran yang sudah disimpan.</p></div></div>
    ${absensiRiwayat()}
  </section>`;
}

function kas(){return `${heading("Kas Kelas","Informasi iuran dan riwayat pembayaran.")}<div class="payment-card"><div><span class="eyebrow">TAGIHAN BULAN INI</span><h3>Iuran Kas Kelas · November 2026</h3><p>Transfer sesuai nominal, lalu unggah bukti pembayaran untuk diverifikasi bendahara.</p><div class="payment-amount">Rp 20.000</div></div><div class="qr-placeholder">QRIS<br><b>SIMULASI</b><br>R3S</div></div><div class="two-col" style="margin-top:17px"><section class="panel"><div class="panel-head"><h3>Informasi Pembayaran</h3><span class="status pending">Pending</span></div><div class="detail-list"><div class="detail-row"><span>Bank</span><strong>Bank Mandiri</strong></div><div class="detail-row"><span>Nomor rekening</span><strong>32465302</strong></div><div class="detail-row"><span>Atas nama</span><strong>Bendahara R3S</strong></div><div class="detail-row"><span>Tagihan</span><strong>Rp 20.000</strong></div></div></section><section class="panel"><div class="panel-head"><h3>Unggah Bukti Pembayaran</h3></div><form id="paymentForm"><div class="field"><label>Metode pembayaran</label><select><option>Transfer Bank</option><option>QRIS</option><option>Tunai</option></select></div><div class="field"><label>Nominal pembayaran</label><input value="20000" type="number"></div><div class="field"><label>File bukti pembayaran</label><input type="file" accept="image/*,.pdf"></div><button class="btn btn-primary" style="margin-top:18px">Kirim Bukti</button></form></section></div><section class="panel" style="margin-top:17px"><div class="panel-head"><h3>Riwayat Pembayaran</h3></div>${table(`<tr><td>1</td><td>Oktober 2026</td><td>Rp 25.000</td><td>Transfer Bank</td><td><span class="status">Terverifikasi</span></td></tr><tr><td>2</td><td>November 2026</td><td>Rp 20.000</td><td>QRIS</td><td><span class="status pending">Menunggu</span></td></tr>`,["No","Periode","Nominal","Metode","Status"])}</section>`}
function cuti(){return `${heading("Pengajuan Cuti","Ajukan izin tidak mengikuti perkuliahan.")}<div class="two-col"><section class="panel form-panel"><div class="panel-head"><h3>Form Pengajuan Cuti</h3></div><form id="leaveForm"><div class="field"><label>Tanggal Mulai</label><input type="date" required></div><div class="field"><label>Tanggal Selesai</label><input type="date" required></div><div class="field"><label>Alasan Cuti</label><select><option>Urusan Keluarga</option><option>Sakit</option><option>Keperluan Pribadi</option><option>Lainnya</option></select></div><div class="field"><label>Keterangan</label><textarea placeholder="Jelaskan alasan pengajuan cuti..." required></textarea></div><div class="field"><label>Bukti pendukung (opsional)</label><input type="file"></div><div class="form-actions"><button class="btn btn-primary">Kirim Pengajuan</button></div></form></section><section class="panel"><div class="panel-head"><h3>Status Pengajuan</h3></div><div class="stat-value">1</div><p class="muted">Pengajuan sedang menunggu verifikasi admin.</p><div class="detail-list"><div class="detail-row"><span>Periode</span><strong>10–12 Nov 2026</strong></div><div class="detail-row"><span>Alasan</span><strong>Urusan Keluarga</strong></div><div class="detail-row"><span>Status</span><span class="status pending">Menunggu</span></div></div></section></div>`}
function laporan(){return `${heading("Laporan","Sampaikan kendala atau laporan terkait portal dan kegiatan kelas.")}<div class="two-col"><section class="panel form-panel"><div class="panel-head"><h3>Buat Laporan Baru</h3></div><form id="reportForm"><div class="field"><label>Kategori laporan</label><select><option>Akun Bermasalah</option><option>Kesalahan Sistem</option><option>Kesalahan Data Absensi</option><option>Kas Kelas</option><option>Lainnya</option></select></div><div class="field"><label>Judul laporan</label><input placeholder="Contoh: Status pembayaran belum berubah" required></div><div class="field"><label>Detail laporan</label><textarea placeholder="Ceritakan kendala yang kamu alami..." required></textarea></div><div class="field"><label>Lampiran (opsional)</label><input type="file"></div><div class="form-actions"><button class="btn btn-primary">Kirim Laporan</button></div></form></section><section class="panel"><div class="panel-head"><h3>Riwayat Laporan</h3></div><div class="activity-list"><div class="activity-item"><span class="activity-symbol">⚑</span><div><strong>Akun Bermasalah</strong><small>11 Nov 2026 · Menunggu tanggapan admin</small></div><span class="status pending">Menunggu</span></div><div class="activity-item"><span class="activity-symbol">✓</span><div><strong>Kesalahan Data</strong><small>08 Nov 2026 · Sudah ditanggapi</small></div><span class="status">Selesai</span></div></div></section></div>`}
function profil(){return `${heading("Profil","Informasi akun dan data mahasiswa.")}<section class="panel profile-header"><div class="profile-large">${isStudent()?"M":"A"}</div><div><h3 style="margin:0 0 5px;font:700 16px Manrope">${isStudent()?"Mahasiswa":"Admin R3S"}</h3><span class="muted">${roleName()} · Kelas R3S</span></div></section><section class="panel form-panel" style="margin-top:17px"><div class="panel-head"><h3>Informasi Akun</h3><span class="status info">Akun aktif</span></div><div class="form-grid"><div class="field"><label>Nama Lengkap</label><input value="${isStudent()?"Mahasiswa":"Admin R3S"}"></div><div class="field"><label>NIM / Username</label><input value="${isStudent()?"202543600983":"admin.r3s"}"></div><div class="field"><label>Email</label><input value="mahasiswa@example.com"></div><div class="field"><label>No. Telepon</label><input value="08xxxxxxxxxx"></div></div><div class="form-actions"><button class="btn btn-primary" data-toast="Perubahan profil tersimpan (simulasi)">Simpan Perubahan</button></div></section>`}

/* ====== MONITORING KAS (Tampilan Referensi) ====== */
function kasTransaksiData(){
  const base = STORE.get("r3s_kas_trx", null);
  if(base) return base;
  const seed = [
    {id:1, waktu:"2026-09-11", ket:"FotoCopy Soal UAS", kategori:"Modul & Belajar", jenis:"Pengeluaran", nominal:13000, status:"Terverifikasi"},
    {id:2, waktu:"2026-09-14", ket:"Iuran Kas September", kategori:"Iuran Kelas", jenis:"Pemasukan", nominal:25000, status:"Terverifikasi"},
    {id:3, waktu:"2026-09-20", ket:"Beli Spidol & Penghapus", kategori:"Alat Tulis", jenis:"Pengeluaran", nominal:22000, status:"Terverifikasi"},
    {id:4, waktu:"2026-10-02", ket:"Iuran Kas Oktober", kategori:"Iuran Kelas", jenis:"Pemasukan", nominal:25000, status:"Terverifikasi"},
    {id:5, waktu:"2026-10-15", ket:"Cetak Laporan Praktikum", kategori:"Modul & Belajar", jenis:"Pengeluaran", nominal:15000, status:"Terverifikasi"}
  ];
  STORE.set("r3s_kas_trx", seed); return seed;
}
function kasTotals(list){
  const masuk = list.filter(t=>t.jenis==="Pemasukan").reduce((a,b)=>a+b.nominal,0);
  const keluar = list.filter(t=>t.jenis==="Pengeluaran").reduce((a,b)=>a+b.nominal,0);
  return {masuk, keluar, total: masuk - keluar};
}
const rupiah = n => "Rp "+n.toLocaleString("id-ID");

function monitoringKasPage(){
  const trx = kasTransaksiData();
  const t = kasTotals(trx);
  
  // Baris tabel
  const rows = trx.map((x,i)=>`<tr id="kas-row-${x.id}">
    <td>${x.waktu}</td>
    <td>${x.ket}</td>
    <td>${x.kategori}</td>
    <td class="${x.jenis==="Pemasukan"?"positive":""}" style="${x.jenis==="Pengeluaran"?"color:var(--red)":""}">${rupiah(x.nominal)}</td>
    <td><span class="status ${x.status==="Terverifikasi"?"":"pending"}">${x.status}</span></td>
    <td><button class="action-link" data-detail-id="${x.id}" style="color:#4bd0d7;">Lihat</button></td>
  </tr>`).join("");

  return `${heading("Monitoring Kas","Detail pembayaran & transaksi kas kelas R3S.")}
  <div class="content-grid" style="grid-template-columns:1fr 1fr 1fr; margin-bottom:15px;">
    <div class="stat-card"><div class="stat-top"><span>Total Keseluruhan Uang Kas</span><span class="stat-icon">＄</span></div><div class="stat-value" style="color:var(--green)">${rupiah(t.total)}</div><div class="stat-note">Saldo bersih</div></div>
    <div class="stat-card"><div class="stat-top"><span>Total Pemasukan</span><span class="stat-icon">↑</span></div><div class="stat-value" style="color:var(--green)">${rupiah(t.masuk)}</div><div class="stat-note">Seluruh pemasukan</div></div>
    <div class="stat-card"><div class="stat-top"><span>Total Pengeluaran</span><span class="stat-icon">↓</span></div><div class="stat-value" style="color:var(--red)">${rupiah(t.keluar)}</div><div class="stat-note">Seluruh pengeluaran</div></div>
  </div>
  <div style="display:flex;gap:9px;margin:15px 0">
    ${canManageKas()?`<button class="btn btn-soft" data-toast="Form tambah transaksi (simulasi)">+ Tambah Transaksi</button>`:""}
  </div>
  <section class="panel table-panel">
    <div class="panel-head" style="padding:19px 20px 0">
      <div class="tabs">
        <button class="tab active" data-kas-filter="Semua">Semua</button>
        <button class="tab" data-kas-filter="Pemasukan">Pemasukan</button>
        <button class="tab" data-kas-filter="Pengeluaran">Pengeluaran</button>
      </div>
      <div class="table-tools">
        <select class="search-input" id="kasKategori" style="width:170px">
          <option value="">Semua Kategori</option>
          <option>Iuran Kelas</option><option>Modul & Belajar</option><option>Alat Tulis</option>
        </select>
        <input class="search-input" id="kasSearch" placeholder="Cari keterangan...">
      </div>
    </div>
    <div id="kasTableWrap">
      ${table(rows,["WAKTU","KETERANGAN","KATEGORI","NOMINAL","STATUS","BUKTI"])}
    </div>
  </section>`;
}
function adminTablePage(type){
  if(type==="monitoring-kas") return monitoringKasPage();
  
  let title,sub,headers,rows;
  if(type==="monitoring-absensi"){title="Monitoring Absensi";sub="Pantau status kehadiran seluruh mahasiswa.";headers=["No","Nama Mahasiswa","NIM","Mata Kuliah","Status","Tanggal"];rows=people.map((p,i)=>`<tr><td>${i+1}</td><td>${p.name}</td><td>${p.nim}</td><td>Matematika Diskrit</td><td><span class="status ${p.status==="Hadir"?"":p.status==="Izin"?"pending":"rejected"}">${p.status}</span></td><td>18 Nov 2026</td></tr>`)}
  if(type==="cuti-admin"){title="Pengajuan Cuti";sub="Daftar pengajuan cuti mahasiswa kelas R3S.";headers=["No","Nama Mahasiswa","Periode","Alasan","Status","Aksi"];rows=people.slice(0,3).map((p,i)=>`<tr><td>${i+1}</td><td>${p.name}</td><td>10–12 Nov 2026</td><td>${["Urusan Keluarga","Sakit","Keperluan Pribadi"][i]}</td><td><span class="status pending">Menunggu</span></td><td><button class="action-link" data-toast="Detail pengajuan dibuka">Lihat</button> ${isAdmin()?`<button class="action-link" data-toast="Pengajuan disetujui (simulasi)">Setujui</button>`:""}</td></tr>`)}
  if(type==="mahasiswa"){title="Daftar Mahasiswa";sub="Kelola data dan pembagian peran mahasiswa kelas R3S.";headers=["No","Nama Lengkap","NIM","Kelas","Peran","Aksi"];rows=people.map((p,i)=>`<tr><td>${i+1}</td><td>${p.name}</td><td>${p.nim}</td><td>R3S</td><td><span class="status info">${["Mahasiswa","Bendahara","Ketua Kelas","Mahasiswa","Mahasiswa"][i]}</span></td><td><button class="action-link" data-toast="Data mahasiswa dibuka">Edit</button></td></tr>`)}
  if(type==="laporan-admin"){title="Monitoring Laporan";sub="Tinjau laporan mahasiswa dan perbarui status penyelesaiannya.";headers=["No","Kategori Laporan","Pelapor","Tanggal","Status","Aksi"];rows=[["Akun Bermasalah","Anisa Wahuda","11 Nov 2026","Menunggu"],["Kesalahan Sistem","Rangga Pratama","11 Nov 2026","Selesai"],["Data Absensi","Mahasiswa","10 Nov 2026","Menunggu"]].map((p,i)=>`<tr><td>${i+1}</td><td>${p[0]}</td><td>${p[1]}</td><td>${p[2]}</td><td><span class="status ${p[3]==="Selesai"?"":"pending"}">${p[3]}</span></td><td><button class="action-link" data-toast="Detail laporan dibuka">Lihat</button> ${isAdmin()?`<button class="action-link" data-toast="Status laporan diperbarui (simulasi)">Update</button>`:""}</td></tr>`)}
  let action=type==="mahasiswa"&&isAdmin()?`<button class="btn btn-primary" data-toast="Form tambah akun (simulasi)">+ Buat Akun</button>`:"";
  return `${heading(title,sub,action)}<section class="panel table-panel"><div class="panel-head"><div class="tabs"><button class="tab active" data-filter="Semua">Semua</button><button class="tab" data-filter="Menunggu">Menunggu</button><button class="tab" data-filter="Selesai">Selesai / Lunas</button></div><input class="search-input" id="tableSearch" placeholder="Cari nama atau NIM..."></div>${table(rows,headers)}</section>`
}

function renderPage(){
  const map={dashboard,absensi,kas,cuti,laporan,profil};let html;
  if(map[state.page]) html=map[state.page]();
  else if(["monitoring-kas","monitoring-absensi","cuti-admin","mahasiswa","laporan-admin"].includes(state.page)){
    if(state.page==="mahasiswa"&&!isAdmin()){state.page="dashboard";html=dashboard()}
    else html=adminTablePage(state.page);
  } else {state.page="dashboard";html=dashboard()}
  $("#pageContent").innerHTML=html;
  $("#crumbCurrent").textContent=({dashboard:"Dashboard",absensi:"Absensi",kas:"Kas",cuti:"Pengajuan Cuti",laporan:"Laporan",profil:"Profil","monitoring-kas":"Monitoring Kas","monitoring-absensi":"Monitoring Absensi","cuti-admin":"Pengajuan Cuti",mahasiswa:"Daftar Mahasiswa","laporan-admin":"Monitoring Laporan"})[state.page];
  wirePage();
}

function wirePage(){
  document.querySelectorAll("[data-toast]").forEach(b=>b.onclick=()=>showToast(b.dataset.toast));
  document.querySelectorAll("[data-go]").forEach(a=>a.onclick=e=>{e.preventDefault();state.page=a.dataset.go;state.detailKas=null;renderNav();renderPage()});

  // Absensi: Logika Dropdown Dinamis
  const absSemester = $("#absSemester");
  const absMk = $("#absMk");
  if(absSemester && absMk){
    absSemester.onchange = () => {
      const sem = absSemester.value;
      absMk.innerHTML = KURIKULUM[sem].map(m=>`<option value="${m}">${m}</option>`).join("");
    };
  }
  const af=$("#attendanceForm");
  if(af) af.onsubmit=e=>{
    e.preventDefault();
    const mk=$("#absMk").value;
    const sem=Number($("#absSemester").value);
    const pertemuan=Number($("#absPertemuan").value);
    const tanggal=$("#absTanggal").value;
    const status=(document.querySelector('input[name="att"]:checked')||{}).value || "Hadir";
    const ket=$("#absKet")?$("#absKet").value:"";
    if(!tanggal){ showToast("Tanggal wajib diisi."); return; }
    const list=getAbsensiStore();
    list.push({mk,sem,pertemuan,tanggal,status,ket});
    saveAbsensiStore(list);
    showToast(`Absensi tersimpan: ${mk} · Pertemuan ${pertemuan} · ${status}`);
    renderPage();
  };

  ["paymentForm","leaveForm","reportForm"].forEach(id=>{let f=$("#"+id);if(f)f.onsubmit=e=>{e.preventDefault();showToast("Berhasil! Ini simulasi, belum tersimpan ke database.");f.reset()}});

  // Tabel Umum
  let search=$("#tableSearch");
  if(search)search.oninput=()=>{let q=search.value.toLowerCase();document.querySelectorAll("tbody tr").forEach(tr=>tr.style.display=tr.innerText.toLowerCase().includes(q)?"":"none")};
  document.querySelectorAll("[data-filter]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-filter]").forEach(x=>x.classList.remove("active"));b.classList.add("active");let q=b.dataset.filter.toLowerCase();document.querySelectorAll("tbody tr").forEach(tr=>tr.style.display=(q==="semua"||tr.innerText.toLowerCase().includes(q))?"":"none")});

  // Monitoring Kas: Detail
    // Monitoring Kas: Detail (Expandable Row)
  document.querySelectorAll("[data-detail-id]").forEach(b=>b.onclick=()=>{
    const id = Number(b.dataset.detailId);
    const tr = b.closest("tr");
    const existingDetail = document.getElementById("detail-row-" + id);

    // Jika baris detail sudah terbuka, tutup (toggle)
    if(existingDetail) {
      existingDetail.remove();
      return;
    }

    // Tutup semua detail lain yang sedang terbuka (opsional, agar hanya 1 yang terbuka)
    document.querySelectorAll(".kas-detail-row").forEach(el => el.remove());

    const trx = kasTransaksiData();
    const selected = trx.find(x => x.id === id);
    if(!selected) return;

    // Buat baris baru untuk detail
    const newRow = document.createElement("tr");
    newRow.id = "detail-row-" + id;
    newRow.className = "kas-detail-row";
    
    // Desain panel detail
    newRow.innerHTML = `
      <td colspan="6" style="padding:0; border-bottom: 2px solid #eef2f4; background-color: #f8fafc;">
        <div class="kas-detail-referensi" style="margin: 15px 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div class="kas-detail-image">
            <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=300&q=80" alt="Bukti Transaksi">
          </div>
          <div class="kas-detail-info">
            <ul class="kas-info-list">
              <li><span class="label">WAKTU</span><span class="separator">:</span><span class="value">${selected.waktu}</span></li>
              <li><span class="label">KETERANGAN</span><span class="separator">:</span><span class="value">${selected.ket}</span></li>
              <li><span class="label">KATEGORI</span><span class="separator">:</span><span class="value">${selected.kategori}</span></li>
              <li><span class="label">NOMINAL</span><span class="separator">:</span><span class="value ${selected.jenis==="Pemasukan"?"positive":""}" style="${selected.jenis==="Pengeluaran"?"color:var(--red)":""}">${rupiah(selected.nominal)}</span></li>
              <li><span class="label">STATUS</span><span class="separator">:</span><span class="value">${selected.status}</span></li>
            </ul>
          </div>
        </div>
      </td>
    `;

    // Sisipkan baris baru tepat setelah baris yang diklik
    tr.parentNode.insertBefore(newRow, tr.nextSibling);
  });
  
  // Monitoring Kas: Filter
  document.querySelectorAll("[data-kas-filter]").forEach(b=>b.onclick=()=>{
    document.querySelectorAll("[data-kas-filter]").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    const q=b.dataset.kasFilter.toLowerCase();
    document.querySelectorAll("#kasTableWrap tbody tr").forEach(tr=>{
      tr.style.display=(q==="semua"||tr.innerText.toLowerCase().includes(q))?"":"none";
    });
  });
  const ks=$("#kasSearch");
  if(ks) ks.oninput=()=>{ let q=ks.value.toLowerCase(); document.querySelectorAll("#kasTableWrap tbody tr").forEach(tr=>tr.style.display=tr.innerText.toLowerCase().includes(q)?"":"none"); };
  const kk=$("#kasKategori");
  if(kk) kk.onchange=()=>{ let q=kk.value.toLowerCase(); document.querySelectorAll("#kasTableWrap tbody tr").forEach(tr=>tr.style.display=(!q||tr.innerText.toLowerCase().includes(q))?"":"none"); };
}

$("#loginForm").addEventListener("submit",e=>{e.preventDefault();login()});
$("#logoutBtn").onclick=()=>{$("#appShell").classList.add("hidden");$("#loginScreen").classList.remove("hidden")};
$("#togglePassword").onclick=()=>{let p=$("#loginPassword");p.type=p.type==="password"?"text":"password"};
$("#forgotLink").onclick=e=>{e.preventDefault();showToast("Fitur lupa password akan dihubungkan ke backend nanti.")};