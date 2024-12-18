// kitchenUtensils.js

/**
 * 주방용품 상품정보제공고시
 *
 * /**
 * @param {Object} data - 제품 정보를 담은 객체
 *
 * @param {string} data.returnCostReason - 제품하자/오배송에 따른 청약철회 조항 (필수)
 *   - 제품하자ㆍ오배송 등에 따른 청약철회 등의 경우 청약철회 등의 기한 및 통신판매업자가 부담하는 반품 비용 등에 관한 정보.
 *   - 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0: 전자상거래등에서의소비자보호에관한법률 등에 의한 제품의 하자 또는 오배송 등으로 인한 청약철회의 경우, 상품 수령 후 3개월 이내, 그 사실을 안 날 또는 알 수 있었던 날로부터 30일 이내에 청약철회를 할 수 있으며, 반품 비용은 통신판매업자가 부담합니다.
 *      - 1: 상품상세 참조
 *
 * @param {string} data.noRefundReason - 단순변심에 따른 청약철회 불가 사유 (필수)
 *   - 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0: 전자상거래 등에서의 소비자보호에 관한 법률 등에 의한 청약철회 제한 사유에 해당하는 경우 및 기타 객관적으로 이에 준하는 것으로 인정되는 경우 청약철회가 제한될 수 있습니다.
 *      - 1: 상품상세 참조
 *
 * @param {string} data.qualityAssuranceStandard - 재화 등의 교환ㆍ반품ㆍ보증 조건 및 품질 보증 기준 (필수)
 *   - 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0: 소비자분쟁해결기준(공정거래위원회 고시) 및 관계법령에 따릅니다.
 *      - 1: 상품상세 참조
 *
 * @param {string} data.compensationProcedure - 대금을 환불받기 위한 방법과 환불 지연 시 지연배상금 지급 조건 및 절차 (필수)
 *   - 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0: 주문취소 및 대금의 환불은 네이버페이 마이페이지에서 신청할 수 있으며, 소비자의 청약철회 후 판매자가 반환 받은 날로부터 3영업일 이내에 환불.
 *      - 1: 상품상세 참조
 *
 * @param {string} data.troubleShootingContents - 소비자 피해 보상 및 분쟁 처리 관련 사항 (필수)
 *   - 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0: 소비자분쟁해결기준(공정거래위원회 고시) 및 관계법령에 따릅니다.
 *      - 1: 상품상세 참조
 *
 * @param {string} data.itemName - 품명 (필수, 최대 50자)
 * @param {string} data.modelName - 모델명 (필수, 최대 50자)
 * @param {string} data.material - 재질 (필수, 최대 200자)
 * @param {string} data.component - 구성품 (필수, 최대 500자)
 * @param {string} data.size - 크기 (필수, 최대 200자)
 * @param {string} data.releaseDate - 출시연월 (<'yyyy-MM'> 형식, 최대 300자)
 * @param {string} data.releaseDateText - 동일 모델 출시연월 직접 입력 (releaseDate 미입력 시 필수, 최대 300자)
 * @param {string} data.manufacturer - 제조자(사) (필수, 최대 200자)
 * @param {string} data.producer - 제조국 (필수, 최대 200자)
 * @param {boolean} data.importDeclaration - 수입식품안전관리특별법에 따른 수입신고 여부 (미입력 시 기본값 false)
 *   - true: 수입식품안전관리특별법에 따른 수입신고를 필함.
 *   - false: 해당 사항 없음.
 *
 * @param {string} data.warrantyPolicy - 품질 보증 기준 (필수, 최대 1500자)
 * @param {string} data.afterServiceDirector - A/S 책임자와 전화번호 (필수, 최대 200자)
 */
export function createKitchenUtensils(data) {
    const {
        returnCostReason,
        noRefundReason,
        qualityAssuranceStandard,
        compensationProcedure,
        troubleShootingContents,
        itemName,
        modelName,
        material,
        component,
        size,
        releaseDate,
        releaseDateText,
        manufacturer,
        producer,
        importDeclaration,
        warrantyPolicy,
        afterServiceDirector,
    } = data;

    return {
        returnCostReason,
        noRefundReason,
        qualityAssuranceStandard,
        compensationProcedure,
        troubleShootingContents,
        itemName,
        modelName,
        material,
        component,
        size,
        releaseDate,
        releaseDateText,
        manufacturer,
        producer,
        importDeclaration,
        warrantyPolicy,
        afterServiceDirector,
    };
}
