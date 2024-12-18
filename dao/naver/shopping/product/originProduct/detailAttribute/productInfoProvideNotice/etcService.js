// etcService.js

/**
 * 기타 용역 상품정보제공고시
 *
 * /**
 * @param {Object} data - 서비스 제공 및 환불 정책 정보를 담은 객체
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
 * @param {string} data.serviceProvider - 서비스 제공 사업자 (필수, 최대 200자)
 * @param {string} data.certificateDetails - 법에 의한 인증ㆍ허가 등을 받았음을 확인할 수 있는 경우 그에 대한 사항 (필수, 최대 200자)
 * @param {string} data.usableCondition - 이용 조건 (필수, 최대 200자)
 *   - 이용 가능 기간·장소, 추가 비용 등 포함.
 * @param {string} data.cancelationStandard - 취소ㆍ중도해약ㆍ해지 조건 및 환불 기준 (필수, 최대 200자)
 * @param {string} data.cancelationPolicy - 취소ㆍ환불 방법 (필수, 최대 200자)
 * @param {string} data.customerServicePhoneNumber - 소비자 상담 관련 전화번호 (필수, 최대 30자)
 */
export function createEtcService(data) {
    const {
        returnCostReason,
        noRefundReason,
        qualityAssuranceStandard,
        compensationProcedure,
        troubleShootingContents,
        serviceProvider,
        certificateDetails,
        usableCondition,
        cancelationStandard,
        cancelationPolicy,
        customerServicePhoneNumber,
    } = data;

    return {
        returnCostReason,
        noRefundReason,
        qualityAssuranceStandard,
        compensationProcedure,
        troubleShootingContents,
        serviceProvider,
        certificateDetails,
        usableCondition,
        cancelationStandard,
        cancelationPolicy,
        customerServicePhoneNumber,
    };
}
