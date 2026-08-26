const puppeteer = require('puppeteer');
const fs = require('fs');

// ================================================================
// KONFIGURASI
// ================================================================
const NIK_LIST = 'nik_list.txt';
const RESULT_FILE = 'found_results.txt';
const LOG_FILE = 'scan.log';
const DELAY = 3000; // 3 detik delay antar scan
const URL_TARGET = 'https://edu.jakarta.go.id/kjp/cek_bansos_disdik/';

// ================================================================
// FUNGSI LOG
// ================================================================
function log(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

// ================================================================
// CEK NIK DI WEBSITE BANSOS
// ================================================================
async function checkNIK(page, nik) {
    try {
        log(`📡 Checking NIK: ${nik}`);
        
        // Buka halaman cek bansos
        await page.goto(URL_TARGET, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Tunggu form muncul
        await page.waitForSelector('input[name="nik"]', { timeout: 10000 });
        
        // Isi NIK
        await page.type('input[name="nik"]', nik, { delay: 100 });
        
        // Pilih tahap (default tahap terbaru)
        try {
            await page.select('select[name="tahap"]', 'Tahap 1 Tahun 2026');
        } catch {
            // Jika tidak ada select, lanjut saja
        }
        
        // Klik tombol cek
        await page.click('button[type="submit"], input[type="submit"]');
        
        // Tunggu hasil loading
        await page.waitForTimeout(4000);
        
        // Ambil semua teks dari halaman
        const pageContent = await page.evaluate(() => {
            return document.body.innerText;
        });
        
        // Cek apakah ada indikasi hasil positif
        const positiveIndicators = [
            'ditemukan',
            'terdaftar', 
            'penerima',
            'berhak',
            'aktif',
            'lulus',
            'dapat',
            'menerima',
            'disetujui'
        ];
        
        let isFound = false;
        let resultText = '';
        
        for (const indicator of positiveIndicators) {
            if (pageContent.toLowerCase().includes(indicator)) {
                isFound = true;
                
                // Ambil bagian penting sekitar indicator
                const index = pageContent.toLowerCase().indexOf(indicator);
                const start = Math.max(0, index - 100);
                const end = Math.min(pageContent.length, index + 200);
                resultText = pageContent.substring(start, end);
                break;
            }
        }
        
        if (isFound) {
            log(`✅ FOUND! NIK: ${nik}`);
            const saveData = `
========================================
NIK: ${nik}
Waktu: ${new Date().toLocaleString()}
URL: ${URL_TARGET}
Hasil: ${resultText}
========================================
`;
            fs.appendFileSync(RESULT_FILE, saveData);
            
            // Tampilkan hasil langsung di terminal
            console.log('\n🔥🔥🔥 HASIL DITEMUKAN! 🔥🔥🔥');
            console.log(`NIK: ${nik}`);
            console.log(`Detail: ${resultText.substring(0, 150)}...`);
            console.log('========================================\n');
            
            return true;
        } else {
            log(`❌ NOT FOUND - NIK: ${nik}`);
            return false;
        }
        
    } catch (error) {
        log(`⚠️ ERROR - NIK: ${nik} - ${error.message}`);
        return false;
    }
}

// ================================================================
// BACA DAFTAR NIK
// ================================================================
function readNIKList() {
    if (!fs.existsSync(NIK_LIST)) {
        console.log(`❌ File ${NIK_LIST} tidak ditemukan!`);
        console.log(`Buat file ${NIK_LIST} dengan format:`);
        console.log(`3173010101010001`);
        console.log(`3173010101010002`);
        console.log(`3173010101010003`);
        process.exit(1);
    }
    
    const data = fs.readFileSync(NIK_LIST, 'utf8');
    const lines = data.split('\n')
        .map(line => line.trim())
        .filter(line => line.length === 16 && /^\d+$/.test(line)); // Filter hanya NIK 16 digit
    
    if (lines.length === 0) {
        console.log('❌ Tidak ada NIK valid di file!');
        process.exit(1);
    }
    
    return lines;
}

// ================================================================
// GENERATE NIK RANDOM (jika perlu)
// ================================================================
function generateRandomNIK(count = 100) {
    const nikList = [];
    for (let i = 0; i < count; i++) {
        // Format: 31 (Jakarta) + random 14 digit
        const randomPart = Math.floor(Math.random() * 10000000000000).toString().padStart(14, '0');
        const nik = `31${randomPart}`;
        if (nik.length === 16) {
            nikList.push(nik);
        }
    }
    return nikList;
}

// ================================================================
// MAIN EXECUTION
// ================================================================
(async () => {
    console.log('\n🔥🔥🔥 NIK BANSOS AUTO-CHECK BOT 🔥🔥🔥');
    console.log(`Target: ${URL_TARGET}`);
    console.log('========================================\n');
    
    // Pilihan mode
    const args = process.argv.slice(2);
    let nikList = [];
    
    if (args.includes('--random') || args.includes('-r')) {
        console.log('🎲 Mode: RANDOM NIK GENERATION');
        const count = args[1] ? parseInt(args[1]) : 100;
        nikList = generateRandomNIK(count);
        console.log(`Generated ${nikList.length} random NIKs`);
    } else {
        console.log('📂 Mode: READ FROM FILE');
        nikList = readNIKList();
        console.log(`Total NIK to scan: ${nikList.length}`);
    }
    
    // Launch browser
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    let foundCount = 0;
    let scannedCount = 0;
    
    for (const nik of nikList) {
        scannedCount++;
        const page = await browser.newPage();
        
        // Set user agent biasa
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        
        const found = await checkNIK(page, nik);
        if (found) foundCount++;
        
        await page.close();
        
        // Progress report
        if (scannedCount % 10 === 0) {
            console.log(`📊 Progress: ${scannedCount}/${nikList.length} | Found: ${foundCount}`);
        }
        
        // Delay antara scan
        if (scannedCount < nikList.length) {
            await new Promise(resolve => setTimeout(resolve, DELAY));
        }
    }
    
    await browser.close();
    
    // Final report
    console.log('\n' + '='.repeat(50));
    console.log('✅ SCAN COMPLETE!');
    console.log('='.repeat(50));
    console.log(`📊 Total NIK scanned: ${scannedCount}`);
    console.log(`✅ Found active bansos: ${foundCount}`);
    console.log(`❌ Not found: ${scannedCount - foundCount}`);
    console.log(`📁 Results saved to: ${RESULT_FILE}`);
    console.log(`📋 Log saved to: ${LOG_FILE}`);
    
    // Tampilkan hasil jika ada
    if (fs.existsSync(RESULT_FILE)) {
        const resultData = fs.readFileSync(RESULT_FILE, 'utf8');
        if (resultData.trim().length > 0) {
            console.log('\n🔥 HASIL YANG DITEMUKAN:');
            console.log('='.repeat(50));
            console.log(resultData);
        }
    }
})();