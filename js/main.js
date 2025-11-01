// js/main.js

// 전역 상태
let currentExchangeRate = 1300;
let egsRatesData = null;
let currentServiceType = 'standard';

// eGS 데이터 기반 목적지 드롭다운 초기화
function updateDestinationUI() {
    if (!egsRatesData) {
        console.warn("eGS 데이터가 없어 목적지 UI를 업데이트할 수 없습니다.");
        return;
    }
    populateStandardDestinations();
    populateExpressDestinations();
}

// Standard 서비스 목적지 드롭다운
function populateStandardDestinations() {
    const primarySelect = document.getElementById('destinationPrimary');
    const secondarySelect = document.getElementById('destinationSecondary');
    primarySelect.innerHTML = '';
    secondarySelect.innerHTML = '<option value="">국가 선택</option>';

    const primaryCountries = {
        'US': '미국', 'CA': '캐나다', 'GB': '영국', 'DE': '독일',
        'IT': '이탈리아', 'FR': '프랑스', 'ES': '스페인', 'AU': '호주'
    };
    Object.entries(primaryCountries).forEach(([code, name]) => {
        primarySelect.add(new Option(name, code));
    });
    primarySelect.add(new Option('기타 유럽', 'EU_GROUP'));

    const europeExclusions = ['GB', 'DE', 'IT', 'FR', 'ES'];
    if (egsRatesData && egsRatesData.standard) {
        Object.keys(egsRatesData.standard)
            .filter(code => !primaryCountries[code] && !europeExclusions.includes(code))
            .sort((a, b) => getCountryName(a).localeCompare(getCountryName(b), 'ko'))
            .forEach(code => {
                secondarySelect.add(new Option(getCountryName(code), code));
            });
    }

    primarySelect.onchange = function() {
        const isEuropeGroup = this.value === 'EU_GROUP';
        secondarySelect.disabled = !isEuropeGroup;
        if (!isEuropeGroup) {
            secondarySelect.value = '';
        }
    };
}

// ✅ 수정된 Express 서비스 Zone 및 국가 드롭다운
function populateExpressDestinations() {
    const zoneSelect = document.getElementById('zonePrimary');
    const countrySelect = document.getElementById('zoneSecondary');
    zoneSelect.innerHTML = '<option value="">Zone 선택</option>';
    countrySelect.innerHTML = '<option value="">국가 선택</option>';
    countrySelect.disabled = true;

    if (!egsRatesData || !egsRatesData.express) return;

    // getAllZones() 함수 사용
    const sortedZones = getAllZones();
    sortedZones.forEach(zone => zoneSelect.add(new Option(`Zone ${zone}`, zone)));

    zoneSelect.onchange = function() {
        countrySelect.innerHTML = '<option value="">국가 선택</option>';
        const selectedZone = this.value;
        
        if (selectedZone) {
            // findCountriesByZone() 함수 사용
            const countries = findCountriesByZone(selectedZone);
            
            if (countries.length > 0) {
                // 한글명으로 정렬
                countries.sort((a, b) => a.nameKo.localeCompare(b.nameKo, 'ko'));
                
                countries.forEach(country => {
                    countrySelect.add(new Option(
                        `${country.nameKo} (${country.code})`, 
                        country.code
                    ));
                });
                countrySelect.disabled = false;
            } else {
                countrySelect.disabled = true;
            }
        } else {
            countrySelect.disabled = true;
        }
    };
}

window.addEventListener('DOMContentLoaded', function() {
    fetchExchangeRate();
    loadSavedRatesData();
    setupDragAndDrop();
    setupEventListeners();
});

function setupEventListeners() {
    const tabLinks = document.querySelectorAll('.tab-link');
    tabLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const tabName = event.currentTarget.getAttribute('onclick').match(/'([^']+)'/)[1];
            openTab(event, tabName);
        });
    });
    
    const marginCalculatorTab = document.getElementById('marginCalculator');
    if (marginCalculatorTab) {
        marginCalculatorTab.addEventListener('input', (event) => {
            const targetId = event.target.id;
            if (['length', 'width', 'height', 'weight'].includes(targetId)) {
                updateWeightInfo();
            }
        });
        
        document.querySelectorAll('.service-type-option').forEach(option => {
            option.addEventListener('click', (event) => {
                toggleServiceType(event.currentTarget.dataset.type);
            });
        });

        document.getElementById('excelFile').addEventListener('change', handleFileUpload);
    }
}

function openTab(event, tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));

    const tabLinks = document.querySelectorAll('.tab-link');
    tabLinks.forEach(link => link.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    document.querySelector(`.tab-link[onclick*="'${tabName}'"]`).classList.add('active');
}

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

function loadSavedRatesData() {
    const loadedData = loadRatesData();
    
    if (loadedData) {
        egsRatesData = loadedData;
        const lastUpdate = localStorage.getItem('egsRatesLastUpdate');
        showUploadStatus(`✅ 저장된 운임표 로드됨 (${new Date(lastUpdate).toLocaleDateString()})`, 'success');
        updateDestinationUI();
    } else {
        showUploadStatus('⚠️ 운임표를 업로드해주세요. 계산이 불가능합니다.', 'info');
    }
}

function clearSavedRatesData() {
    if (confirm('정말로 저장된 운임표 데이터를 삭제하시겠습니까?')) {
        clearRatesData();
        egsRatesData = null;
        showUploadStatus('✅ 저장된 운임표 데이터가 삭제되었습니다.', 'success');
        
        if (typeof window.updateEgsRatesTables === 'function') {
            window.updateEgsRatesTables();
        }
        
        setTimeout(() => {
            showUploadStatus('⚠️ 운임표를 업로드해주세요. 계산이 불가능합니다.', 'info');
        }, 2000);
    }
}

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

    if (!['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'application/csv'].includes(file.type)) {
        showUploadStatus('❌ Excel 또는 CSV 파일만 업로드 가능합니다 (.xlsx, .xls, .csv)', 'error');
        return;
    }

    showUploadStatus('📤 파일 분석 중...', 'info');
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const parsedData = parseExcelWorkbook(workbook);
            
            if (parsedData && (Object.keys(parsedData.standard).length > 0 || Object.keys(parsedData.express).length > 0)) {
                egsRatesData = parsedData;
                saveRatesData(parsedData);
                showUploadStatus(`✅ 운임표 업로드 완료! (${Object.keys(parsedData.standard).length}개 Standard 국가, ${Object.keys(parsedData.express).length}개 Express Zone)`, 'success');
                
                if (typeof window.updateEgsRatesTables === 'function') {
                    window.updateEgsRatesTables();
                }
                updateDestinationUI();
            } else {
                showUploadStatus('❌ 유효한 eGS 운임 데이터를 찾지 못했습니다. 파일 형식을 확인해주세요.', 'error');
            }
        } catch (error) {
            console.error('파일 파싱 오류:', error);
            showUploadStatus('❌ 파일 처리 중 오류가 발생했습니다. 콘솔을 확인해주세요.', 'error');
        }
    };
    
    reader.readAsArrayBuffer(file);
}

function toggleServiceType(type) {
    currentServiceType = type;
    document.querySelectorAll('.service-type-option').forEach(option => option.classList.remove('active'));
    document.querySelector(`.service-type-option[data-type="${type}"]`).classList.add('active');
    
    const standardWrapper = document.getElementById('standardDestinationWrapper');
    const expressWrapper = document.getElementById('expressDestinationWrapper');
    
    if (type === 'standard') {
        standardWrapper.classList.remove('hidden');
        expressWrapper.classList.add('hidden');
    } else {
        standardWrapper.classList.add('hidden');
        expressWrapper.classList.remove('hidden');
    }

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

function openHelpModal() {
    const modal = document.getElementById('helpModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    const iframe = document.getElementById('feesIframe');
    if (!iframe.src) {
        iframe.src = 'js/ebay-fee-structure.html';
    }
}

function closeHelpModal() {
    const modal = document.getElementById('helpModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

function switchHelpTab(tabName) {
    document.querySelectorAll('.help-tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    document.querySelectorAll('.help-tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    if (tabName === 'usage') {
        document.getElementById('helpUsageContent').style.display = 'block';
    } else if (tabName === 'fees') {
        document.getElementById('helpFeesContent').style.display = 'block';
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeHelpModal();
    }
});

document.addEventListener('click', function(event) {
    const helpModal = document.getElementById('helpModal');
    if (event.target === helpModal) {
        closeHelpModal();
    }
});
