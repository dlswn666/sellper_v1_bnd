// optionInfo.js
// @description: detailAttribute 내 optionInfo 객체를 생성하는 함수

/**
 * @function createOptionInfo
 * @param {Object} data
 * @param {'CREATE'|'ABC'} data.simpleOptionSortType - 단독형 옵션 정렬 순서 Enum
 *      - CREATE : 등록순
 *      - ABC : 가나다순
 * @param {Object} data.optionSimple - 단독형 옵션, 최대 3개까지 등록 가능
 * @param {number} data.optionSimple.id - 옵션 ID
 * @param {string} data.optionSimple.groupName - 옵션 그룹명
 * @param {string} data.optionSimple.name - 옵션명
 * @param {boolean} data.optionSimple.usable - 사용 가능 여부
 *
 * @param {Object} data.optionCombinationGroupNames - 조합형 옵션명 목록
 * @param {string} data.optionCombinationGroupNames.optionGroupName1 - 조합형 옵션 그룹명 required
 * @param {string} data.optionCombinationGroupNames.optionGroupName2 - 조합형 옵션명
 * @param {string} data.optionCombinationGroupNames.optionGroupName3 - 조합형 옵션명
 * @param {string} data.optionCombinationGroupNames.optionGroupName4 - "지점형 옵션"인 경우만 대상. "조합형 옵션"인 경우 무시됩니다.
 *
 *
 * @returns {Object} optionInfo
 */
export function createOptionInfo(data) {
    const {
        simpleOptionSortType = 'CREATE',
        optionSimple = [
            {
                id: 1,
                groupName: '옵션명',
                name: '옵션명',
                usable: true,
            },
        ],
    } = data;
}
