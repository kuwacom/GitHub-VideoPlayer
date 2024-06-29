export const projectVersion = "1.0.0";

export const ContributionDataLevels = [ 0, 1, 2, 3, 4 ]

export const sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

export const init = async (fn: Function, time: number = 1000) => {
    await sleep(time)
    fn()
}

export const normalizeToRange = (num: number, base: number): number => {
    // モジュロ演算子 (%) を使用して範囲内に収める
    return ((num - 1) % base) + 1;
}
