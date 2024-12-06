// afterServiceInfo.js
// @description: detailAttribute 내 afterServiceInfo 객체를 생성하는 함수
// DOC를 보고 필수/선택 파악 필요

/**
 * @function createAfterServiceInfo
 * @description detailAttribute 내 A/S 정보 객체 생성
 *
 * @param {Object} data
 * @param {string} data.afterServiceTelephoneNumber - A/S 전화번호
 * @param {string} data.afterServiceGuideContent - A/S 안내 내용
 *
 * @returns {Object} afterServiceInfo
 */
export function createAfterServiceInfo(data) {
    const {
        afterServiceTelephoneNumber = '010-3504-8164',
        afterServiceGuideContent = '전화상담 가능하나, 네이버톡톡으로 문의 주시면 더욱 빠르게 답변 가능합니다.',
    } = data;

    return {
        afterServiceTelephoneNumber: afterServiceTelephoneNumber,
        afterServiceGuideContent: afterServiceGuideContent,
    };
}
