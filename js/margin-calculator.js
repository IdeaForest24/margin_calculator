// js/margin-calculator.js

// --- Calculator Constants ---
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


// --- Excel File Parsing Logic ---
function parseExcelWorkbook(workbook) {
    try {
        const result = { standard: {}, express: {} };
        const parseSheet = (sheetName, parserFn, ...args) => {
            const sheet = workbook.Sheets[sheetName];
            return sheet ? parserFn(XLSX.utils.sheet_to_json(sheet, { header: 1 }), ...args) : null;
        };

        const standardUS = parseSheet('eGS Standard - US', parseStandardUSSheet);
        if (standardUS) result.standard.US = standardUS;

        const standardCA = parseSheet('eGS Standard - CA', parseStandardGenericSheet, 7);
        if (standardCA) result.standard.CA = standardCA;
        
        const standardGB = parseSheet('eGS Standard - GB', parseStandardGenericSheet, 7);
        if (standardGB) result.standard.GB = standardGB;

        const standardAU = parseSheet('eGS Standard - AU', parseStandardGenericSheet, 6);
        if (standardAU) result.standard.AU = standardAU;
        
        Object.assign(result.standard, parseSheet('eGS Standard - EU', parseStandardEUSheet) || {});
        
        const expressData = parseSheet('eGS Express', parseExpressSheet);
        if (expressData) result.express = expressData;

        return result;
    } catch (error) { 
        console.error('엑셀 파싱 오류:', error); 
        return null; 
    }
}

function parseStandardUSSheet(data) {
    const result = [];
    for (let row = 4; row < data.length; row++) {
        const rowData = data[row];
        if (!rowData || rowData.length < 3) continue;
        const weight = parseFloat(rowData[1]);
        const price = parseFloat(rowData[2]);
        if (!isNaN(weight) && !isNaN(price) && weight > 0 && price > 0) {
            result.push({ weight, price });
        }
    }
    return result.length > 0 ? result : null;
}

function parseStandardGenericSheet(data, startRow) {
    const result = [];
    for (let row = startRow; row < data.length; row++) {
        const rowData = data[row];
        if (!rowData || rowData.length < 2) continue;
        const weight = parseFloat(rowData[0]);
        const price = parseFloat(rowData[1]);
        if (!isNaN(weight) && !isNaN(price) && weight > 0 && price > 0) {
            result.push({ weight, price });
        }
    }
    return result.length > 0 ? result : null;
}

function parseStandardEUSheet(data) {
    const results = {};
    try {
        const headerRow = data[2];
        if (!headerRow) return null;
        const countryMapping = { 'FR': 'France', 'DE': 'Germany', 'IT': 'Italy', 'ES': 'Spain' };
        const countryIndices = {};
        Object.keys(countryMapping).forEach(code => {
            const countryName = countryMapping[code];
            const index = headerRow.findIndex(h => h && h.includes(countryName));
            if (index !== -1) countryIndices[code] = index;
        });
        
        Object.keys(countryIndices).forEach(countryCode => {
            const columnIndex = countryIndices[countryCode];
            const countryData = [];
            for (let row = 3; row < data.length; row++) {
                const rowData = data[row];
                if (!rowData || rowData.length <= columnIndex) continue;
                const weight = parseFloat(rowData[0]);
                const price = parseFloat(rowData[columnIndex]);
                if (!isNaN(weight) && !isNaN(price) && weight > 0 && price > 0) {
                    countryData.push({ weight, price });
                }
            }
            if (countryData.length > 0) results[countryCode] = countryData;
        });

        if (results.DE) results.EU = [...results.DE];
        return Object.keys(results).length > 0 ? results : null;
    } catch (error) {
        console.error('EU 시트 파싱 오류:', error);
        return null;
    }
}

function parseExpressSheet(data) {
    const expressData = {};
    try {
        const zoneHeader = data[3];
        if (!zoneHeader) return {};

        const zoneMapping = {
            'US': { index: zoneHeader.indexOf('E') },
            'CA': { index: zoneHeader.indexOf('F') },
            'GB': { index: zoneHeader.indexOf('M') },
            'AU': { index: zoneHeader.indexOf('U') }
        };

        for (let row = 5; row < data.length; row++) {
            const rowData = data[row];
            if (!rowData || typeof rowData[0] !== 'number') continue;
            const weight = rowData[0];
            
            Object.keys(zoneMapping).forEach(country => {
                const { index } = zoneMapping[country];
                if (index !== -1 && typeof rowData[index] === 'number') {
                    if (!expressData[country]) expressData[country] = [];
                    expressData[country].push({ weight: weight, price: rowData[index] });
                }
            });
        }

        if (expressData.GB) {
            expressData.DE = [...expressData.GB];
            expressData.FR = [...expressData.GB];
            expressData.IT = [...expressData.GB];
            expressData.ES = [...expressData.GB];
            expressData.EU = [...expressData.GB];
        }
        return expressData;
    } catch (error) {
        console.error('Express 시트 파싱 오류:', error);
        return {};
    }
}


// --- Core Calculation Logic ---
function calculateEgsShipping(targetWeight, destination) {
    if (!egsRatesData || !egsRatesData[currentServiceType] || !egsRatesData[currentServiceType][destination]) return 0;
    
    const rates = egsRatesData[currentServiceType][destination];
    if (!rates || rates.length === 0) return 0;

    const exactMatch = rates.find(rate => rate.weight === targetWeight);
    if (exactMatch) return exactMatch.price;
    
    const nextHigher = rates.find(rate => rate.weight > targetWeight);
    if (nextHigher) return nextHigher.price;

    const lastRate = rates[rates.length - 1];
    return (targetWeight > lastRate.weight) ? lastRate.price : 0;
}

function calculateEbayFee(sellingPriceUSD, category, hasStore) {
    const categoryData = ebayCategories[category];
    if (!categoryData) {
        return { finalValueFee: 0, perOrderFee: 0, internationalFee: 0, total: 0 };
    }

    const feeStructure = hasStore ? categoryData.withStore : categoryData.noStore;
    const transactionFee = sellingPriceUSD <= 10 ? 0.30 : 0.40;
    const internationalFee = sellingPriceUSD * 0.0165;
    let percentageFee = 0;

    if (feeStructure.threshold) {
        const baseRate = feeStructure.rate / 100;
        const overRate = feeStructure.overRate / 100;
        const threshold = feeStructure.threshold;
        if (sellingPriceUSD <= threshold) {
            percentageFee = sellingPriceUSD * baseRate;
        } else {
            percentageFee = (threshold * baseRate) + ((sellingPriceUSD - threshold) * overRate);
        }
    } else if (feeStructure.minAmount) {
        percentageFee = sellingPriceUSD * ((sellingPriceUSD >= feeStructure.minAmount ? feeStructure.rate : feeStructure.belowMinRate) / 100);
    } else if (feeStructure.threshold1) {
        const { threshold1, threshold2, rate1, rate2, rate } = feeStructure;
        const baseRate = rate / 100;
        if (sellingPriceUSD <= threshold1) {
            percentageFee = sellingPriceUSD * baseRate;
        } else if (sellingPriceUSD <= threshold2) {
            percentageFee = (threshold1 * baseRate) + ((sellingPriceUSD - threshold1) * (rate1 / 100));
        } else {
            percentageFee = (threshold1 * baseRate) + ((threshold2 - threshold1) * (rate1 / 100)) + ((sellingPriceUSD - threshold2) * (rate2 / 100));
        }
    } else {
        percentageFee = sellingPriceUSD * (feeStructure.rate / 100);
    }

    return {
        finalValueFee: percentageFee,
        perOrderFee: transactionFee,
        internationalFee: internationalFee,
        total: percentageFee + transactionFee + internationalFee
    };
}

function findTargetSellingPrice(totalCostUSD, targetMarginRate, category, hasStore, isKoreanSeller) {
    let low = totalCostUSD;
    let high = totalCostUSD * 5;
    let bestPrice = high;

    for (let i = 0; i < 50; i++) {
        const midPrice = (low + high) / 2;
        const ebayFeeBreakdown = calculateEbayFee(midPrice, category, hasStore);
        const vat = isKoreanSeller ? ebayFeeBreakdown.total * 0.1 : 0;
        const ebayTotalFee = ebayFeeBreakdown.total + vat;
        const ebayPayout = midPrice - ebayTotalFee;
        const payoneerWithdrawalFee = ebayPayout > 1.0 ? 1.0 : 0;
        const payoneerExchangeFee = ebayPayout * 0.012;
        const payoneerTotalFee = payoneerWithdrawalFee + payoneerExchangeFee;
        const finalReceive = ebayPayout - payoneerTotalFee;
        const netProfit = finalReceive - totalCostUSD;
        const actualMarginRate = midPrice > 0 ? (netProfit / midPrice) * 100 : 0;

        if (Math.abs(actualMarginRate - targetMarginRate) < 0.01) {
            bestPrice = midPrice;
            break;
        }
        if (actualMarginRate < targetMarginRate) {
            low = midPrice;
        } else {
            high = midPrice;
            bestPrice = midPrice;
        }
    }
    return bestPrice;
}

// --- Main Calculation Function ---
function calculateMargin() {
    if (!egsRatesData) {
        alert('⚠️ 운임표를 먼저 업로드해주세요!');
        return;
    }

    const productCost = document.getElementById('productCost').value;
    const destination = document.getElementById('destination').value;
    const category = document.getElementById('category').value;
    const weight = document.getElementById('weight').value;
    const targetMargin = document.getElementById('targetMargin').value;

    if (!productCost || !destination || !category || !weight || !targetMargin) {
		alert('모든 필수 항목을 입력해주세요.');
        return;
    }

    const supplierShipping = parseFloat(document.getElementById('supplierShipping').value) || 0;
    const egsShipping = parseFloat(document.getElementById('egsShipping').value) || 3400;
    const storeType = document.getElementById('storeType').value;
    const isKoreanSeller = document.getElementById('isKoreanSeller').value === 'true';

    const finalWeight = getFinalWeight();
    const egsShippingCost = calculateEgsShipping(finalWeight, destination);
    if (egsShippingCost === 0 && finalWeight > 0) {
        alert(`⚠️ ${destinations[destination]} (${finalWeight.toFixed(2)}kg)에 대한 배송비 정보가 없습니다. 운임표를 확인해주세요.`);
        return;
    }

    const totalCostKRW = parseFloat(productCost) + supplierShipping + egsShipping + egsShippingCost;
    const totalCostUSD = totalCostKRW / currentExchangeRate;
    const hasStore = storeType !== 'none';
    const targetMarginRate = parseFloat(targetMargin);

    const requiredSellingPriceUSD = findTargetSellingPrice(totalCostUSD, targetMarginRate, category, hasStore, isKoreanSeller);
    const ebayFeeBreakdown = calculateEbayFee(requiredSellingPriceUSD, category, hasStore);
    
    const vatUSD = isKoreanSeller ? ebayFeeBreakdown.total * 0.1 : 0;
    const ebayTotalFee = ebayFeeBreakdown.total + vatUSD;
    const ebayPayoutUSD = requiredSellingPriceUSD - ebayTotalFee;
    
    const payoneerWithdrawalFee = ebayPayoutUSD > 1.0 ? 1.00 : 0;
    const payoneerExchangeFee = ebayPayoutUSD * 0.012;
    const payoneerTotalFee = payoneerWithdrawalFee + payoneerExchangeFee;

    const finalReceiveUSD = ebayPayoutUSD - payoneerTotalFee;
    const finalReceiveKRW = finalReceiveUSD * currentExchangeRate;
    const netProfitKRW = finalReceiveKRW - totalCostKRW;
    const actualMarginRate = requiredSellingPriceUSD > 0 ? (netProfitKRW / (requiredSellingPriceUSD * currentExchangeRate)) * 100 : 0;
    
    displayResultsInModal({
        requiredSellingPriceUSD,
        ebayFeeBreakdown,
        vatUSD,
        ebayTotalFee,
        ebayPayoutUSD,
        payoneerWithdrawalFee,
        payoneerExchangeFee,
        payoneerTotalFee,
        finalReceiveUSD,
        finalReceiveKRW,
        productCost: parseFloat(productCost),
        supplierShipping,
        egsShipping,
        egsInternationalShipping: egsShippingCost,
        totalCostKRW,
        netProfitKRW,
        actualMarginRate,
        targetMarginRate,
        finalWeight,
        volumetricWeight: calculateVolumetricWeight(),
        hasStore,
        isKoreanSeller,
        destination,
        category,
        serviceType: currentServiceType
    });
}


// --- Modal Control Functions ---
function openResultModal() {
    const modal = document.getElementById('resultModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeResultModal() {
    const modal = document.getElementById('resultModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeResultModal();
    }
});

// 모달 배경 클릭 시 닫기
document.addEventListener('click', function(event) {
    const modal = document.getElementById('resultModal');
    if (event.target === modal) {
        closeResultModal();
    }
});


// --- Display Results in Modal ---
function displayResultsInModal(results) {
    const modalContent = document.getElementById('modalResultContent');

    const serviceTypeText = results.serviceType === 'express' 
        ? '⚡ eGS Express' 
        : '🚛 eGS Standard';
    
    const modalHTML = `
        <!-- 가로 Flow 레이아웃 -->
        <div class="horizontal-flow">
            <!-- Step 1: 판매가 -->
            <div class="flow-step">
                <div class="flow-step-header">💵 eBay 판매가</div>
                <div class="flow-step-content">
                    <div class="flow-value main">
                        <span>권장 판매가</span>
                        <span class="value-number blue">$${results.requiredSellingPriceUSD.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div class="flow-arrow">→</div>

            <!-- Step 2: eBay 수수료 -->
            <div class="flow-step">
                <div class="flow-step-header">📉 eBay 수수료</div>
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
                    <div class="flow-value total">
                        <span>총 수수료</span>
                        <span class="value-number red">-$${results.ebayTotalFee.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div class="flow-arrow">→</div>

            <!-- Step 3: eBay 정산 -->
            <div class="flow-step">
                <div class="flow-step-header">💰 eBay 정산</div>
                <div class="flow-step-content">
                    <div class="flow-value main">
                        <span>정산액 (USD)</span>
                        <span class="value-number blue">$${results.ebayPayoutUSD.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div class="flow-arrow">→</div>

            <!-- Step 4: Payoneer 수수료 -->
            <div class="flow-step">
                <div class="flow-step-header">📉 Payoneer 수수료</div>
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
                </div>
            </div>

            <div class="flow-arrow">→</div>

            <!-- Step 5: Payoneer 정산 -->
            <div class="flow-step">
                <div class="flow-step-header">💵 Payoneer 정산</div>
                <div class="flow-step-content">
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

            <!-- Step 6: 원가 차감 -->
            <div class="flow-step">
                <div class="flow-step-header">📦 원가 차감</div>
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
                        <span>eGS 입고비</span>
                        <span class="value-number red">-${Math.round(results.egsShipping).toLocaleString()}원</span>
                    </div>
                    <div class="flow-value small">
                        <span>국제 배송비</span>
                        <span class="value-number red">-${Math.round(results.egsInternationalShipping).toLocaleString()}원</span>
                    </div>
                    <div class="flow-value total">
                        <span>총 원가</span>
                        <span class="value-number red">-${Math.round(results.totalCostKRW).toLocaleString()}원</span>
                    </div>
                </div>
            </div>

            <div class="flow-arrow final">→</div>

            <!-- Step 7: 최종 수익 -->
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

        <!-- 설정 정보 -->
        <div class="settings-info-section">
            <div class="settings-info-header">⚙️ 계산 설정 정보</div>
            <div class="settings-grid">
                <div class="setting-item">
                    <span class="setting-label">목적지:</span>
                    <span class="setting-value">${destinations[results.destination]}</span>
                </div>
                <div class="setting-item">
                    <span class="setting-label">과금 중량:</span>
                    <span class="setting-value">${results.finalWeight.toFixed(2)}kg (부피: ${results.volumetricWeight.toFixed(2)}kg)</span>
                </div>
                <div class="setting-item">
                    <span class="setting-label">배송 서비스:</span>
                    <span class="setting-value">${serviceTypeText}</span>
                </div>
                <div class="setting-item">
                    <span class="setting-label">카테고리:</span>
                    <span class="setting-value">${ebayCategories[results.category].name}</span>
                </div>
                <div class="setting-item">
                    <span class="setting-label">스토어:</span>
                    <span class="setting-value">${results.hasStore ? 'Basic 이상' : '없음/Starter'}</span>
                </div>
                <div class="setting-item">
                    <span class="setting-label">판매자:</span>
                    <span class="setting-value">${results.isKoreanSeller ? '한국 (VAT 10%)' : '해외'}</span>
                </div>
            </div>
        </div>
    `;
    
    modalContent.innerHTML = modalHTML;
    openResultModal();
}
