// combinationOption.js
// @description: detailAttribute 내 optionInfo 객체를 생성하는 함수
// 조합형 옵션 : optionCombination

/**
 * @function createCombinationOption
 *
 * @param {'CREATE'|'ABC'|'LOW_PRICE'|'HIGH_PRICE'} data.optionCombinationSortType - 조합형 옵션 정렬 순서 Enum
 *      - CREATE : 등록순
 *      - ABC : 가나다순
 *      - LOW_PRICE : 낮은가격순
 *      - HIGH_PRICE : 높은가격순
 *
 * @param {Object} data.optionCombinationGroupNames - 조합형 옵션명 목록
 * @param {string} data.optionCombinationGroupNames.optionGroupName1 - 조합형 옵션 그룹명 required
 * @param {string} data.optionCombinationGroupNames.optionGroupName2 - 조합형 옵션명
 * @param {string} data.optionCombinationGroupNames.optionGroupName3 - 조합형 옵션명
 * @param {string} data.optionCombinationGroupNames.optionGroupName4 - "지점형 옵션"인 경우만 대상. "조합형 옵션"인 경우 무시됩니다.
 *
 * @param {Object} data.optionCombinations - 조합형 옵션 목록
 * @param {number} data.optionCombinations.id - 조합형 옵션 ID - 옵션 수정시 필요
 * @param {string} data.optionCombinations.optionName1 - 조합형 옵션값 1 ( 필수 ) - 조합형 옵션 그룹명 1에 해당
 * @param {string} data.optionCombinations.optionName2 - 조합형 옵션값 2 ( 필수 ) - 조합형 옵션 그룹명 2에 해당
 * @param {string} data.optionCombinations.optionName3 - 조합형 옵션값 3 ( 필수 ) - 조합형 옵션 그룹명 3에 해당
 * @param {string} data.optionCombinations.optionName4 - "지점형 옵션"인 경우만 대상. "조합형 옵션"인 경우 무시됩니다.
 * @param {number} data.optionCombinations.stockQuantity - 재고 수량, 미입력시 0
 * @param {number} data.optionCombinations.price - 조합형 옵션 가격, 미입력시 0
 * @param {string} data.optionCombinations.sellerManagerCode - 판매자 관리 코드
 * @param {boolean} data.optionCombinations.usable - 사용 가능 여부
 *
 * @returns {Object} optionCombination
 */

export function createCombinationOption(data = {}) {
    const { optionCombinationSortType, optionCombinationGroupNames, optionCombinations } = data;

    // 예시 데이터
    // const defaultCombinationOption = {
    //     optionCombinationSortType: 'CREATE',
    //     optionCombinationGroupNames: {
    //         optionGroupName1: '색상',
    //         optionGroupName2: '사이즈',
    //         optionGroupName3: '옵션',
    //     },
    //     optionCombinations: [
    //         {
    //             id: 1,
    //             optionName1: '블랙',
    //             optionName2: 'M',
    //             optionName3: '옵션1',
    //         },
    //         {
    //             id: 2,
    //             optionName1: '블랙',
    //             optionName2: 'L',
    //             optionName3: '옵션2',
    //         },
    //         {
    //             id: 3,
    //             optionName1: '블랙',
    //             optionName2: 'L',
    //             optionName3: '옵션3',
    //         },
    //     ],
    // };

    const optionCombination = {
        optionCombinationSortType,
        optionCombinationGroupNames: {
            optionGroupName1: optionCombinationGroupNames.optionGroupName1,
            optionGroupName2: optionCombinationGroupNames.optionGroupName2,
            optionGroupName3: optionCombinationGroupNames.optionGroupName3,
        },
        optionCombinations: optionCombinations?.map((optionCombination) => ({
            id: optionCombination.id,
            optionName1: optionCombination.optionName1,
            optionName2: optionCombination.optionName2,
            optionName3: optionCombination.optionName3,
        })),
    };

    return optionCombination;
}
