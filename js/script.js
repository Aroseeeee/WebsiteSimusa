const calcForm = document.getElementById('efficiency-form');
const calcButton = calcForm.querySelector('.btn-calc');
const chartMsg = document.getElementById('chart-msg');
const chartWrap = document.getElementById('chart-wrap');
const chartDesc = document.getElementById('chart-svg-desc');
const yLabels = document.getElementById('y-labels');
const chartPoints = document.getElementById('chart-points');
const lineRekap = document.getElementById('line-rekap');
const lineLaporan = document.getElementById('line-laporan');
const results = document.getElementById('results');
const svgNS = 'http://www.w3.org/2000/svg';
const xStart = 56;
const xEnd = 520;
const yTop = 24;
const yBottom = 210;

function formatJam(nilai) {
  return String(Math.round(nilai * 10) / 10);
}

function bacaMenit(awalan) {
  return Array.from({ length: 5 }, (_, indeks) => {
    const input = document.getElementById(`${awalan}-${indeks + 1}`);
    const teks = input.value.trim();
    if (teks === '') return 0;
    const angka = Number(teks);
    if (!Number.isFinite(angka) || angka < 0 || angka > 480) return null;
    return angka;
  });
}

function tampilkanPesan(teks, error = false) {
  chartMsg.textContent = teks;
  chartMsg.className = `chart-msg${error ? ' is-error' : ''}`;
  chartMsg.hidden = false;
  chartWrap.hidden = true;
  results.hidden = true;
}

function keJam(menitPerHari, staf) {
  return menitPerHari.map((menit) => menit * staf / 60);
}

function jalurGaris(nilai, maksJam) {
  return nilai.map((angka, indeks) => {
    const x = xStart + indeks * ((xEnd - xStart) / 4);
    const y = yBottom - (angka / maksJam) * (yBottom - yTop);
    return `${indeks === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
}

function gambarTitik(nilai, maksJam, namaSeri, kelas) {
  nilai.forEach((angka, indeks) => {
    const x = xStart + indeks * ((xEnd - xStart) / 4);
    const y = yBottom - (angka / maksJam) * (yBottom - yTop);
    const titik = document.createElementNS(svgNS, 'circle');
    titik.setAttribute('cx', x.toFixed(1));
    titik.setAttribute('cy', y.toFixed(1));
    titik.setAttribute('r', '4');
    titik.setAttribute('class', `chart-point ${kelas}`);
    const keterangan = document.createElementNS(svgNS, 'title');
    keterangan.textContent = `${namaSeri} Hari ${indeks + 1}: ${formatJam(angka)} jam`;
    titik.appendChild(keterangan);
    chartPoints.appendChild(titik);
  });
}

calcForm.addEventListener('submit', function (e) {
  e.preventDefault();
  if (calcButton.disabled) return;

  const rekap = bacaMenit('rekap');
  const laporan = bacaMenit('laporan');
  const staf = Number(document.getElementById('staff-count').value);
  const valid = !rekap.includes(null) && !laporan.includes(null)
    && Number.isFinite(staf) && staf >= 1 && staf <= 500;

  calcButton.disabled = true;
  tampilkanPesan('Menghitung dari data yang Anda isi...');
  chartMsg.classList.add('is-loading');

  setTimeout(() => {
    calcButton.disabled = false;
    chartMsg.classList.remove('is-loading');

    if (!valid) {
      tampilkanPesan('Gagal menghitung. Isi jumlah staf minimal 1 dan menit tiap hari antara 0 sampai 480.', true);
      return;
    }

    const jamRekap = keJam(rekap, staf);
    const jamLaporan = keJam(laporan, staf);
    const puncak = Math.max(...jamRekap, ...jamLaporan);
    const maksJam = Math.max(1, Math.ceil(puncak * 2) / 2);

    yLabels.replaceChildren();
    [
      [maksJam, yTop],
      [maksJam / 2, (yTop + yBottom) / 2],
      [0, yBottom],
    ].forEach(([label, y]) => {
      const teks = document.createElementNS(svgNS, 'text');
      teks.setAttribute('x', '44');
      teks.setAttribute('y', (y + 4).toFixed(1));
      teks.setAttribute('text-anchor', 'end');
      teks.textContent = formatJam(label);
      yLabels.appendChild(teks);
    });

    lineRekap.setAttribute('d', jalurGaris(jamRekap, maksJam));
    lineLaporan.setAttribute('d', jalurGaris(jamLaporan, maksJam));
    chartPoints.replaceChildren();
    gambarTitik(jamRekap, maksJam, 'Rekap absensi', 'point-rekap');
    gambarTitik(jamLaporan, maksJam, 'Laporan', 'point-laporan');

    const totalRekap = rekap.reduce((jumlah, angka) => jumlah + angka, 0) * staf / 60;
    const totalLaporan = laporan.reduce((jumlah, angka) => jumlah + angka, 0) * staf / 60;
    document.getElementById('rekap-hours').textContent = formatJam(totalRekap);
    document.getElementById('laporan-hours').textContent = formatJam(totalLaporan);
    document.getElementById('total-hours').textContent = formatJam(totalRekap + totalLaporan);

    chartDesc.textContent = `Grafik jam manual per hari. Rekap absensi: ${jamRekap.map(formatJam).join(', ')} jam. Laporan: ${jamLaporan.map(formatJam).join(', ')} jam. Total mingguan: ${formatJam(totalRekap + totalLaporan)} jam.`;
    chartMsg.hidden = true;
    chartWrap.hidden = false;
    results.hidden = false;
  }, 120);
});

document.querySelectorAll('.faq-question').forEach((button) => {
  const answer = button.nextElementSibling;
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', answer.id);
  answer.hidden = true;

  button.addEventListener('click', () => {
    const buka = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(buka));
    answer.hidden = !buka;
  });
});

const demoForm = document.getElementById('demo-form');
demoForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const status = document.getElementById('form-status');
  if (!this.checkValidity()) {
    status.className = 'form-status error';
    status.textContent = 'Lengkapi nama, email, nomor telepon, jenis instansi, dan minat utama.';
    status.style.display = 'block';
    return;
  }

  const data = new FormData(this);
  status.className = 'form-status success';
  status.textContent = `Contoh konfirmasi untuk ${data.get('full-name')}. Formulir ini belum mengirim data ke sistem mana pun.`;
  status.style.display = 'block';
});

// TODO: hubungkan demo-form ke endpoint pendaftaran sebelum publikasi.

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const navbar = document.querySelector('.navbar');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  navbar.style.boxShadow = currentScroll > lastScroll && currentScroll > 100
    ? '0 4px 12px rgba(0,0,0,0.1)'
    : 'var(--shadow-md)';
  lastScroll = currentScroll;
});
