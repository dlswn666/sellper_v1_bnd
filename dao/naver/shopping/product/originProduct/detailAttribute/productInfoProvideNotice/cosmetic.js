// cosmetic.js

/**
 * 화장품 상품정보제공고시
 *
 * @param {Object} data - 화장품 상품정보제공고시 데이터
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
 * @param {string} data.capacity - 내용물의 용량 및 중량 (필수, 최대 200자)
 * @param {string} data.specification - 제품 주요 사양 (필수, 최대 1500자)
 *   - 예: 피부 타입, 색상(호, 번) 등.
 * @param {string} data.expirationDate - 사용기한 또는 개봉 후 사용기간 (<'yyyy-MM'> 형식, 최대 300자)
 * @param {string} data.expirationDateText - 사용기한 직접 입력 (expirationDate 미입력 시 필수, 최대 300자)
 * @param {string} data.usage - 사용 방법 (필수, 최대 1500자)
 * @param {string} data.manufacturer - 화장품 제조업자 (필수, 최대 200자)
 * @param {string} data.producer - 제조국 (필수, 최대 200자)
 * @param {string} data.distributor - 화장품책임판매업자 (필수, 최대 200자)
 * @param {string} data.customizedDistributor - 맞춤형 화장품판매업자 (선택, 최대 200자, 해당 사항 없을 경우 제외)
 * @param {string} data.mainIngredient - ｢화장품법｣에 따라 기재ㆍ표시하여야 하는 모든 성분 (필수, 최대 1500자)
 * @param {string} data.certificationType - ｢화장품법｣에 따른 기능성 화장품 (필수, 최대 200자)
 *   - 예: 미백, 주름개선, 자외선 차단제품 등.
 * @param {string} data.caution - 사용할 때의 주의사항 (필수, 최대 1500자)
 * @param {string} data.warrantyPolicy - 품질 보증 기준 (필수, 최대 1500자)
 * @param {string} data.customerServicePhoneNumber - 소비자 상담 관련 전화번호 (필수, 최대 30자)
 */
export function createCosmetic(data) {
    const {
        returnCostReason,
        noRefundReason,
        qualityAssuranceStandard,
        compensationProcedure,
        troubleShootingContents,
        capacity,
        specification,
        expirationDate,
        expirationDateText,
        usage,
        manufacturer,
        producer,
        distributor,
        customizedDistributor,
        mainIngredient,
        certificationType,
        caution,
        warrantyPolicy,
        customerServicePhoneNumber,
    } = data;

    return {
        returnCostReason,
        noRefundReason,
        qualityAssuranceStandard,
        compensationProcedure,
        troubleShootingContents,
        capacity,
        specification,
        expirationDate,
        expirationDateText,
        usage,
        manufacturer,
        producer,
        distributor,
        customizedDistributor,
        mainIngredient,
        certificationType,
        caution,
        warrantyPolicy,
        customerServicePhoneNumber,
    };
}
