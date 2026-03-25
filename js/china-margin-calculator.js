// js/china-margin-calculator.js

let lastChinaCalculationResults = null;

// =========================================
// 입력 UI 제어
// =========================================

function toggleChinaAdInput() {
    const adEnabled = document.getElementById('cn_adEnabled').checked;
    const adRateInput = document.getElementById('cn_adRate');
    adRateInput.disabled = !adEnabled;
    if (!adEnabled) {
        adRateInput.value = '';
    }
}

// CNY → USD 실시간 환산 표시
function updateCnyToUsdDisplay() {
    const cnyCost = parseFloat(document.getElementById('cn_productCostCny').value) || 0;
    const displayEl = document.getElementById('cn_productCostUsdDisplay');
    if (!displayEl) return;

    if (cnyCost > 0 && currentCnyRate > 0 && currentExchangeRate > 0) {
        const usd = (cnyCost * currentCnyRate) / currentExchangeRate;
        displayEl.value = `$${usd.toFixed(2)}`;
    } else {
        displayEl.value = '$0.00';
    }
}

// 배송비 → 부가세(10%) 자동 계산
function autoFillShippingVat() {
    const shipping = parseFloat(document.getElementById('cn_shippingCost').value) || 0;
    const vatInput = document.getElementById('cn_shippingVat');
    vatInput.value = (shipping * 0.10).toFixed(2);
}

// =========================================
// 메인 계산 함수
// =========================================

function calculateChinaMargin() {
    const productCostCny = document.getElementById('cn_productCostCny').value;
    const category = document.getElementById('cn_category').value;
    const targetMargin = document.getElementById('cn_targetMargin').value;

    if (!productCostCny || !category || !targetMargin) {
        alert('모든 필수 항목을 입력해주세요. (제품 원가, 카테고리, 목표 마진율)');
        return;
    }

    const productCostCnyVal = parseFloat(productCostCny);
    const productCostUSD = (productCostCnyVal * currentCnyRate) / currentExchangeRate;
    const giftCostCny = parseFloat(document.getElementById('cn_giftCost').value) || 0;
    const giftCostUSD = (giftCostCny * currentCnyRate) / currentExchangeRate;
    const shippingCost = parseFloat(document.getElementById('cn_shippingCost').value) || 0;
    const shippingVat = parseFloat(document.getElementById('cn_shippingVat').value) || 0;
    const storeType = document.getElementById('cn_storeType').value;
    const isKoreanSeller = document.getElementById('cn_isKoreanSeller').value === 'true';
    const adEnabled = document.getElementById('cn_adEnabled').checked;
    const adRate = adEnabled ? (parseFloat(document.getElementById('cn_adRate').value) || 0) : 0;
    const targetMarginRate = parseFloat(targetMargin);
    const hasStore = storeType !== 'none';

    const totalCostUSD = productCostUSD + giftCostUSD + shippingCost + shippingVat;

    // findTargetSellingPrice, calculateebayFee는 margin-calculator.js에서 재사용
    const requiredSellingPriceUSD = findTargetSellingPrice(
        totalCostUSD,
        targetMarginRate,
        category,
        hasStore,
        isKoreanSeller,
        adRate,
        0 // tariffRate = 0
    );

    const ebayFeeBreakdown = calculateebayFee(requiredSellingPriceUSD, category, hasStore);
    const vatUSD = isKoreanSeller ? ebayFeeBreakdown.total * 0.1 : 0;
    const adCostUSD = adRate > 0 ? requiredSellingPriceUSD * (adRate / 100) : 0;
    const ebayTotalFee = ebayFeeBreakdown.total + vatUSD + adCostUSD;
    const ebayPayoutUSD = requiredSellingPriceUSD - ebayTotalFee;

    const payoneerWithdrawalFee = ebayPayoutUSD > 1.0 ? 1.00 : 0;
    const payoneerExchangeFee = ebayPayoutUSD * 0.012;
    const payoneerTotalFee = payoneerWithdrawalFee + payoneerExchangeFee;

    const finalReceiveUSD = ebayPayoutUSD - payoneerTotalFee;
    const netProfitUSD = finalReceiveUSD - totalCostUSD;
    const netProfitKRW = netProfitUSD * currentExchangeRate;
    const actualMarginRate = requiredSellingPriceUSD > 0 ? (netProfitUSD / requiredSellingPriceUSD) * 100 : 0;

    const results = {
        productCostCny: productCostCnyVal,
        productCostUSD,
        giftCostCny,
        giftCostUSD,
        shippingCostUSD: shippingCost,
        shippingVatUSD: shippingVat,
        totalCostUSD,
        category,
        hasStore,
        isKoreanSeller,
        adEnabled,
        adRate,
        adCostUSD,
        requiredSellingPriceUSD,
        ebayFeeBreakdown,
        vatUSD,
        ebayTotalFee,
        ebayPayoutUSD,
        payoneerWithdrawalFee,
        payoneerExchangeFee,
        payoneerTotalFee,
        finalReceiveUSD,
        netProfitUSD,
        netProfitKRW,
        actualMarginRate,
        targetMarginRate
    };

    displayChinaResultsInUI(results);
}

// =========================================
// 결과 UI 렌더링 (인라인 요약 카드)
// =========================================

function displayChinaResultsInUI(results) {
    lastChinaCalculationResults = results;

    const resultContent = document.getElementById('cn_result-ui-content');
    resultContent.classList.remove('result-placeholder-style');

    const resultHTML = `
        <div class="horizontal-flow summary-flow">
            <div class="flow-step">
                <div class="flow-step-header">💵 eBay 판매가</div>
                <div class="flow-step-content">
                    <div class="flow-value main">
                        <span>권장 판매가</span>
                        <span class="value-number blue">$${results.requiredSellingPriceUSD.toFixed(2)}</span>
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

    resultContent.innerHTML = resultHTML;

    const resultHeaderButtons = document.getElementById('cn_result-header-buttons');
    resultHeaderButtons.innerHTML = '';

    const viewDetailsButton = document.createElement('button');
    viewDetailsButton.className = 'button-sm';
    viewDetailsButton.textContent = '자세히 보기';
    viewDetailsButton.onclick = () => openChinaResultModal(lastChinaCalculationResults);
    resultHeaderButtons.appendChild(viewDetailsButton);
}

// =========================================
// 상세 결과 모달 (기존 resultModal 재사용)
// =========================================

function openChinaResultModal(results) {
    const modal = document.getElementById('resultModal');
    const modalContent = document.getElementById('modalResultContent');

    const ebayTotalDisplayUSD = results.ebayFeeBreakdown.total + results.vatUSD + (results.adCostUSD || 0);

    const resultHTML = `
        <div class="horizontal-flow">

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
                <div class="flow-step-header">💰 eBay 정산</div>
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
                        <span class="value-number green">${Math.round(results.finalReceiveUSD * currentExchangeRate).toLocaleString()}원</span>
                    </div>
                </div>
            </div>

            <div class="flow-arrow">→</div>

            <div class="flow-step">
                <div class="flow-step-header">📦 원가</div>
                <div class="flow-step-content">
                    <div class="flow-value small">
                        <span>제품 원가</span>
                        <span class="value-number red">¥${results.productCostCny.toFixed(2)} (≈ $${results.productCostUSD.toFixed(2)})</span>
                    </div>
                    ${results.giftCostCny > 0 ? `
                    <div class="flow-value small">
                        <span>사은품</span>
                        <span class="value-number red">¥${results.giftCostCny.toFixed(2)} (≈ $${results.giftCostUSD.toFixed(2)})</span>
                    </div>
                    ` : ''}
                    <div class="flow-value small">
                        <span>배송비</span>
                        <span class="value-number red">-$${results.shippingCostUSD.toFixed(2)}</span>
                    </div>
                    <div class="flow-value small">
                        <span>배송비 부가세</span>
                        <span class="value-number red">-$${results.shippingVatUSD.toFixed(2)}</span>
                    </div>
                    <div class="flow-value total">
                        <span>총 원가</span>
                        <span class="value-number red">-$${results.totalCostUSD.toFixed(2)}</span>
                    </div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 6px;">
                        ≈ ${Math.round(results.totalCostUSD * currentExchangeRate).toLocaleString()}원
                    </div>
                </div>
            </div>

            <div class="flow-arrow final">→</div>

            <div class="flow-step highlight">
                <div class="flow-step-header">🎯 최종 결과</div>
                <div class="flow-step-content">
                    <div class="flow-value main">
                        <span>순수익 (USD)</span>
                        <span class="value-number ${results.netProfitUSD >= 0 ? 'green' : 'red'}">
                            ${results.netProfitUSD >= 0 ? '+' : ''}$${results.netProfitUSD.toFixed(2)}
                        </span>
                    </div>
                    <div class="flow-value main">
                        <span>순수익 (KRW)</span>
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

// =========================================
// 설정 저장/불러오기
// =========================================

function saveChinaCalculatorSettings() {
    const settings = {
        category: document.getElementById('cn_category').value,
        storeType: document.getElementById('cn_storeType').value,
        isKoreanSeller: document.getElementById('cn_isKoreanSeller').value,
        targetMargin: document.getElementById('cn_targetMargin').value,
        adEnabled: document.getElementById('cn_adEnabled').checked,
        adRate: document.getElementById('cn_adRate').value
    };
    localStorage.setItem('chinaMarginCalculatorSettings', JSON.stringify(settings));
    if (typeof showToast === 'function') {
        showToast('설정이 저장되었습니다');
    }
}

function loadChinaCalculatorSettings() {
    const savedSettings = localStorage.getItem('chinaMarginCalculatorSettings');
    if (!savedSettings) return;

    try {
        const settings = JSON.parse(savedSettings);

        if (settings.category) document.getElementById('cn_category').value = settings.category;
        if (settings.storeType) document.getElementById('cn_storeType').value = settings.storeType;
        if (settings.isKoreanSeller) document.getElementById('cn_isKoreanSeller').value = settings.isKoreanSeller;
        if (settings.targetMargin) document.getElementById('cn_targetMargin').value = settings.targetMargin;

        document.getElementById('cn_adEnabled').checked = settings.adEnabled || false;
        if (settings.adEnabled && settings.adRate) {
            document.getElementById('cn_adRate').disabled = false;
            document.getElementById('cn_adRate').value = settings.adRate;
        }
    } catch (error) {
        console.error('중국 계산기 설정 불러오기 오류:', error);
    }
}

// =========================================
// 이벤트 리스너 초기화
// =========================================

window.addEventListener('DOMContentLoaded', function () {
    loadChinaCalculatorSettings();

    // CNY → USD 실시간 환산
    const cnyInput = document.getElementById('cn_productCostCny');
    if (cnyInput) {
        cnyInput.addEventListener('input', updateCnyToUsdDisplay);
    }

    // 배송비 → 부가세 자동 계산
    const shippingInput = document.getElementById('cn_shippingCost');
    if (shippingInput) {
        shippingInput.addEventListener('input', autoFillShippingVat);
    }
});
