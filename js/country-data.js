// js/country-data.js
// eGS Express 운임표 국가 데이터 (203개 국가)
// 구조: { code: { nameEn, nameKo, code, zone } }

const COUNTRY_DATA = {
    'MO': {
        nameEn: 'Macau SAR, China',
        nameKo: '마카오',
        code: 'MO',
        zone: 'A'
    },
    'BN': {
        nameEn: 'Brunei',
        nameKo: '브루나이',
        code: 'BN',
        zone: 'D-1'
    },
    'KH': {
        nameEn: 'Cambodia',
        nameKo: '캄보디아',
        code: 'KH',
        zone: 'D-1'
    },
    'LA': {
        nameEn: 'Laos',
        nameKo: '라오스',
        code: 'LA',
        zone: 'D-1'
    },
    'GU': {
        nameEn: 'Guam',
        nameKo: '괌',
        code: 'GU',
        zone: 'D-2'
    },
    'MN': {
        nameEn: 'Mongolia',
        nameKo: '몽골',
        code: 'MN',
        zone: 'D-2'
    },
    'US': {
        nameEn: 'U.S.',
        nameKo: '미국',
        code: 'US',
        zone: 'E'
    },
    'CA': {
        nameEn: 'Canada',
        nameKo: '캐나다',
        code: 'CA',
        zone: 'F'
    },
    'MX': {
        nameEn: 'Mexico',
        nameKo: '멕시코',
        code: 'MX',
        zone: 'F'
    },
    'PR': {
        nameEn: 'Puerto Rico',
        nameKo: '푸에르토리코',
        code: 'PR',
        zone: 'F'
    },
    'AT': {
        nameEn: 'Austria',
        nameKo: '오스트리아',
        code: 'AT',
        zone: 'G'
    },
    'CZ': {
        nameEn: 'Czech Republic',
        nameKo: '체코',
        code: 'CZ',
        zone: 'G'
    },
    'DK': {
        nameEn: 'Denmark',
        nameKo: '덴마크',
        code: 'DK',
        zone: 'G'
    },
    'FO': {
        nameEn: 'Faeroe Islands',
        nameKo: '페로 제도',
        code: 'FO',
        zone: 'G'
    },
    'FI': {
        nameEn: 'Finland',
        nameKo: '핀란드',
        code: 'FI',
        zone: 'G'
    },
    'GR': {
        nameEn: 'Greece',
        nameKo: '그리스',
        code: 'GR',
        zone: 'G'
    },
    'GL': {
        nameEn: 'Greenland',
        nameKo: '그린란드',
        code: 'GL',
        zone: 'G'
    },
    'HU': {
        nameEn: 'Hungary',
        nameKo: '헝가리',
        code: 'HU',
        zone: 'G'
    },
    'IE': {
        nameEn: 'Ireland',
        nameKo: '아일랜드',
        code: 'IE',
        zone: 'G'
    },
    'LI': {
        nameEn: 'Liechtenstein',
        nameKo: '리히텐슈타인',
        code: 'LI',
        zone: 'G'
    },
    'LU': {
        nameEn: 'Luxembourg',
        nameKo: '룩셈부르크',
        code: 'LU',
        zone: 'G'
    },
    'MC': {
        nameEn: 'Monaco',
        nameKo: '모나코',
        code: 'MC',
        zone: 'G'
    },
    'NO': {
        nameEn: 'Norway',
        nameKo: '노르웨이',
        code: 'NO',
        zone: 'G'
    },
    'PL': {
        nameEn: 'Poland',
        nameKo: '폴란드',
        code: 'PL',
        zone: 'G'
    },
    'PT': {
        nameEn: 'Portugal',
        nameKo: '포르투갈',
        code: 'PT',
        zone: 'G'
    },
    'SK': {
        nameEn: 'Slovakia',
        nameKo: '슬로바키아',
        code: 'SK',
        zone: 'G'
    },
    'SE': {
        nameEn: 'Sweden',
        nameKo: '스웨덴',
        code: 'SE',
        zone: 'G'
    },
    'CH': {
        nameEn: 'Switzerland',
        nameKo: '스위스',
        code: 'CH',
        zone: 'G'
    },
    'AL': {
        nameEn: 'Albania',
        nameKo: '알바니아',
        code: 'AL',
        zone: 'H'
    },
    'AD': {
        nameEn: 'Andorra',
        nameKo: '안도라',
        code: 'AD',
        zone: 'H'
    },
    'AM': {
        nameEn: 'Armenia',
        nameKo: '아르메니아',
        code: 'AM',
        zone: 'H'
    },
    'AZ': {
        nameEn: 'Azerbaijan',
        nameKo: '아제르바이잔',
        code: 'AZ',
        zone: 'H'
    },
    'BY': {
        nameEn: 'Belarus',
        nameKo: '벨라루스',
        code: 'BY',
        zone: 'H'
    },
    'BA': {
        nameEn: 'Bosnia-Herzegovina',
        nameKo: '보스니아 헤르체고비나',
        code: 'BA',
        zone: 'H'
    },
    'BG': {
        nameEn: 'Bulgaria',
        nameKo: '불가리아',
        code: 'BG',
        zone: 'H'
    },
    'HR': {
        nameEn: 'Croatia',
        nameKo: '크로아티아',
        code: 'HR',
        zone: 'H'
    },
    'CY': {
        nameEn: 'Cyprus',
        nameKo: '키프로스',
        code: 'CY',
        zone: 'H'
    },
    'EE': {
        nameEn: 'Estonia',
        nameKo: '에스토니아',
        code: 'EE',
        zone: 'H'
    },
    'GE': {
        nameEn: 'Georgia',
        nameKo: '조지아',
        code: 'GE',
        zone: 'H'
    },
    'GI': {
        nameEn: 'Gibraltar',
        nameKo: '지브롤터',
        code: 'GI',
        zone: 'H'
    },
    'IS': {
        nameEn: 'Iceland',
        nameKo: '아이슬란드',
        code: 'IS',
        zone: 'H'
    },
    'IL': {
        nameEn: 'Israel',
        nameKo: '이스라엘',
        code: 'IL',
        zone: 'H'
    },
    'KZ': {
        nameEn: 'Kazakhstan',
        nameKo: '카자흐스탄',
        code: 'KZ',
        zone: 'H'
    },
    'KG': {
        nameEn: 'Kyrgyzstan',
        nameKo: '키르기스스탄',
        code: 'KG',
        zone: 'H'
    },
    'LV': {
        nameEn: 'Latvia',
        nameKo: '라트비아',
        code: 'LV',
        zone: 'H'
    },
    'LT': {
        nameEn: 'Lithuania',
        nameKo: '리투아니아',
        code: 'LT',
        zone: 'H'
    },
    'MK': {
        nameEn: 'Macedonia',
        nameKo: '북마케도니아',
        code: 'MK',
        zone: 'H'
    },
    'MT': {
        nameEn: 'Malta',
        nameKo: '몰타',
        code: 'MT',
        zone: 'H'
    },
    'MD': {
        nameEn: 'Moldova, Republic of',
        nameKo: '몰도바',
        code: 'MD',
        zone: 'H'
    },
    'ME': {
        nameEn: 'Montenegro',
        nameKo: '몬테네그로',
        code: 'ME',
        zone: 'H'
    },
    'RO': {
        nameEn: 'Romania',
        nameKo: '루마니아',
        code: 'RO',
        zone: 'H'
    },
    'RU': {
        nameEn: 'Russian Federation',
        nameKo: '러시아',
        code: 'RU',
        zone: 'H'
    },
    'RS': {
        nameEn: 'Serbia',
        nameKo: '세르비아',
        code: 'RS',
        zone: 'H'
    },
    'SI': {
        nameEn: 'Slovenia',
        nameKo: '슬로베니아',
        code: 'SI',
        zone: 'H'
    },
    'TR': {
        nameEn: 'Turkey',
        nameKo: '터키',
        code: 'TR',
        zone: 'H'
    },
    'UA': {
        nameEn: 'Ukraine',
        nameKo: '우크라이나',
        code: 'UA',
        zone: 'H'
    },
    'UZ': {
        nameEn: 'Uzbekistan',
        nameKo: '우즈베키스탄',
        code: 'UZ',
        zone: 'H'
    },
    'AS': {
        nameEn: 'American Samoa',
        nameKo: '미국령 사모아',
        code: 'AS',
        zone: 'I'
    },
    'AI': {
        nameEn: 'Anguilla',
        nameKo: '앵귈라',
        code: 'AI',
        zone: 'I'
    },
    'AG': {
        nameEn: 'Antigua & Barbuda',
        nameKo: '앤티가 바부다',
        code: 'AG',
        zone: 'I'
    },
    'AR': {
        nameEn: 'Argentina',
        nameKo: '아르헨티나',
        code: 'AR',
        zone: 'I'
    },
    'AW': {
        nameEn: 'Aruba',
        nameKo: '아루바',
        code: 'AW',
        zone: 'I'
    },
    'BS': {
        nameEn: 'Bahama',
        nameKo: '바하마',
        code: 'BS',
        zone: 'I'
    },
    'BB': {
        nameEn: 'Barbados',
        nameKo: '바베이도스',
        code: 'BB',
        zone: 'I'
    },
    'BZ': {
        nameEn: 'Belize',
        nameKo: '벨리즈',
        code: 'BZ',
        zone: 'I'
    },
    'BM': {
        nameEn: 'Bermuda',
        nameKo: '버뮤다',
        code: 'BM',
        zone: 'I'
    },
    'BO': {
        nameEn: 'Bolivia',
        nameKo: '볼리비아',
        code: 'BO',
        zone: 'I'
    },
    'BQ': {
        nameEn: 'Bonaire',
        nameKo: '보네르',
        code: 'BQ',
        zone: 'I'
    },
    'BR': {
        nameEn: 'Brazil',
        nameKo: '브라질',
        code: 'BR',
        zone: 'I'
    },
    'VG': {
        nameEn: 'British Virgin Islands',
        nameKo: '영국령 버진아일랜드',
        code: 'VG',
        zone: 'I'
    },
    'KY': {
        nameEn: 'Cayman Islands',
        nameKo: '케이맨 제도',
        code: 'KY',
        zone: 'I'
    },
    'CL': {
        nameEn: 'Chile',
        nameKo: '칠레',
        code: 'CL',
        zone: 'I'
    },
    'CO': {
        nameEn: 'Colombia',
        nameKo: '콜롬비아',
        code: 'CO',
        zone: 'I'
    },
    'CK': {
        nameEn: 'Cook Islands',
        nameKo: '쿡 제도',
        code: 'CK',
        zone: 'I'
    },
    'CR': {
        nameEn: 'Costa Rica',
        nameKo: '코스타리카',
        code: 'CR',
        zone: 'I'
    },
    'CW': {
        nameEn: 'Curacao',
        nameKo: '퀴라소',
        code: 'CW',
        zone: 'I'
    },
    'DM': {
        nameEn: 'Dominica',
        nameKo: '도미니카',
        code: 'DM',
        zone: 'I'
    },
    'DO': {
        nameEn: 'Dominican Republic',
        nameKo: '도미니카 공화국',
        code: 'DO',
        zone: 'I'
    },
    'TL': {
        nameEn: 'East Timor',
        nameKo: '동티모르',
        code: 'TL',
        zone: 'I'
    },
    'EC': {
        nameEn: 'Ecuador',
        nameKo: '에콰도르',
        code: 'EC',
        zone: 'I'
    },
    'SV': {
        nameEn: 'El Salvador',
        nameKo: '엘살바도르',
        code: 'SV',
        zone: 'I'
    },
    'FJ': {
        nameEn: 'Fiji',
        nameKo: '피지',
        code: 'FJ',
        zone: 'I'
    },
    'GF': {
        nameEn: 'French Guiana',
        nameKo: '프랑스령 기아나',
        code: 'GF',
        zone: 'I'
    },
    'PF': {
        nameEn: 'French Polynesia',
        nameKo: '프랑스령 폴리네시아',
        code: 'PF',
        zone: 'I'
    },
    'GD': {
        nameEn: 'Grenada',
        nameKo: '그레나다',
        code: 'GD',
        zone: 'I'
    },
    'GP': {
        nameEn: 'Guadeloupe',
        nameKo: '과들루프',
        code: 'GP',
        zone: 'I'
    },
    'GT': {
        nameEn: 'Guatemala',
        nameKo: '과테말라',
        code: 'GT',
        zone: 'I'
    },
    'GY': {
        nameEn: 'Guyana',
        nameKo: '가이아나',
        code: 'GY',
        zone: 'I'
    },
    'HT': {
        nameEn: 'Haiti',
        nameKo: '아이티',
        code: 'HT',
        zone: 'I'
    },
    'HN': {
        nameEn: 'Honduras',
        nameKo: '온두라스',
        code: 'HN',
        zone: 'I'
    },
    'JM': {
        nameEn: 'Jamaica',
        nameKo: '자메이카',
        code: 'JM',
        zone: 'I'
    },
    'MH': {
        nameEn: 'Marshall Islands',
        nameKo: '마셜 제도',
        code: 'MH',
        zone: 'I'
    },
    'MQ': {
        nameEn: 'Martinique',
        nameKo: '마르티니크',
        code: 'MQ',
        zone: 'I'
    },
    'FM': {
        nameEn: 'Micronesia',
        nameKo: '미크로네시아',
        code: 'FM',
        zone: 'I'
    },
    'MS': {
        nameEn: 'Monserrat',
        nameKo: '몬트세랫',
        code: 'MS',
        zone: 'I'
    },
    'AN': {
        nameEn: 'Netherlands Antilles',
        nameKo: '네덜란드령 안틸레스',
        code: 'AN',
        zone: 'I'
    },
    'NC': {
        nameEn: 'New Caledonia',
        nameKo: '뉴칼레도니아',
        code: 'NC',
        zone: 'I'
    },
    'NI': {
        nameEn: 'Nicaragua',
        nameKo: '니카라과',
        code: 'NI',
        zone: 'I'
    },
    'MP': {
        nameEn: 'Northern Mariana Islands',
        nameKo: '북마리아나 제도',
        code: 'MP',
        zone: 'I'
    },
    'PW': {
        nameEn: 'Palau',
        nameKo: '팔라우',
        code: 'PW',
        zone: 'I'
    },
    'PA': {
        nameEn: 'Panama',
        nameKo: '파나마',
        code: 'PA',
        zone: 'I'
    },
    'PG': {
        nameEn: 'Papua New Guinea',
        nameKo: '파푸아뉴기니',
        code: 'PG',
        zone: 'I'
    },
    'PY': {
        nameEn: 'Paraguay',
        nameKo: '파라과이',
        code: 'PY',
        zone: 'I'
    },
    'PE': {
        nameEn: 'Peru',
        nameKo: '페루',
        code: 'PE',
        zone: 'I'
    },
    'LC': {
        nameEn: 'Saint Lucia',
        nameKo: '세인트루시아',
        code: 'LC',
        zone: 'I'
    },
    'MF': {
        nameEn: 'Saint Martin',
        nameKo: '생마르탱',
        code: 'MF',
        zone: 'I'
    },
    'WS': {
        nameEn: 'Samoa',
        nameKo: '사모아',
        code: 'WS',
        zone: 'I'
    },
    'KN': {
        nameEn: 'St. Kitts and Nevis',
        nameKo: '세인트키츠 네비스',
        code: 'KN',
        zone: 'I'
    },
    'VC': {
        nameEn: 'St. Vincent & the Grenadines',
        nameKo: '세인트빈센트 그레나딘',
        code: 'VC',
        zone: 'I'
    },
    'SR': {
        nameEn: 'Suriname',
        nameKo: '수리남',
        code: 'SR',
        zone: 'I'
    },
    'TO': {
        nameEn: 'Tonga',
        nameKo: '통가',
        code: 'TO',
        zone: 'I'
    },
    'TT': {
        nameEn: 'Trinidad & Tobago',
        nameKo: '트리니다드 토바고',
        code: 'TT',
        zone: 'I'
    },
    'TC': {
        nameEn: 'Turks & Caicos Islands',
        nameKo: '터크스 케이커스 제도',
        code: 'TC',
        zone: 'I'
    },
    'VI': {
        nameEn: 'U.S. Virgin Islands',
        nameKo: '미국령 버진아일랜드',
        code: 'VI',
        zone: 'I'
    },
    'UY': {
        nameEn: 'Uruguay',
        nameKo: '우루과이',
        code: 'UY',
        zone: 'I'
    },
    'VU': {
        nameEn: 'Vanuatu',
        nameKo: '바누아투',
        code: 'VU',
        zone: 'I'
    },
    'VE': {
        nameEn: 'Venezuela',
        nameKo: '베네수엘라',
        code: 'VE',
        zone: 'I'
    },
    'WF': {
        nameEn: 'Wallis & Futuna',
        nameKo: '왈리스 푸투나',
        code: 'WF',
        zone: 'I'
    },
    'AF': {
        nameEn: 'Afghanistan',
        nameKo: '아프가니스탄',
        code: 'AF',
        zone: 'J'
    },
    'DZ': {
        nameEn: 'Algeria',
        nameKo: '알제리',
        code: 'DZ',
        zone: 'J'
    },
    'AO': {
        nameEn: 'Angola',
        nameKo: '앙골라',
        code: 'AO',
        zone: 'J'
    },
    'BH': {
        nameEn: 'Bahrain',
        nameKo: '바레인',
        code: 'BH',
        zone: 'J'
    },
    'BD': {
        nameEn: 'Bangladesh',
        nameKo: '방글라데시',
        code: 'BD',
        zone: 'J'
    },
    'BJ': {
        nameEn: 'Benin',
        nameKo: '베냉',
        code: 'BJ',
        zone: 'J'
    },
    'BT': {
        nameEn: 'Bhutan',
        nameKo: '부탄',
        code: 'BT',
        zone: 'J'
    },
    'BW': {
        nameEn: 'Botswana',
        nameKo: '보츠와나',
        code: 'BW',
        zone: 'J'
    },
    'BF': {
        nameEn: 'Burkina Faso',
        nameKo: '부르키나파소',
        code: 'BF',
        zone: 'J'
    },
    'BI': {
        nameEn: 'Burundi',
        nameKo: '부룬디',
        code: 'BI',
        zone: 'J'
    },
    'CM': {
        nameEn: 'Cameroon',
        nameKo: '카메룬',
        code: 'CM',
        zone: 'J'
    },
    'CV': {
        nameEn: 'Cape Verde',
        nameKo: '카보베르데',
        code: 'CV',
        zone: 'J'
    },
    'TD': {
        nameEn: 'Chad',
        nameKo: '차드',
        code: 'TD',
        zone: 'J'
    },
    'CG': {
        nameEn: 'Congo',
        nameKo: '콩고',
        code: 'CG',
        zone: 'J'
    },
    'CI': {
        nameEn: 'Côte D\'ivoire (Ivory Coast)',
        nameKo: '코트디부아르',
        code: 'CI',
        zone: 'J'
    },
    'CG': {
        nameEn: 'Democratic Republic of the Congo',
        nameKo: '콩고민주공화국',
        code: 'CG',
        zone: 'J'
    },
    'DJ': {
        nameEn: 'Djibouti',
        nameKo: '지부티',
        code: 'DJ',
        zone: 'J'
    },
    'EG': {
        nameEn: 'Egypt',
        nameKo: '이집트',
        code: 'EG',
        zone: 'J'
    },
    'ER': {
        nameEn: 'Eritrea',
        nameKo: '에리트레아',
        code: 'ER',
        zone: 'J'
    },
    'ET': {
        nameEn: 'Ethiopia',
        nameKo: '에티오피아',
        code: 'ET',
        zone: 'J'
    },
    'GA': {
        nameEn: 'Gabon',
        nameKo: '가봉',
        code: 'GA',
        zone: 'J'
    },
    'GM': {
        nameEn: 'Gambia',
        nameKo: '감비아',
        code: 'GM',
        zone: 'J'
    },
    'GH': {
        nameEn: 'Ghana',
        nameKo: '가나',
        code: 'GH',
        zone: 'J'
    },
    'GN': {
        nameEn: 'Guinea',
        nameKo: '기니',
        code: 'GN',
        zone: 'J'
    },
    'IQ': {
        nameEn: 'Iraq',
        nameKo: '이라크',
        code: 'IQ',
        zone: 'J'
    },
    'JO': {
        nameEn: 'Jordan',
        nameKo: '요르단',
        code: 'JO',
        zone: 'J'
    },
    'KE': {
        nameEn: 'Kenya',
        nameKo: '케냐',
        code: 'KE',
        zone: 'J'
    },
    'KW': {
        nameEn: 'Kuwait',
        nameKo: '쿠웨이트',
        code: 'KW',
        zone: 'J'
    },
    'LB': {
        nameEn: 'Lebanon',
        nameKo: '레바논',
        code: 'LB',
        zone: 'J'
    },
    'LS': {
        nameEn: 'Lesotho',
        nameKo: '레소토',
        code: 'LS',
        zone: 'J'
    },
    'LR': {
        nameEn: 'Liberia',
        nameKo: '라이베리아',
        code: 'LR',
        zone: 'J'
    },
    'LY': {
        nameEn: 'Libya',
        nameKo: '리비아',
        code: 'LY',
        zone: 'J'
    },
    'MG': {
        nameEn: 'Madagascar',
        nameKo: '마다가스카르',
        code: 'MG',
        zone: 'J'
    },
    'MW': {
        nameEn: 'Malawi',
        nameKo: '말라위',
        code: 'MW',
        zone: 'J'
    },
    'MV': {
        nameEn: 'Maldives',
        nameKo: '몰디브',
        code: 'MV',
        zone: 'J'
    },
    'ML': {
        nameEn: 'Mali',
        nameKo: '말리',
        code: 'ML',
        zone: 'J'
    },
    'MR': {
        nameEn: 'Mauritania',
        nameKo: '모리타니',
        code: 'MR',
        zone: 'J'
    },
    'MU': {
        nameEn: 'Mauritius',
        nameKo: '모리셔스',
        code: 'MU',
        zone: 'J'
    },
    'MA': {
        nameEn: 'Morocco',
        nameKo: '모로코',
        code: 'MA',
        zone: 'J'
    },
    'MZ': {
        nameEn: 'Mozambique',
        nameKo: '모잠비크',
        code: 'MZ',
        zone: 'J'
    },
    '': {
        nameEn: 'Namibia',
        nameKo: '나미비아',
        code: '',
        zone: 'J'
    },
    'NP': {
        nameEn: 'Nepal',
        nameKo: '네팔',
        code: 'NP',
        zone: 'J'
    },
    'NE': {
        nameEn: 'Niger',
        nameKo: '니제르',
        code: 'NE',
        zone: 'J'
    },
    'NG': {
        nameEn: 'Nigeria',
        nameKo: '나이지리아',
        code: 'NG',
        zone: 'J'
    },
    'OM': {
        nameEn: 'Oman',
        nameKo: '오만',
        code: 'OM',
        zone: 'J'
    },
    'PK': {
        nameEn: 'Pakistan',
        nameKo: '파키스탄',
        code: 'PK',
        zone: 'J'
    },
    'PS': {
        nameEn: 'Palestine Autonomous',
        nameKo: '팔레스타인',
        code: 'PS',
        zone: 'J'
    },
    'QA': {
        nameEn: 'Qatar',
        nameKo: '카타르',
        code: 'QA',
        zone: 'J'
    },
    'RE': {
        nameEn: 'Réunion',
        nameKo: '레위니옹',
        code: 'RE',
        zone: 'J'
    },
    'RW': {
        nameEn: 'Rwanda',
        nameKo: '르완다',
        code: 'RW',
        zone: 'J'
    },
    'SA': {
        nameEn: 'Saudi Arabia',
        nameKo: '사우디아라비아',
        code: 'SA',
        zone: 'J'
    },
    'SN': {
        nameEn: 'Senegal',
        nameKo: '세네갈',
        code: 'SN',
        zone: 'J'
    },
    'SC': {
        nameEn: 'Seychelles',
        nameKo: '세이셸',
        code: 'SC',
        zone: 'J'
    },
    'ZA': {
        nameEn: 'South Africa',
        nameKo: '남아프리카 공화국',
        code: 'ZA',
        zone: 'J'
    },
    'LK': {
        nameEn: 'Sri Lanka',
        nameKo: '스리랑카',
        code: 'LK',
        zone: 'J'
    },
    'SZ': {
        nameEn: 'Swaziland',
        nameKo: '에스와티니',
        code: 'SZ',
        zone: 'J'
    },
    'SY': {
        nameEn: 'Syrian Arab Republic',
        nameKo: '시리아',
        code: 'SY',
        zone: 'J'
    },
    'TZ': {
        nameEn: 'Tanzania, United Republic of',
        nameKo: '탄자니아',
        code: 'TZ',
        zone: 'J'
    },
    'TG': {
        nameEn: 'Togo',
        nameKo: '토고',
        code: 'TG',
        zone: 'J'
    },
    'TN': {
        nameEn: 'Tunisia',
        nameKo: '튀니지',
        code: 'TN',
        zone: 'J'
    },
    'UG': {
        nameEn: 'Uganda',
        nameKo: '우간다',
        code: 'UG',
        zone: 'J'
    },
    'AE': {
        nameEn: 'United Arab Emirates',
        nameKo: '아랍에미리트',
        code: 'AE',
        zone: 'J'
    },
    'YE': {
        nameEn: 'Yemen',
        nameKo: '예멘',
        code: 'YE',
        zone: 'J'
    },
    'ZM': {
        nameEn: 'Zambia',
        nameKo: '잠비아',
        code: 'ZM',
        zone: 'J'
    },
    'ZW': {
        nameEn: 'Zimbabwe',
        nameKo: '짐바브웨',
        code: 'ZW',
        zone: 'J'
    },
    'BE': {
        nameEn: 'Belgium',
        nameKo: '벨기에',
        code: 'BE',
        zone: 'M'
    },
    'FR': {
        nameEn: 'France',
        nameKo: '프랑스',
        code: 'FR',
        zone: 'M'
    },
    'DE': {
        nameEn: 'Germany',
        nameKo: '독일',
        code: 'DE',
        zone: 'M'
    },
    'IT': {
        nameEn: 'Italy',
        nameKo: '이탈리아',
        code: 'IT',
        zone: 'M'
    },
    'NL': {
        nameEn: 'Netherlands',
        nameKo: '네덜란드',
        code: 'NL',
        zone: 'M'
    },
    'ES': {
        nameEn: 'Spain',
        nameKo: '스페인',
        code: 'ES',
        zone: 'M'
    },
    'GB': {
        nameEn: 'United Kingdom (Great Britain)',
        nameKo: '영국',
        code: 'GB',
        zone: 'M'
    },
    'VN': {
        nameEn: 'Vietnam',
        nameKo: '베트남',
        code: 'VN',
        zone: 'N'
    },
    'IN': {
        nameEn: 'India',
        nameKo: '인도',
        code: 'IN',
        zone: 'O'
    },
    'JP': {
        nameEn: 'Japan',
        nameKo: '일본',
        code: 'JP',
        zone: 'P'
    },
    'MY': {
        nameEn: 'Malaysia',
        nameKo: '말레이시아',
        code: 'MY',
        zone: 'Q'
    },
    'TH': {
        nameEn: 'Thailand',
        nameKo: '태국',
        code: 'TH',
        zone: 'R'
    },
    'PH': {
        nameEn: 'Philippines',
        nameKo: '필리핀',
        code: 'PH',
        zone: 'S'
    },
    'ID': {
        nameEn: 'Indonesia',
        nameKo: '인도네시아',
        code: 'ID',
        zone: 'T'
    },
    'AU': {
        nameEn: 'Australia',
        nameKo: '호주',
        code: 'AU',
        zone: 'U'
    },
    'NZ': {
        nameEn: 'New Zealand',
        nameKo: '뉴질랜드',
        code: 'NZ',
        zone: 'U'
    },
    'HK': {
        nameEn: 'Hong Kong SAR, China',
        nameKo: '홍콩',
        code: 'HK',
        zone: 'V'
    },
    'CN': {
        nameEn: 'China',
        nameKo: '중국',
        code: 'CN',
        zone: 'W'
    },
    'TW': {
        nameEn: 'Taiwan',
        nameKo: '대만',
        code: 'TW',
        zone: 'X'
    },
    'SG': {
        nameEn: 'Singapore',
        nameKo: '싱가포르',
        code: 'SG',
        zone: 'Y'
    },
};


// ========================================
// 검색 헬퍼 함수들
// ========================================

/**
 * 국가 코드로 국가 정보 찾기
 * @param {string} code - 국가 코드 (예: 'US', 'KR')
 * @returns {Object|null} 국가 정보 객체
 */
function findCountryByCode(code) {
    if (!code) return null;
    return COUNTRY_DATA[code.toUpperCase()] || null;
}

/**
 * 국가명(한글 또는 영문)으로 국가 정보 찾기
 * @param {string} name - 검색할 국가명
 * @returns {Object|null} 국가 정보 객체
 */
function findCountryByName(name) {
    if (!name) return null;
    
    const normalized = normalizeName(name);
    
    // 정확한 매칭 우선
    for (const [code, data] of Object.entries(COUNTRY_DATA)) {
        if (normalizeName(data.nameEn) === normalized || 
            normalizeName(data.nameKo) === normalized) {
            return data;
        }
    }
    
    // 부분 매칭
    for (const [code, data] of Object.entries(COUNTRY_DATA)) {
        if (normalizeName(data.nameEn).includes(normalized) || 
            normalizeName(data.nameKo).includes(normalized)) {
            return data;
        }
    }
    
    return null;
}

/**
 * Zone으로 국가 목록 찾기
 * @param {string} zone - Zone 코드 (예: 'A', 'E', 'G')
 * @returns {Array} 해당 Zone의 국가 배열
 */
function findCountriesByZone(zone) {
    if (!zone) return [];
    
    return Object.values(COUNTRY_DATA).filter(country => country.zone === zone);
}

/**
 * 국가명 정규화 (검색 비교용)
 * @param {string} name - 정규화할 문자열
 * @returns {string} 정규화된 문자열
 */
function normalizeName(name) {
    if (!name) return '';
    
    return name
        .toLowerCase()
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ýÿ]/g, 'y')
        .replace(/[ñ]/g, 'n')
        .replace(/[ç]/g, 'c')
        .replace(/['\(\),\.\-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * 모든 국가 코드 목록 반환
 * @returns {Array<string>} 국가 코드 배열
 */
function getAllCountryCodes() {
    return Object.keys(COUNTRY_DATA);
}

/**
 * 모든 Zone 목록 반환
 * @returns {Array<string>} Zone 코드 배열 (정렬됨)
 */
function getAllZones() {
    const zones = new Set(Object.values(COUNTRY_DATA).map(c => c.zone));
    return Array.from(zones).sort((a, b) => {
        const valA = a.replace('D-', 'D').replace('-', '.');
        const valB = b.replace('D-', 'D').replace('-', '.');
        return valA.localeCompare(valB, undefined, { numeric: true });
    });
}

// ========================================
// 하위 호환성을 위한 기존 COUNTRY_MAP 유지
// ========================================

const COUNTRY_MAP = {};
const ENGLISH_TO_KOREAN_MAP = {};

for (const [code, data] of Object.entries(COUNTRY_DATA)) {
    COUNTRY_MAP[data.nameKo] = data.nameEn;
    ENGLISH_TO_KOREAN_MAP[data.nameEn] = data.nameKo;
}

// ========================================
// 범용 국가 데이터 변환 함수
// ========================================

/**
 * 국가 정보를 다양한 형식으로 변환하는 범용 함수
 * @param {string} input - 입력값 (국가 코드, 한글명, 영문명 등)
 * @param {string} returnType - 반환 타입 ('code', 'nameKo', 'nameEn', 'zone')
 * @returns {string|null} - 변환된 값 또는 null (찾지 못한 경우)
 *
 * 사용 예시:
 * - convertCountryData('US', 'nameKo') → '미국'
 * - convertCountryData('미국', 'code') → 'US'
 * - convertCountryData('United States', 'code') → 'US'
 * - convertCountryData('스페인', 'nameEn') → 'Spain'
 */
function convertCountryData(input, returnType = 'code') {
    if (!input) return null;

    const inputUpper = String(input).trim().toUpperCase();
    const inputOriginal = String(input).trim();

    // 1. 국가 코드로 직접 검색
    if (COUNTRY_DATA[inputUpper]) {
        return COUNTRY_DATA[inputUpper][returnType] || null;
    }

    // 2. 한글명으로 검색
    for (const [code, data] of Object.entries(COUNTRY_DATA)) {
        if (data.nameKo === inputOriginal) {
            return data[returnType] || null;
        }
    }

    // 3. 영문명으로 검색 (대소문자 무시)
    for (const [code, data] of Object.entries(COUNTRY_DATA)) {
        if (data.nameEn.toUpperCase() === inputUpper) {
            return data[returnType] || null;
        }
    }

    // 4. 부분 일치 검색 (한글명 또는 영문명에 포함되는 경우)
    for (const [code, data] of Object.entries(COUNTRY_DATA)) {
        if (data.nameKo.includes(inputOriginal) ||
            data.nameEn.toUpperCase().includes(inputUpper)) {
            return data[returnType] || null;
        }
    }

    return null;
}

console.log(`✅ Country Data Loaded: ${Object.keys(COUNTRY_DATA).length} countries`);
