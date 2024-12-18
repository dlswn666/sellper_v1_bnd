import { createStandardOptionGroup } from './standardOptionGroup';
import { createStandardOption } from './standardOption';
import { createCombinationOption } from './combinationOption';
import { createSimpleOption } from './simpleOption';

/**
 * @param {Object} data
 * @description 옵션 정보 생성
 * @returns {Object} optionInfo
 */
export function createOptionInfo(data = {}) {
    const optionInfo = {
        ...createStandardOptionGroup(data),
        ...createStandardOption(data),
        ...createCombinationOption(data),
        ...createSimpleOption(data),
    };

    return optionInfo;
}

export { createStandardOptionGroup, createStandardOption, createCombinationOption, createSimpleOption };
