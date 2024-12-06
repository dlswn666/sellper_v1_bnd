// originAreaInfo.js
// @description: detailAttribute 내 원산지 정보
/**
 * @function createOriginAreaInfo
 * @param {Object} data
 * @param {string} data.originAreaCode - 원산지 상세 지역 코드
 *      - 00(국산)
 *      - 01(원양산)
 *      - 02(수입산)
 *      - 03(기타-상세 설명에 표시)
 *      - 04(기타-직접 입력)
 *      - 05(원산지 표기 의무 대상 아님)
 * @param {string} data.importer - 수입사명 ( 수입산인 경우 필수 )
 * @param {string} data.content - 원산지 관련 설명 ( 기타-상세 설명에 표시인 경우 필수 )
 * @param {boolean} data.plural - 복수 원산지 여부 ( 미입력시 false )
 *
 * @returns {Object} originAreaInfo
 */
export function createOriginAreaInfo(data) {
    return {
        originAreaCode: data.originAreaCode,
        importer: data.importer,
        content: data.content,
        plural: data.plural,
    };
}
