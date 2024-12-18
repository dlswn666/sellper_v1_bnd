// detailAttribute.js
// 상품 상세 속성 정보를 담고 있는 객체를 생성하는 함수

import { createNaverShoppingSearchInfo } from './naverShoppingSearchInfo.js';
import { createAfterServiceInfo } from './afterServiceInfo.js';
import { createPurchaseQuantityInfo } from './purchaseQuantityInfo.js';
import { createOriginAreaInfo } from './originAreaInfo.js';
import { createSellerCodeInfo } from './sellerCodeInfo.js';
import { createOptionInfo } from './optionInfo/optionInfo.js';
import { createSupplementProductInfo } from './supplementProductInfo.js';
import { createIsbnInfo } from './isbnInfo.js';
import { createBookInfo } from './bookInfo.js';
import { createProductCertificationInfos } from './productCertificationInfos.js';
import { createCertificationTargetExcludeContent } from './certificationTargetExcludeContent.js';
import { createEcoupon } from './ecoupon.js';
import { createProductInfoProvideNotice } from './productInfoProvideNotice/productInfoProvideNotice.js';
import { createProductAttributes } from './productAttributes.js';
import { createSeoInfo } from './seoInfo.js';
import { createProductSize } from './productSize.js';

/**
 * 원상품 상세 속성
 *
 * @param {Object} data - 원상품 상세 속성 정보를 담은 객체
 *
 * @param {Object} data.naverShoppingSearchInfo - 네이버 쇼핑 검색 정보
 *   - 네이버 쇼핑에서 검색 가능한 정보.
 *
 * @param {string} data.manufactureDefineNo - 품번
 *   - 제조사에서 부여한 고유 모델명. 품번 입력 대상 카테고리에 한해 사용.
 *
 * @param {Object} data.afterServiceInfo - A/S 정보
 *   - 상품의 A/S 정보. 필수 입력.
 *
 * @param {Object} data.purchaseQuantityInfo - 구매 수량 설정 정보
 *   - 구매 가능한 수량 설정 정보.
 *
 * @param {Object} data.originAreaInfo - 원산지 정보
 *   - 상품의 원산지 정보를 나타냄. 필수 입력.
 *
 * @param {Object} data.sellerCodeInfo - 판매자 코드 정보
 *   - 판매자 고유 코드를 포함.
 *
 * @param {Object} data.optionInfo - 옵션 정보
 *   - 상품 옵션 정보. 단독형, 조합형, 직접 입력형 중 최소 하나는 입력 필요.
 *   - 렌탈 상품의 경우 조합형 및 직접 입력형만 사용 가능.
 *
 * @param {Object} data.supplementProductInfo - 추가 상품
 *   - 추가 구매 가능한 상품 정보.
 *
 * @param {Object} data.purchaseReviewInfo - 구매평 정보
 *   - 구매평 노출 설정 정보.
 *
 * @param {Object} data.isbnInfo - ISBN 정보
 *   - 도서 상품의 ISBN 정보.
 *
 * @param {Object} data.bookInfo - 도서 정보
 *   - 도서 항목에 대한 부가 정보를 포함.
 *
 * @param {string} data.eventPhraseCont - 이벤트 문구
 *   - 홍보용 이벤트 문구.
 *
 * @param {string} data.manufactureDate - 제조일자
 *   - 인증 유형에 따라 필요한 제조일자. 'yyyy-MM-dd' 형식 입력.
 *
 * @param {string} data.releaseDate - 출시일자
 *   - 최초 1회만 입력 가능. 수정/삭제 불가능. 'yyyy-MM-dd' 형식 입력.
 *
 * @param {string} data.validDate - 유효일자
 *   - 유효일자. 'yyyy-MM-dd' 형식 입력.
 *
 * @param {string} data.taxType - 부가가치세 타입 코드
 *   - 부가가치세 유형. 기본값은 'TAX'(과세 상품).
 *   - 허용 값:
 *     - 'TAX': 과세 상품
 *     - 'DUTYFREE': 면세 상품
 *     - 'SMALL': 영세 상품
 *
 * @param {Array<Object>} data.productCertificationInfos - 인증 정보 목록
 *   - '어린이제품 인증 대상' 카테고리 상품에 대해 필수 입력.
 *
 * @param {Object} data.certificationTargetExcludeContent - 인증 대상 제외 여부 정보
 *   - 인증 대상에서 제외되는 경우 관련 정보를 포함.
 *
 * @param {string} data.sellerCommentContent - 판매자 특이 사항
 *   - `sellerCommentUsable`이 `true`일 때만 입력 가능.
 *
 * @param {boolean} data.sellerCommentUsable - 판매자 특이 사항 사용 여부
 *   - 특이 사항 입력 가능 여부.
 *
 * @param {boolean} data.minorPurchasable - 미성년자 구매 가능 여부
 *   - 성인 카테고리에서는 반드시 `false`로 설정.
 *
 * @param {Object} data.ecoupon - E쿠폰 정보
 *   - E쿠폰 관련 정보.
 *
 * @param {Object} data.productInfoProvidedNotice - 상품정보제공고시
 *   - 상품 요약 정보. 등록 시 필수.
 *
 * @param {Array<Object>} data.productAttributes - 상품 속성 목록
 *   - 상품의 세부 속성 정보.
 *
 * @param {boolean} data.cultureCostIncomeDeductionYn - 문화비 소득공제 여부
 *   - 도서 및 관련 카테고리에서만 사용 가능. 미입력 시 기본값은 `false`.
 *
 * @param {boolean} data.customProductYn - 맞춤 제작 상품 여부
 *   - 맞춤 제작 상품 여부를 나타냄.
 *
 * @param {boolean} data.itselfProductionProductYn - 자체 제작 상품 여부
 *   - 자체 제작 상품 여부. 미입력 시 `false`.
 *
 * @param {boolean} data.brandCertificationYn - 브랜드 인증 여부
 *   - 브랜드 인증 여부.
 *
 * @param {Object} data.seoInfo - SEO 정보
 *   - 검색 엔진 최적화 정보.
 *
 * @param {Object} data.productSize - 상품 사이즈 정보
 *   - 상품 크기 관련 정보.
 */
export function createDetailAttribute(data = {}) {
    const naverShoppingSearchInfo = createNaverShoppingSearchInfo(data.naverShoppingSearchInfo);
    const afterServiceInfo = createAfterServiceInfo(data.afterServiceInfo);
    const purchaseQuantityInfo = createPurchaseQuantityInfo(data.purchaseQuantityInfo);
    const originAreaInfo = createOriginAreaInfo(data.originAreaInfo);
    const sellerCodeInfo = createSellerCodeInfo(data.sellerCodeInfo);
    const optionInfo = createOptionInfo(data.optionInfo);
    const supplementProductInfo = createSupplementProductInfo(data.supplementProductInfo);
    const isbnInfo = createIsbnInfo(data.isbnInfo);
    const bookInfo = createBookInfo(data.bookInfo);
    const productCertificationInfos = createProductCertificationInfos(data.productCertificationInfos);
    const certificationTargetExcludeContent = createCertificationTargetExcludeContent(
        data.certificationTargetExcludeContent
    );
    const productInfoProvidedNotice = createProductInfoProvideNotice(data.productInfoProvidedNotice);
    const productAttributes = createProductAttributes(data.productAttributes);
    const seoInfo = createSeoInfo(data.seoInfo);
    const productSize = createProductSize(data.productSize);

    return {
        naverShoppingSearchInfo,
        manufactureDefineNo,
        afterServiceInfo,
        purchaseQuantityInfo,
        originAreaInfo,
        sellerCodeInfo,
        optionInfo,
        supplementProductInfo,
        isbnInfo,
        bookInfo,
        eventPhraseCont,
        manufactureDate,
        releaseDate,
        validDate,
        taxType,
        productCertificationInfos,
        certificationTargetExcludeContent,
        sellerCommentContent,
        sellerCommentUsable,
        minorPurchasable,
        ecoupon,
        productInfoProvidedNotice,
        productAttributes,
        cultureCostIncomeDeductionYn,
        customProductYn,
        itselfProductionProductYn,
        brandCertificationYn,
        seoInfo,
        productSize,
    };
}
