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
    }
}

function searchCountryRate() {
    const searchInput = document.getElementById('countrySearchInput').value.trim().toUpperCase();
    
    if (!searchInput) {
        alert('국가명 또는 코드를 입력해주세요.');
        return;
    }
    
    const countrySearchMap = getCountrySearchMap();
    let countryCode = countrySearchMap[searchInput];
    
    if (!countryCode) {
        countryCode = searchInput;
    }
    
    if (!egsRatesData || !egsRatesData.standard) {
        showSearchResultModal('❌ 데이터 없음', '운임표 파일을 먼저 업로드해주세요.');
        return;
    }
    
    if (!egsRatesData.standard[countryCode]) {
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

function searchExpressCountryRate() {
    let searchInput = document.getElementById('expressCountrySearchInput').value.trim();
    const originalInput = searchInput;
    
    if (!searchInput) {
        alert('국가명을 입력해주세요.');
        return;
    }
    
    if (!egsRatesData || !egsRatesData.expressZones || !egsRatesData.express) {
        showSearchResultModal('❌ 데이터 없음', '운임표 파일을 먼저 업로드해주세요.');
        return;
    }
    
    const englishCountryName = COUNTRY_MAP[searchInput];
    if (englishCountryName) {
        searchInput = englishCountryName;
    }
    
    const foundZone = findZoneByCountry(searchInput.toUpperCase());
    
    if (!foundZone) {
        showSearchResultModal(
            '❌ 검색 결과 없음', 
            `"${originalInput}"에 해당하는 국가를 찾을 수 없습니다.<br><br>` +
            `국가명은 한글 또는 영어로 입력해주세요. (예: 미국, United States)`
        );
        return;
    }
    
    showZoneRateTable(foundZone.zone, foundZone.country);
}

function findZoneByCountry(searchTerm) {
    if (!egsRatesData || !egsRatesData.expressZones) return null;
    
    const term = searchTerm.toUpperCase();
    
    for (const [zone, countries] of Object.entries(egsRatesData.expressZones)) {
        const found = countries.find(country => 
            country.name.toUpperCase().includes(term) || 
            (country.code && country.code.toUpperCase() === term)
        );
        
        if (found) {
            return { zone, country: found.name };
        }
    }
    
    return null;
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

function showZoneCountries(zone) {
    if (!egsRatesData || !egsRatesData.expressZones || !egsRatesData.expressZones[zone]) {
        alert(`Zone ${zone}의 국가 정보가 없습니다.`);
        return;
    }
    
    const countries = egsRatesData.expressZones[zone];
    
    let countryListHTML = '<ul style="line-height: 2; margin-left: 20px;">';
    countries.forEach(country => {
        const koreanName = ENGLISH_TO_KOREAN_MAP[country.name] || country.name;
        countryListHTML += `<li>${koreanName}${country.code ? ` (${country.code})` : ''}</li>`;
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
});

window.updateEgsRatesTables = function() {
    const egsTab = document.getElementById('egsRates');
    const standardSubTab = document.getElementById('egsStandard');
    const expressSubTab = document.getElementById('egsExpress');
    
    if (egsTab.classList.contains('active')) {
        if (standardSubTab.classList.contains('active')) {
            renderStandardTable();
        } else if (expressSubTab.classList.contains('active')) {
            renderExpressTable();
        }
    }
};

console.log("✅ eGS Rates script loaded with Express support.");
