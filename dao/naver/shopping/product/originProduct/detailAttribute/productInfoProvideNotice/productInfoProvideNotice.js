// productInfoProvideNotice.js
// @description: detailAttribute 내 productInfoProvideNotice 객체를 생성하는 함수

import { createWear } from './wear';
import { createShoes } from './shoes';
import { createBag } from './bag';
import { createFashionItems } from './fashionItems';
import { createSleepingGear } from './sleepingGear';
import { createFurniture } from './furniture';
import { createImageAppliances } from './imageAppliances';
import { createHomeAppliances } from './homeAppliances';
import { createSeasonAppliances } from './seasonAppliances';
import { createOfficeAppliances } from './officeAppliances';
import { createOpticsAppliances } from './opticsAppliances';
import { createMicroElectronics } from './microElectronics';
import { createNavigation } from './navigation';
import { createCarArticles } from './carArticles';
import { createMedicalAppliances } from './medicalAppliances';
import { createKitchenUtensils } from './kitchenUtensils';
import { createCosmetic } from './cosmetic';
import { createJewellery } from './jewellery';
import { createFood } from './food';
import { createGeneralFood } from './generalFood';
import { createDietFood } from './dietFood';
import { createKids } from './kids';
import { createMusicalInstrument } from './musicalInstrument';
import { createSportsEquipment } from './sportsEquipment';
import { createBooks } from './books';
import { createRentalEtc } from './rentalEtc';
import { createRentalHa } from './rentalHa';
import { createDigitalContents } from './digitalContents';
import { createGiftCard } from './giftCard';
import { createMobileCoupon } from './mobileCoupon';
import { createMovieShow } from './movieShow';
import { createEtcService } from './etcService';
import { createBiochemistry } from './biochemistry';
import { createBiocidal } from './biocidal';
import { createCellPhone } from './cellPhone';
import { createEtc } from './etc';

/**
 * @function createProductInfoProvideNotice
 * @description 상품 제공 안내 정보
 *
 * @param {Object} data - 상품정보제공고시, 상품 등록시 필수
 * @param {'WEAR' | 'SHOES' | 'BAG' | 'FASHION_ITEMS' | 'SLEEPING_GEAR' | 'FURNITURE' | 'IMAGE_APPLIANCES' | 'HOME_APPLIANCES' | 'SEASON_APPLIANCES' | 'OFFICE_APPLIANCES' | 'OPTICS_APPLIANCES' | 'MICROELECTRONICS' | 'NAVIGATION' | 'CAR_ARTICLES' | 'MEDICAL_APPLIANCES' | 'KITCHEN_UTENSILS' | 'COSMETIC' | 'JEWELLERY'} data.productInfoProvidedNoticeType - 상품 제공 안내 내용
 *      - WEAR(의류 상품 요약 정보, wear 필드에 정보 입력)
 *      - SHOES(구두/신발 상품 요약 정보, shoes 필드에 정보 입력)
 *      - BAG(가방 상품 요약 정보, bag 필드에 정보 입력)
 *      - FASHION_ITEMS(패션잡화(모자/벨트/액세서리) 상품 요약 정보, fashionItems 필드에 정보 입력)
 *      - SLEEPING_GEAR(침구류/커튼 상품 요약 정보, sleepingGear 필드에 정보 입력)
 *      - FURNITURE(가구(침대/소파/싱크대/DIY제품) 상품 요약 정보, furniture 필드에 정보 입력)
 *      - IMAGE_APPLIANCES(영상가전(TV류) 상품 요약 정보, imageAppliances 필드에 정보 입력)
 *      - HOME_APPLIANCES(가정용 전기제품(냉장고/세탁기/식기세척기/전자레인지) 상품 요약 정보, homeAppliances 필드에 정보 입력)
 *      - SEASON_APPLIANCES(계절가전(에어컨/온풍기) 상품 요약 정보, seasonAppliances 필드에 정보 입력)
 *      - OFFICE_APPLIANCES(사무용기기(컴퓨터/노트북/프린터) 상품 요약 정보, officeAppliances 필드에 정보 입력)
 *      - OPTICS_APPLIANCES(광학기기(디지털카메라/캠코더) 상품 요약 정보, opticsAppliances 필드에 정보 입력)
 *      - MICROELECTRONICS(소형전자(MP3/전자사전 등) 상품 요약 정보, microElectronics 필드에 정보 입력)
 *      - NAVIGATION(내비게이션 상품 요약 정보, navigation 필드에 정보 입력)
 *      - CAR_ARTICLES(자동차용품(자동차부품/기타 자동차용품) 상품 요약 정보, carArticles 필드에 정보 입력)
 *      - MEDICAL_APPLIANCES(의료기기 상품 요약 정보, medicalAppliances 필드에 정보 입력)
 *      - KITCHEN_UTENSILS(주방용품 상품 요약 정보, kitchenUtensils 필드에 정보 입력)
 *      - COSMETIC(화장품 상품 요약 정보, cosmetic 필드에 정보 입력)
 *      - JEWELLERY(귀금속/보석/시계류 상품 요약 정보, jewellery 필드에 정보 입력)
 *      - FOOD(식품(농ㆍ축ㆍ수산물) 상품 요약 정보, food 필드에 정보 입력)
 *      - GENERAL_FOOD(가공식품 상품 요약 정보, generalFood 필드에 정보 입력)
 *      - DIET_FOOD(건강기능식품 상품 요약 정보, dietFood 필드에 정보 입력)
 *      - KIDS(영유아용품 상품 요약 정보, kids 필드에 정보 입력)
 *      - MUSICAL_INSTRUMENT(악기 상품 요약 정보, musicalInstrument 필드에 정보 입력)
 *      - SPORTS_EQUIPMENT(스포츠용품 상품 요약 정보, sportsEquipment 필드에 정보 입력)
 *      - BOOKS(서적 상품 요약 정보, books 필드에 정보 입력)
 *      - RENTAL_ETC(물품대여 서비스(서적, 유아용품, 행사용품 등) 상품 요약 정보, rentalEtc 필드에 정보 입력)
 *      - RENTAL_HA(물품대여 서비스(정수기, 비데, 공기청정기 등) 상품 요약 정보, rentalHa 필드에 정보 입력)
 *      - DIGITAL_CONTENTS(디지털 콘텐츠(음원, 게임, 인터넷강의 등) 상품 요약 정보, digitalContents 필드에 정보 입력)
 *      - GIFT_CARD(상품권/쿠폰 상품 요약 정보, giftCard 필드에 정보 입력)
 *      - MOBILE_COUPON(모바일 쿠폰 상품 요약 정보, mobileCoupon 필드에 정보 입력)
 *      - MOVIE_SHOW(영화/공연 상품 요약 정보, movieShow 필드에 정보 입력)
 *      - ETC_SERVICE(기타 용역 상품 요약 정보, etcService 필드에 정보 입력)
 *      - BIOCHEMISTRY(생활화학제품 요약 정보, biochemistry 필드에 정보 입력)
 *      - BIOCIDAL(살생물제품 요약 정보, biocidal 필드에 정보 입력)
 *      - CELLPHONE(휴대폰 요약 정보, cellPhone 필드에 정보 입력)
 *      - ETC(기타 상품 요약 정보, etc 필드에 정보 입력)
 *
 * @returns {Object} productInfoProvideNotice
 */
export function createProductInfoProvideNotice(data = {}) {
    const { productInfoProvidedNoticeType } = data;

    const enumValue = [
        'WEAR',
        'SHOES',
        'BAG',
        'FASHION_ITEMS',
        'SLEEPING_GEAR',
        'FURNITURE',
        'IMAGE_APPLIANCES',
        'HOME_APPLIANCES',
        'SEASON_APPLIANCES',
        'OFFICE_APPLIANCES',
        'OPTICS_APPLIANCES',
        'MICROELECTRONICS',
        'NAVIGATION',
        'CAR_ARTICLES',
        'MEDICAL_APPLIANCES',
        'KITCHEN_UTENSILS',
        'COSMETIC',
        'JEWELLERY',
    ];

    const productInfoProvideNotice = {
        productInfoProvidedNoticeType,
        ...createWear(data),
        ...createShoes(data),
        ...createBag(data),
        ...createFashionItems(data),
        ...createSleepingGear(data),
        ...createFurniture(data),
        ...createImageAppliances(data),
        ...createHomeAppliances(data),
        ...createSeasonAppliances(data),
        ...createOfficeAppliances(data),
        ...createOpticsAppliances(data),
        ...createMicroElectronics(data),
        ...createNavigation(data),
        ...createCarArticles(data),
        ...createMedicalAppliances(data),
        ...createKitchenUtensils(data),
        ...createCosmetic(data),
        ...createJewellery(data),
        ...createFood(data),
        ...createGeneralFood(data),
        ...createDietFood(data),
        ...createKids(data),
        ...createMusicalInstrument(data),
        ...createSportsEquipment(data),
        ...createBooks(data),
        ...createRentalEtc(data),
        ...createRentalHa(data),
        ...createDigitalContents(data),
        ...createGiftCard(data),
        ...createMobileCoupon(data),
        ...createMovieShow(data),
        ...createEtcService(data),
        ...createBiochemistry(data),
        ...createBiocidal(data),
        ...createCellPhone(data),
        ...createEtc(data),
    };

    return productInfoProvideNotice;
}
