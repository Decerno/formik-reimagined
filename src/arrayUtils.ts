export const move = (array: ReadonlyArray<any>, from: number, to: number) => {
  const copy = copyArray(array);
  const value = copy[from];
  copy.splice(from, 1);
  copy.splice(to, 0, value);
  return copy;
};

export const swap = (arrayLike: ReadonlyArray<any>, indexA: number, indexB: number) => {
  const copy = copyArray(arrayLike);
  const a = copy[indexA];
  copy[indexA] = copy[indexB];
  copy[indexB] = a;
  return copy;
};

export const insert = (arrayLike: ReadonlyArray<any>, index: number, value: any) => {
  const copy = copyArray(arrayLike);
  copy.splice(index, 0, value);
  return copy;
};

export const replace = (arrayLike: ReadonlyArray<any>, index: number, value: any) => {
  const copy = copyArray(arrayLike);
  copy[index] = value;
  return copy;
};

export const copyArray = (arrayLike: ReadonlyArray<any>): any[] => {
  if (!arrayLike) {
    return [];
  } else if (Array.isArray(arrayLike)) {
    return [...arrayLike];
  } else {
    throw new Error('Not an array');
  }
};
