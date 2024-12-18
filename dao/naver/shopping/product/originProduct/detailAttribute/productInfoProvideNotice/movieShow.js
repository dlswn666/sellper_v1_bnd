// movieShow.js

/**
 * 영화/공연 상품정보제공고시
 *
 * /**
 * @param {Object} data - 공연 관련 정보를 담은 객체
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
 * @param {string} data.sponsor - 주최 또는 기획 (필수, 최대 200자)
 *   - 공연에 한하며, 주최 및 기획사를 명시.
 * @param {string} data.actor - 주연 (필수, 최대 200자)
 *   - 공연에 한하며, 주요 출연진을 명시.
 * @param {string} data.rating - 관람 등급 (필수, 최대 200자)
 *   - 해당 공연이나 상영의 관람 가능 연령 등급.
 * @param {string} data.showTime - 상영ㆍ공연 시간 (필수, 최대 200자)
 * @param {string} data.showPlace - 상영ㆍ공연 장소 (필수, 최대 200자)
 * @param {string} data.cancelationCondition - 예매 취소 조건 (필수, 최대 200자)
 *   - 취소 가능한 조건 및 사유를 명시.
 * @param {string} data.cancelationPolicy - 취소ㆍ환불 방법 (필수, 최대 200자)
 *   - 예매 취소 시 환불 방법을 상세히 기술.
 * @param {string} data.customerServicePhoneNumber - 소비자 상담 관련 전화번호 (필수, 최대 30자)
 */
export function createMovieShow(data) {
    const {
        returnCostReason,
        noRefundReason,
        qualityAssuranceStandard,
        compensationProcedure,
        troubleShootingContents,
        sponsor,
        actor,
        rating,
        showTime,
        showPlace,
        cancelationCondition,
        cancelationPolicy,
        customerServicePhoneNumber,
    } = data;

    return {
        returnCostReason,
        noRefundReason,
        qualityAssuranceStandard,
        compensationProcedure,
        troubleShootingContents,
        sponsor,
        actor,
        rating,
        showTime,
        showPlace,
        cancelationCondition,
        cancelationPolicy,
        customerServicePhoneNumber,
    };
}
