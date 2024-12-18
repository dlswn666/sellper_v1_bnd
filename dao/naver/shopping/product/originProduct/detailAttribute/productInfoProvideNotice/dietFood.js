// dietFood.js

/**
 * 건강기능식품 상품정보제공고시
 *
 * /**
 * @param {Object} data - 제품 정보를 담은 객체
 *
 * @param {string} data.returnCostReason - 제품하자/오배송에 따른 청약철회 조항 (필수)
 *   - 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0: 전자상거래등에서의소비자보호에관한법률 등에 의한 제품의 하자 또는 오배송 등으로 인한 청약철회의 경우, 상품 수령 후 3개월 이내 청약철회 가능, 반품 비용은 통신판매업자가 부담.
 *      - 1: 상품상세 참조
 *
 * @param {string} data.noRefundReason - 단순변심에 따른 청약철회 불가 사유 (필수)
 *   - 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0: 전자상거래 등에서의 소비자보호에 관한 법률 등에 의한 청약철회 제한 사유에 해당.
 *      - 1: 상품상세 참조
 *
 * @param {string} data.qualityAssuranceStandard - 교환ㆍ반품ㆍ보증 조건 및 품질 보증 기준 (필수)
 *   - 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0: 소비자분쟁해결기준(공정거래위원회 고시) 및 관계법령에 따름.
 *      - 1: 상품상세 참조
 *
 * @param {string} data.compensationProcedure - 환불 및 지연배상금 지급 조건 및 절차 (필수)
 *   - 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0: 네이버페이 마이페이지에서 신청 가능하며, 환불 지연 시 연 15%의 지연배상금을 청구할 수 있음.
 *      - 1: 상품상세 참조
 *
 * @param {string} data.troubleShootingContents - 소비자 피해 보상 및 분쟁 처리 관련 사항 (필수)
 *   - 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0: 소비자분쟁해결기준(공정거래위원회 고시) 및 관계법령에 따름.
 *      - 1: 상품상세 참조
 *
 * @param {string} data.productName - 제품명 (필수, 최대 200자)
 * @param {string} data.producer - 제조업소 (필수, 최대 200자)
 * @param {string} data.location - 소재지 (필수, 최대 200자)
 *   - 수입품의 경우 수입업소명, 제조업소명 및 수출국명 포함.
 * @param {string} data.consumptionDate - 소비기한 (<date>, 최대 300자)
 * @param {string} data.consumptionDateText - 소비기한 직접 입력 (consumptionDate 미입력 시 필수, 최대 300자)
 * @param {string} data.storageMethod - 보관방법 (필수, 최대 200자)
 * @param {string} data.weight - 포장 단위별 내용물의 용량(중량), 수량 (필수, 최대 200자)
 * @param {string} data.amount - 포장 단위별 수량 (필수, 최대 200자)
 * @param {string} data.ingredients - 원료명 및 함량 (필수, 최대 1000자)
 *   - ｢농수산물의 원산지 표시 등에 관한 법률｣에 따른 원산지 표시 포함.
 * @param {string} data.nutritionFacts - 영양 정보 (필수, 최대 1000자)
 * @param {string} data.specification - 기능 정보 (필수, 최대 1000자)
 * @param {string} data.cautionAndSideEffect - 섭취량, 섭취 방법 및 섭취 시 주의사항 (필수, 최대 1000자)
 * @param {string} data.nonMedicinalUsesMessage - 질병의 예방 및 치료를 위한 의약품이 아님을 명시하는 문구 (필수, 최대 200자)
 * @param {boolean} data.geneticallyModified - 유전자변형건강기능식품에 해당하는 경우의 표시 (필수)
 * @param {boolean} data.importDeclarationCheck - 수입 건강기능식품 신고 필 여부 (필수)
 *   - true: 수입식품안전관리특별법에 따른 수입 신고를 필함.
 *   - false: 해당 사항 없음.
 * @param {string} data.consumerSafetyCaution - 소비자안전을 위한 주의사항 (필수, 최대 500자)
 *   - ｢식품 등의 표시ㆍ광고에 관한 법률 시행규칙｣ 제5조 및 [별표 2]에 따른 표시사항.
 * @param {string} data.customerServicePhoneNumber - 소비자 상담 관련 전화번호 (필수, 최대 30자)
 */

export function createDietFood(data) {
    const {
        returnCostReason,
        noRefundReason,
        qualityAssuranceStandard,
        compensationProcedure,
        troubleShootingContents,
        productName,
        producer,
        location,
        consumptionDate,
        consumptionDateText,
        storageMethod,
        weight,
        amount,
        ingredients,
        nutritionFacts,
        specification,
        cautionAndSideEffect,
        nonMedicinalUsesMessage,
        geneticallyModified,
        importDeclarationCheck,
        consumerSafetyCaution,
        customerServicePhoneNumber,
    } = data;

    return {
        returnCostReason,
        noRefundReason,
        qualityAssuranceStandard,
        compensationProcedure,
        troubleShootingContents,
        productName,
        producer,
        location,
        consumptionDate,
        consumptionDateText,
        storageMethod,
        weight,
        amount,
        ingredients,
        nutritionFacts,
        specification,
        cautionAndSideEffect,
        nonMedicinalUsesMessage,
        geneticallyModified,
        importDeclarationCheck,
        consumerSafetyCaution,
        customerServicePhoneNumber,
    };
}
