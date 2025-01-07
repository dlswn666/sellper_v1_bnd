import { createStandardOptionGroup } from './standardOptionGroup.js';
import { createCustomOption } from './customOption.js';
import { createCombinationOption } from './combinationOption.js';
import { createSimpleOption } from './simpleOption.js';

/**
 * @param {Object} data
 * @description 옵션 정보 생성
 * @returns {Object} optionInfo
 */
export function createOptionInfo(data = {}) {
    const optionInfo = {
        ...createStandardOptionGroup(data),
        ...createCustomOption(data),
        ...createCombinationOption(data),
        ...createSimpleOption(data),
    };

    return optionInfo;
}

export { createStandardOptionGroup, createCustomOption, createCombinationOption, createSimpleOption };
