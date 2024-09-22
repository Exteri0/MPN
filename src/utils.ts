export async function extractInfo(
    url: string
): Promise<{ type: string; owner: string; repo: string }> {
    let splitURL = url.split('/')
    if (splitURL[2] === 'github.com')
        return { type: 'github', owner: splitURL[3], repo: splitURL[4] }
    else if (splitURL[2] === 'www.npmjs.com')
        return { type: 'npm', owner: splitURL[3], repo: splitURL[4] }
    else return { type: 'unknown', owner: '', repo: '' }
}

export function contains(arr: string[], q: string): number {
    return arr.findIndex((item) => q.toLowerCase() === item.toLowerCase())
}

export function differenceInHours(date1: string, date2: string): number {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const diffInMs = Math.abs(d2.getTime() - d1.getTime())
    return diffInMs / (1000 * 60 * 60)
}
