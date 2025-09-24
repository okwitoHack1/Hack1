class OTPReader {
    constructor() {
        this.isListening = false;
        this.detectedOTPs = JSON.parse(localStorage.getItem('otpHistory')) || [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.checkBrowserSupport();
        this.updateRecentOTPsList();
    }

    initializeElements() {
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.testBtn = document.getElementById('testBtn');
        this.statusDiv = document.getElementById('status');
        this.otpDisplay = document.getElementById('otpDisplay');
        this.otpList = document.getElementById('otpList');
        this.manualOTP = document.getElementById('manualOTP');
        this.submitManual = document.getElementById('submitManual');
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startDetection());
        this.stopBtn.addEventListener('click', () => this.stopDetection());
        this.testBtn.addEventListener('click', () => this.simulateOTP());
        this.submitManual.addEventListener('click', () => this.handleManualOTP());
        
        this.manualOTP.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleManualOTP();
        });
        
        this.manualOTP.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }

    checkBrowserSupport() {
        if (!('OTPCredential' in window)) {
            this.showStatus('⚠️ OTP API not supported in this browser. Use manual input instead.', 'error');
            this.startBtn.disabled = true;
        }
        
        // Check if we're on HTTPS (required for OTP API)
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            this.showStatus('ℹ️ OTP auto-detection requires HTTPS. This page is served via GitHub Pages (HTTPS).', 'info');
        }
    }

    async startDetection() {
        if (!('OTPCredential' in window)) {
            this.showStatus('❌ OTP API not supported in this browser', 'error');
            return;
        }

        try {
            this.isListening = true;
            this.updateUI();
            this.showStatus('🔍 Listening for OTP messages...', 'info');

            const content = await navigator.credentials.get({
                otp: { transport: ['sms'] }
            });

            if (content && content.code) {
                this.handleDetectedOTP(content.code, 'auto');
            }

        } catch (error) {
            if (error.name !== 'AbortError') {
                this.showStatus(`❌ Error: ${error.message}`, 'error');
                console.error('OTP detection error:', error);
            }
        } finally {
            if (this.isListening) {
                setTimeout(() => this.startDetection(), 1000);
            }
        }
    }

    stopDetection() {
        this.isListening = false;
        this.updateUI();
        this.showStatus('⏹️ OTP detection stopped', 'info');
    }

    handleDetectedOTP(otpCode, source = 'auto') {
        if (!/^\d{4,6}$/.test(otpCode)) {
            this.showStatus('❌ Invalid OTP format detected', 'error');
            return;
        }

        const otpData = {
            code: otpCode,
            timestamp: new Date(),
            source: source
        };

        this.detectedOTPs.unshift(otpData);
        // Keep only last 10 OTPs
        this.detectedOTPs = this.detectedOTPs.slice(0, 10);
        
        // Save to localStorage
        localStorage.setItem('otpHistory', JSON.stringify(this.detectedOTPs));
        
        this.displayOTP(otpData);
        this.updateRecentOTPsList();
        
        this.showStatus(`✅ OTP detected via ${source === 'auto' ? 'auto-detection' : 'manual input'}`, 'success');
        
        if (source === 'auto') {
            this.stopDetection();
        }
    }

    displayOTP(otpData) {
        this.otpDisplay.textContent = otpData.code;
        this.otpDisplay.classList.add('detected');
        this.createConfetti();
        
        setTimeout(() => {
            this.otpDisplay.classList.remove('detected');
        }, 3000);
    }

    updateRecentOTPsList() {
        this.otpList.innerHTML = '';
        
        if (this.detectedOTPs.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.textContent = 'No OTPs detected yet';
            emptyItem.style.color = '#666';
            emptyItem.style.fontStyle = 'italic';
            this.otpList.appendChild(emptyItem);
            return;
        }
        
        this.detectedOTPs.forEach(otpData => {
            const listItem = document.createElement('li');
            
            const timeString = otpData.timestamp.toLocaleTimeString();
            const dateString = otpData.timestamp.toLocaleDateString();
            
            listItem.innerHTML = `
                <span class="otp-code">${otpData.code}</span>
                <div>
                    <div class="otp-time">${timeString}</div>
                    <div class="otp-time">${dateString}</div>
                    <div class="otp-time" style="font-size: 0.8em; color: #999;">${otpData.source}</div>
                </div>
            `;
            
            this.otpList.appendChild(listItem);
        });
    }

    handleManualOTP() {
        const otpCode = this.manualOTP.value.trim();
        
        if (!otpCode) {
            this.showStatus('❌ Please enter an OTP code', 'error');
            return;
        }
        
        if (!/^\d{4,6}$/.test(otpCode)) {
            this.showStatus('❌ OTP must be 4-6 digits', 'error');
            return;
        }
        
        this.handleDetectedOTP(otpCode, 'manual');
        this.manualOTP.value = '';
    }

    simulateOTP() {
        const testOTP = Math.floor(1000 + Math.random() * 9000).toString();
        this.showStatus('🧪 Testing OTP detection...', 'info');
        setTimeout(() => {
            this.handleDetectedOTP(testOTP, 'test');
        }, 1000);
    }

    updateUI() {
        this.startBtn.disabled = this.isListening;
        this.stopBtn.disabled = !this.isListening;
    }

    showStatus(message, type) {
        this.statusDiv.textContent = message;
        this.statusDiv.className = `status ${type}`;
    }

    createConfetti() {
        const confettiCount = 30;
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: 50%;
                left: 50%;
                opacity: 1;
                pointer-events: none;
                z-index: 1000;
                border-radius: 1px;
            `;
            
            document.body.appendChild(confetti);
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = 1 + Math.random() * 2;
            const x = Math.cos(angle) * velocity;
            const y = Math.sin(angle) * velocity;
            
            let posX = 0;
            let posY = 0;
            let opacity = 1;
            
            const animate = () => {
                posX += x;
                posY += y;
                opacity -= 0.02;
                
                confetti.style.transform = `translate(${posX * 10}px, ${posY * 10}px)`;
                confetti.style.opacity = opacity;
                
                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    confetti.remove();
                }
            };
            
            animate();
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new OTPReader();
});
