// js/margin-calculator.js

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

function toggleAdInput() {
    const adEnabled = document.getElementById('adEnabled').checked;
    const adRateInput = document.getElementById('adRate');
    adRateInput.disabled = !adEnabled;
    if (!adEnabled) {
        adRateInput.value = '';
    }
}

// 현재 UI에서 선택된 최종 목적지 국가 코드 가져오기
function getSelectedDestination() {
    if (currentServiceType === 'standard') {
        const primary = document.getElementById('destinationPrimary').value;
        if (primary === 'EU_GROUP') {
            return document.getElementById('destinationSecondary').value || 'DE';
        }
        return primary;
    } else {
        return document.getElementById('zoneSecondary').value;
    }
}

// 국가 코드로 Express Zone 찾기
function findZoneByCountryCode(countryCode) {
    if (!egsRatesData || !egsRatesData.expressZones || !countryCode) return null;

    for (const [zone, countries] of Object.entries(egsRatesData.expressZones)) {
        if (countries.some(c => c.code && c.code.toUpperCase() === countryCode.toUpperCase())) {
            return zone;
        }
    }
    return null;
}

function calculateEgsShipping(targetWeight, destinationCode) {
    if (!egsRatesData) return 0;

    let rates;
    let service = currentServiceType;
    let lookupKey = destinationCode;

    if (service === 'express') {
        const zone = findZoneByCountryCode(destinationCode);
        if (!zone) {
            alert(`[Express] '${destinationCode}' 국가의 Zone 정보를 찾을 수 없습니다. 운임표를 확인해주세요.`);
            return 0;
        }
        lookupKey = zone;
    }
    
    if (!egsRatesData[service] || !egsRatesData[service][lookupKey]) return 0;

    rates = egsRatesData[service][lookupKey];
    if (!rates || rates.length === 0) return 0;

    const sortedRates = [...rates].sort((a, b) => a.weight - b.weight);

    const exactMatch = sortedRates.find(rate => rate.weight === targetWeight);
    if (exactMatch) return exactMatch.price;
    
    const nextHigher = sortedRates.find(rate => rate.weight > targetWeight);
    if (nextHigher) return nextHigher.price;

    const lastRate = sortedRates[sortedRates.length - 1];
    return (targetWeight > lastRate.weight) ? lastRate.price : 0;
}

function calculateebayFee(sellingPriceUSD, category, hasStore) {
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

function findTargetSellingPrice(totalCostUSD, targetMarginRate, category, hasStore, isKoreanSeller, adRate) {
    let low = totalCostUSD;
    let high = totalCostUSD * 5;
    let bestPrice = high;

    for (let i = 0; i < 50; i++) {
        const midPrice = (low + high) / 2;
        const ebayFeeBreakdown = calculateebayFee(midPrice, category, hasStore);
        const vat = isKoreanSeller ? ebayFeeBreakdown.total * 0.1 : 0;
        const adCost = adRate > 0 ? midPrice * (adRate / 100) : 0;
        const ebayTotalFee = ebayFeeBreakdown.total + vat + adCost;
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

function calculateMargin() {
    if (!egsRatesData) {
        alert('⚠️ 운임표를 먼저 업로드해주세요!');
        return;
    }

    const destination = getSelectedDestination();

    const productCost = document.getElementById('productCost').value;
    const category = document.getElementById('category').value;
    const weight = document.getElementById('weight').value;
    const targetMargin = document.getElementById('targetMargin').value;

    if (!productCost || !destination || !category || !weight || !targetMargin) {
		alert('모든 필수 항목을 입력해주세요. (목적지 국가 선택 포함)');
        return;
    }

    const supplierShipping = parseFloat(document.getElementById('supplierShipping').value) || 0;
    const egsShipping = parseFloat(document.getElementById('egsShipping').value) || 3400;
    const storeType = document.getElementById('storeType').value;
    const isKoreanSeller = document.getElementById('isKoreanSeller').value === 'true';
    
    const adEnabled = document.getElementById('adEnabled').checked;
    const adRate = adEnabled ? (parseFloat(document.getElementById('adRate').value) || 0) : 0;

    const finalWeight = getFinalWeight();
    const egsShippingCost = calculateEgsShipping(finalWeight, destination);
    
    // country-data.js 활용으로 통합
    const destinationName = ENGLISH_TO_KOREAN_MAP[getCountryName(destination)] || 
                            getCountryName(destination) || 
                            (findZoneByCountryCode(destination) ? 
                             `Zone ${findZoneByCountryCode(destination)}` : 
                             destination);

    if (egsShippingCost === 0 && finalWeight > 0) {
        alert(`⚠️ ${destinationName} (${finalWeight.toFixed(2)}kg)에 대한 배송비 정보가 없습니다. 운임표를 확인해주세요.`);
        return;
    }

    const totalCostKRW = parseFloat(productCost) + supplierShipping + egsShipping + egsShippingCost;
    const totalCostUSD = totalCostKRW / currentExchangeRate;
    const hasStore = storeType !== 'none';
    const targetMarginRate = parseFloat(targetMargin);

    const requiredSellingPriceUSD = findTargetSellingPrice(totalCostUSD, targetMarginRate, category, hasStore, isKoreanSeller, adRate);
    const ebayFeeBreakdown = calculateebayFee(requiredSellingPriceUSD, category, hasStore);
    
    const vatUSD = isKoreanSeller ? ebayFeeBreakdown.total * 0.1 : 0;
    const adCostUSD = adRate > 0 ? requiredSellingPriceUSD * (adRate / 100) : 0;
    const ebayTotalFee = ebayFeeBreakdown.total + vatUSD + adCostUSD;
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
        adEnabled,
        adRate,
        adCostUSD,
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

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeResultModal();
    }
});

document.addEventListener('click', function(event) {
    const modal = document.getElementById('resultModal');
    if (event.target === modal) {
        closeResultModal();
    }
});

function displayResultsInModal(results) {
    const modalContent = document.getElementById('modalResultContent');

    const serviceTypeText = results.serviceType === 'express' 
        ? '⚡ eGS Express' 
        : '🚛 eGS Standard';
    
    const adStepHTML = results.adEnabled && results.adRate > 0 ? `
        <div class="flow-arrow">→</div>
        <div class="flow-step">
            <div class="flow-step-header">📢 광고비</div>
            <div class="flow-step-content">
                <div class="flow-value main">
                    <span>광고비 (${results.adRate}%)</span>
                    <span class="value-number red">-$${results.adCostUSD.toFixed(2)}</span>
                </div>
            </div>
        </div>
    ` : '';
    
    const modalHTML = `
        <div class="horizontal-flow">
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
                    <div class="flow-value total">
                        <span>총 수수료</span>
                        <span class="value-number red">-$${(results.ebayFeeBreakdown.total + results.vatUSD).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            ${adStepHTML}

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

        <div class="settings-info-section">
            <div class="settings-info-header">⚙️ 계산 설정 정보</div>
            <div class="settings-grid">
                <div class="setting-item">
                    <span class="setting-label">목적지:</span>
                    <span class="setting-value">${ENGLISH_TO_KOREAN_MAP[getCountryName(results.destination)] || getCountryName(results.destination)}</span>
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
                ${results.adEnabled ? `
                <div class="setting-item">
                    <span class="setting-label">광고:</span>
                    <span class="setting-value">적용 (${results.adRate}%)</span>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    modalContent.innerHTML = modalHTML;
    openResultModal();
}

// =========================================
// 💾 설정 저장/불러오기 기능
// =========================================

function saveCalculatorSettings() {
    const settings = {
        serviceType: currentServiceType,
        destinationPrimary: document.getElementById('destinationPrimary').value,
        destinationSecondary: document.getElementById('destinationSecondary').value,
        zonePrimary: document.getElementById('zonePrimary').value,
        zoneSecondary: document.getElementById('zoneSecondary').value,
        category: document.getElementById('category').value,
        storeType: document.getElementById('storeType').value,
        isKoreanSeller: document.getElementById('isKoreanSeller').value,
        targetMargin: document.getElementById('targetMargin').value,
        adEnabled: document.getElementById('adEnabled').checked,
        adRate: document.getElementById('adRate').value
    };

    localStorage.setItem('ebayCalculatorSettings', JSON.stringify(settings));
    showToast('설정이 저장되었습니다');
}

function loadCalculatorSettings() {
    const savedSettings = localStorage.getItem('ebayCalculatorSettings');
    if (!savedSettings) return;

    try {
        const settings = JSON.parse(savedSettings);
        
        // 배송 서비스 타입 복원
        if (settings.serviceType) {
            toggleServiceType(settings.serviceType);
        }
        
        // Standard 배송 설정 복원
        if (settings.destinationPrimary) {
            document.getElementById('destinationPrimary').value = settings.destinationPrimary;
            if (settings.destinationPrimary === 'EU_GROUP' && settings.destinationSecondary) {
                document.getElementById('destinationSecondary').disabled = false;
                document.getElementById('destinationSecondary').value = settings.destinationSecondary;
            }
        }
        
        // Express 배송 설정 복원
        if (settings.zonePrimary) {
            document.getElementById('zonePrimary').value = settings.zonePrimary;
            // Zone 선택 시 국가 목록 업데이트
            const event = new Event('change');
            document.getElementById('zonePrimary').dispatchEvent(event);
            
            // 국가 드롭다운이 채워진 후 선택
            setTimeout(() => {
                if (settings.zoneSecondary) {
                    document.getElementById('zoneSecondary').value = settings.zoneSecondary;
                }
            }, 100);
        }
        
        // 기타 설정 복원
        if (settings.category) {
            document.getElementById('category').value = settings.category;
        }
        if (settings.storeType) {
            document.getElementById('storeType').value = settings.storeType;
        }
        if (settings.isKoreanSeller) {
            document.getElementById('isKoreanSeller').value = settings.isKoreanSeller;
        }
        if (settings.targetMargin) {
            document.getElementById('targetMargin').value = settings.targetMargin;
        }
        
        // 광고 설정 복원
        document.getElementById('adEnabled').checked = settings.adEnabled || false;
        if (settings.adEnabled && settings.adRate) {
            document.getElementById('adRate').disabled = false;
            document.getElementById('adRate').value = settings.adRate;
        }
    } catch (error) {
        console.error('설정 불러오기 오류:', error);
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
