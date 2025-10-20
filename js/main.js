// js/main.js

// --- Global Variables & Initial Setup ---
let currentExchangeRate = 1300;
let egsRatesData = null;
let currentServiceType = 'standard';

// --- DOMContentLoaded Event Listener ---
window.addEventListener('DOMContentLoaded', function() {
    // Initial actions on page load
    fetchExchangeRate();
    loadSavedRatesData();
    setupDragAndDrop();
    setupEventListeners();
});

// --- Event Listener Setup ---
function setupEventListeners() {
    // 탭 기능 설정
    const tabLinks = document.querySelectorAll('.tab-link');
    tabLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const tabName = event.currentTarget.getAttribute('onclick').match(/'([^']+)'/)[1];
            openTab(event, tabName);
        });
    });
    
    // 계산기 입력 필드 이벤트
    const marginCalculatorTab = document.getElementById('marginCalculator');
    if (marginCalculatorTab) {
        // 실시간 중량 정보 업데이트
        marginCalculatorTab.addEventListener('input', (event) => {
            const targetId = event.target.id;
            if (['length', 'width', 'height', 'weight'].includes(targetId)) {
                updateWeightInfo();
            }
        });
        
        // 서비스 타입 토글
        document.querySelectorAll('.service-type-option').forEach(option => {
            option.addEventListener('click', (event) => {
                toggleServiceType(event.currentTarget.dataset.type);
            });
        });

        // 파일 업로드 input 변경 감지
        document.getElementById('excelFile').addEventListener('change', handleFileUpload);
    }
}


// --- Tab Management ---
function openTab(event, tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));

    const tabLinks = document.querySelectorAll('.tab-link');
    tabLinks.forEach(link => link.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    document.querySelector(`.tab-link[onclick*="'${tabName}'"]`).classList.add('active');
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

// --- Drag and Drop & File Upload ---
function setupDragAndDrop() {
    const uploadSection = document.getElementById('uploadSection');
    if (!uploadSection) return;

    ['dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadSection.addEventListener(eventName, (e) => e.preventDefault(), false);
    });

    uploadSection.addEventListener('dragover', () => {
        uploadSection.style.borderColor = '#0284c7';
        uploadSection.style.transform = 'scale(1.02)';
    });
    
    uploadSection.addEventListener('dragleave', () => {
        uploadSection.style.borderColor = '#0ea5e9';
        uploadSection.style.transform = 'scale(1)';
    });
    
    uploadSection.addEventListener('drop', (e) => {
        uploadSection.style.borderColor = '#0ea5e9';
        uploadSection.style.transform = 'scale(1)';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            document.getElementById('excelFile').files = files;
            handleFileUpload({ target: { files: files } });
        }
    });
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(file.type)) {
        showUploadStatus('❌ Excel 파일만 업로드 가능합니다 (.xlsx, .xls)', 'error');
        return;
    }

    showUploadStatus('📤 파일 업로드 중...', 'info');
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const parsedData = parseExcelWorkbook(workbook);
            
            if (parsedData && (Object.keys(parsedData.standard).length > 0 || Object.keys(parsedData.express).length > 0)) {
                egsRatesData = parsedData;
                localStorage.setItem('egsRatesData', JSON.stringify(parsedData));
                localStorage.setItem('egsRatesLastUpdate', new Date().toISOString());
                showUploadStatus(`✅ 운임표 업로드 완료! (${file.name})`, 'success');
            } else {
                showUploadStatus('❌ 운임표 형식이 올바르지 않거나 데이터가 없습니다.', 'error');
            }
        } catch (error) {
            console.error('파일 파싱 오류:', error);
            showUploadStatus('❌ 파일 읽기 실패.', 'error');
        }
    };
    reader.readAsArrayBuffer(file);
}

// --- UI Interaction Functions ---
function toggleServiceType(type) {
    currentServiceType = type;
    document.querySelectorAll('.service-type-option').forEach(option => option.classList.remove('active'));
    document.querySelector(`.service-type-option[data-type="${type}"]`).classList.add('active');
    updateWeightInfo();
}

function updateWeightInfo() {
    const volumetricWeight = calculateVolumetricWeight();
    const finalWeight = getFinalWeight();
    const weightInfo = document.getElementById('weightInfo');
    if (volumetricWeight > 0 || finalWeight > 0) {
        const serviceTypeText = currentServiceType === 'express' ? 'eGS Express' : 'eGS Standard';
        weightInfo.innerHTML = `📦 부피 중량: ${volumetricWeight.toFixed(2)}kg | <strong>과금 중량: ${finalWeight.toFixed(2)}kg</strong><br>🚚 선택된 서비스: ${serviceTypeText}`;
        weightInfo.classList.remove('hidden');
    } else {
        weightInfo.classList.add('hidden');
    }
}

function calculateVolumetricWeight() {
    const length = parseFloat(document.getElementById('length').value) || 0;
    const width = parseFloat(document.getElementById('width').value) || 0;
    const height = parseFloat(document.getElementById('height').value) || 0;
    return (length && width && height) ? (length * width * height) / 6000 : 0;
}

function getFinalWeight() {
    const actualWeight = parseFloat(document.getElementById('weight').value) || 0;
    return Math.max(actualWeight, calculateVolumetricWeight());
}
