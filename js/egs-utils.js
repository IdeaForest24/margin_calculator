// js/egs-utils.js
// eGS 운임표 관련 데이터 파싱 및 공통 유틸리티

// Excel 워크북 파싱: Standard, Express, Zone 매핑 추출
function parseExcelWorkbook(workbook) {
    const result = {
        standard: {},
        express: {}, expressZones: {},
        ems: {}
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
                case 'Express_Zones':
                    result.expressZones = parseExpressZoneMapping(data);
                    break;
                case 'EMS':
                    Object.assign(result.ems, parseEms(data));
                    break;
                default:
                    console.log(`  -> 알려지지 않은 시트 타입입니다: ${sheetType}`);
            }
        } catch (error) {
            console.error(`"${sheetName}" 시트 파싱 중 오류 발생:`, error);
        }
    });

    console.log('=== 최종 파싱 결과 ===');
    console.log(`Standard: ${Object.keys(result.standard).length}개 국가`);
    console.log(`Express: ${Object.keys(result.express).length}개 Zone`);
    console.log(`Express Zones 매핑: ${Object.keys(result.expressZones).length}개 Zone`);
    console.log(`EMS: ${Object.keys(result.ems).length}개 Zone`);
    return result;
}

function identifySheetType(sheetName, data) {
    const name = sheetName.toLowerCase();
    
    if (name.includes('express') && name.includes('service') && name.includes('zone')) {
        return 'Express_Zones';
    }
    
    if (name.includes('express') && !name.includes('surcharge') && !name.includes('zone')) {
        return 'Express';
    }
    
    if (name.includes('ems') && !name.includes('surcharge') && !name.includes('zone') && !name.includes('수수료')) {
        return 'EMS';
    }

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
    const headerRowIndex = 3;
    
    console.log(`  -> Express 파싱 시작. 총 ${data.length}개 행 데이터`);
    
    if (!data[headerRowIndex]) {
        console.error('  -> Express 시트에서 헤더 행(Row 4)을 찾을 수 없습니다.');
        return {};
    }

    const headerRow = data[headerRowIndex];
    console.log(`  -> 헤더 행 데이터 (처음 10개):`, headerRow.slice(0, 10));
    
    const zoneColumns = [];
    const zonePattern = /^[A-Z](-\d)?$/;
    
    for (let col = 2; col < headerRow.length; col++) {
        const cellValue = headerRow[col];
        
        if (!cellValue && cellValue !== 0) continue;
        
        let zoneName = '';
        if (typeof cellValue === 'string') {
            zoneName = cellValue.trim();
        } else if (typeof cellValue === 'number') {
            zoneName = cellValue.toString().trim();
        } else {
            continue;
        }
        
        if (zoneName && zonePattern.test(zoneName)) {
            zoneColumns.push({ col, zone: zoneName });
            results[zoneName] = [];
            console.log(`  -> Zone 발견: "${zoneName}" (col ${col}, Excel: ${String.fromCharCode(65+col)})`);
        }
    }
    
    console.log(`  -> 총 ${zoneColumns.length}개 Zone 발견:`, zoneColumns.map(z => z.zone).join(', '));
    
    if (zoneColumns.length === 0) {
        console.error('  -> Zone을 하나도 찾지 못했습니다!');
        return {};
    }
    
    let successCount = 0;
    for (let row = 5; row < data.length; row++) {
        const rowData = data[row];
        if (!rowData || rowData.length < 3) continue;
        
        const weightValue = rowData[0];
        const weight = cleanNumber(weightValue);
        
        if (isNaN(weight) || weight <= 0) {
            if (row > 10) break;
            continue;
        }
        
        let hasData = false;
        zoneColumns.forEach(({ col, zone }) => {
            const priceValue = rowData[col];
            const price = cleanNumber(priceValue);
            
            if (!isNaN(price) && price > 0) {
                results[zone].push({ 
                    weight: parseFloat(weight.toFixed(1)), 
                    price: Math.round(price) 
                });
                hasData = true;
            }
        });
        
        if (hasData) successCount++;
    }
    
    console.log(`  -> Express 파싱 완료. ${successCount}개 중량 구간, ${Object.keys(results).length}개 Zone 데이터.`);
    
    Object.keys(results).slice(0, 5).forEach(zone => {
        console.log(`     Zone ${zone}: ${results[zone].length}개 데이터`);
    });
    
    return results;
}

function parseExpressZoneMapping(data) {
    const zoneMap = {};
    
    console.log(`  -> Express Zone 매핑 파싱 시작. 총 ${data.length}개 행 데이터`);
    
    for (let i = 2; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 3) continue;
        
        const countryValue = row[0];
        const codeValue = row[1];
        const zoneValue = row[2];
        
        if (!countryValue || !zoneValue) continue;
        
        const country = String(countryValue).trim();
        const code = codeValue ? String(codeValue).trim() : '';
        const zone = String(zoneValue).trim();
        
        if (!zoneMap[zone]) {
            zoneMap[zone] = [];
        }
        
        zoneMap[zone].push({
            name: country,
            code: code
        });
    }
    
    console.log(`  -> Express Zone 매핑 파싱 완료. ${Object.keys(zoneMap).length}개 Zone.`);
    Object.keys(zoneMap).forEach(zone => {
        console.log(`     Zone ${zone}: ${zoneMap[zone].length}개 국가`);
    });
    
    return zoneMap;
}

function parseEms(data) {
    const results = {};
    const headerRowIndex = 2; // A3 is the first data row, so header is on row 2 (0-indexed)

    console.log(`  -> EMS 파싱 시작. 총 ${data.length}개 행 데이터`);

    if (!data[headerRowIndex]) {
        console.error(`  -> EMS 시트에서 헤더 행(Row ${headerRowIndex + 1})을 찾을 수 없습니다.`);
        return {};
    }

    const headerRow = data[headerRowIndex];
    console.log(`  -> 헤더 행 데이터 (처음 10개):`, headerRow.slice(0, 10));

    const zoneColumns = [];
    // Zone from B to AA (col 1 to 26)
    for (let col = 1; col <= 26; col++) {
        const cellValue = headerRow[col];

        if (!cellValue && cellValue !== 0) continue;

        let zoneName = String(cellValue).trim();

        if (zoneName === 'Weigh(구간)') continue;

        if (zoneName) {
            zoneColumns.push({ col, zone: zoneName });
            results[zoneName] = [];
        }
    }

    console.log(`  -> 총 ${zoneColumns.length}개 Zone 발견:`, zoneColumns.map(z => z.zone).join(', '));

    if (zoneColumns.length === 0) {
        console.error('  -> Zone을 하나도 찾지 못했습니다!');
        return {};
    }

    let successCount = 0;
    // Data from row 3 to 66 (0-indexed 2 to 65)
    for (let row = 3; row < 66 && row < data.length; row++) {
        const rowData = data[row];
        if (!rowData || rowData.length === 0) continue;

        const weightValue = rowData[0];
        const weight = cleanNumber(weightValue);

        if (isNaN(weight) || weight <= 0) {
            continue;
        }

        let hasData = false;
        zoneColumns.forEach(({ col, zone }) => {
            const priceValue = rowData[col];
            const price = cleanNumber(priceValue);

            if (!isNaN(price) && price > 0) {
                results[zone].push({
                    weight: parseFloat(weight.toFixed(2)), // EMS might have more detailed weight
                    price: Math.round(price)
                });
                hasData = true;
            }
        });

        if (hasData) successCount++;
    }

    console.log(`  -> EMS 파싱 완료. ${successCount}개 중량 구간, ${Object.keys(results).length}개 Zone 데이터.`);
    
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

function getCountryName(code) {
    const countryNames = {
        'US': '미국', 'CA': '캐나다', 'GB': '영국', 'AU': '호주', 'DE': '독일', 'FR': '프랑스', 'IT': '이탈리아', 'ES': '스페인', 'BE': '벨기에', 'NL': '네덜란드', 'AT': '오스트리아', 'PL': '폴란드', 'SE': '스웨덴', 'DK': '덴마크', 'FI': '핀란드', 'IE': '아일랜드', 'PT': '포르투갈', 'CZ': '체코', 'HU': '헝가리', 'GR': '그리스', 'RO': '루마니아', 'BG': '불가리아', 'HR': '크로아티아', 'SK': '슬로바키아', 'SI': '슬로베니아', 'LT': '리투아니아', 'LV': '라트비아', 'EE': '에스토니아', 'CY': '키프로스', 'LU': '룩셈부르크', 'MT': '몰타', 'EU': '기타 유럽'
    };
    return countryNames[code] || code;
}

console.log('✅ eGS Utils script loaded successfully with Enhanced Express parsing.');
