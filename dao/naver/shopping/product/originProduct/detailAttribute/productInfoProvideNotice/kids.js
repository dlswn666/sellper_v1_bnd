// kids.js

/**
 * 어린이제품요약정보 상품정보제공고시
 *
 * /**
 * @param {Object} data - 제품 정보를 담은 객체
 *
 * @param {string} data.returnCostReason - 제품하자/오배송에 따른 청약철회 조항 (필수)
 *   - 미입력 시 상품상세 참조로 입력됩니다.
 *      - 0: 전자상거래 등에서의 소비자보호에 관한 법률 등에 의한 제품의 하자 또는 오배송 등으로 인한 청약철회의 경우, 상품 수령 후 3개월 이내 청약철회 가능, 반품 비용은 통신판매업자가 부담.
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
 * @param {string} data.itemName - 품명 (필수, 최대 50자)
 * @param {string} data.modelName - 모델명 (필수, 최대 50자)
 * @param {string} data.certificationType - KC 인증정보 (필수, 최대 200자)
 *   - ｢어린이제품 안전 특별법｣에 따른 안전인증·안전확인·공급자적합성확인대상 어린이제품에 한함.
 * @param {string} data.size - 크기 (필수, 최대 200자)
 * @param {string} data.weight - 중량 (필수, 최대 200자)
 *   - 섬유제품 등의 경우 치수 정보로 대체 가능.
 * @param {string} data.color - 색상 (필수, 최대 200자)
 * @param {string} data.material - 재질 (필수, 최대 200자)
 *   - 섬유의 경우 혼용율 포함.
 * @param {string} data.recommendedAge - 사용 연령 또는 권장 사용 연령 (필수, 최대 30자)
 * @param {string} data.releaseDate - 동일 모델의 출시연월 (<'yyyy-MM'> 형식, 최대 300자)
 * @param {string} data.releaseDateText - 동일 모델 출시연월 직접 입력 (releaseDate 미입력 시 필수, 최대 300자)
 * @param {string} data.manufacturer - 제조자(사) (필수, 최대 200자)
 * @param {string} data.caution - 취급방법 및 취급 시 주의사항, 안전표시(주의, 경고 등) (필수, 최대 1500자)
 * @param {string} data.warrantyPolicy - 품질 보증 기준 (필수, 최대 1500자)
 * @param {string} data.afterServiceDirector - A/S 책임자와 전화번호 (필수, 최대 200자)
 * @param {string} data.numberLimit - 크기·체중의 한계 (선택, 최대 200자)
 *   - 착용 또는 탑승용 어린이제품과 같이 크기·체중에 제한이 있는 품목의 경우 반드시 표시.
 */
export function createKids(data) {
    const {
        returnCostReason,
        noRefundReason,
        qualityAssuranceStandard,
        compensationProcedure,
        troubleShootingContents,
        itemName,
        modelName,
        certificationType,
        size,
        weight,
        color,
        material,
        recommendedAge,
        releaseDate,
        releaseDateText,
        manufacturer,
        caution,
        warrantyPolicy,
        afterServiceDirector,
        numberLimit,
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
        size,
        weight,
        color,
        material,
        recommendedAge,
        releaseDate,
        releaseDateText,
        manufacturer,
        caution,
        warrantyPolicy,
        afterServiceDirector,
        numberLimit,
    };
}
