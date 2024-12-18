// etc.js

/**
 * 기타
 *
 * /**
 * @param {Object} data - 상품 정보를 담은 객체
 *
 * @param {string} data.returnCostReason - 제품하자/오배송에 따른 청약철회 조항 (필수)
 *   - 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0: 전자상거래등에서의소비자보호에관한법률에 따라, 상품 수령 후 3개월 이내 또는 그 사실을 안 날로부터 30일 이내 청약철회 가능하며 반품 비용은 통신판매업자가 부담합니다.
 *      - 1: 상품상세 참조
 *
 * @param {string} data.noRefundReason - 단순변심에 따른 청약철회 불가 사유 (필수)
 *   - 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0: 전자상거래 등에서의 소비자보호에 관한 법률 등에 의한 청약철회 제한 사유에 해당합니다.
 *      - 1: 상품상세 참조
 *
 * @param {string} data.qualityAssuranceStandard - 교환ㆍ반품ㆍ보증 조건 및 품질 보증 기준 (필수)
 *   - 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0: 소비자분쟁해결기준(공정거래위원회 고시) 및 관계법령에 따릅니다.
 *      - 1: 상품상세 참조
 *
 * @param {string} data.compensationProcedure - 대금을 환불받기 위한 방법 및 지연 배상금 지급 조건 (필수)
 *   - 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0: 네이버페이 마이페이지에서 신청 가능하며, 환불 지연 시 연 15%의 지연배상금을 청구할 수 있습니다.
 *      - 1: 상품상세 참조
 *
 * @param {string} data.troubleShootingContents - 소비자 피해 보상 및 분쟁 처리 관련 사항 (필수)
 *   - 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0: 소비자분쟁해결기준(공정거래위원회 고시) 및 관계법령에 따릅니다.
 *      - 1: 상품상세 참조
 *
 * @param {string} data.itemName - 품명 (필수, 최대 50자)
 * @param {string} data.modelName - 모델명 (필수, 최대 50자)
 *
 * @param {string} data.certificateDetails - 법에 의한 인증, 허가 등에 대한 세부사항 (선택, 최대 500자)
 *   - 해당 사항이 없으면 이 요소를 생략.
 *
 * @param {string} data.manufacturer - 제조자(사) (필수, 최대 200자)
 *
 * @param {string} data.afterServiceDirector - A/S 책임자 (선택, 최대 200자)
 *   - 입력하지 않을 경우 `customerServicePhoneNumber`가 필수입니다.
 *
 * @param {string} data.customerServicePhoneNumber - 소비자 상담 관련 전화번호 (최대 30자)
 *   - `afterServiceDirector`를 입력하지 않은 경우 필수.
 */
export function createEtc(data) {
    const {
        returnCostReason,
        noRefundReason,
        qualityAssuranceStandard,
        compensationProcedure,
        troubleShootingContents,
        itemName,
        modelName,
        certificateDetails,
        manufacturer,
        afterServiceDirector,
        customerServicePhoneNumber,
    } = data;

    return {
        returnCostReason,
        noRefundReason,
        qualityAssuranceStandard,
        compensationProcedure,
        troubleShootingContents,
        itemName,
        modelName,
        certificateDetails,
        manufacturer,
        afterServiceDirector,
        customerServicePhoneNumber,
    };
}
