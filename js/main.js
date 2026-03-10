// js/main.js

// 전역 상태
let currentExchangeRate = 1300;
let egsRatesData = null;
let currentServiceType = 'standard';
let statusTimeout;

// [추가] 유럽 판별을 위한 Zone 정의 및 헬퍼 함수
const EUROPEAN_ZONES = ['G', 'H', 'M'];

/**
 * 국가 코드가 유럽 Zone에 속하는지 확인합니다. (country-data.js 활용)
 * @param {string} countryCode - 확인할 국가 코드 (예: 'DE', 'US')
 * @returns {boolean} 유럽 국가이면 true, 아니면 false
 */
function isEuropeanCountry(countryCode) {
    if (!countryCode) return false;

    // country-data.js에 정의된 findCountryByCode 함수를 사용합니다.
    const countryData = findCountryByCode(countryCode);

    if (countryData && countryData.zone) {
        return EUROPEAN_ZONES.includes(countryData.zone);
    }
    // country-data.js에 데이터가 없는 Standard 전용 국가(예: EU 그룹)는 유럽으로 간주하지 않음
    return false;
}


function toggleTariffInput() {
    const applyTariff = document.getElementById('applyTariff').checked;
    const tariffRateInput = document.getElementById('tariffRate');
    tariffRateInput.disabled = !applyTariff;
    if (!applyTariff) {
        tariffRateInput.value = '';
    }
}

// EMS + 미국 조합 시 관세 자동 설정, 그 외 조합에서는 초기화
function checkAutoTariff() {
    const applyTariffEl = document.getElementById('applyTariff');
    const tariffRateEl = document.getElementById('tariffRate');
    if (!applyTariffEl || !tariffRateEl) return;

    if (currentServiceType === 'ems') {
        const dest = document.getElementById('emsDestinationPrimary').value;
        if (dest === '미국') {
            applyTariffEl.checked = true;
            tariffRateEl.disabled = false;
            tariffRateEl.value = '10';
            return;
        }
    }

    // EMS+미국 이외의 모든 조합: 초기화
    applyTariffEl.checked = false;
    tariffRateEl.disabled = true;
    tariffRateEl.value = '';
}

// EMS 서비스 Zone 드롭다운
function populateEmsDestinations() {
    const primarySelect = document.getElementById('emsDestinationPrimary');
    const secondarySelect = document.getElementById('emsDestinationSecondary'); // 현재 사용하지 않음
    primarySelect.innerHTML = '<option value="">Zone 선택</option>';
    secondarySelect.innerHTML = '<option value="">국가 선택</option>';
    secondarySelect.disabled = true;

    if (!egsRatesData || !egsRatesData.ems) return;

    // egsRatesData.ems 객체의 키(zone 이름)들을 가져와서 정렬
    const emsZones = Object.keys(egsRatesData.ems).sort();

    emsZones.forEach(zone => {
        primarySelect.add(new Option(zone, zone));
    });

    primarySelect.onchange = function() {
        // EMS의 경우 현재는 secondary 선택이 없으므로 항상 비활성화
        secondarySelect.innerHTML = '<option value="">국가 선택</option>';
        secondarySelect.disabled = true;
    };
}

// eGS 데이터 기반 목적지 드롭다운 초기화
function updateDestinationUI() {
    if (!egsRatesData) {
        console.warn("eGS 데이터가 없어 목적지 UI를 업데이트할 수 없습니다.");
        return;
    }
    populateStandardDestinations();
    populateExpressDestinations();
    populateEmsDestinations(); // EMS 목적지 드롭다운 추가
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
    
    // 💾 저장된 설정 자동 불러오기
    if (typeof loadCalculatorSettings === 'function') {
        loadCalculatorSettings();
    }
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

    // 판매가 보정 탭이 활성화될 때 결과를 로드
    if (tabName === 'salesPriceAdjustment' && typeof loadSalesPriceAdjustmentResults === 'function') {
        loadSalesPriceAdjustmentResults();
    }
}

function showUploadStatus(message, type) {
    if (statusTimeout) {
        clearTimeout(statusTimeout);
    }
    const statusDiv = document.getElementById('uploadStatus');
    statusDiv.textContent = message;
    statusDiv.className = `upload-status ${type}`;
    statusDiv.classList.remove('hidden');

    // 'success' 또는 'error' 타입의 메시지만 2초 후에 자동으로 사라지게 함
    if (type === 'success' || type === 'error') {
        statusTimeout = setTimeout(() => {
            statusDiv.classList.add('hidden');
        }, 2000);
    }
}

async function fetchExchangeRate(forceRefresh = false) {
    const refreshIcon = document.getElementById('refreshIcon');
    const exchangeRateDisplay = document.getElementById('exchangeRateDisplay');
    const lastUpdated = document.getElementById('lastUpdated');
    const statusIndicator = document.getElementById('exchangeRateStatus');

    // 1. 캐시된 환율 확인 (30분 이내면 재사용)
    const cachedRate = localStorage.getItem('cachedExchangeRate');
    const cachedTime = localStorage.getItem('cachedExchangeRateTime');
    const cachedSource = localStorage.getItem('cachedExchangeRateSource') || 'Unknown';
    const CACHE_DURATION = 30 * 60 * 1000; // 30분

    if (!forceRefresh && cachedRate && cachedTime) {
        const timeSinceCache = Date.now() - parseInt(cachedTime);
        if (timeSinceCache < CACHE_DURATION) {
            currentExchangeRate = parseFloat(cachedRate);
            const cacheDate = new Date(parseInt(cachedTime));
            exchangeRateDisplay.textContent = `1 USD = ${currentExchangeRate.toLocaleString()}원`;
            lastUpdated.textContent = `(${cacheDate.toLocaleTimeString()} • ${cachedSource})`;

            // 상태 표시: 30분 내 캐시 - 녹색
            if (statusIndicator) {
                statusIndicator.style.backgroundColor = '#10b981'; // 녹색
            }

            console.log('✅ 캐시된 환율 사용:', currentExchangeRate);
            return;
        }
    }

    // 2. Rate Limit 방지 (마지막 호출 후 5초 이내면 스킵)
    const lastFetchTime = localStorage.getItem('lastExchangeRateFetch');
    if (!forceRefresh && lastFetchTime) {
        const timeSinceLastFetch = Date.now() - parseInt(lastFetchTime);
        if (timeSinceLastFetch < 5000) {
            console.log('⏱️ Rate Limit 방지: 마지막 호출 후 5초 이내');
            return;
        }
    }

    refreshIcon.innerHTML = '<div class="loading"></div>';
    localStorage.setItem('lastExchangeRateFetch', Date.now().toString());

    // 3. API 호출 (다중 Fallback)
    const apis = [
        {
            name: 'ExchangeRate-API',
            url: 'https://api.exchangerate-api.com/v4/latest/USD',
            parse: (data) => data.rates?.KRW
        },
        {
            name: 'ExchangeRate-API (Proxy)',
            url: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://api.exchangerate-api.com/v4/latest/USD'),
            parse: (data) => data.rates?.KRW
        },
        {
            name: 'Open Exchange Rates (Free)',
            url: 'https://open.er-api.com/v6/latest/USD',
            parse: (data) => data.rates?.KRW
        }
    ];

    for (const api of apis) {
        try {
            console.log(`🔄 환율 API 시도: ${api.name}`);
            const response = await fetch(api.url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const rate = api.parse(data);

            if (rate && rate > 0) {
                currentExchangeRate = rate;

                // LocalStorage에 캐싱 (출처 정보 포함)
                localStorage.setItem('cachedExchangeRate', rate.toString());
                localStorage.setItem('cachedExchangeRateTime', Date.now().toString());
                localStorage.setItem('cachedExchangeRateSource', api.name);

                exchangeRateDisplay.textContent = `1 USD = ${currentExchangeRate.toLocaleString()}원`;
                lastUpdated.textContent = `(${new Date().toLocaleTimeString()} 업데이트 • ${api.name})`;
                refreshIcon.innerHTML = '🔄';

                // 상태 표시: 좋음 - 녹색
                if (statusIndicator) {
                    statusIndicator.style.backgroundColor = '#10b981'; // 녹색
                }

                console.log(`✅ 환율 로드 성공 (${api.name}):`, currentExchangeRate);
                return;
            }
        } catch (error) {
            console.warn(`⚠️ ${api.name} 실패:`, error.message);
            continue;
        }
    }

    // 4. 모든 API 실패 시 - 캐시된 환율 사용 (시간 제한 없이)
    if (cachedRate) {
        currentExchangeRate = parseFloat(cachedRate);
        const cacheDate = new Date(parseInt(cachedTime));
        const cacheSource = localStorage.getItem('cachedExchangeRateSource') || 'Unknown';
        exchangeRateDisplay.textContent = `1 USD = ${currentExchangeRate.toLocaleString()}원`;
        lastUpdated.textContent = `(${cacheDate.toLocaleDateString()} ${cacheDate.toLocaleTimeString()} • ${cacheSource} 캐시)`;
        refreshIcon.innerHTML = '⚠️';

        // 상태 표시: 오래된 캐시 - 주황색
        if (statusIndicator) {
            statusIndicator.style.backgroundColor = '#f59e0b'; // 주황색
        }

        console.warn('⚠️ 모든 API 실패 - 캐시된 환율 사용');
        return;
    }

    // 5. 캐시도 없으면 수동 입력
    console.error('❌ 환율 로드 완전 실패 - 수동 입력 모드');
    exchangeRateDisplay.innerHTML = `
        <input type="number" id="manualExchangeRate" value="1300"
               style="width: 80px; padding: 2px 6px; border: 1px solid #d1d5db; border-radius: 4px;"
               onchange="updateManualExchangeRate(this.value)">원 (수동 입력)
    `;
    lastUpdated.textContent = '(API 오류 - 수동 입력)';
    currentExchangeRate = 1300;
    refreshIcon.innerHTML = '❌';

    // 상태 표시: 수동 입력 - 빨강색
    if (statusIndicator) {
        statusIndicator.style.backgroundColor = '#ef4444'; // 빨강색
    }
}

function updateManualExchangeRate(value) {
    const rate = parseFloat(value);
    if (rate && rate > 0) {
        currentExchangeRate = rate;

        // 수동 입력도 캐싱 (다음 로드 시 사용)
        localStorage.setItem('cachedExchangeRate', rate.toString());
        localStorage.setItem('cachedExchangeRateTime', Date.now().toString());
        localStorage.setItem('cachedExchangeRateSource', '수동 입력');

        const lastUpdated = document.getElementById('lastUpdated');
        const statusIndicator = document.getElementById('exchangeRateStatus');

        if (lastUpdated) {
            lastUpdated.textContent = `(${new Date().toLocaleTimeString()} • 수동 입력)`;
        }

        // 상태 표시: 수동 입력 - 빨강색
        if (statusIndicator) {
            statusIndicator.style.backgroundColor = '#ef4444'; // 빨강색
        }
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
                showUploadStatus(`✅ 운임표 업로드 완료! (${Object.keys(parsedData.standard).length}개 Standard 국가, ${Object.keys(parsedData.express).length}개 Express Zone, ${Object.keys(parsedData.ems).length}개 EMS Zone)`, 'success');
                
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
    const emsWrapper = document.getElementById('emsDestinationWrapper');
    
    standardWrapper.classList.add('hidden');
    expressWrapper.classList.add('hidden');
    emsWrapper.classList.add('hidden');

    if (type === 'standard') {
        standardWrapper.classList.remove('hidden');
    } else if (type === 'express') {
        expressWrapper.classList.remove('hidden');
    } else if (type === 'ems') {
        emsWrapper.classList.remove('hidden');
    }

    updateWeightInfo();
}

// [수정] updateWeightInfo 함수
function updateWeightInfo() {
    // getSelectedDestination()는 margin-calculator.js에 정의되어 있음
    const destinationCode = getSelectedDestination();
    const volumetricWeight = calculateVolumetricWeight(destinationCode);
    const finalWeight = getFinalWeight(destinationCode);
    const weightInfo = document.getElementById('weightInfo');
    
    if (volumetricWeight > 0 || finalWeight > 0) {
        let serviceTypeText = '';
        if (currentServiceType === 'express') {
            serviceTypeText = 'eGS Express';
        } else if (currentServiceType === 'ems') {
            serviceTypeText = 'eGS EMS';
        } else {
            serviceTypeText = 'eGS Standard';
        }
        weightInfo.innerHTML = `📦 부피 중량: ${volumetricWeight.toFixed(2)}kg | <strong>과금 중량: ${finalWeight.toFixed(2)}kg</strong><br>🚚 선택된 서비스: ${serviceTypeText}`;
        weightInfo.classList.remove('hidden');
    } else {
        weightInfo.classList.add('hidden');
    }
}

// [수정] calculateVolumetricWeight 함수
function calculateVolumetricWeight(destinationCode) {
    const length = parseFloat(document.getElementById('length').value) || 0;
    const width = parseFloat(document.getElementById('width').value) || 0;
    const height = parseFloat(document.getElementById('height').value) || 0;

    if (!length || !width || !height) return 0;

    let divisor = 6000; // 기본값 (Standard 비유럽)

    if (currentServiceType === 'express' || currentServiceType === 'ems') {
        // Express와 EMS는 모든 국가 /5000
        divisor = 5000;
    } else { // Standard 서비스일 경우
        // isEuropeanCountry 헬퍼 함수를 사용하여 유럽 국가 여부 판별
        if (isEuropeanCountry(destinationCode)) {
            // 유럽 국가는 /5000
            divisor = 5000;
        }
        // 그 외 (미국, 호주, 캐나다 등)는 기본값 /6000 유지
    }

    return (length * width * height) / divisor;
}

// [수정] getFinalWeight 함수
function getFinalWeight(destinationCode) {
    const actualWeight = parseFloat(document.getElementById('weight').value) || 0;
    // calculateVolumetricWeight 함수에 destinationCode를 전달
    return Math.max(actualWeight, calculateVolumetricWeight(destinationCode));
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

function openResultModal(results) {
    const modal = document.getElementById('resultModal');
    const modalContent = document.getElementById('modalResultContent');

    // eBay 수수료 합계: 기본 수수료 + VAT + 광고비
    const ebayTotalDisplayUSD = results.ebayFeeBreakdown.total + results.vatUSD + (results.adCostUSD || 0);

    const resultHTML = `
        <div class="horizontal-flow">

            ${results.applyTariff && results.tariffCostUSD > 0 ? `
            <div class="flow-step">
                <div class="flow-step-header">🛃 관세</div>
                <div class="flow-step-content">
                    <div class="flow-value small">
                        <span>관세율</span>
                        <span class="value-number red">${results.tariffRate}%</span>
                    </div>
                    <div class="flow-value main">
                        <span>관세 포함 판매가 (무료)</span>
                        <span class="value-number blue">$${(results.requiredSellingPriceUSD + results.tariffCostUSD).toFixed(2)}</span>
                    </div>
                    <div class="flow-value main" style="margin-top: 4px;">
                        <span>관세 포함 판매가 (유료)</span>
                        <span class="value-number orange">$${(results.requiredSellingPriceUSD - (results.egsInternationalShipping / currentExchangeRate) + results.tariffCostUSD).toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <div class="flow-arrow">→</div>
            ` : ''}

            <div class="flow-step">
                <div class="flow-step-header">💵 ebay 판매가</div>
                <div class="flow-step-content">
                    <div class="flow-value main">
                        <span>권장 판매가 (무료)</span>
                        <span class="value-number blue">$${results.requiredSellingPriceUSD.toFixed(2)}</span>
                    </div>
                    <div class="flow-value main" style="margin-top: 8px;">
                        <span>권장 판매가 (유료)</span>
                        <span class="value-number orange">$${(results.requiredSellingPriceUSD - (results.egsInternationalShipping / currentExchangeRate)).toFixed(2)}</span>
                    </div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 8px; padding: 8px; background: #f9fafb; border-radius: 4px;">
                        💡 유료배송 = 무료배송가 - 국제배송비 ($${(results.egsInternationalShipping / currentExchangeRate).toFixed(2)})
                    </div>
                </div>
            </div>

            <div class="flow-arrow">→</div>

            <div class="flow-step">
                <div class="flow-step-header">📉 ebay 수수료</div>
                <div class="flow-step-content">
                    <div class="flow-value small">
                        <span>Final Value Fee</span>
                        <span class="value-number red">-$${results.ebayFeeBreakdown.finalValueFee.toFixed(2)}</span>
                    </div>
                    <div class="flow-value small">
                        <span>Per Order Fee</span>
                        <span class="value-number red">-$${results.ebayFeeBreakdown.perOrderFee.toFixed(2)}</span>
                    </div>
                    <div class="flow-value small">
                        <span>International Fee</span>
                        <span class="value-number red">-$${results.ebayFeeBreakdown.internationalFee.toFixed(2)}</span>
                    </div>
                    ${results.isKoreanSeller ? `
                    <div class="flow-value small">
                        <span>VAT (10%)</span>
                        <span class="value-number red">-$${results.vatUSD.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    ${results.adEnabled && results.adCostUSD > 0 ? `
                    <div style="border-top: 1px solid #e5e7eb; margin: 6px 0;"></div>
                    <div class="flow-value small">
                        <span>광고비 (${results.adRate}%)</span>
                        <span class="value-number red">-$${results.adCostUSD.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    <div class="flow-value total">
                        <span>총 수수료</span>
                        <span class="value-number red">-$${ebayTotalDisplayUSD.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div class="flow-arrow">→</div>

            <div class="flow-step">
                <div class="flow-step-header">💰 ebay 정산</div>
                <div class="flow-step-content">
                    <div class="flow-value main">
                        <span>정산액 (USD)</span>
                        <span class="value-number blue">$${results.ebayPayoutUSD.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div class="flow-arrow">→</div>

            <div class="flow-step">
                <div class="flow-step-header">💵 Payoneer</div>
                <div class="flow-step-content">
                    <div class="flow-value small">
                        <span>출금 수수료</span>
                        <span class="value-number red">-$${results.payoneerWithdrawalFee.toFixed(2)}</span>
                    </div>
                    <div class="flow-value small">
                        <span>환전 수수료 (1.2%)</span>
                        <span class="value-number red">-$${results.payoneerExchangeFee.toFixed(2)}</span>
                    </div>
                    <div class="flow-value total">
                        <span>총 수수료</span>
                        <span class="value-number red">-$${results.payoneerTotalFee.toFixed(2)}</span>
                    </div>
                    <div style="border-top: 1px solid #e5e7eb; margin: 6px 0;"></div>
                    <div class="flow-value main">
                        <span>입금액 (USD)</span>
                        <span class="value-number blue">$${results.finalReceiveUSD.toFixed(2)}</span>
                    </div>
                    <div class="flow-value main">
                        <span>입금액 (KRW)</span>
                        <span class="value-number green">${Math.round(results.finalReceiveKRW).toLocaleString()}원</span>
                    </div>
                </div>
            </div>

            <div class="flow-arrow">→</div>

            <div class="flow-step">
                <div class="flow-step-header">📦 제품 원가 정보</div>
                <div class="flow-step-content">
                    <div class="flow-value small">
                        <span>제품 매입가</span>
                        <span class="value-number red">-${Math.round(results.productCost).toLocaleString()}원</span>
                    </div>
                    <div class="flow-value small">
                        <span>매입처 배송비</span>
                        <span class="value-number red">-${Math.round(results.supplierShipping).toLocaleString()}원</span>
                    </div>
                    <div class="flow-value small">
                        <span>포장비</span>
                        <span class="value-number red">-${Math.round(results.packagingCost).toLocaleString()}원</span>
                    </div>
                    <div class="flow-value small">
                        <span>eGS 입고비</span>
                        <span class="value-number red">-${Math.round(results.egsShipping).toLocaleString()}원</span>
                    </div>
                    <div class="flow-value small">
                        <span>국제 배송비</span>
                        <span class="value-number red">-${Math.round(results.egsInternationalShipping).toLocaleString()}원</span>
                    </div>
                    ${results.serviceType === 'ems' && results.emsSurcharge > 0 ? `
                    <div class="flow-value small">
                        <span>할증료</span>
                        <span class="value-number red">-${Math.round(results.emsSurcharge).toLocaleString()}원</span>
                    </div>
                    ` : ''}
                    <div class="flow-value total">
                        <span>총 원가</span>
                        <span class="value-number red">-${Math.round(results.totalCostKRW).toLocaleString()}원</span>
                    </div>
                </div>
            </div>

            <div class="flow-arrow final">→</div>

            <div class="flow-step highlight">
                <div class="flow-step-header">🎯 최종 결과</div>
                <div class="flow-step-content">
                    <div class="flow-value main">
                        <span>순수익</span>
                        <span class="value-number ${results.netProfitKRW >= 0 ? 'green' : 'red'}">
                            ${results.netProfitKRW >= 0 ? '+' : ''}${Math.round(results.netProfitKRW).toLocaleString()}원
                        </span>
                    </div>
                    <div class="flow-value main">
                        <span>마진율</span>
                        <span class="value-number ${results.actualMarginRate >= results.targetMarginRate ? 'green' : 'orange'}">
                            ${results.actualMarginRate.toFixed(2)}%
                            <span class="target-info">(목표: ${results.targetMarginRate}%)</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;

    modalContent.innerHTML = resultHTML;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeResultModal() {
    const modal = document.getElementById('resultModal');
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
        closeResultModal();
    }
});

document.addEventListener('click', function(event) {
    const helpModal = document.getElementById('helpModal');
    if (event.target === helpModal) {
        closeHelpModal();
    }
    const resultModal = document.getElementById('resultModal');
    if (event.target === resultModal) {
        closeResultModal();
    }
});
