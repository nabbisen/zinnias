import Compressor from "compressorjs"

export function compressImage(file: File, successCallback: (file: File) => void, errorCallback: (err: Error) => void | null) {
    new Compressor(file, {
        quality: 0.7,
        maxWidth: 1280,
        maxHeight: 1280,
        mimeType: 'image/jpeg',

        success(file: File) {
            successCallback(file)
        },

        error(err) {
            if (errorCallback) {
                errorCallback(err)
            }
        },
    })
}

export async function textFromImage(file: File) {
    // 圧縮された File オブジェクトを FormData に追加
    const formData = new FormData()
    formData.append('image', file, file.name) // 'image' はサーバーで受け取るキー名

    // fetch API を使ってサーバーに POST リクエストを送信
    const response: Response | void = await fetch('/api/text-from-image', {
        // サーバーのアップロードAPIエンドポイント
        method: 'POST',
        body: formData, // FormData オブジェクトを body に設定
    }).catch((error) => {
        console.error('アップロード中にエラーが発生しました:', error)
        alert('アップロードに失敗しました。')
    })
    if (!response) return

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const responseJson: Record<string, any> = await response.json()
    // console.log('アップロード成功:', responseJson)
    // alert('画像が正常にアップロードされました！')
    return responseJson.detectedText
}