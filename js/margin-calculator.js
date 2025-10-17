// --- Calculator Constants ---
let currentServiceType = 'standard';

const ebayCategories = {
    'most_categories': { name: '대부분 카테고리 (일반)', noStore: { rate: 13.6, threshold: 7500, overRate: 2.35 }, withStore: { rate: 12.7, threshold: 2500, overRate: 2.35 } },
    'books_movies_music': { name: '도서/영화/음악', noStore: { rate: 15.3, threshold: 7500, overRate: 2.35 }, withStore: { rate: 15.3, threshold: 2500, overRate: 2.35 } },
    'womens_bags': { name: '여성용 가방/핸드백', noStore: { rate: 15.0, threshold: 2000, overRate: 9.0 }, withStore: { rate: 13.0, threshold: 2000, overRate: 7.0 } },
    'athletic_shoes': { name: '운동화 (남성/여성)', noStore: { rate: 8.0, minAmount: 150, belowMinRate: 13.6 }, withStore: { rate: 7.0, minAmount: 150, belowMinRate: 12.7 } },
    'jewelry_watches': { name: '보석/시계 (일반)', noStore: { rate: 15.0, threshold: 5000, overRate: 9.0 }, withStore: { rate: 13.0, threshold: 5000, overRate: 7.0 } },
    'watches_parts': { name: '시계/부품/액세서리', noStore: { rate: 15.0, threshold1: 1000, rate1: 6.5, threshold2: 7500, rate2: 3.0 }, withStore: { rate: 12.5, threshold1: 1000, rate1: 4.0, threshold2: 5000, rate2: 3.0 } },
    'coins_paper_money': { name: '동전/지폐 (금괴제외)', noStore: { rate: 13.25, threshold: 7500, overRate: 2.35 }, withStore: { rate: 9.0, threshold: 4000, overRate: 2.35 } },
    'bullion': { name: '금괴/귀금속', noStore: { rate: 13.6, threshold: 7500, overRate: 7.0 }, withStore: { rate: 7.5, threshold1: 1500, rate1: 5.0, threshold2: 10000, rate2: 4.5 } },
    'guitars_basses': { name: '악기 (기타/베이스)', noStore: { rate: 6.7, threshold: 7500, overRate: 2.35 }, withStore: { rate: 6.7, threshold: 2500, overRate: 2.35 } },
    'trading_cards': { name: '트레이딩 카드', noStore: { rate: 13.25, threshold: 7500, overRate: 2.35 }, withStore: { rate: 12.35, threshold: 2500, overRate: 2.35 } },
    'nft_categories': { name: 'NFT 카테고리', noStore: { rate: 5.0 }, withStore: { rate: 5.0 } }
};

const destinations = { US: '미국', CA: '캐나다', GB: '영국', DE: '독일', FR: '프랑스', IT: '이탈리아', ES: '스페인', EU: '기타 유럽 (독일 요금)', AU: '호주' };


// --- Event Listeners for Calculator ---
document.querySelectorAll('.service-type-option').forEach(option => {
    option.addEventListener('click', (event) => {
        toggleServiceType(event.currentTarget.dataset.type);
    });
});

// --- File Upload & Parsing ---
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
            
            if (parsedData) {
                egsRatesData = parsedData;
                localStorage.setItem('egsRatesData', JSON.stringify(parsedData));
                localStorage.setItem('egsRatesLastUpdate', new Date().toISOString());
                showUploadStatus(`✅ 운임표 업로드 완료! (${file.name})`, 'success');
            } else {
                showUploadStatus('❌ 운임표 형식이 올바르지 않습니다.', 'error');
            }
        } catch (error) {
            console.error('파일 파싱 오류:', error);
            showUploadStatus('❌ 파일 읽기 실패.', 'error');
        }
    };
    reader.readAsArrayBuffer(file);
}

function parseExcelWorkbook(workbook) {
    try {
        const result = { standard: {}, express: {} };
        const parseSheet = (sheetName, parserFn, ...args) => {
            const sheet = workbook.Sheets[sheetName];
            return sheet ? parserFn(XLSX.utils.sheet_to_json(sheet, { header: 1 }), ...args) : null;
        };

        result.standard.US = parseSheet('eGS Standard - US', parseStandardUSSheet);
        result.standard.CA = parseSheet('eGS Standard - CA', parseStandardGenericSheet, 7);
        result.standard.GB = parseSheet('eGS Standard - GB', parseStandardGenericSheet, 7);
        result.standard.AU = parseSheet('eGS Standard - AU', parseStandardGenericSheet, 6);
        Object.assign(result.standard, parseSheet('eGS Standard - EU', parseStandardEUSheet) || {});
        
        result.express = parseSheet('eGS Express', parseExpressSheet) || {};

        return (Object.keys(result.standard).length > 0 || Object.keys(result.express).length > 0) ? result : null;
    } catch (error) { console.error('엑셀 파싱 오류:', error); return null; }
}
function parseStandardUSSheet(data) { /* ... same as original ... */ return []; }
function parseStandardGenericSheet(data, startRow) { /* ... same as original ... */ return []; }
function parseStandardEUSheet(data) { /* ... same as original ... */ return {}; }
function parseExpressSheet(workbook) { /* ... same as original ... */ return {}; }
// NOTE: For brevity, the detailed parsing functions are kept collapsed. They should be copied from the original file.


// --- Core Calculation Logic ---
function toggleServiceType(type) {
    currentServiceType = type;
    document.querySelectorAll('.service-type-option').forEach(option => option.classList.remove('active'));
    document.querySelector(`.service-type-option[data-type="${type}"]`).classList.add('active');
    updateWeightInfo();
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
function updateWeightInfo() {
    const volumetricWeight = calculateVolumetricWeight();
    const finalWeight = getFinalWeight();
    const weightInfo = document.getElementById('weightInfo');
    if (volumetricWeight > 0 || finalWeight > 0) {
        const serviceTypeText = currentServiceType === 'express' ? 'Express' : 'Standard';
        weightInfo.innerHTML = `📦 부피 중량: ${volumetricWeight.toFixed(2)}kg | 과금 중량: ${finalWeight.toFixed(2)}kg<br>🚚 선택된 서비스: eGS ${serviceTypeText}`;
        weightInfo.classList.remove('hidden');
    } else {
        weightInfo.classList.add('hidden');
    }
}
function calculateEgsShipping(targetWeight, destination) {
    if (!egsRatesData || !egsRatesData[currentServiceType] || !egsRatesData[currentServiceType][destination]) return 0;
    const rates = egsRatesData[currentServiceType][destination];
    if (!rates || rates.length === 0) return 0;
    const nextHigher = rates.find(rate => rate.weight >= targetWeight);
    return nextHigher ? nextHigher.price : 0; // Simplified logic, can be expanded
}
function calculateEbayFee(sellingPriceUSD, category, hasStore) { /* ... same as original ... */ return { total: 0 }; }
function findTargetSellingPrice(totalCostUSD, targetMarginRate, category, hasStore, isKoreanSeller) { /* ... same as original ... */ return 0; }

function calculateMargin() {
    if (!egsRatesData) { alert('⚠️ 운임표를 먼저 업로드해주세요!'); return; }
    
    const productCost = document.getElementById('productCost').value;
    const destination = document.getElementById('destination').value;
    const category = document.getElementById('category').value;
    const weight = document.getElementById('weight').value;
    const targetMargin = document.getElementById('targetMargin').value;
    
    if (!productCost || !destination || !category || !weight || !targetMargin) { alert('모든 필수 항목을 입력해주세요.'); return; }

    const supplierShipping = parseFloat(document.getElementById('supplierShipping').value) || 0;
    const egsShipping = parseFloat(document.getElementById('egsShipping').value) || 3400;
    const storeType = document.getElementById('storeType').value;
    const isKoreanSeller = document.getElementById('isKoreanSeller').value === 'true';

    const finalWeight = getFinalWeight();
    const egsShippingCost = calculateEgsShipping(finalWeight, destination);
    if (egsShippingCost === 0) { alert(`⚠️ ${destinations[destination]} 배송비 정보가 없습니다.`); return; }

    const totalCostKRW = parseFloat(productCost) + supplierShipping + egsShipping + egsShippingCost;
    const totalCostUSD = totalCostKRW / currentExchangeRate;
    const hasStore = storeType !== 'none';
    const targetMarginRate = parseFloat(targetMargin);

    const requiredSellingPriceUSD = findTargetSellingPrice(totalCostUSD, targetMarginRate, category, hasStore, isKoreanSeller);
    const ebayFeeBreakdown = calculateEbayFee(requiredSellingPriceUSD, category, hasStore);
    const vatUSD = isKoreanSeller ? ebayFeeBreakdown.total * 0.1 : 0;
    const ebayTotalFee = ebayFeeBreakdown.total + vatUSD;
    const ebayPayoutUSD = requiredSellingPriceUSD - ebayTotalFee;
    const payoneerWithdrawalFee = 1.00;
    const payoneerExchangeFee = ebayPayoutUSD * 0.012;
    const payoneerTotalFee = payoneerWithdrawalFee + payoneerExchangeFee;
    const finalReceiveUSD = ebayPayoutUSD - payoneerTotalFee;
    const netProfitUSD = finalReceiveUSD - totalCostUSD;
    
    displayResults({
        totalCostKRW, totalCostUSD, requiredSellingPriceUSD, ebayFeeBreakdown, vatUSD, ebayTotalFee, 
        ebayPayoutUSD, payoneerTotalFee, finalReceiveUSD, netProfitUSD, targetMarginRate, finalWeight,
        productCost: parseFloat(productCost), supplierShipping, egsShipping, egsInternationalShipping: egsShippingCost,
        finalReceiveKRW: finalReceiveUSD * currentExchangeRate, netProfitKRW: netProfitUSD * currentExchangeRate,
        actualMarginRate: (netProfitUSD / requiredSellingPriceUSD) * 100, volumetricWeight: calculateVolumetricWeight(),
        hasStore, isKoreanSeller, destination, category, serviceType: currentServiceType
    });
}

function displayResults(results) {
    const resultDetailsContainer = document.getElementById('resultDetails');
    const settingsInfoContainer = document.getElementById('settingsInfo');
    
    const resultHTML = `<!-- ... same as original result HTML structure ... -->`;
    resultDetailsContainer.innerHTML = resultHTML;

    const serviceTypeText = results.serviceType === 'express' ? '⚡ eGS Express' : '🚛 eGS Standard';
    const settingsHTML = `
        <div style="font-size: 14px; line-height: 1.8;">
            <div><strong>목적지:</strong> ${destinations[results.destination]}</div>
            <div><strong>과금 중량:</strong> ${results.finalWeight.toFixed(2)}kg</div>
            <div><strong>배송 서비스:</strong> ${serviceTypeText}</div>
            <div><strong>카테고리:</strong> ${ebayCategories[results.category].name}</div>
            <div><strong>스토어:</strong> ${results.hasStore ? 'Basic 이상' : '없음/Starter'}</div>
            <div><strong>판매자:</strong> ${results.isKoreanSeller ? '한국 (VAT 10%)' : '해외'}</div>
        </div>`;
    settingsInfoContainer.innerHTML = settingsHTML;

    document.getElementById('resultsContainer').classList.remove('hidden');
    document.getElementById('usageGuide').classList.add('hidden');
}

// NOTE: Please copy the full content of the JavaScript functions from your original file.
// The functions parseStandardUSSheet, parseStandardGenericSheet, parseStandardEUSheet, parseExpressSheet,
// calculateEbayFee, findTargetSellingPrice, and the inner HTML for displayResults have been collapsed here for brevity
// but must be included in your final margin-calculator.js file.