import dompurify from 'dompurify'
import katex from 'katex'
import { marked } from "marked"

const KATEX_REGEX = /\$\$[^$]+\$\$|\$[^$]+\$/g

export async function markdownToMathHTML(text: string): Promise<string> {
    let retHTML = dompurify.sanitize(await marked.parse(text))
    retHTML = retHTML.replace(KATEX_REGEX, katexReplace)
    return retHTML
}

function katexReplace(matched: string) {
    let displayMode = false
    let latex = ''
    if (matched.startsWith('$$')) {
        latex = matched.slice(2, -2)
        displayMode = true
    } else {
        latex = matched.slice(1, -1)
    }

    let rendered = ''
    try {
        rendered = katex.renderToString(latex, {
            displayMode,
            output: displayMode ? 'mathml' : 'html',
        })
    } catch {
        return matched
    }

    return displayMode
        ? `<div class="katex-display">${rendered}</div>`
        : `<span class="katex-inline">${rendered}</span>`
}