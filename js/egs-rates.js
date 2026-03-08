// js/egs-rates.js

function openEgsSubTab(event, tabName) {
    const subtabContents = document.querySelectorAll('.egs-subtab-content');
    subtabContents.forEach(content => content.classList.remove('active'));

    const subtabLinks = document.querySelectorAll('.egs-subtab-link');
    subtabLinks.forEach(link => link.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');

    if (tabName === 'egsStandard') {
        renderStandardTable();
    } else if (tabName === 'egsExpress') {
        renderExpressTable();
    } else if (tabName === 'egsEms') {
        renderEmsTable();
    } else if (tabName === 'egsEmsSurcharge') {
        renderEmsSurchargeTable();
    }
}

function searchCountryRate() {
    const searchInput = document.getElementById('countrySearchInput').value.trim();

    if (!searchInput) {
        alert('국가명 또는 코드를 입력해주세요.');
        return;
    }

    if (!egsRatesData || !egsRatesData.standard) {
        showSearchResultModal('❌ 데이터 없음', '운임표 파일을 먼저 업로드해주세요.');
        return;
    }

    // convertCountryData 함수를 사용하여 국가 코드 찾기
    let countryCode = null;
    if (typeof convertCountryData === 'function') {
        countryCode = convertCountryData(searchInput, 'code');
    } else {
        // fallback: 직접 대문자 변환하여 시도
        countryCode = searchInput.toUpperCase();
    }

    // Standard 데이터에 해당 국가 코드가 있는지 확인
    if (!countryCode || !egsRatesData.standard[countryCode]) {
        const availableCountries = Object.keys(egsRatesData.standard).sort();
        const countryList = availableCountries.map(code => {
            const name = getCountryName(code);
            return name !== code ? `${name}(${code})` : code;
        }).join(', ');

        showSearchResultModal(
            '❌ 검색 결과 없음',
            `"${searchInput}"에 해당하는 국가 데이터가 없습니다.<br><br>` +
            `<strong>현재 데이터에 포함된 국가:</strong><br>${countryList}`
        );
        return;
    }

    const countryData = egsRatesData.standard[countryCode];
    showCountryRateTable(countryCode, countryData, 'Standard');
}

// ✅ 수정된 searchExpressCountryRate 함수
function searchExpressCountryRate() {
    const searchInput = document.getElementById('expressCountrySearchInput').value.trim();
    const originalInput = searchInput;
    
    if (!searchInput) {
        alert('국가명 또는 코드를 입력해주세요.');
        return;
    }
    
    if (!egsRatesData || !egsRatesData.express) {
        showSearchResultModal('❌ 데이터 없음', '운임표 파일을 먼저 업로드해주세요.');
        return;
    }
    
    // 1단계: 국가 코드로 직접 검색
    let countryData = findCountryByCode(searchInput);
    
    // 2단계: 국가명으로 검색
    if (!countryData) {
        countryData = findCountryByName(searchInput);
    }
    
    if (!countryData) {
        showSearchResultModal(
            '❌ 검색 결과 없음', 
            `"${originalInput}"에 해당하는 국가를 찾을 수 없습니다.<br><br>` +
            `💡 검색 방법:<br>` +
            `- 국가 코드: US, CA, GB, KR<br>` +
            `- 한글명: 미국, 캐나다, 영국, 대한민국<br>` +
            `- 영문명: United States, Canada, United Kingdom`
        );
        return;
    }
    
    // Zone 데이터 확인
    if (!egsRatesData.express[countryData.zone]) {
        showSearchResultModal(
            '❌ 운임 데이터 없음',
            `"${countryData.nameKo} (${countryData.code})"의 Zone ${countryData.zone} 운임 데이터가 없습니다.`
        );
        return;
    }
    
    showZoneRateTable(countryData.zone, `${countryData.nameKo} (${countryData.code})`);
}

function searchEmsCountryRate() {
    const searchInput = document.getElementById('emsCountrySearchInput').value.trim();
    const originalInput = searchInput;

    if (!searchInput) {
        alert('국가명을 입력해주세요.');
        return;
    }

    if (!egsRatesData || !egsRatesData.ems) {
        showSearchResultModal('❌ 데이터 없음', '운임표 파일을 먼저 업로드해주세요.');
        return;
    }

    let foundZone = null;
    let foundDisplayName = null;

    // convertCountryData를 사용하여 한글명과 영문명 가져오기
    if (typeof convertCountryData === 'function') {
        const koreanName = convertCountryData(searchInput, 'nameKo');
        const englishName = convertCountryData(searchInput, 'nameEn');

        // 한글명으로 먼저 시도
        if (koreanName && egsRatesData.ems[koreanName]) {
            foundZone = koreanName;
            foundDisplayName = koreanName;
        }
        // 영문명으로 시도
        else if (englishName && egsRatesData.ems[englishName]) {
            foundZone = englishName;
            foundDisplayName = englishName;
        }
    }

    // convertCountryData로 찾지 못한 경우, 직접 검색 (fallback)
    if (!foundZone) {
        const emsZoneNames = Object.keys(egsRatesData.ems);
        const searchLower = searchInput.toLowerCase();

        // 완전 일치 검색
        for (const zone of emsZoneNames) {
            if (zone.toLowerCase() === searchLower) {
                foundZone = zone;
                foundDisplayName = zone;
                break;
            }
        }

        // 부분 일치 검색
        if (!foundZone) {
            for (const zone of emsZoneNames) {
                if (zone.toLowerCase().includes(searchLower)) {
                    foundZone = zone;
                    foundDisplayName = zone;
                    break;
                }
            }
        }
    }

    if (!foundZone) {
        showSearchResultModal(
            '❌ 검색 결과 없음',
            `"${originalInput}"에 해당하는 국가/지역을 찾을 수 없습니다.<br><br>` +
            `💡 검색 방법:<br>` +
            `- 국가 코드: US, CA, GB, AU<br>` +
            `- 한글명: 미국, 캐나다, 영국, 호주<br>` +
            `- 영문명: United States, Canada, United Kingdom`
        );
        return;
    }

    showEmsRateTable(foundZone, foundDisplayName);
}

function showZoneRateTable(zone, highlightCountry = null) {
    if (!egsRatesData || !egsRatesData.express || !egsRatesData.express[zone]) {
        alert(`Zone ${zone}의 운임 데이터가 없습니다.`);
        return;
    }
    
    const rateData = egsRatesData.express[zone];
    
    let tableHTML = `
        <table class="country-rate-table">
            <thead>
                <tr>
                    <th>중량 (kg)</th>
                    <th>운임 (원)</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    rateData.forEach(item => {
        tableHTML += `
            <tr>
                <td>${item.weight.toFixed(1)}</td>
                <td class="price-cell">${item.price.toLocaleString()}원</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    const titleText = highlightCountry 
        ? `✈️ Zone ${zone} - Express 운임표<br><small style="font-size: 14px; color: #6b7280;">검색 국가: ${highlightCountry}</small>`
        : `✈️ Zone ${zone} - Express 운임표`;
    
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.innerHTML = `
        <div class="search-modal-content large">
            <div class="search-modal-header">
                <h3>${titleText}</h3>
                <button class="search-modal-close" onclick="closeSearchModal()">&times;</button>
            </div>
            <div class="search-modal-body">
                ${tableHTML}
            </div>
            <div class="search-modal-footer">
                <button class="search-modal-btn" onclick="closeSearchModal()">닫기</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function showEmsRateTable(zone, displayName = null) {
    if (!egsRatesData || !egsRatesData.ems || !egsRatesData.ems[zone]) {
        alert(`${zone}의 EMS 운임 데이터가 없습니다.`);
        return;
    }

    const rateData = egsRatesData.ems[zone];

    let tableHTML = `
        <table class="country-rate-table">
            <thead>
                <tr>
                    <th>중량 (kg)</th>
                    <th>운임 (원)</th>
                </tr>
            </thead>
            <tbody>
    `;

    rateData.forEach(item => {
        tableHTML += `
            <tr>
                <td>${item.weight.toFixed(2)}</td>
                <td class="price-cell">${item.price.toLocaleString()}원</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    const titleText = displayName
        ? `🚀 ${displayName} - EMS 운임표`
        : `🚀 ${zone} - EMS 운임표`;

    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.innerHTML = `
        <div class="search-modal-content large">
            <div class="search-modal-header">
                <h3>${titleText}</h3>
                <button class="search-modal-close" onclick="closeSearchModal()">&times;</button>
            </div>
            <div class="search-modal-body">
                ${tableHTML}
            </div>
            <div class="search-modal-footer">
                <button class="search-modal-btn" onclick="closeSearchModal()">닫기</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

// ✅ 수정된 showZoneCountries 함수
function showZoneCountries(zone) {
    const countries = findCountriesByZone(zone);
    
    if (countries.length === 0) {
        alert(`Zone ${zone}의 국가 정보가 없습니다.`);
        return;
    }
    
    // 한글명으로 정렬
    countries.sort((a, b) => a.nameKo.localeCompare(b.nameKo, 'ko'));
    
    let countryListHTML = '<ul style="line-height: 2; margin-left: 20px;">';
    countries.forEach(country => {
        countryListHTML += `<li>${country.nameKo} (${country.code})</li>`;
    });
    countryListHTML += '</ul>';
    
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.innerHTML = `
        <div class="search-modal-content">
            <div class="search-modal-header">
                <h3>🌍 Zone ${zone} 국가 목록</h3>
                <button class="search-modal-close" onclick="closeSearchModal()">&times;</button>
            </div>
            <div class="search-modal-body">
                <p style="margin-bottom: 16px; font-weight: 600; color: #1f2937;">
                    총 ${countries.length}개 국가
                </p>
                ${countryListHTML}
            </div>
            <div class="search-modal-footer">
                <button class="search-modal-btn" onclick="closeSearchModal()">닫기</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function showSearchResultModal(title, message) {
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.innerHTML = `
        <div class="search-modal-content">
            <div class="search-modal-header">
                <h3>${title}</h3>
                <button class="search-modal-close" onclick="closeSearchModal()">&times;</button>
            </div>
            <div class="search-modal-body">
                <p>${message}</p>
            </div>
            <div class="search-modal-footer">
                <button class="search-modal-btn" onclick="closeSearchModal()">확인</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function showCountryRateTable(countryCode, data, serviceType) {
    const countryName = getCountryName(countryCode);
    
    let tableHTML = `
        <table class="country-rate-table">
            <thead>
                <tr>
                    <th>중량 (kg)</th>
                    <th>운임 (원)</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    data.forEach(item => {
        tableHTML += `
            <tr>
                <td>${item.weight.toFixed(1)}</td>
                <td class="price-cell">${item.price.toLocaleString()}원</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.innerHTML = `
        <div class="search-modal-content large">
            <div class="search-modal-header">
                <h3>🌍 ${countryName} (${countryCode}) - ${serviceType} 운임표</h3>
                <button class="search-modal-close" onclick="closeSearchModal()">&times;</button>
            </div>
            <div class="search-modal-body">
                ${tableHTML}
            </div>
            <div class="search-modal-footer">
                <button class="search-modal-btn" onclick="closeSearchModal()">닫기</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeSearchModal() {
    const modals = document.querySelectorAll('.search-modal');
    modals.forEach(modal => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });
}

function renderStandardTable() {
    const container = document.getElementById('standardTableContainer');
    
    if (!egsRatesData || !egsRatesData.standard || Object.keys(egsRatesData.standard).length === 0) {
        container.innerHTML = `
            <div class="no-data-message">
                <h3>📭 운임표 데이터 없음</h3>
                <p>마진 계산기 탭에서 eGS 운임표를 업로드하면 여기에 표시됩니다.</p>
            </div>
        `;
        return;
    }

    const standardData = egsRatesData.standard;
    const countryOrder = ['US', 'CA', 'GB', 'DE', 'IT', 'FR', 'ES', 'AU'];
    const countryNames = {
        'US': '미국', 'CA': '캐나다', 'GB': '영국', 'DE': '독일', 
        'IT': '이탈리아', 'FR': '프랑스', 'ES': '스페인', 'AU': '호주'
    };

    const availableCountries = countryOrder.filter(code => 
        standardData[code] && standardData[code].length > 0
    );

    if (availableCountries.length === 0) {
        container.innerHTML = `
            <div class="no-data-message">
                <h3>📭 표시할 운임표 데이터 없음</h3>
                <p>업로드된 파일에 US, CA, GB, DE, IT, FR, ES, AU 국가의 운임 정보가 없습니다.</p>
            </div>
        `;
        return;
    }

    const allWeights = new Set();
    availableCountries.forEach(country => {
        standardData[country].forEach(item => allWeights.add(item.weight));
    });
    const sortedWeights = Array.from(allWeights).sort((a, b) => a - b);

    let tableHTML = `
        <div class="rates-table-wrapper">
            <table class="rates-table">
                <thead>
                    <tr>
                        <th>중량 (kg)</th>`;

    availableCountries.forEach(code => {
        tableHTML += `<th>${countryNames[code]} (${code})</th>`;
    });

    tableHTML += `
                    </tr>
                </thead>
                <tbody>`;

    sortedWeights.forEach(weight => {
        tableHTML += `<tr><td>${weight.toFixed(2)}</td>`;
        availableCountries.forEach(country => {
            const item = standardData[country].find(d => d.weight === weight);
            tableHTML += item ? `<td class="price-cell">${item.price.toLocaleString()}원</td>` : `<td>-</td>`;
        });
        tableHTML += `</tr>`;
    });

    tableHTML += `
                </tbody>
            </table>
        </div>`;

    container.innerHTML = tableHTML;
}

function renderExpressTable() {
    const container = document.getElementById('expressTableContainer');
    
    if (!egsRatesData || !egsRatesData.express || Object.keys(egsRatesData.express).length === 0) {
        container.innerHTML = `
            <div class="no-data-message">
                <h3>📭 Express 운임표 데이터 없음</h3>
                <p>마진 계산기 탭에서 eGS 운임표를 업로드하면 여기에 표시됩니다.</p>
            </div>
        `;
        return;
    }

    const expressData = egsRatesData.express;
    
    const allZones = Object.keys(expressData).sort((a, b) => {
        const getZoneValue = (zone) => {
            const match = zone.match(/^([A-Z])(-(\d))?$/);
            if (match) {
                const letter = match[1].charCodeAt(0);
                const number = match[3] ? parseInt(match[3]) : 0;
                return letter * 10 + number;
            }
            return 0;
        };
        return getZoneValue(a) - getZoneValue(b);
    });

    const allWeights = new Set();
    allZones.forEach(zone => {
        expressData[zone].forEach(item => allWeights.add(item.weight));
    });
    const sortedWeights = Array.from(allWeights).sort((a, b) => a - b);

    let tableHTML = `
        <div class="rates-table-wrapper">
            <table class="rates-table">
                <thead>
                    <tr>
                        <th>중량 (kg)</th>`;

    allZones.forEach(zone => {
        tableHTML += `
                        <th class="zone-header" onclick="showZoneCountries('${zone}')" title="클릭하여 국가 목록 보기">
                            ${zone}<br><span style="font-size: 10px;">🔍</span>
                        </th>`;
    });

    tableHTML += `
                    </tr>
                </thead>
                <tbody>`;

    sortedWeights.forEach(weight => {
        tableHTML += `<tr><td>${weight.toFixed(1)}</td>`;
        allZones.forEach(zone => {
            const item = expressData[zone].find(d => d.weight === weight);
            tableHTML += item ? `<td class="price-cell">${item.price.toLocaleString()}원</td>` : `<td>-</td>`;
        });
        tableHTML += `</tr>`;
    });

    tableHTML += `
                </tbody>
            </table>
        </div>`;

    container.innerHTML = tableHTML;
}

function searchEmsSurchargeCountryRate() {
    const searchInput = document.getElementById('emsSurchargeCountrySearchInput').value.trim();

    if (!searchInput) {
        alert('국가명 또는 코드를 입력해주세요.');
        return;
    }

    if (!egsRatesData || !egsRatesData.emsSurchargeRates || Object.keys(egsRatesData.emsSurchargeRates).length === 0) {
        showSearchResultModal('❌ 데이터 없음', '운임표 파일을 먼저 업로드해주세요.');
        return;
    }

    // 국가 코드 또는 국가명으로 코드 변환
    let countryCode = null;
    let countryData = findCountryByCode(searchInput);
    if (!countryData) {
        countryData = findCountryByName(searchInput);
    }
    if (countryData) {
        countryCode = countryData.code;
    } else if (typeof convertCountryData === 'function') {
        countryCode = convertCountryData(searchInput, 'code');
    }

    if (!countryCode || !egsRatesData.emsSurchargeRates[countryCode]) {
        showSearchResultModal(
            '❌ 검색 결과 없음',
            `"${searchInput}"에 해당하는 EMS 할증료 데이터가 없습니다.<br><br>` +
            `💡 검색 방법:<br>` +
            `- 국가 코드: US, CA, GB, AU<br>` +
            `- 한글명: 미국, 캐나다, 영국, 호주<br>` +
            `- 영문명: United States, Canada, United Kingdom`
        );
        return;
    }

    const surcharge = egsRatesData.emsSurchargeRates[countryCode];
    const name = getCountryName(countryCode);

    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.innerHTML = `
        <div class="search-modal-content">
            <div class="search-modal-header">
                <h3>💰 EMS 할증료 검색 결과</h3>
                <button class="search-modal-close" onclick="closeSearchModal()">&times;</button>
            </div>
            <div class="search-modal-body">
                <table class="country-rate-table">
                    <thead>
                        <tr>
                            <th>국가명</th>
                            <th>국가코드</th>
                            <th>kg당 수수료 (원)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${name}</td>
                            <td>${countryCode}</td>
                            <td class="price-cell">${surcharge.toLocaleString()}원</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="search-modal-footer">
                <button class="search-modal-btn" onclick="closeSearchModal()">닫기</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function renderEmsSurchargeTable() {
    const container = document.getElementById('emsSurchargeTableContainer');

    if (!egsRatesData || !egsRatesData.emsSurchargeRates || Object.keys(egsRatesData.emsSurchargeRates).length === 0) {
        container.innerHTML = `
            <div class="no-data-message">
                <h3>📭 EMS 할증료 데이터 없음</h3>
                <p>마진 계산기 탭에서 eGS 운임표를 업로드하면 여기에 표시됩니다.</p>
            </div>
        `;
        return;
    }

    const surchargeData = egsRatesData.emsSurchargeRates;
    const defaultCodes = ['DE', 'US', 'ES', 'GB', 'FR', 'AU'];

    // 기본 6개국 중 데이터 있는 것만 표시, 한글명 가나다순 정렬
    const displayCodes = defaultCodes
        .filter(code => surchargeData[code] !== undefined)
        .sort((a, b) => getCountryName(a).localeCompare(getCountryName(b), 'ko'));

    if (displayCodes.length === 0) {
        container.innerHTML = `
            <div class="no-data-message">
                <h3>📭 표시할 EMS 할증료 데이터 없음</h3>
                <p>업로드된 파일에 주요 국가(독일, 미국, 스페인, 영국, 프랑스, 호주)의 할증료 정보가 없습니다.</p>
            </div>
        `;
        return;
    }

    let tableHTML = `
        <div class="rates-table-wrapper">
            <table class="rates-table">
                <thead>
                    <tr>
                        <th>국가명 (한글)</th>
                        <th>국가코드</th>
                        <th>kg당 수수료 (원)</th>
                    </tr>
                </thead>
                <tbody>`;

    displayCodes.forEach(code => {
        const name = getCountryName(code);
        const surcharge = surchargeData[code];
        tableHTML += `
                    <tr>
                        <td>${name}</td>
                        <td>${code}</td>
                        <td class="price-cell">${surcharge.toLocaleString()}원</td>
                    </tr>`;
    });

    tableHTML += `
                </tbody>
            </table>
        </div>`;

    container.innerHTML = tableHTML;
}

function renderEmsTable() {
    const container = document.getElementById('emsTableContainer');
    
    if (!egsRatesData || !egsRatesData.ems || Object.keys(egsRatesData.ems).length === 0) {
        container.innerHTML = `
            <div class="no-data-message">
                <h3>📭 EMS 운임표 데이터 없음</h3>
                <p>마진 계산기 탭에서 eGS 운임표를 업로드하면 여기에 표시됩니다.</p>
            </div>
        `;
        return;
    }

    const emsData = egsRatesData.ems;
    
    // Specified preferred countries/zones
    const preferredEmsZones = ['미국', '영국', '독일', '이탈리아', '프랑스', '스페인', '호주'];
    
    // Filter out available zones based on preferred list
    const availableZones = Object.keys(emsData).filter(zone => 
        preferredEmsZones.includes(zone) && emsData[zone].length > 0
    ).sort();

    if (availableZones.length === 0) {
        container.innerHTML = `
            <div class="no-data-message">
                <h3>📭 표시할 EMS 운임표 데이터 없음</h3>
                <p>업로드된 파일에 주요 국가(미국, 영국, 독일, 이탈리아, 프랑스, 스페인, 호주)의 운임 정보가 없습니다.</p>
            </div>
        `;
        return;
    }

    const allWeights = new Set();
    availableZones.forEach(zone => {
        emsData[zone].forEach(item => allWeights.add(item.weight));
    });
    const sortedWeights = Array.from(allWeights).sort((a, b) => a - b);

    let tableHTML = `
        <div class="rates-table-wrapper">
            <table class="rates-table">
                <thead>
                    <tr>
                        <th>중량 (kg)</th>`;

    availableZones.forEach(zone => {
        tableHTML += `<th>${zone}</th>`;
    });

    tableHTML += `
                    </tr>
                </thead>
                <tbody>`;

    sortedWeights.forEach(weight => {
        tableHTML += `<tr><td>${weight.toFixed(2)}</td>`;
        availableZones.forEach(zone => {
            const item = emsData[zone].find(d => d.weight === weight);
            tableHTML += item ? `<td class="price-cell">${item.price.toLocaleString()}원</td>` : `<td>-</td>`;
        });
        tableHTML += `</tr>`;
    });

    tableHTML += `
                </tbody>
            </table>
        </div>`;

    container.innerHTML = tableHTML;
}

window.addEventListener('DOMContentLoaded', function() {
    const egsTabLink = document.querySelector('.tab-link[onclick*="egsRates"]');
    if (egsTabLink) {
        egsTabLink.addEventListener('click', function() {
            setTimeout(renderStandardTable, 100);
        });
    }
    
    const searchInput = document.getElementById('countrySearchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchCountryRate();
            }
        });
    }
    
    const expressSearchInput = document.getElementById('expressCountrySearchInput');
    if (expressSearchInput) {
        expressSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchExpressCountryRate();
            }
        });
    }

    const emsSearchInput = document.getElementById('emsCountrySearchInput');
    if (emsSearchInput) {
        emsSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchEmsCountryRate();
            }
        });
    }

    const emsSurchargeSearchInput = document.getElementById('emsSurchargeCountrySearchInput');
    if (emsSurchargeSearchInput) {
        emsSurchargeSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchEmsSurchargeCountryRate();
            }
        });
    }
});

window.updateEgsRatesTables = function() {
    const egsTab = document.getElementById('egsRates');
    const standardSubTab = document.getElementById('egsStandard');
    const expressSubTab = document.getElementById('egsExpress');
    const emsSubTab = document.getElementById('egsEms');
    const emsSurchargeSubTab = document.getElementById('egsEmsSurcharge');

    if (egsTab.classList.contains('active')) {
        if (standardSubTab.classList.contains('active')) {
            renderStandardTable();
        } else if (expressSubTab.classList.contains('active')) {
            renderExpressTable();
        } else if (emsSubTab.classList.contains('active')) {
            renderEmsTable();
        } else if (emsSurchargeSubTab.classList.contains('active')) {
            renderEmsSurchargeTable();
        }
    }
};

console.log("✅ eGS Rates script loaded with Express support.");
