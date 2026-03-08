// js/sales-price-adjustment.js

// 전역 변수: 넘어온 마진 계산 결과를 저장
let salesPriceAdjustmentData = null;
let lastLoadedResultsJson = null; // 마지막으로 로드된 결과의 JSON 문자열

document.addEventListener('DOMContentLoaded', () => {
    // 탭이 활성화될 때마다 결과 로드
    // MutationObserver를 사용하여 #salesPriceAdjustment 탭의 활성화/비활성화 감지
    const salesPriceAdjustmentTab = document.getElementById('salesPriceAdjustment');
    if (salesPriceAdjustmentTab) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const isActive = salesPriceAdjustmentTab.classList.contains('active');
                    if (isActive) {
                        loadSalesPriceAdjustmentResults();
                    }
                }
            });
        });
        observer.observe(salesPriceAdjustmentTab, { attributes: true });
    }
});


function loadSalesPriceAdjustmentResults() {
    const resultsContainer = document.getElementById('sales-price-adjustment-results-container');

    const storedResults = sessionStorage.getItem('lastCalculationResults');
    if (!storedResults) {
        resultsContainer.innerHTML = '<div class="no-data-message"><p>마진 계산기에서 \'판매가 보정 넘기기\' 버튼을 눌러주세요.</p></div>';
        return;
    }

    // 이미 로드된 결과와 동일한지 확인 (탭 전환 시 재로드 방지)
    if (lastLoadedResultsJson === storedResults) {
        return; // 동일한 데이터면 다시 로드하지 않음
    }

    const results = JSON.parse(storedResults);

    // 전역 변수에 저장
    salesPriceAdjustmentData = results;
    lastLoadedResultsJson = storedResults;

    // 요약 카드 형태로 결과 HTML 생성
    const summaryHTML = createSummaryCard(results, 'before');
    const detailsHTML = createDetailedFlow(results);

    const resultHTML = `
        <div class="comparison-container">
            <div class="summary-card before" id="beforeCard">
                ${summaryHTML}
            </div>
        </div>

        <button class="toggle-details-btn unified" onclick="toggleAllDetails()">
            <span id="unifiedToggleText">▼ 상세보기</span>
        </button>

        <div class="details-accordion" id="unifiedDetails">
            <div class="unified-details-wrapper">
                <div class="detail-column-wrapper">
                    <div class="detail-column before">
                        <div class="detail-column-header">📊 보정 전</div>
                        ${detailsHTML}
                    </div>
                </div>
            </div>
        </div>
    `;

    resultsContainer.innerHTML = resultHTML;

    // 배송 정보 영역 추가
    addShippingInfoSections(results);
}

// 배송 정보 영역 추가 함수
function addShippingInfoSections(results) {
    const resultsContainer = document.getElementById('sales-price-adjustment-results-container');

    // 목적지 국가명 가져오기
    const destinationName = getDestinationDisplayName(results);
    const serviceTypeName = getServiceTypeDisplayName(results.serviceType);

    const shippingInfoHTML = `
        <div class="shipping-info-container">
            <!-- 왼쪽: 목적지 배송 정보 -->
            <div class="shipping-info-section destination">
                <div class="shipping-info-header">📍 목적지 배송 정보</div>
                <div class="info-row">
                    <span class="info-label">목적지 국가</span>
                    <span class="info-value">${destinationName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">중량</span>
                    <span class="info-value">${results.finalWeight.toFixed(2)} kg</span>
                </div>
                <div class="info-row">
                    <span class="info-label">배송 타입</span>
                    <span class="info-value">${serviceTypeName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">국제 배송비</span>
                    <span class="info-value">${Math.round(results.egsInternationalShipping).toLocaleString()}원</span>
                </div>
            </div>

            <!-- 오른쪽: 리스팅 배송 정보 -->
            <div class="shipping-info-section listing">
                <div class="shipping-info-header">🛒 리스팅 배송 정보</div>
                <div class="form-group" style="margin-bottom: 16px;">
                    <label for="listingCountry" style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">리스팅 국가</label>
                    <select id="listingCountry" class="listing-select" style="width: 100%; padding: 10px; border: 2px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                        <option value="">선택하세요</option>
                        <option value="US">미국 (US)</option>
                        <option value="CA">캐나다 (CA)</option>
                        <option value="GB">영국 (GB)</option>
                        <option value="AU">호주 (AU)</option>
                        <option value="DE">독일 (DE)</option>
                        <option value="FR">프랑스 (FR)</option>
                        <option value="IT">이탈리아 (IT)</option>
                        <option value="ES">스페인 (ES)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="listingShippingType" style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">배송 타입</label>
                    <select id="listingShippingType" class="listing-select" style="width: 100%; padding: 10px; border: 2px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                        <option value="">선택하세요</option>
                        <option value="standard">Standard</option>
                        <option value="express">Express</option>
                        <option value="ems">EMS</option>
                    </select>
                </div>
                <div class="form-group" id="listingTariffGroup" style="display: none; margin-top: 12px;">
                    <label for="listingTariffRate" style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">관세율 (%)</label>
                    <input type="number" id="listingTariffRate" step="0.1" placeholder="예: 10" style="width: 100%; padding: 10px; border: 2px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
                    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">미국 리스팅 시 적용할 관세율을 입력하세요.</div>
                </div>
            </div>
        </div>
    `;

    resultsContainer.insertAdjacentHTML('beforeend', shippingInfoHTML);

    // 리스팅 국가 변경 시 관세 입력 영역 표시/숨김
    const listingCountryEl = document.getElementById('listingCountry');
    if (listingCountryEl) {
        listingCountryEl.addEventListener('change', function() {
            const tariffGroup = document.getElementById('listingTariffGroup');
            if (this.value === 'US') {
                tariffGroup.style.display = 'block';
            } else {
                tariffGroup.style.display = 'none';
                document.getElementById('listingTariffRate').value = '';
            }
        });
    }

    // 배송비 보정 버튼 추가
    const buttonHTML = `
        <button class="adjust-shipping-btn" onclick="adjustShippingCost()">
            🔄 배송비 보정
        </button>
    `;
    resultsContainer.insertAdjacentHTML('beforeend', buttonHTML);
}

// 목적지 표시 이름 가져오기
function getDestinationDisplayName(results) {
    const code = results.destination;

    // getCountryName 함수가 있으면 사용
    if (typeof getCountryName === 'function') {
        const koreanName = getCountryName(code);
        if (koreanName && koreanName !== code) {
            return `${koreanName} (${code})`;
        }
    }

    // COUNTRY_DATA가 있으면 사용
    if (typeof COUNTRY_DATA !== 'undefined' && COUNTRY_DATA[code]) {
        return `${COUNTRY_DATA[code].nameKo} (${code})`;
    }

    return code;
}

// 배송 타입 표시 이름 가져오기
function getServiceTypeDisplayName(serviceType) {
    const typeMap = {
        'standard': '🚛 Standard',
        'express': '✈️ Express',
        'ems': '🚀 EMS'
    };
    return typeMap[serviceType] || serviceType;
}

// 요약 카드 HTML 생성
function createSummaryCard(results, type) {
    const titleIcon = type === 'before' ? '📊' : '🎨';
    const titleText = type === 'before' ? '보정 전' : '보정 후';
    const highlightClass = type === 'before' ? 'highlight' : 'after-highlight';

    // 보정 후 카드일 경우 배송비 차액 정보 추가
    let shippingDifferenceInfo = '';
    if (type === 'after' && results.shippingCostDifference !== undefined) {
        const originalShipping = results.egsInternationalShipping - results.shippingCostDifference;
        shippingDifferenceInfo = `
            <span style="font-size: 12px; color: #6b7280; margin-left: 8px;">
                (${Math.round(results.egsInternationalShipping).toLocaleString()}원 - ${Math.round(originalShipping).toLocaleString()}원 = ${Math.round(results.shippingCostDifference).toLocaleString()}원 / $${Math.abs(results.shippingCostDifferenceUSD).toFixed(2)})
            </span>
        `;
    }

    // 보정 후 카드일 경우 취소선 표시
    const priceDisplayFree = type === 'after' && results.requiredSellingPriceBeforeAdjustmentUSD !== undefined
        ? `<span style="text-decoration: line-through; color: #9ca3af; margin-right: 8px;">$${results.requiredSellingPriceBeforeAdjustmentUSD.toFixed(2)}</span> $${results.requiredSellingPriceUSD.toFixed(2)}`
        : `$${results.requiredSellingPriceUSD.toFixed(2)}`;

    const priceDisplayPaid = type === 'after' && results.requiredSellingPriceBeforeAdjustmentUSD !== undefined
        ? `<span style="text-decoration: line-through; color: #9ca3af; margin-right: 8px;">$${(results.requiredSellingPriceBeforeAdjustmentUSD - (results.egsInternationalShipping / currentExchangeRate)).toFixed(2)}</span> $${(results.requiredSellingPriceUSD - (results.egsInternationalShipping / currentExchangeRate)).toFixed(2)}`
        : `$${(results.requiredSellingPriceUSD - (results.egsInternationalShipping / currentExchangeRate)).toFixed(2)}`;

    return `
        <div class="summary-card-header">
            <span>${titleIcon} ${titleText}</span>
            ${shippingDifferenceInfo}
        </div>
        <div class="summary-stats">
            <div class="summary-stat ${highlightClass}">
                <span class="stat-label">권장 판매가 (무료)</span>
                <span class="stat-value large blue">${priceDisplayFree}</span>
            </div>
            <div class="summary-stat">
                <span class="stat-label">권장 판매가 (유료)</span>
                <span class="stat-value orange">${priceDisplayPaid}</span>
            </div>
            ${results.serviceType === 'ems' && results.emsSurcharge > 0 ? `
            <div class="summary-stat">
                <span class="stat-label">EMS 할증료</span>
                <span class="stat-value red">-${Math.round(results.emsSurcharge).toLocaleString()}원</span>
            </div>
            ` : ''}
            ${results.applyTariff && results.tariffCostUSD > 0 ? `
            <div class="summary-stat">
                <span class="stat-label">관세 포함 판매가</span>
                <span class="stat-value blue">$${(results.requiredSellingPriceUSD + results.tariffCostUSD).toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="summary-stat ${highlightClass}">
                <span class="stat-label">순수익</span>
                <span class="stat-value ${results.netProfitKRW >= 0 ? 'green' : 'red'}">
                    ${results.netProfitKRW >= 0 ? '+' : ''}${Math.round(results.netProfitKRW).toLocaleString()}원
                </span>
            </div>
            <div class="summary-stat ${highlightClass}">
                <span class="stat-label">마진율</span>
                <span class="stat-value ${results.actualMarginRate >= results.targetMarginRate ? 'green' : 'orange'}">
                    ${results.actualMarginRate.toFixed(2)}%
                </span>
            </div>
        </div>
    `;
}

// 상세 flow HTML 생성 (openResultModal과 동일한 구조)
function createDetailedFlow(results) {
    // 보정 후일 경우 표시할 권장 판매가 결정 (배송비 차액 반영 전)
    const displaySellingPriceUSD = results.requiredSellingPriceBeforeAdjustmentUSD !== undefined
        ? results.requiredSellingPriceBeforeAdjustmentUSD
        : results.requiredSellingPriceUSD;

    // 보정 후일 경우 국제 배송비를 "목적지 배송비 - 차액" 형태로 표시
    let shippingDisplay;
    if (results.shippingCostDifference !== undefined) {
        const originalShipping = results.egsInternationalShipping - results.shippingCostDifference;
        shippingDisplay = `${Math.round(originalShipping).toLocaleString()}원 - ${Math.round(Math.abs(results.shippingCostDifference)).toLocaleString()}원`;
    } else {
        shippingDisplay = `${Math.round(results.egsInternationalShipping).toLocaleString()}원`;
    }

    // ebay 수수료 합계 (광고비 포함)
    const ebayTotalDisplayUSD = results.ebayFeeBreakdown.total + results.vatUSD + (results.adCostUSD || 0);

    return `
        <div class="horizontal-flow" style="margin-top: 20px;">

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
                        <span class="value-number blue">$${(displaySellingPriceUSD + results.tariffCostUSD).toFixed(2)}</span>
                    </div>
                    <div class="flow-value main" style="margin-top: 4px;">
                        <span>관세 포함 판매가 (유료)</span>
                        <span class="value-number orange">$${(displaySellingPriceUSD - (results.egsInternationalShipping / currentExchangeRate) + results.tariffCostUSD).toFixed(2)}</span>
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
                        <span class="value-number blue">$${displaySellingPriceUSD.toFixed(2)}</span>
                    </div>
                    <div class="flow-value main" style="margin-top: 8px;">
                        <span>권장 판매가 (유료)</span>
                        <span class="value-number orange">$${(displaySellingPriceUSD - (results.egsInternationalShipping / currentExchangeRate)).toFixed(2)}</span>
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
                        <span class="value-number red">-${shippingDisplay}</span>
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
}

// 상세보기 토글 함수 (통합)
function toggleAllDetails() {
    const details = document.getElementById('unifiedDetails');
    const toggleText = document.getElementById('unifiedToggleText');
    const toggleBtn = document.querySelector('.toggle-details-btn.unified');

    if (details.classList.contains('expanded')) {
        details.classList.remove('expanded');
        toggleBtn.classList.remove('expanded');
        toggleText.textContent = '▼ 상세보기';
    } else {
        details.classList.add('expanded');
        toggleBtn.classList.add('expanded');
        toggleText.textContent = '▲ 접기';
    }
}

// 배송비 보정 메인 함수
function adjustShippingCost() {
    // 리스팅 국가 및 배송 타입 가져오기
    const listingCountry = document.getElementById('listingCountry').value;
    const listingShippingType = document.getElementById('listingShippingType').value;

    if (!listingCountry || !listingShippingType) {
        alert('⚠️ 리스팅 국가와 배송 타입을 모두 선택해주세요.');
        return;
    }

    if (!salesPriceAdjustmentData) {
        alert('⚠️ 마진 계산 결과 데이터가 없습니다.');
        return;
    }

    if (!egsRatesData) {
        alert('⚠️ eGS 운임표 데이터가 없습니다.');
        return;
    }

    // 새로운 배송비 조회
    const newShippingCost = getNewShippingCost(
        listingCountry,
        listingShippingType,
        salesPriceAdjustmentData.finalWeight
    );

    if (newShippingCost === null) {
        return; // 에러 메시지는 getNewShippingCost 내부에서 처리
    }

    // 마진 재계산
    const adjustedResults = recalculateMargin(salesPriceAdjustmentData, newShippingCost, listingCountry, listingShippingType);

    // 보정 후 결과 출력
    displayAdjustedResults(adjustedResults);
}

// 국가 코드로 EMS Zone 찾기
function findEmsZoneByCountryCode(countryCode) {
    if (!egsRatesData || !egsRatesData.ems || !countryCode) return null;

    // convertCountryData 함수를 사용하여 국가 코드 → 한글명 변환
    if (typeof convertCountryData === 'function') {
        const koreanName = convertCountryData(countryCode, 'nameKo');
        if (koreanName && egsRatesData.ems[koreanName]) {
            return koreanName;
        }

        // 한글명으로 찾지 못하면 영문명으로도 시도
        const englishName = convertCountryData(countryCode, 'nameEn');
        if (englishName && egsRatesData.ems[englishName]) {
            return englishName;
        }
    }

    // convertCountryData 함수가 없거나 실패한 경우, 실제 EMS 데이터에서 직접 검색
    const upperCode = countryCode.toUpperCase();
    for (const zone of Object.keys(egsRatesData.ems)) {
        if (zone.toUpperCase() === upperCode ||
            zone.toUpperCase().includes(upperCode)) {
            return zone;
        }
    }

    return null;
}

// 새로운 배송비 조회
function getNewShippingCost(countryCode, serviceType, weight) {
    let rates;
    let lookupKey = countryCode;

    if (serviceType === 'express') {
        // Express의 경우 국가 코드로 Zone 찾기
        const zone = findZoneByCountryCode(countryCode);
        if (!zone) {
            alert(`⚠️ [Express] '${countryCode}' 국가의 Zone 정보를 찾을 수 없습니다.`);
            return null;
        }
        lookupKey = zone;
    } else if (serviceType === 'ems') {
        // EMS의 경우 국가 코드로 Zone 이름 찾기
        const zone = findEmsZoneByCountryCode(countryCode);
        if (!zone) {
            alert(`⚠️ [EMS] '${countryCode}' 국가의 배송비 정보를 찾을 수 없습니다.`);
            return null;
        }
        lookupKey = zone;
    }

    if (!egsRatesData[serviceType] || !egsRatesData[serviceType][lookupKey]) {
        alert(`⚠️ [${serviceType.toUpperCase()}] '${countryCode}' 국가의 배송비 정보를 찾을 수 없습니다.`);
        return null;
    }

    rates = egsRatesData[serviceType][lookupKey];
    if (!rates || rates.length === 0) {
        alert('⚠️ 운임표 데이터가 비어있습니다.');
        return null;
    }

    const sortedRates = [...rates].sort((a, b) => a.weight - b.weight);

    // 정확한 중량 찾기
    const exactMatch = sortedRates.find(rate => rate.weight === weight);
    if (exactMatch) return exactMatch.price;

    // 더 높은 중량 찾기
    const nextHigher = sortedRates.find(rate => rate.weight > weight);
    if (nextHigher) return nextHigher.price;

    // 마지막 중량보다 크면 마지막 가격 반환
    const lastRate = sortedRates[sortedRates.length - 1];
    return (weight > lastRate.weight) ? lastRate.price : 0;
}

// 마진 재계산
function recalculateMargin(originalData, newShippingCost, newDestination, newServiceType) {
    // 보정 후 EMS 할증료 계산
    let newEmsSurcharge = 0;
    if (newServiceType === 'ems' && egsRatesData && egsRatesData.emsSurchargeRates) {
        const surchargePerKg = egsRatesData.emsSurchargeRates[newDestination] || 0;
        if (surchargePerKg > 0) {
            const roundedWeight = Math.ceil(originalData.finalWeight / 0.25) * 0.25;
            newEmsSurcharge = roundedWeight * surchargePerKg;
        }
    }
    const oldEmsSurcharge = originalData.emsSurcharge || 0;
    const emsSurchargeDifference = newEmsSurcharge - oldEmsSurcharge; // KRW
    const emsSurchargeDifferenceUSD = emsSurchargeDifference / currentExchangeRate;

    // 보정 후 관세율 결정 (리스팅 국가가 미국일 때 관세 입력 필드에서 읽기)
    let newTariffRate = 0;
    if (newDestination === 'US') {
        const listingTariffRateEl = document.getElementById('listingTariffRate');
        if (listingTariffRateEl && listingTariffRateEl.value) {
            newTariffRate = parseFloat(listingTariffRateEl.value) || 0;
        }
    }

    // 새로운 기본 원가 계산 (국제 배송비 + 할증료 포함, 관세 제외)
    const baseCostKRW =
        originalData.productCost +
        originalData.supplierShipping +
        originalData.packagingCost +
        originalData.egsShipping +
        newShippingCost +
        newEmsSurcharge;

    const totalCostUSD = baseCostKRW / currentExchangeRate;

    // findTargetSellingPrice 함수 재사용 (관세 이진탐색 포함)
    const requiredSellingPriceBeforeAdjustmentUSD = findTargetSellingPrice(
        totalCostUSD,
        originalData.targetMarginRate,
        originalData.category,
        originalData.hasStore,
        originalData.isKoreanSeller,
        originalData.adRate,
        newTariffRate
    );

    // eBay 수수료 계산
    const ebayFeeBreakdown = calculateebayFee(
        requiredSellingPriceBeforeAdjustmentUSD,
        originalData.category,
        originalData.hasStore
    );

    const vatUSD = originalData.isKoreanSeller ? ebayFeeBreakdown.total * 0.1 : 0;
    const adCostUSD = originalData.adRate > 0 ? requiredSellingPriceBeforeAdjustmentUSD * (originalData.adRate / 100) : 0;
    const newTariffCostUSD = newTariffRate > 0 ? requiredSellingPriceBeforeAdjustmentUSD * (newTariffRate / 100) : 0;
    const ebayTotalFee = ebayFeeBreakdown.total + vatUSD + adCostUSD;

    // 배송비 차액 계산
    const shippingCostDifference = newShippingCost - originalData.egsInternationalShipping; // KRW
    const shippingCostDifferenceUSD = shippingCostDifference / currentExchangeRate;

    // eBay Payout 계산
    const ebayPayoutUSD = requiredSellingPriceBeforeAdjustmentUSD - ebayTotalFee;

    // 최종 권장 판매가 = 배송비 차액 + 할증료 차액 반영
    const requiredSellingPriceUSD = requiredSellingPriceBeforeAdjustmentUSD
        - shippingCostDifferenceUSD
        - emsSurchargeDifferenceUSD;

    // Payoneer 수수료 재계산
    const payoneerWithdrawalFee = ebayPayoutUSD > 1.0 ? 1.0 : 0;
    const payoneerExchangeFee = ebayPayoutUSD * 0.012;
    const payoneerTotalFee = payoneerWithdrawalFee + payoneerExchangeFee;

    const finalReceiveUSD = ebayPayoutUSD - payoneerTotalFee;
    const finalReceiveKRW = finalReceiveUSD * currentExchangeRate;
    const newTotalCostKRW = baseCostKRW;
    const netProfitKRW = finalReceiveKRW - newTotalCostKRW;
    const actualMarginRate = requiredSellingPriceUSD > 0 ? (netProfitKRW / (requiredSellingPriceUSD * currentExchangeRate)) * 100 : 0;

    // 결과 객체 반환
    return {
        ...originalData,
        destination: newDestination,
        serviceType: newServiceType,
        egsInternationalShipping: newShippingCost,
        emsSurcharge: newEmsSurcharge,
        emsSurchargeDifference,
        applyTariff: newTariffRate > 0,
        tariffRate: newTariffRate,
        tariffCostUSD: newTariffCostUSD,
        totalCostKRW: newTotalCostKRW,
        requiredSellingPriceUSD,
        requiredSellingPriceBeforeAdjustmentUSD, // 취소선 표시용
        shippingCostDifference, // 배송비 차액 (KRW)
        shippingCostDifferenceUSD, // 배송비 차액 (USD)
        ebayFeeBreakdown,
        vatUSD,
        adCostUSD,
        ebayTotalFee,
        ebayPayoutUSD,
        payoneerWithdrawalFee,
        payoneerExchangeFee,
        payoneerTotalFee,
        finalReceiveUSD,
        finalReceiveKRW,
        netProfitKRW,
        actualMarginRate
    };
}

// 보정 후 결과 출력
function displayAdjustedResults(results) {
    // 기존 보정 후 카드가 있으면 제거
    const existingAfterCard = document.getElementById('afterCard');
    if (existingAfterCard) {
        existingAfterCard.remove();
    }

    // 기존 보정 후 컬럼 래퍼가 있으면 제거
    const existingAfterColumnWrapper = document.getElementById('afterColumnWrapper');
    if (existingAfterColumnWrapper) {
        existingAfterColumnWrapper.remove();
    }

    const summaryHTML = createSummaryCard(results, 'after');
    const detailsHTML = createDetailedFlow(results);

    const afterCardHTML = `
        <div class="summary-card after" id="afterCard">
            ${summaryHTML}
        </div>
    `;

    const afterColumnHTML = `
        <div class="detail-column-wrapper" id="afterColumnWrapper">
            <div class="detail-column after">
                <div class="detail-column-header">🎨 보정 후</div>
                ${detailsHTML}
            </div>
        </div>
    `;

    // comparison-container에 카드 추가
    const comparisonContainer = document.querySelector('.comparison-container');
    if (comparisonContainer) {
        comparisonContainer.insertAdjacentHTML('beforeend', afterCardHTML);
    }

    // unified-details-wrapper에 컬럼 래퍼 추가
    const detailsWrapper = document.querySelector('.unified-details-wrapper');
    if (detailsWrapper) {
        detailsWrapper.insertAdjacentHTML('beforeend', afterColumnHTML);
    }
}
