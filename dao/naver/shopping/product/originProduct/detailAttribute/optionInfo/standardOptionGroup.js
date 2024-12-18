// standardOption.js
// @description: detailAttribute 내 optionInfo 객체를 생성하는 함수
// 표준형 옵션 : optionStandard

/**
 * @function createStandardOption
 * @param {object} data.standardOptionGroups - 표준옵션 그룹 목록
 * @param {string} data.standardOptionGroups.groupName - 표준옵션 그룹명
 * @param {object} data.standardOptionGroups.standardOptionAttributes - 표준옵션명
 * @param {number} data.standardOptionGroups.standardOptionAttributes.attributeId - 속성 ID (옵션 선택시 필수)
 * @param {number} data.standardOptionGroups.standardOptionAttributes.attributeValueId - 속성 값 ID (옵션 선택시 필수)
 * @param {string} data.standardOptionGroups.standardOptionAttributes.attributeValueName - 속성값 이름 (옵션 선택시 필수)
 * @param {object} data.standardOptionGroups.standardOptionAttributes.imageUrls - 속성값 이미지 목록
 *
 * @param {object} data.optionStandards - 표준형 옵션 목록
 * @param {number} data.optionStandards.id - 표준형 옵션명 1
 * @param {string} data.optionStandards.optionName1 - 표준형 옵션값 1
 * @param {string} data.optionStandards.optionName2 - 표준형 옵션값 2
 * @param {string} data.optionStandards.stockQuantity - 표준형 옵션 재고 수량
 * @param {string} data.optionStandards.sellerManagerCode - 판매자 관리 코드
 * @param {boolean} data.optionStandards.usable - 사용 가능 여부
 *
 * @returns {Object} optionStandard
 */

export function createStandardOption(data = {}) {
    const { standardOptionGroups, optionStandards } = data;
    // 예시 데이터
    // const defaultStandardOption = {
    //     standardOptionGroups: [
    //         {
    //             groupName: '색상',
    //             standardOptionAttributes: [
    //                 {
    //                     attributeId: 1,
    //                     attributeValueId: 1,
    //                     attributeValueName: '블랙',
    //                     imageUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    //                 },
    //                 {
    //                     attributeId: 2,
    //                     attributeValueId: 2,
    //                     attributeValueName: '화이트',
    //                     imageUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    //                 },
    //             ],
    //         },
    //         {
    //             groupName: '소재',
    //             standardOptionAttributes: [
    //                 {
    //                     attributeId: 3,
    //                     attributeValueId: 3,
    //                     attributeValueName: '면',
    //                     imageUrls: ['https://example.com/image3.jpg'],
    //                 },
    //                 {
    //                     attributeId: 4,
    //                     attributeValueId: 4,
    //                     attributeValueName: '폴리에스터',
    //                     imageUrls: ['https://example.com/image4.jpg'],
    //                 },
    //             ],
    //         },
    //     ],
    //     optionStandards: [
    //         {
    //             id: 1,
    //             optionName1: '블랙', // 색상
    //             optionName2: '면', // 소재
    //             stockQuantity: 10,
    //             sellerManagerCode: '1234567890',
    //             usable: true,
    //         },
    //         {
    //             id: 2,
    //             optionName1: '화이트', // 색상
    //             optionName2: '폴리에스터', // 소재
    //             stockQuantity: 5,
    //             sellerManagerCode: '0987654321',
    //             usable: true,
    //         },
    //     ],
    // };

    return {
        standardOptionGroups: standardOptionGroups?.map((standardOptionGroup) => ({
            groupName: standardOptionGroup.groupName,
            standardOptionAttributes: standardOptionGroup.standardOptionAttributes?.map((standardOptionAttribute) => ({
                attributeId: standardOptionAttribute.attributeId,
                attributeValueId: standardOptionAttribute.attributeValueId,
                attributeValueName: standardOptionAttribute.attributeValueName,
                imageUrls: standardOptionAttribute.imageUrls,
            })),
        })),
        optionStandards: optionStandards?.map((optionStandard) => ({
            id: optionStandard.id,
            optionName1: optionStandard.optionName1,
            optionName2: optionStandard.optionName2,
            stockQuantity: optionStandard.stockQuantity,
            sellerManagerCode: optionStandard.sellerManagerCode,
            usable: optionStandard.usable,
        })),
    };
}
