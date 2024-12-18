// bookInfo.js
// @description: detailAttribute 내 bookInfo 객체를 생성하는 함수

/**
 * @function createBookInfo
 *
 * @param {Object} data - 도서 정보
 *
 * @param {string} data.publishDay - 출간일 YYYY-MM-DD
 *
 * @param {Object} data.publisher - 출판사
 * @param {string} data.publisher.code - 출판사 코드
 * @param {string} data.publisher.text - 출판사명
 *
 * @param {Object} data.authors - 저자
 * @param {string} data.authors.code - 저자 코드
 * @param {string} data.authors.text - 저자명
 *
 * @param {Object} data.illustrators - 일러스트레이터
 * @param {string} data.illustrators.code - 일러스트레이터 코드
 * @param {string} data.illustrators.text - 일러스트레이터명
 *
 * @param {Object} data.translators - 번역자
 * @param {string} data.translators.code - 번역자 코드
 * @param {string} data.translators.text - 번역자명
 *
 */
export function createBookInfo(data = {}) {
    const { publishDay, publisher, authors, illustrators, translators } = data;

    return {
        publishDay,
        publisher: {
            code: publisher.code,
            text: publisher.text,
        },
        authors: authors?.map((author) => ({
            code: author.code,
            text: author.text,
        })),
        illustrators: illustrators?.map((illustrator) => ({
            code: illustrator.code,
            text: illustrator.text,
        })),
        translators: translators?.map((translator) => ({
            code: translator.code,
            text: translator.text,
        })),
    };
}
