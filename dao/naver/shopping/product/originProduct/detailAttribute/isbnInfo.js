// isbnInfo.js
// @description: detailAttribute 내 isbnInfo 객체를 생성하는 함수

/**
 * @function createIsbnInfo
 *
 * @param {Object} data - ISBN 정보 - 사용 안함
 * @param {string} data.isbn13 - 도서 일련번호  ^[\d*]{13}$ 도서_일반, 도서_해외, 도서_중고, 도서_E북, 도서_오디오북에 해당하는 경우 필수.
 * @param {string} data.issn - 도서 일련번호 ^[\d*]{7}[\d|X]{1}$ 도서_잡지에 해당하는 경우 입력
 * @param {boolean} data.independentPublicationYn - 독립출판 여부
 *
 * @returns {Object} isbnInfo
 */
export function createIsbnInfo(data = {}) {
    const { isbn13, issn, independentPublicationYn } = data;

    return {
        isbn13,
        issn,
        independentPublicationYn,
    };
}
