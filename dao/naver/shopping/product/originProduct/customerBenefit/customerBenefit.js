// customerBenefit 생성 함수

import { createFreeInterestPolicy } from './freeInterestPolicy.js';
import { createGiftPolicy } from './giftPolicy.js';
import { createImmediateDiscountPolicy } from './immediateDiscountPolicy.js';
import { createMultiPurchaseDiscountPolicy } from './multiPurchaseDiscountPolicy.js';
import { createPurchasePointPolicy } from './purchasePointPolicy.js';
import { createReservedDiscountPolicy } from './reservedDiscountPolicy.js';
import { createReviewPointPolicy } from './reviewPointPolicy.js';

export const createCustomerBenefit = ({ customerBenefit }) => {
    const freeInterestPolicy = createFreeInterestPolicy({ freeInterestPolicy });
    const giftPolicy = createGiftPolicy({ giftPolicy });
    const immediateDiscountPolicy = createImmediateDiscountPolicy({ immediateDiscountPolicy });
    const multiPurchaseDiscountPolicy = createMultiPurchaseDiscountPolicy({ multiPurchaseDiscountPolicy });
    const purchasePointPolicy = createPurchasePointPolicy({ purchasePointPolicy });
    const reservedDiscountPolicy = createReservedDiscountPolicy({ reservedDiscountPolicy });
    const reviewPointPolicy = createReviewPointPolicy({ reviewPointPolicy });

    return {
        freeInterestPolicy,
        giftPolicy,
        immediateDiscountPolicy,
        multiPurchaseDiscountPolicy,
        purchasePointPolicy,
        reservedDiscountPolicy,
        reviewPointPolicy,
    };
};
