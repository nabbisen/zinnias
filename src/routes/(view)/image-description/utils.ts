export async function generateImageDescription(file: File) {
    const formData = new FormData()
    formData.append('image', file, file.name)

    const response: Response | void = await fetch('/api/image-description', {
        method: 'POST',
        body: formData,
    }).catch((error) => {
        console.error('アップロード中にエラーが発生しました:', error)
        alert('アップロードに失敗しました。')
    })
    if (!response) return

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const responseJson: Record<string, any> = await response.json()
    return responseJson.generatedText
}