// --- Global Variables & Initial Setup ---
let currentExchangeRate = 1300;
let egsRatesData = null;

// --- DOMContentLoaded Event Listener ---
window.addEventListener('DOMContentLoaded', function() {
    // Initial actions on page load
    fetchExchangeRate();
    loadSavedRatesData();
    setupDragAndDrop();
    setupTabEvents();

    // Event listeners for calculator inputs (delegated from main)
    const marginCalculatorTab = document.getElementById('marginCalculator');
    if (marginCalculatorTab) {
        marginCalculatorTab.addEventListener('input', (event) => {
            const targetId = event.target.id;
            if (['length', 'width', 'height', 'weight'].includes(targetId)) {
                updateWeightInfo();
            }
        });
    }
});

// --- Tab Management ---
function setupTabEvents() {
    const tabLinks = document.querySelectorAll('.tab-link');
    tabLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            openTab(event, event.target.textContent.includes('마진 계산기') ? 'marginCalculator' : 'egsRates');
        });
    });
}

function openTab(event, tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // Deactivate all tab links
    const tabLinks = document.querySelectorAll('.tab-link');
    tabLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Show the selected tab content and activate the link
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}


// --- Common Utility Functions ---

function showUploadStatus(message, type) {
    const statusDiv = document.getElementById('uploadStatus');
    statusDiv.textContent = message;
    statusDiv.className = `upload-status ${type}`;
    statusDiv.classList.remove('hidden');
}

async function fetchExchangeRate() {
    const refreshIcon = document.getElementById('refreshIcon');
    const exchangeRateDisplay = document.getElementById('exchangeRateDisplay');
    const lastUpdated = document.getElementById('lastUpdated');
    
    refreshIcon.innerHTML = '<div class="loading"></div>';
    
    try {
        const response = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://api.exchangerate-api.com/v4/latest/USD'));
        const data = await response.json();
        
        if (data.rates && data.rates.KRW) {
            currentExchangeRate = data.rates.KRW;
            exchangeRateDisplay.textContent = `1 USD = ${currentExchangeRate.toLocaleString()}원`;
            lastUpdated.textContent = `(${new Date().toLocaleTimeString()} 업데이트)`;
        } else {
            throw new Error('환율 데이터를 가져올 수 없습니다');
        }
    } catch (error) {
        console.error('환율 API 오류:', error);
        exchangeRateDisplay.innerHTML = `
            <input type="number" id="manualExchangeRate" value="1300" 
                   style="width: 80px; padding: 2px 6px; border: 1px solid #d1d5db; border-radius: 4px;"
                   onchange="updateManualExchangeRate(this.value)">원 (수동 입력)
        `;
        lastUpdated.textContent = '(API 오류)';
        currentExchangeRate = 1300;
    }
    
    refreshIcon.innerHTML = '🔄';
}

function updateManualExchangeRate(value) {
    const rate = parseFloat(value);
    if (rate && rate > 0) {
        currentExchangeRate = rate;
        document.getElementById('lastUpdated').textContent = `(${new Date().toLocaleTimeString()} 수동)`;
    }
}

// --- LocalStorage Data Management ---

function loadSavedRatesData() {
    try {
        const savedData = localStorage.getItem('egsRatesData');
        const lastUpdate = localStorage.getItem('egsRatesLastUpdate');
        
        if (savedData) {
            egsRatesData = JSON.parse(savedData);
            showUploadStatus(`✅ 저장된 운임표 로드됨 (${new Date(lastUpdate).toLocaleDateString()})`, 'success');
        } else {
            showUploadStatus('⚠️ 운임표를 업로드해주세요. 계산이 불가능합니다.', 'info');
        }
    } catch (error) {
        console.error('저장된 데이터 로드 오류:', error);
        showUploadStatus('❌ 저장된 운임표 로드 실패. 새로 업로드해주세요.', 'error');
    }
}

function clearSavedRatesData() {
    if (confirm('정말로 저장된 운임표 데이터를 삭제하시겠습니까?')) {
        localStorage.removeItem('egsRatesData');
        localStorage.removeItem('egsRatesLastUpdate');
        egsRatesData = null;
        showUploadStatus('✅ 저장된 운임표 데이터가 삭제되었습니다.', 'success');
        
        setTimeout(() => {
            showUploadStatus('⚠️ 운임표를 업로드해주세요. 계산이 불가능합니다.', 'info');
        }, 2000);
    }
}

// --- Drag and Drop Setup ---

function setupDragAndDrop() {
    const uploadSection = document.getElementById('uploadSection');
    if (!uploadSection) return;

    ['dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadSection.addEventListener(eventName, (e) => e.preventDefault(), false);
    });

    uploadSection.addEventListener('dragover', () => {
        uploadSection.style.borderColor = '#0284c7';
        uploadSection.style.background = 'linear-gradient(135deg, #e0f2fe, #bae6fd)';
        uploadSection.style.transform = 'scale(1.02)';
    });
    
    uploadSection.addEventListener('dragleave', () => {
        uploadSection.style.borderColor = '#0ea5e9';
        uploadSection.style.background = 'linear-gradient(135deg, #f0f9ff, #e0f2fe)';
        uploadSection.style.transform = 'scale(1)';
    });
    
    uploadSection.addEventListener('drop', (e) => {
        uploadSection.style.borderColor = '#0ea5e9';
        uploadSection.style.background = 'linear-gradient(135deg, #f0f9ff, #e0f2fe)';
        uploadSection.style.transform = 'scale(1)';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            document.getElementById('excelFile').files = files;
            handleFileUpload({ target: { files: files } });
        }
    });
}
