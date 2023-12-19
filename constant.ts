export const msgFromBase64 = (
    p: string,
    op: string,
    tick: string,
    amt: string,
): string => {
    const memoMsg = {
        p: p,
        op: op,
        tick: tick,
        amt: amt,
    }
    return btoa(`data:,${JSON.stringify(memoMsg)}`);
}
