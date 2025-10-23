// js/egs-utils.js
// eGS 운임표 관련 데이터 파싱 및 공통 유틸리티 함수

// ========================================
// Excel 파싱 메인 함수
// ========================================
function parseExcelWorkbook(workbook) {
    const result = {
        standard: {},
        express: {}
    };

    workbook.SheetNames.forEach(sheetName => {
        console.log(`- "${sheetName}" 시트 파싱 시도...`);
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        const sheetType = identifySheetType(sheetName, data);

        if (sheetType === 'ignore') {
            console.log(`  -> 운임과 관련 없는 시트로 판단되어 건너뜁니다.`);
            return;
        }

        try {
            switch (sheetType) {
                case 'Standard_US':
                    Object.assign(result.standard, parseStandardUS(data));
                    break;
                case 'Standard_CA':
                    Object.assign(result.standard, parseStandardGeneric(data, 'CA', 7));
                    break;
                case 'Standard_GB':
                    Object.assign(result.standard, parseStandardGeneric(data, 'GB', 7));
                    break;
                case 'Standard_AU':
                    Object.assign(result.standard, parseStandardGeneric(data, 'AU', 6));
                    break;
                case 'Standard_EU':
                    Object.assign(result.standard, parseStandardEU(data));
                    break;
                case 'Express':
                    Object.assign(result.express, parseExpress(data));
                    break;
                default:
                    console.log(`  -> 알려지지 않은 시트 타입입니다: ${sheetType}`);
            }
        } catch (error) {
            console.error(`"${sheetName}" 시트 파싱 중 오류 발생:`, error);
        }
    });

    console.log('=== 최종 파싱 결과 ===', result);
    return result;
}

// ========================================
// 시트 타입 식별 함수
// ========================================
function identifySheetType(sheetName, data) {
    const name = sheetName.toLowerCase();
    
    if (name.includes('express') && !name.includes('surcharge') && !name.includes('zone')) return 'Express';

    if (name.includes('standard')) {
        if (name.includes('us')) return 'Standard_US';
        if (name.includes('ca')) return 'Standard_CA';
        if (name.includes('gb')) return 'Standard_GB';
        if (name.includes('au')) return 'Standard_AU';
        
        for (let i = 0; i < 5 && i < data.length; i++) {
            const rowStr = (data[i] || []).join(',').toLowerCase();
            if (rowStr.includes('france') || rowStr.includes('germany') || rowStr.includes('italy')) {
                return 'Standard_EU';
            }
        }
    }
    return 'ignore';
}

// ========================================
// 시트별 상세 파서
// ========================================

const cleanNumber = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val !== 'string') return NaN;
    const cleaned = val.replace(/[^0-9.]/g, '');
    return cleaned ? parseFloat(cleaned) : NaN;
};

function parseStandardUS(data) {
    const rates = [];
    let startRow = findRowContaining(data, 'Weight(kg)', 1);
    for (let i = startRow + 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 3) continue;
        const weight = cleanNumber(row[1]);
        const price = cleanNumber(row[2]);
        if (!isNaN(weight) && !isNaN(price) && weight > 0) rates.push({ weight, price });
    }
    console.log(`  -> Standard US 파싱 완료. ${rates.length}개 데이터 발견.`);
    return rates.length > 0 ? { 'US': rates } : {};
}

function parseStandardGeneric(data, countryCode, startRowDefault) {
    const rates = [];
    let startRow = findRowContaining(data, 'KG', 0);
    if (startRow === -1) startRow = startRowDefault -1;
    
    for (let i = startRow + 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 2) continue;
        const weight = cleanNumber(row[0]);
        const price = cleanNumber(row[1]);
        if (!isNaN(weight) && !isNaN(price) && weight > 0) rates.push({ weight, price });
    }
    console.log(`  -> Standard ${countryCode} 파싱 완료. ${rates.length}개 데이터 발견.`);
    return rates.length > 0 ? { [countryCode]: rates } : {};
}

function parseStandardEU(data) {
    const results = {};
    const headerRowIndex = findRowContaining(data, 'France');
    if (headerRowIndex === -1) {
         console.error('  -> EU 시트에서 국가 헤더 행을 찾을 수 없습니다.');
        return {};
    }

    const headerRow = data[headerRowIndex];
    const countryColMap = {};
    const euCountryMap = {
        'FR': 'France', 'DE': 'Germany', 'IT': 'Italy', 'ES': 'Spain', 'BE': 'Belgium', 'NL': 'Netherlands', 'AT': 'Austria', 'PL': 'Poland', 'SE': 'Sweden', 'DK': 'Denmark', 'FI': 'Finland', 'IE': 'Ireland', 'PT': 'Portugal', 'CZ': 'Czech', 'HU': 'Hungary', 'GR': 'Greece', 'RO': 'Romania', 'BG': 'Bulgaria', 'HR': 'Croatia', 'SK': 'Slovakia', 'SI': 'Slovenia', 'LT': 'Lithuania', 'LV': 'Latvia', 'EE': 'Estonia', 'CY': 'Cyprus', 'LU': 'Luxembourg', 'MT': 'Malta'
    };

    headerRow.forEach((headerCell, index) => {
        if (typeof headerCell !== 'string') return;
        for (const [code, name] of Object.entries(euCountryMap)) {
            if (headerCell.includes(name)) {
                countryColMap[code] = index;
                results[code] = [];
            }
        }
    });
    
    console.log(`  -> EU 시트에서 ${Object.keys(countryColMap).length}개 국가 컬럼을 매핑했습니다.`);

    for (let i = headerRowIndex + 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        const weight = cleanNumber(row[0]);
        if (isNaN(weight) || weight <= 0) continue;

        for (const [code, colIndex] of Object.entries(countryColMap)) {
            const price = cleanNumber(row[colIndex]);
            if (!isNaN(price) && price > 0) results[code].push({ weight, price });
        }
    }

    if (results['DE']) results['EU'] = [...results['DE']];
    console.log(`  -> Standard EU 파싱 완료. ${Object.keys(results).length}개 국가 데이터 발견.`);
    return results;
}

function parseExpress(data) {
    const results = {};
    const headerRowIndex = findRowContaining(data, 'Zone');
    if (headerRowIndex === -1) return {};

    const headerRow = data[headerRowIndex];
    const countryColMap = { 'US': headerRow.indexOf('E'), 'CA': headerRow.indexOf('F'), 'GB': headerRow.indexOf('M'), 'AU': headerRow.indexOf('U') };

    Object.keys(countryColMap).forEach(code => {
        if(countryColMap[code] !== -1) results[code] = [];
    });

    for (let i = headerRowIndex + 2; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        const weight = cleanNumber(row[0]);
        if (isNaN(weight) || weight < 0) continue;

        for (const [code, colIndex] of Object.entries(countryColMap)) {
            if (colIndex === -1) continue;
            const price = cleanNumber(row[colIndex]);
            if (!isNaN(price) && price > 0) results[code].push({ weight, price });
        }
    }
    
    if (results['GB']) {
        results['DE'] = [...results['GB']]; results['FR'] = [...results['GB']]; results['IT'] = [...results['GB']]; results['ES'] = [...results['GB']]; results['EU'] = [...results['GB']];
    }
    console.log(`  -> Express 파싱 완료. ${Object.keys(results).length}개 국가 데이터 발견.`);
    return results;
}

function findRowContaining(data, keyword, columnIndex = -1) {
    const lowerKeyword = keyword.toLowerCase();
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row) continue;
        if (columnIndex !== -1) {
            const cell = row[columnIndex];
            if (typeof cell === 'string' && cell.toLowerCase().includes(lowerKeyword)) return i;
        } else {
            for (const cell of row) {
                if (typeof cell === 'string' && cell.toLowerCase().includes(lowerKeyword)) return i;
            }
        }
    }
    return -1;
}

// ========================================
// LocalStorage 관리 함수
// ========================================
function saveRatesData(data) {
    try {
        if (!data || !data.standard || Object.keys(data.standard).length === 0) {
            console.warn("저장할 유효한 운임 데이터가 없어 저장을 건너뜁니다.");
            return;
        }
        localStorage.setItem('egsRatesData', JSON.stringify(data));
        localStorage.setItem('egsRatesLastUpdate', new Date().toISOString());
        console.log('✅ 운임표 데이터가 LocalStorage에 성공적으로 저장되었습니다.');
    } catch (error) {
        console.error('❌ LocalStorage 저장 실패:', error);
    }
}

function loadRatesData() {
    try {
        const savedData = localStorage.getItem('egsRatesData');
        if (savedData) {
            console.log('✅ LocalStorage에서 운임표 데이터를 불러왔습니다.');
            return JSON.parse(savedData);
        }
        return null;
    } catch (error) {
        console.error('❌ LocalStorage 로드 실패:', error);
        return null;
    }
}

function clearRatesData() {
    try {
        localStorage.removeItem('egsRatesData');
        localStorage.removeItem('egsRatesLastUpdate');
        console.log('✅ LocalStorage의 운임표 데이터가 삭제되었습니다.');
        return true;
    } catch (error) {
        console.error('❌ LocalStorage 삭제 실패:', error);
        return false;
    }
}

// ========================================
// 국가 관련 유틸리티 (★★★★★ 내용 복원)
// ========================================
function getCountryName(code) {
    const countryNames = {
        'US': '미국', 'CA': '캐나다', 'GB': '영국', 'AU': '호주', 'DE': '독일', 'FR': '프랑스', 'IT': '이탈리아', 'ES': '스페인', 'BE': '벨기에', 'NL': '네덜란드', 'AT': '오스트리아', 'PL': '폴란드', 'SE': '스웨덴', 'DK': '덴마크', 'FI': '핀란드', 'IE': '아일랜드', 'PT': '포르투갈', 'CZ': '체코', 'HU': '헝가리', 'GR': '그리스', 'RO': '루마니아', 'BG': '불가리아', 'HR': '크로아티아', 'SK': '슬로바키아', 'SI': '슬로베니아', 'LT': '리투아니아', 'LV': '라트비아', 'EE': '에스토니아', 'CY': '키프로스', 'LU': '룩셈부르크', 'MT': '몰타', 'EU': '기타 유럽'
    };
    return countryNames[code] || code;
}

function getCountrySearchMap() {
    return {
        // 주요 8개국
        'US': 'US', '미국': 'US', 'USA': 'US', 'UNITED STATES': 'US', 'AMERICA': 'US',
        'CA': 'CA', '캐나다': 'CA', 'CANADA': 'CA',
        'GB': 'GB', '영국': 'GB', 'UK': 'GB', 'UNITED KINGDOM': 'GB', 'BRITAIN': 'GB',
        'DE': 'DE', '독일': 'DE', 'GERMANY': 'DE',
        'IT': 'IT', '이탈리아': 'IT', 'ITALY': 'IT',
        'FR': 'FR', '프랑스': 'FR', 'FRANCE': 'FR',
        'ES': 'ES', '스페인': 'ES', 'SPAIN': 'ES',
        'AU': 'AU', '호주': 'AU', 'AUSTRALIA': 'AU',
        
        // 유럽 기타 국가들
        'BE': 'BE', '벨기에': 'BE', 'BELGIUM': 'BE',
        'CZ': 'CZ', '체코': 'CZ', 'CZECH': 'CZ', 'CZECHIA': 'CZ',
        'HU': 'HU', '헝가리': 'HU', 'HUNGARY': 'HU',
        'NL': 'NL', '네덜란드': 'NL', 'NETHERLANDS': 'NL', 'HOLLAND': 'NL',
        'PL': 'PL', '폴란드': 'PL', 'POLAND': 'PL',
        'PT': 'PT', '포르투갈': 'PT', 'PORTUGAL': 'PT',
        'AT': 'AT', '오스트리아': 'AT', 'AUSTRIA': 'AT',
        'FI': 'FI', '핀란드': 'FI', 'FINLAND': 'FI',
        'IE': 'IE', '아일랜드': 'IE', 'IRELAND': 'IE',
        'SE': 'SE', '스웨덴': 'SE', 'SWEDEN': 'SE',
        'DK': 'DK', '덴마크': 'DK', 'DENMARK': 'DK',
        'GR': 'GR', '그리스': 'GR', 'GREECE': 'GR',
        'BG': 'BG', '불가리아': 'BG', 'BULGARIA': 'BG',
        'HR': 'HR', '크로아티아': 'HR', 'CROATIA': 'HR',
        'CY': 'CY', '키프로스': 'CY', 'CYPRUS': 'CY',
        'EE': 'EE', '에스토니아': 'EE', 'ESTONIA': 'EE',
        'LV': 'LV', '라트비아': 'LV', 'LATVIA': 'LV',
        'LT': 'LT', '리투아니아': 'LT', 'LITHUANIA': 'LT',
        'LU': 'LU', '룩셈부르크': 'LU', 'LUXEMBOURG': 'LU',
        'MT': 'MT', '몰타': 'MT', 'MALTA': 'MT',
        'RO': 'RO', '루마니아': 'RO', 'ROMANIA': 'RO',
        'SK': 'SK', '슬로바키아': 'SK', 'SLOVAKIA': 'SK',
        'SI': 'SI', '슬로베니아': 'SI', 'SLOVENIA': 'SI'
    };
}

// ========================================
// 운임 조회 함수 (★★★★★ 내용 복원)
// ========================================
function getShippingRate(countryCode, weight, serviceType = 'standard') {
    if (!egsRatesData || !egsRatesData[serviceType]) {
        console.error('운임표 데이터가 없습니다');
        return null;
    }
    
    const countryData = egsRatesData[serviceType][countryCode];
    if (!countryData || countryData.length === 0) {
        console.error(`${countryCode} 국가의 운임 데이터가 없습니다`);
        return null;
    }
    
    const sorted = [...countryData].sort((a, b) => a.weight - b.weight);
    const nextHigher = sorted.find(item => item.weight >= weight);

    if (nextHigher) {
        return nextHigher.price;
    }

    if (sorted.length > 0) {
        return sorted[sorted.length - 1].price;
    }
    
    return null;
}

console.log('eGS Utils script loaded successfully with advanced parsing logic.');