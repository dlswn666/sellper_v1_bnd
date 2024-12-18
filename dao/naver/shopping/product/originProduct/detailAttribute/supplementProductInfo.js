/**
 * @param {Object} data
 * @description 추가상품 정보 , 등록된 기본 상품과 함께 구성하면 좋은 상품으로 구성
 *
 * @param {'CREATE' | 'ABC' | 'LOW_PRICE' | 'HIGH_PRICE'} sortType - 정렬 타입
 *  - CREATE : 생성순
 *  - ABC : 가나다순
 *  - LOW_PRICE : 낮은가격순
 *  - HIGH_PRICE : 높은가격순
 * @param {object} supplementProducts - 추가상품 목록
 * @param {number} supplementProducts.id - 추가상품 ID
 * @param {string} supplementProducts.name - 추가상품명
 * @param {number} supplementProducts.price - 추가상품 가격
 * @param {number} supplementProducts.stockQuantity - 추가상품 재고 수량
 * @param {string} supplementProducts.sellerManagerCode - 판매자 관리 코드
 * @param {boolean} supplementProducts.usable - 사용 가능 여부
 * 
 * 예시 데이터 
 * const defaultSupplementProductInfo = {
        sortType: 'CREATE',
        supplementProducts: [
            {
                id: 1,
                name: '추가상품1',
                price: 1000,
                stockQuantity: 10,
                sellerManagerCode: '1234567890',
                usable: true,
            },
            {
                id: 2,
                name: '추가상품2',
                price: 2000,
                stockQuantity: 20,
                sellerManagerCode: '0987654321',
                usable: true,
            },
        ],
    };
 *
 * @returns {Object} supplementProductInfo
 */
export function createSupplementProductInfo(data = {}) {
    const { sortType, supplementProducts } = data;

    const supplementProductInfo = {
        sortType,
        supplementProducts: supplementProducts?.map((supplementProduct) => ({
            id: supplementProduct.id,
            name: supplementProduct.name,
            price: supplementProduct.price,
            stockQuantity: supplementProduct.stockQuantity,
            sellerManagerCode: supplementProduct.sellerManagerCode,
            usable: supplementProduct.usable,
        })),
    };

    return supplementProductInfo;
}
