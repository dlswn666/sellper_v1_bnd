// customOption.js
// @description: detailAttribute 내 optionInfo 객체를 생성하는 함수
// 직접입력형 옵션 : optionCustom

/**
 * @function createCustomOption
 *
 * @param {Object} data.optionCustom - 직접입력형 옵션, 최대 5개 까지 등록 가능.
 * @param {number} data.optionCustom.id - 옵션 ID
 * @param {string} data.optionCustom.groupName - 옵션 그룹명 ( 직접입력형 옵션 필수값 )
 * @param {string} data.optionCustom.name - 옵션명 ("단독형 옵션"인 경우 입력합니다. "직접 입력형 옵션"인 경우 무시됩니다)
 * @param {boolean} data.optionCustom.usable - 사용 가능 여부
 *
 * @returns {Object} optionCustom
 */
export function createCustomOption(data = {}) {
    const { optionCustom } = data;
    // 예시 데이터
    // const defaultCustomOption = [
    //     {
    //         id: 1,
    //         groupName: '색상',
    //         name: '레드',
    //         usable: true,
    //     },
    // ];

    return {
        optionCustom: optionCustom?.map((option) => ({
            id: option.id,
            groupName: option.groupName,
            name: option.name,
            usable: option.usable,
        })),
    };
}
