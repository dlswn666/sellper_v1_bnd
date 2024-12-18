// customerBenefit 생성 함수

import { createFreeInterestPolicy } from './freeInterestPolicy';
import { createGiftPolicy } from './giftPolicy';
import { createImmediateDiscountPolicy } from './immediateDiscountPolicy';
import { createMultiPurchaseDiscountPolicy } from './multiPurchaseDiscountPolicy';
import { createPurchasePointPolicy } from './purchasePointPolicy';
import { createReservedDiscountPolicy } from './reservedDiscountPolicy';
import { createReviewPointPolicy } from './reviewPointPolicy';

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
