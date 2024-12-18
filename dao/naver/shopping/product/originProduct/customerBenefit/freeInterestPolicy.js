// freeInterestPolicy.js

/**
 * 무이자 할부 정책
 * @param {Object} data - 무이자 할부 정보를 담은 객체
 *
 * @param {number} data.value - 무이자 할부 개월 수
 *   - 무이자 할부 적용 개월 수를 입력합니다.
 *   - 정수 값 입력 (예: 3, 6, 12)
 *
 * @param {string} data.startDate - 무이자 할부 시작일
 *   - 무이자 할부가 시작되는 날짜를 입력합니다.
 *   - 형식: 'yyyy-MM-dd'
 *     - 예: '2024-12-01'
 *
 * @param {string} data.endDate - 무이자 할부 종료일 (시작일 입력 시 필수)
 *   - 무이자 할부가 종료되는 날짜를 입력합니다.
 *   - 형식: 'yyyy-MM-dd'
 *     - 예: '2025-01-01'
 */

export function createFreeInterestPolicy(data) {
    const { value, startDate, endDate } = data;

    return {
        value,
        startDate,
        endDate,
    };
}
