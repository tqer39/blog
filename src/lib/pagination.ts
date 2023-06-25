export type PageInfo = (number | string)[];

const pagination = (current: number, max: number): PageInfo => {
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
};

export default pagination;

// [DEBUG]
// console.log(pagination(4, 9)); // [1, "...", 3, 4, 5, "...", 9]
// console.log(pagination(1, 7)); // [1, 2, 3, 4, 5, 6, 7]
// console.log(pagination(4, 7)); // [1, 2, 3, 4, 5, 6, 7]
// console.log(pagination(4, 8)); // [1, 2, 3, 4, 5, '...', 8]
// console.log(pagination(5, 8)); // [1, '...', 4, 5, 6, 7, 8]
// console.log(pagination(5, 9)); // [1, '...', 4, 5, 6, '...', 9]
// console.log(pagination(20, 20)); // [1, "...", 16, 17, 18, 19, 20]
