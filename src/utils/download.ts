/**
 * 触发文件下载
 * @param name 文件名
 * @param type 文件类型，如 "text/csv;charset=utf-8;"
 * @param content 文件内容
 *
 * @example
 *     const blob = new Blob(
 *         [ 'hello, world!' ],
 *         { type: 'text/plain;charset=utf-8;' }
 *     )
 *
 *     const isSuccess = download('hello.txt', blob);
 */
export function download(name: string, blob: Blob): boolean {
    const link = document.createElement('a');

    if (link.download === undefined) {
        return false;
    }

    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', name);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
}
