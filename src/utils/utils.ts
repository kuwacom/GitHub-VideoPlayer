export const projectVersion = "1.1.0";

export const ContributionDataLevels = [ 0, 1, 2, 3, 4 ]

// export const ContributionLikeGrayScale = [
//     '#161b22', '#182725', '#1b3429', '#1d402c', '#1f4c2f', '#225832', '#246536', '#267139',
//     '#297d3c', '#2b893f', '#2d9643', '#30a246', '#32ae49', '#34ba4c', '#37c750', '#39d353'
// ]

export const ContributionLikeGrayScale = [
    '#161b22', '#182725', '#1b3429', '#1d402c', '#1f4c2f', '#225832', '#246536', '#267139',
    '#297d3c', '#2b893f', '#2d9643', '#30a246', '#32ae49', '#34ba4c', '#37c750', '#39d353',
    '#3bd757', '#3ee45a', '#40f05d', '#42fc60'
];

export const ColorMode = [
    {
        name: 'Level',
        value: 'contributionDataLevels'
    },
    {
        name: 'Level Like',
        value: 'contributionLikeGrayScale'
    },
    {
        name: 'Color',
        value: 'color'
    }
]

export const sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

export const init = async (fn: Function, time: number = 1000) => {
    await sleep(time)
    fn()
}

export const normalizeToRange = (num: number, base: number): number => {
    // モジュロ演算子 (%) を使用して範囲内に収める
    return ((num - 1) % base) + 1;
}
