export { ARTICLES_PER_PAGE } from '@blog/config';

export type PageInfo = (number | string)[];

export function getPagination(current: number, max: number): PageInfo {
  const result: PageInfo = [];

  if (max <= 7) {
    for (let i = 1; i <= max; i++) {
      result.push(i);
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        result.push(i);
      }
      result.push('...');
      result.push(max);
    } else if (current >= max - 3) {
      result.push(1);
      result.push('...');
      for (let i = max - 4; i <= max; i++) {
        result.push(i);
      }
    } else {
      result.push(1);
      result.push('...');
      for (let i = current - 1; i <= current + 1; i++) {
        result.push(i);
      }
      result.push('...');
      result.push(max);
    }
  }

  return result;
}
