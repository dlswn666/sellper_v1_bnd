// simpleOption.js
// @description: detailAttribute 내 optionInfo 객체를 생성하는 함수
// 단독형 옵션 : optionSimple, 직접입력형 옵션 : optionCustom, 조합형 옵션 : optionCombination

/**
 * @function createSimpleOption
 * @param {'CREATE'|'ABC'} data.simpleOptionSortType - 단독형 옵션 정렬 순서 Enum
 *      - CREATE : 등록순
 *      - ABC : 가나다순
 * @param {Object} data.optionSimple - 단독형 옵션, 최대 3개까지 등록 가능
 * @param {number} data.optionSimple.id - 옵션 ID
 * @param {string} data.optionSimple.groupName - 옵션명 ( 단독형 옵션 필수값 )
 * @param {string} data.optionSimple.name - 옵션값
 * @param {boolean} data.optionSimple.usable - 사용 가능 여부
 * @returns {Object} simpleOption
 */
export function createSimpleOption(data = {}) {
    const { simpleOptionSortType, optionSimple } = data;
    // 예시 데이터
    // const defaultSimpleOption = {
    //     simpleOptionSortType: 'CREATE',
    //     optionSimple: [
    //         {
    //             id: 1,
    //             groupName: '색상',
    //             name: '블랙',
    //             usable: true,
    //         },
    //     ],
    // };

    return {
        simpleOptionSortType,
        optionSimple: optionSimple?.map((option) => ({
            id: option.id,
            groupName: option.groupName,
            name: option.name,
            usable: option.usable,
        })),
    };
}
