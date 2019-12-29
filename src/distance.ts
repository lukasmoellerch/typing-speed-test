export default function distance(a: string, b: string): number {
    const DP: number[][] = [];
    for (let i = 0; i <= a.length; i++) {
        const row: number[] = [];
        DP.push(row);
        for (let j = 0; j <= b.length; j++) {
            if (j === 0) {
                row.push(i);
            } else if (i === 0) {
                row.push(j);
            } else {
                const aChar = a[i - 1];
                const bChar = b[j - 1];
                let subst = 1;
                if (aChar === bChar) {
                    subst = 0;
                } else if (aChar.toLowerCase() === bChar.toLowerCase()) {
                    subst = 0.3;
                }
                row.push(Math.min(
                    DP[i - 1][j] + 1,
                    DP[i][j - 1] + 1,
                    DP[i - 1][j - 1] + subst)
                );
            }
        }
    }
    return DP[a.length][b.length];
}