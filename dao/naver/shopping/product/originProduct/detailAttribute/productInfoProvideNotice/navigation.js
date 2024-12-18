// navigation.js

/**
 * 내비게이션 상품정보제공고시
 * @param {Object} data
 *
 * @param {string} data.returnCostReason - 제품하자/오배송에 따른 청약철회 조항
 *   - 제품하자ㆍ오배송 등에 따른 청약철회 등의 경우 청약철회 등의 기한 및 통신판매업자가 부담하는 반품 비용 등에 관한 정보. 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0 (전자상거래등에서의소비자보호에관한법률 등에 의한 제품의 하자 또는 오배송 등으로 인한 청약철회의 경우에는 상품 수령 후 3개월 이내, 그 사실을 안 날 또는 알 수 있었던 날로부터 30일 이내에 청약철회를 할 수 있으며, 반품 비용은 통신판매업자가 부담합니다.)
 *      - 1 (상품상세 참조)
 * @param {string} data.noRefundReason - 제품하자가 아닌 소비자의 단순변심에 따른 청약철회가 불가능한 경우 그 구체적 사유와 근거
 *   - 청약철회 불가 사유 중 하나를 선택합니다. 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0 (전자상거래 등에서의 소비자보호에 관한 법률 등에 의한 청약철회 제한 사유에 해당하는 경우 및 기타 객관적으로 이에 준하는 것으로 인정되는 경우 청약철회가 제한될 수 있습니다)
 *      - 1 (상품상세 참조)
 * @param {string} data.qualityAssuranceStandard - 재화 등의 교환ㆍ반품ㆍ보증 조건 및 품질 보증 기준
 *   - 품질보증기준 중 하나를 선택합니다. 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0 (소비자분쟁해결기준(공정거래위원회 고시) 및 관계법령에 따릅니다)
 *      - 1 (상품상세 참조)
 * @param {string} data.compensationProcedure - 대금을 환불받기 위한 방법과 환불이 지연될 경우 지연배상금을 지급받을 수 있다는 사실 및 배상금 지급의 구체적인 조건·절차
 *   - 배상절차 중 하나를 선택합니다. 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0 (주문취소 및 대금의 환불은 네이버페이 마이페이지에서 신청할 수 있으며, 전자상거래 등에서의 소비자보호에 관한 법률에 따라 소비자의 청약철회 후 판매자가 재화 등을 반환 받은 날로부터 3영업일 이내에 지급받은 대금의 환급을 정당한 사유 없이 지연하는 때에는 소비자는 지연기간에 대해서 연 15%의 지연배상금을 판매자에게 청구할 수 있습니다.)
 *      - 1 (상품상세 참조)
 * @param {string} data.troubleShootingContents - 소비자피해보상의 처리, 재화 등에 대한 불만 처리 및 소비자와 사업자 사이의 분쟁 처리에 관한 사항
 *   - 소비자피해보상의 처리, 재화 등에 대한 불만 처리 및 소비자와 사업자 사이의 분쟁 처리에 관한 사항 중 하나를 선택합니다. 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0 (소비자분쟁해결기준(공정거래위원회 고시) 및 관계법령에 따릅니다.)
 *      - 1 (상품상세 참조)
 * @param {string} data.itemName - 품명
 * @param {string} data.modelName - 모델명
 * @param {string} data.certificationType - ｢전기용품 및 생활용품 안전관리법｣에 따른 안전인증·안전확인·공급자적합성확인대상 제품 및 ｢전파법｣에 따른 적합인증·적합등록 대상 기자재에 한함
 * @param {string} data.ratedVoltage - 정격전압
 * @param {string} data.powerConsumption - 소비전력
 * @param {string} data.releaseDate - 출시일 ( <'yyyy-MM' 형식 입력> (동일 모델의 출시연월) )
 * @param {string} data.releaseDateText - releaseDate를 입력하지 않은 경우에는 필수 ( 제조연월 직접 입력 )
 * @param {string} data.manufacturer - 제조사
 * @param {string} data.size - 사이즈
 * @param {string} data.weight - 무게 ( <= 200 characters )
 * @param {string} data.specification - 주요 사양 ( 컴퓨터와 노트북의 경우 성능, 용량, 운영체제 포함 여부 등. 프린터의 경우 인쇄 속도 등. )
 * @param {string} data.updatCost - 맵 업데이트 비용
 * @param {string} data.freeCostPeriod - 무상 기간
 * @param {string} data.warrantyPolicy - 품질 보증 기준
 * @param {string} data.afterServiceDirector - A/S 책임자 및 전화 번호
 *
 * @returns {Object}
 */
export function createNavigation(data) {
    const {
        returnCostReason,
        noRefundReason,
        qualityAssuranceStandard,
        compensationProcedure,
        troubleShootingContents,
        itemName,
        modelName,
        certificationType,
        ratedVoltage,
        powerConsumption,
        releaseDate,
        releaseDateText,
        manufacturer,
        size,
        weight,
        specification,
        updatCost,
        freeCostPeriod,
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
        certificationType,
        ratedVoltage,
        powerConsumption,
        releaseDate,
        releaseDateText,
        manufacturer,
        size,
        weight,
        specification,
        updatCost,
        freeCostPeriod,
        warrantyPolicy,
        afterServiceDirector,
    };
}
