// cellPhone.js

/**
 * 휴대폰 상품정보제공고시
 * /**
 * @param {Object} data - 상품 정보를 담은 객체
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
 * @param {string} data.itemName - 품목 (필수, 최대 50자)
 * @param {string} data.modelName - 모델명 (필수, 최대 50자)
 * @param {string} data.certificationType - KC 인증정보 (필수, 최대 50자)
 *   - ｢전기용품 및 생활용품 안전관리법｣에 따른 인증 대상 제품에 한함.
 *
 * @param {string} data.releaseDate - 동일 모델의 출시연월 ('yyyy-MM' 형식 입력, 최대 300자)
 * @param {string} data.releaseDateText - 출시연월일 직접 입력 (releaseDate 미입력 시 필수, 최대 300자)
 * @param {string} data.manufacturer - 제조자(사) (필수, 최대 200자)
 * @param {string} data.importer - 수입자 (최대 200자, 수입품의 경우에만 사용)
 * @param {string} data.producer - 제조국 (필수, 최대 200자)
 * @param {string} data.size - 크기 (필수, 최대 50자)
 * @param {string} data.weight - 무게 (필수, 최대 50자)
 * @param {string} data.telecomType - 이동통신사 (필수, 최대 50자)
 * @param {string} data.joinProcess - 가입절차 (필수, 최대 50자)
 * @param {string} data.extraBurden - 소비자의 추가적인 부담사항 (필수, 최대 50자)
 *   - 가입비, 유심카드 구입비, 부가서비스, 의무사용기간, 위약금 등
 *
 * @param {string} data.specification - 주요 사양 (필수, 최대 500자)
 * @param {string} data.warrantyPolicy - 품질 보증 기준 (필수, 최대 500자)
 * @param {string} data.afterServiceDirector - A/S 책임자와 전화번호 (필수, 최대 200자)
 */

export function createCellPhone(data) {
    const {
        returnCostReason,
        noRefundReason,
        qualityAssuranceStandard,
        compensationProcedure,
        troubleShootingContents,
        itemName,
        modelName,
        certificationType,
        releaseDate,
        releaseDateText,
        manufacturer,
        importer,
        producer,
        size,
        weight,
        telecomType,
        joinProcess,
        extraBurden,
        specification,
        warrantyPolicy,
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
        certificationType,
        releaseDate,
        releaseDateText,
        manufacturer,
        importer,
        producer,
        size,
        weight,
        telecomType,
        joinProcess,
        extraBurden,
        specification,
        warrantyPolicy,
        afterServiceDirector,
        customerServicePhoneNumber,
    };
}
