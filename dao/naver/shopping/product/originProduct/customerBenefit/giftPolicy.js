// giftPolicy.js

/**
 * 상품 선물 정책
 *
 * @param {Object} data - 선물 정책 정보를 담은 객체
 * @param {string} data.presentContent - 사은품 내용
 */

export function createGiftPolicy(data) {
    const { presentContent } = data;

    return {
        presentContent,
    };
}
