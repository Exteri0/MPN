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
