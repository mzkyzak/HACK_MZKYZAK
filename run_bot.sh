#!/bin/bash

echo "🔥 NIK BANSOS BOT - AUTO INSTALL & RUN 🔥"
echo "========================================="

# Install Node.js jika belum ada
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Install npm packages
echo "📦 Installing dependencies..."
npm install

# Buat folder untuk log jika belum ada
mkdir -p logs

echo ""
echo "🎯 Pilihan Mode:"
echo "1. Scan dari file nik_list.txt"
echo "2. Scan random NIK (500 NIK)"
echo "3. Test mode (10 NIK random)"
echo ""
read -p "Pilih mode (1/2/3): " mode

case $mode in
    1)
        echo "🚀 Starting scan from nik_list.txt..."
        node nik-bansos-bot.js
        ;;
    2)
        echo "🎲 Starting random scan (500 NIK)..."
        node nik-bansos-bot.js --random 500
        ;;
    3)
        echo "🧪 Starting test mode (10 NIK)..."
        node nik-bansos-bot.js --random 10
        ;;
    *)
        echo "❌ Pilihan tidak valid!"
        exit 1
        ;;
esac

echo ""
echo "✅ Bot selesai!"
echo "📁 Hasil disimpan di: found_results.txt"
echo "📋 Log disimpan di: scan.log"