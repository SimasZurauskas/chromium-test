import { max } from 'lodash';
import moment from 'moment';

export const waitFor = async (ms: number) => {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(null);
      clearTimeout(timer);
    }, ms);
  });
};

export const calcValueOfPercentage = (value: number, percentage: number) => {
  const num = (percentage / 100) * value;
  return Math.round(num * 100) / 100;
};

export const calculatePercentage = (numerator: number, denominator: number): number => {
  if (denominator === 0) {
    return 0;
  }
  const percentage = (numerator / denominator) * 100;
  return percentage;
};

type GetStatusesArray = (a: { live: any; uzbaigtas: any; pakibes: any; nuluzes: any }) => string[];
export const getStatusesArray: GetStatusesArray = ({ live, uzbaigtas, pakibes, nuluzes }) => {
  const arr: string[] = [];
  if (live) arr.push('Live');
  if (uzbaigtas) arr.push('Uzbaigtas');
  if (pakibes) arr.push('Pakibes');
  if (nuluzes) arr.push('Nuluzes');

  return arr;
};

const normalize = (val: number, max: number) => {
  return (val - 0) / (max - 0);
};

export const getWeightedPercentage = (arr: { weight: number; value: number }[]) => {
  if (arr.length === 0) return null;

  const maxVal = max(arr.map((el) => el.weight));
  const totalMaxWeight = arr.reduce((acc, el) => acc + normalize(el.weight, maxVal!), 0) * 100;

  const weightedArr = arr.map((el) => {
    return { ...el, weight: normalize(el.weight, maxVal!) };
  });

  const weight = weightedArr.reduce((acc, el) => acc + el.weight * el.value, 0);

  return Math.round((weight / totalMaxWeight) * 1000) / 10;
};

type GetFinishDate = (a: {
  existingDate: string | undefined | null;
  progress: number;
  baigtumasPercentage?: number;
}) => string | null;

export const getFinishDate: GetFinishDate = ({ existingDate, progress, baigtumasPercentage = 100 }) => {
  if (progress >= baigtumasPercentage) {
    if (existingDate) {
      return existingDate;
    } else {
      return moment(new Date()).toISOString();
    }
  }
  return null;
};

export const getLatinInsensitiveRegex = (searchString: string) => {
  const characterSets = searchString.split('').map((char) => {
    switch (char.toLowerCase()) {
      case 'a':
        return '[aą]';
      case 'e':
        return '[eėę]';
      case 'i':
        return '[iį]';
      case 'l':
        return '[lļ]';
      case 'n':
        return '[nņ]';
      case 'o':
        return '[oó]';
      case 's':
        return '[sš]';
      case 'u':
        return '[uųū]';
      case 'z':
        return '[zž]';
      default:
        return char;
    }
  });

  return new RegExp(`.*${characterSets.join('')}.*`, 'i');
};

export const formatNumberToFixed = (num: number | string): number => {
  const parsedNum = typeof num === 'string' ? parseFloat(num) : num;
  const numDecimalPlaces = parsedNum % 1 !== 0 ? parsedNum.toString().split('.')[1].length : 0;
  return parseFloat(parsedNum.toFixed(numDecimalPlaces <= 2 ? numDecimalPlaces : 2));
};
