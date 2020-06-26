export { getProtoRoot } from './yahoo-proto';

export function genRandomId () {
  const m = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const time = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
  const letters = [];
  return time.split('').map(char => m[Number(char)]).join('');
}

export const datesAreOnSameDay = (first, second) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate(); 
