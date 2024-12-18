// biochemistry.js

/**
 * 생활화학제품 상품정보제공고시
 *
 * /**
 * @param {Object} data - 생활화학제품 관련 정보를 담은 객체
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
 * @param {string} data.productName - 품목 및 제품명 (필수, 최대 200자)
 * @param {string} data.dosageForm - 용도 및 제형 (필수, 최대 200자)
 *   - 표백제의 경우 계열을 함께 표시.
 * @param {string} data.packDate - 제조연월 ('yyyy-MM' 형식 입력, 최대 300자)
 * @param {string} data.packDateText - 제조연월 직접 입력 (필수, 최대 300자)
 *   - packDate 미입력 시 입력.
 * @param {string} data.expirationDate - 유통기한 ('yyyy-MM' 형식 입력, 최대 300자)
 * @param {string} data.expirationDateText - 유통기한 직접 입력 (필수, 최대 300자)
 *   - 유통기한이 없으면 '해당사항 없음' 입력.
 * @param {string} data.weight - 중량·용량·매수·크기 (필수, 최대 1500자)
 * @param {string} data.effect - 효능ㆍ효과 (필수, 최대 200자)
 *   - 승인 대상 생활화학제품에 한함.
 * @param {string} data.importer - 수입자 (최대 200자, 해당 사항 없으면 삭제)
 *   - 수입제품에 한함.
 * @param {string} data.producer - 제조국 (필수, 최대 200자)
 * @param {string} data.manufacturer - 제조자(사) (필수, 최대 200자)
 * @param {string} data.childProtection - 어린이보호포장 대상 제품 여부 (필수, 최대 200자)
 * @param {string} data.chemicals - 제품에 사용된 화학 물질 명칭 (필수, 최대 200자)
 *   - 주요물질, 보존제, 알레르기반응가능물질 등 명시.
 * @param {string} data.caution - 사용상 주의사항 (필수, 최대 500자)
 * @param {string} data.safeCriterionNo - 안전기준적합확인신고번호 또는 승인번호 (필수, 최대 200자)
 *   - 화학제품안전법 시행 이전 제품은 자가 검사번호를 표시.
 * @param {string} data.customerServicePhoneNumber - 소비자 상담 관련 전화번호 (필수, 최대 30자)
 */

export function createBiochemistry(data) {
    const {
        returnCostReason,
        noRefundReason,
        qualityAssuranceStandard,
        compensationProcedure,
        troubleShootingContents,
        productName,
        dosageForm,
        packDate,
        packDateText,
        expirationDate,
        expirationDateText,
        weight,
        effect,
        importer,
        producer,
        manufacturer,
        childProtection,
        chemicals,
        caution,
        safeCriterionNo,
        customerServicePhoneNumber,
    } = data;

    return {
        returnCostReason,
        noRefundReason,
        qualityAssuranceStandard,
        compensationProcedure,
        troubleShootingContents,
        productName,
        dosageForm,
        packDate,
        packDateText,
        expirationDate,
        expirationDateText,
        weight,
        effect,
        importer,
        producer,
        manufacturer,
        childProtection,
        chemicals,
        caution,
        safeCriterionNo,
        customerServicePhoneNumber,
    };
}
