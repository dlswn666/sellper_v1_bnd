// book.js

/**
 * 서적 상품정보제공고시
 *
 * /**
 * @param {Object} data - 도서 정보를 담은 객체
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
 * @param {string} data.title - 도서명 (필수, 최대 200자)
 * @param {string} data.author - 저자 (필수, 최대 200자)
 * @param {string} data.publisher - 출판사 (필수, 최대 200자)
 * @param {string} data.size - 크기 (필수, 최대 200자)
 * @param {string} data.pages - 쪽수 (필수, 최대 30자)
 * @param {string} data.components - 제품 구성 (선택, 최대 1000자)
 *   - 전집 또는 세트일 경우 낱권 구성, CD 등을 포함.
 * @param {string} data.publishDate - 발행일 (<date>, 최대 200자)
 *   - ｢출판문화산업 진흥법｣ 제2조 및 제22조의 규정에 따라 매 판을 처음 인쇄한 날.
 * @param {string} data.publishDateText - 발행일 직접 입력 (publishDate 미입력 시 필수, 최대 200자)
 *   - ｢출판문화산업 진흥법｣ 제2조 및 제22조의 규정에 따라 매 판을 처음 인쇄한 날.
 * @param {string} data.description - 목차 또는 책 소개 (필수, 최대 1000자)
 *   - 아동용 학습교재의 경우 사용 연령 포함.
 */
export function createBook(data) {
    const {
        returnCostReason,
        noRefundReason,
        qualityAssuranceStandard,
        compensationProcedure,
        troubleShootingContents,
        title,
        author,
        publisher,
        size,
        pages,
        components,
        publishDate,
        publishDateText,
        description,
    } = data;

    return {
        returnCostReason,
        noRefundReason,
        qualityAssuranceStandard,
        compensationProcedure,
        troubleShootingContents,
        title,
        author,
        publisher,
        size,
        pages,
        components,
        publishDate,
        publishDateText,
        description,
    };
}
