// js/egs-rates.js

// --- eGS Sub-Tab Management ---
function openEgsSubTab(event, tabName) {
    // 모든 서브탭 콘텐츠 숨기기
    const subtabContents = document.querySelectorAll('.egs-subtab-content');
    subtabContents.forEach(content => content.classList.remove('active'));

    // 모든 서브탭 링크 비활성화
    const subtabLinks = document.querySelectorAll('.egs-subtab-link');
    subtabLinks.forEach(link => link.classList.remove('active'));

    // 선택된 탭 활성화
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');

    // Standard 탭이 열릴 때 테이블 렌더링
    if (tabName === 'egsStandard') {
        renderStandardTable();
    }
}

// --- Country Search Functions ---
function searchCountryRate() {
    const searchInput = document.getElementById('countrySearchInput').value.trim().toUpperCase();
    
    if (!searchInput) {
        alert('국가명 또는 코드를 입력해주세요.');
        return;
    }
    
    // 국가 코드 매핑 (검색어 → 코드)
    const countrySearchMap = {
        'US': 'US', '미국': 'US', 'USA': 'US', 'UNITED STATES': 'US', 'AMERICA': 'US',
        'CA': 'CA', '캐나다': 'CA', 'CANADA': 'CA',
        'GB': 'GB', '영국': 'GB', 'UK': 'GB', 'UNITED KINGDOM': 'GB', 'BRITAIN': 'GB',
        'DE': 'DE', '독일': 'DE', 'GERMANY': 'DE',
        'IT': 'IT', '이탈리아': 'IT', 'ITALY': 'IT',
        'FR': 'FR', '프랑스': 'FR', 'FRANCE': 'FR',
        'ES': 'ES', '스페인': 'ES', 'SPAIN': 'ES',
        'AU': 'AU', '호주': 'AU', 'AUSTRALIA': 'AU'
    };
    
    const countryCode = countrySearchMap[searchInput];
    
    if (!countryCode) {
        showSearchResultModal('❌ 검색 결과 없음', `"${searchInput}"에 해당하는 국가를 찾을 수 없습니다.<br><br>지원 국가: 미국(US), 캐나다(CA), 영국(GB), 독일(DE), 이탈리아(IT), 프랑스(FR), 스페인(ES), 호주(AU)`);
        return;
    }
    
    // 데이터 확인
    if (!egsRatesData || !egsRatesData.standard || !egsRatesData.standard[countryCode]) {
        showSearchResultModal('❌ 데이터 없음', `${getCountryName(countryCode)}의 운임 데이터가 없습니다.<br><br>운임표 파일을 업로드했는지 확인해주세요.`);
        return;
    }
    
    // 결과 표시
    const countryData = egsRatesData.standard[countryCode];
    showCountryRateTable(countryCode, countryData);
}

function getCountryName(code) {
    const countryNames = {
        'US': '미국',
        'CA': '캐나다',
        'GB': '영국',
        'DE': '독일',
        'IT': '이탈리아',
        'FR': '프랑스',
        'ES': '스페인',
        'AU': '호주'
    };
    return countryNames[code] || code;
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

function showCountryRateTable(countryCode, data) {
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
                <h3>🌍 ${countryName} (${countryCode}) - Standard 운임표</h3>
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

// --- Standard 테이블 렌더링 ---
function renderStandardTable() {
    const container = document.getElementById('standardTableContainer');
    
    // egsRatesData가 없거나 standard 데이터가 없는 경우
    if (!egsRatesData || !egsRatesData.standard || Object.keys(egsRatesData.standard).length === 0) {
        container.innerHTML = `
            <div class="no-data-message">
                <h3>📭 운임표 데이터 없음</h3>
                <p>eGS 운임표를 업로드하면 여기에 표시됩니다.</p>
            </div>
        `;
        return;
    }

    const standardData = egsRatesData.standard;
    
    // 국가 순서 정의 (미국, 캐나다, 영국, 독일, 이탈리아, 프랑스, 스페인, 호주)
    const countryOrder = ['US', 'CA', 'GB', 'DE', 'IT', 'FR', 'ES', 'AU'];
    const countryNames = {
        'US': '미국',
        'CA': '캐나다',
        'GB': '영국',
        'DE': '독일',
        'IT': '이탈리아',
        'FR': '프랑스',
        'ES': '스페인',
        'AU': '호주'
    };

    // 사용 가능한 국가 목록 (데이터가 있고 순서에 포함된 국가만)
    const availableCountries = countryOrder.filter(code => 
        standardData[code] && standardData[code].length > 0
    );

    if (availableCountries.length === 0) {
        container.innerHTML = `
            <div class="no-data-message">
                <h3>📭 Standard 운임표 데이터 없음</h3>
                <p>업로드된 파일에 Standard 운임표 데이터가 없습니다.</p>
            </div>
        `;
        return;
    }

    // 모든 중량 값 수집 (정렬을 위해)
    const allWeights = new Set();
    availableCountries.forEach(country => {
        standardData[country].forEach(item => {
            allWeights.add(item.weight);
        });
    });
    const sortedWeights = Array.from(allWeights).sort((a, b) => a - b);

    // 테이블 HTML 생성
    let tableHTML = `
        <div class="rates-table-wrapper">
            <table class="rates-table">
                <thead>
                    <tr>
                        <th>중량 (kg)</th>
    `;

    // 국가 헤더 추가
    availableCountries.forEach(code => {
        tableHTML += `<th>${countryNames[code]}</th>`;
    });

    tableHTML += `
                    </tr>
                </thead>
                <tbody>
    `;

    // 각 중량에 대한 행 생성
    sortedWeights.forEach(weight => {
        tableHTML += `<tr><td>${weight.toFixed(1)}</td>`;
        
        availableCountries.forEach(country => {
            const item = standardData[country].find(d => d.weight === weight);
            if (item) {
                tableHTML += `<td class="price-cell">${item.price.toLocaleString()}원</td>`;
            } else {
                tableHTML += `<td></td>`; // 데이터 없으면 공백
            }
        });
        
        tableHTML += `</tr>`;
    });

    tableHTML += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = tableHTML;
}

// --- 페이지 로드 시 초기화 ---
window.addEventListener('DOMContentLoaded', function() {
    // eGS 탭이 활성화될 때 Standard 테이블 렌더링
    const egsTabLink = document.querySelector('.tab-link[onclick*="egsRates"]');
    if (egsTabLink) {
        egsTabLink.addEventListener('click', function() {
            // 약간의 지연을 두고 렌더링 (탭 전환 애니메이션 이후)
            setTimeout(renderStandardTable, 100);
        });
    }
    
    // 검색 입력창에서 Enter 키 처리
    const searchInput = document.getElementById('countrySearchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchCountryRate();
            }
        });
    }
});

// --- 데이터 업데이트 시 테이블 갱신 ---
// main.js에서 파일 업로드 성공 시 호출될 수 있도록 전역 함수로 노출
window.updateEgsRatesTables = function() {
    // 현재 eGS 탭이 활성화되어 있고 Standard 서브탭이 활성화되어 있다면 갱신
    const egsTab = document.getElementById('egsRates');
    const standardSubTab = document.getElementById('egsStandard');
    
    if (egsTab.classList.contains('active') && standardSubTab.classList.contains('active')) {
        renderStandardTable();
    }
};

console.log("eGS Rates script loaded with search and table rendering logic.");
