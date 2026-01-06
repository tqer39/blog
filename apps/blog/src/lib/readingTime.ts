/**
 * 記事の読了時間を計算する
 * 日本語の平均読書速度: 約500文字/分
 */
export function calculateReadingTime(content: string): number {
  // コードブロックを除去（読み飛ばされることが多い）
  const withoutCode = content.replace(/```[\s\S]*?```/g, '');

  // 文字数をカウント（空白・改行除く）
  const charCount = withoutCode.replace(/\s/g, '').length;

  // 500文字/分で計算、最低1分
  return Math.max(1, Math.ceil(charCount / 500));
}
