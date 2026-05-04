// 거울 글씨 PDF 출력 유틸리티
// expo-print 으로 HTML 을 PDF 로 변환하고, expo-sharing 으로 공유한다.
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// HTML 특수문자 이스케이프 (사용자 입력 방어)
const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br/>');

// 거울 글씨 출력용 HTML 템플릿 생성
// - 상단: 원본 텍스트 (확인용)
// - 하단: scaleX(-1) 로 좌우 반전된 텍스트 (거울에 비추는 면)
export const buildMirrorPrintHtml = (text: string, fontSizePx: number): string => {
  const safeText = escapeHtml(text || '여기에 타이핑하세요');
  const printSize = Math.max(fontSizePx, 48); // 출력은 최소 48px 이상
  return `
  <!DOCTYPE html>
  <html lang="ko">
  <head>
    <meta charset="utf-8" />
    <title>Mirror Typing Print</title>
    <style>
      @page { size: A4; margin: 16mm; }
      * { box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Noto Sans KR', sans-serif;
        color: #111;
        margin: 0;
        padding: 0;
      }
      .guide {
        text-align: center;
        font-size: 14px;
        color: #555;
        margin-bottom: 12mm;
      }
      .section-title {
        font-size: 13px;
        color: #888;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        margin: 0 0 6mm 0;
      }
      .original, .mirror {
        font-size: ${printSize}px;
        font-weight: 700;
        line-height: 1.5;
        word-break: keep-all;
        white-space: pre-wrap;
      }
      .original { margin-bottom: 16mm; }
      .mirror {
        transform: scaleX(-1);
        transform-origin: center;
      }
      .mirror-wrap {
        border-top: 1px dashed #ccc;
        padding-top: 10mm;
      }
      .footnote {
        margin-top: 10mm;
        text-align: center;
        font-size: 12px;
        color: #999;
      }
    </style>
  </head>
  <body>
    <div class="guide">🪞 이 면을 거울에 비추세요 — 거울 속에서는 정상 글씨로 보입니다</div>

    <div class="section-title">원본 (Original)</div>
    <div class="original">${safeText}</div>

    <div class="mirror-wrap">
      <div class="section-title">거울 글씨 (Mirror)</div>
      <div class="mirror">${safeText}</div>
    </div>

    <div class="footnote">Mirror Typing Brain Trainer</div>
  </body>
  </html>`;
};

// PDF 생성 후 공유 시트로 전달
export const printAndShareMirror = async (text: string, fontSizePx: number): Promise<void> => {
  const html = buildMirrorPrintHtml(text, fontSizePx);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: '거울 글씨 PDF 공유',
      UTI: 'com.adobe.pdf',
    });
  } else {
    // 공유가 불가능한 환경(웹 등)에서는 즉시 인쇄 다이얼로그를 띄운다
    await Print.printAsync({ html });
  }
};
