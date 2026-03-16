// app/lib/markdownToc.ts
export type TocItem = {
    level: 1 | 2 | 3;
    text: string;
    id: string;
};

function normalizeText(text: string) {
    return text
        .trim()
        .toLowerCase()
        .replace(/[*_`~[\]()]/g, "")
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

export function buildHeadingId(text: string, used: Map<string, number>) {
    const base = normalizeText(text) || "section";
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
}

export function extractToc(content: string): TocItem[] {
    const lines = content.split("\n");
    const used = new Map<string, number>();
    const items: TocItem[] = [];

    for (const line of lines) {
        const match = /^(#{1,3})\s+(.+)$/.exec(line.trim());
        if (!match) continue;

        const level = match[1].length as 1 | 2 | 3;
        const text = match[2].trim();
        if (!text) continue;

        items.push({
            level,
            text,
            id: buildHeadingId(text, used),
        });
    }

    return items;
}