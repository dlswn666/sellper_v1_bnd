// medicalAppliances.js

/**
 * 의료기기 상품정보제공고시
 * @param {Object} data
 *
 * @param {string} data.returnCostReason - 제품하자/오배송에 따른 청약철회 조항 (필수)
 *   - 제품하자ㆍ오배송 등에 따른 청약철회 등의 경우 청약철회 등의 기한 및 통신판매업자가 부담하는 반품 비용 등에 관한 정보. 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0: 전자상거래 등에서의 소비자보호에 관한 법률 등에 의한 제품의 하자 또는 오배송 등으로 인한 청약철회의 경우, 상품 수령 후 3개월 이내, 그 사실을 안 날 또는 알 수 있었던 날로부터 30일 이내에 청약철회를 할 수 있으며, 반품 비용은 통신판매업자가 부담합니다.
 *      - 1: 상품상세 참조
 *
 * @param {string} data.noRefundReason - 소비자의 단순변심에 따른 청약철회 불가 사유 (필수)
 *   - 청약철회 불가 사유 중 하나를 선택합니다. 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0: 전자상거래 등에서의 소비자보호에 관한 법률 등에 의한 청약철회 제한 사유에 해당하는 경우 및 기타 객관적으로 이에 준하는 것으로 인정되는 경우 청약철회가 제한될 수 있습니다.
 *      - 1: 상품상세 참조
 *
 * @param {string} data.qualityAssuranceStandard - 교환ㆍ반품ㆍ보증 조건 및 품질 보증 기준 (필수)
 *   - 품질보증 기준을 선택합니다. 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0: 소비자분쟁해결기준(공정거래위원회 고시) 및 관계법령에 따릅니다.
 *      - 1: 상품상세 참조
 *
 * @param {string} data.compensationProcedure - 환불 및 지연배상금 지급 조건 및 절차 (필수)
 *   - 배상 절차를 선택합니다. 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0: 주문취소 및 대금의 환불은 네이버페이 마이페이지에서 신청할 수 있으며, 전자상거래 등에서의 소비자보호에 관한 법률에 따라 소비자의 청약철회 후 판매자가 재화 등을 반환 받은 날로부터 3영업일 이내에 지급받은 대금의 환급을 정당한 사유 없이 지연하는 때에는 소비자는 지연기간에 대해서 연 15%의 지연배상금을 판매자에게 청구할 수 있습니다.
 *      - 1: 상품상세 참조
 *
 * @param {string} data.troubleShootingContents - 소비자 피해 보상 및 분쟁 처리 관련 사항 (필수)
 *   - 소비자 피해 보상 및 분쟁 처리 관련 사항을 선택합니다. 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0: 소비자분쟁해결기준(공정거래위원회 고시) 및 관계법령에 따릅니다.
 *      - 1: 상품상세 참조
 *
 * @param {string} data.itemName - 품명 (필수, 최대 50자)
 * @param {string} data.modelName - 모델명 (필수, 최대 50자)
 * @param {string} data.licenceNo - 허가·인증·신고번호 (선택, 최대 30자, 해당 사항 없을 경우 제외)
 * @param {string} data.advertisingCertificationType - 광고사전심의 필 유무 (필수, 최대 200자)
 * @param {string} data.ratedVoltage - 정격전압 (선택, 최대 1500자, 전기용품에 한함)
 * @param {string} data.powerConsumption - 소비전력 (선택, 최대 200자, 전기용품에 한함)
 * @param {string} data.releaseDate - 출시연월 (<'yyyy-MM'> 형식, 최대 300자)
 * @param {string} data.releaseDateText - 출시연월 직접 입력 (releaseDate 미입력 시 필수, 최대 300자)
 * @param {string} data.manufacturer - 제조자 (필수, 최대 200자)
 * @param {string} data.purpose - 제품의 사용 목적 (필수, 최대 500자)
 * @param {string} data.usage - 사용 방법 (필수, 최대 500자)
 * @param {string} data.caution - 취급 시 주의사항 (필수, 최대 1500자)
 * @param {string} data.warrantyPolicy - 품질 보증 기준 (필수, 최대 1500자)
 * @param {string} data.afterServiceDirector - A/S 책임자와 전화번호 (필수, 최대 200자)
 */
export function createMedicalAppliances(data) {
    const {
        returnCostReason,
        noRefundReason,
        qualityAssuranceStandard,
        compensationProcedure,
        troubleShootingContents,
        itemName,
        modelName,
        licenceNo,
        advertisingCertificationType,
        ratedVoltage,
        powerConsumption,
        releaseDate,
        releaseDateText,
        manufacturer,
        purpose,
        usage,
        caution,
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
        licenceNo,
        advertisingCertificationType,
        ratedVoltage,
        powerConsumption,
        releaseDate,
        releaseDateText,
        manufacturer,
        purpose,
        usage,
        caution,
        warrantyPolicy,
        afterServiceDirector,
    };
}
