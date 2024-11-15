function sumFilteredEvens(numbers) {
  // 演習問題 1
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] % 2 === 0 && numbers[i] % 5 !== 0) {
      sum += numbers[i];
    }
  }
  return sum;
}

const numbers = [2, 4, 5, 10, 12, 15, 20, 22];
console.log(sumFilteredEvens(numbers)); // 関数の実行

function isPrime(number) {
  // 演習問題 2
  for (let i = 2; i <= Math.sqrt(number); i++) {
    if (number % i === 0) {
      return false;
    }
  }
  return true;
}

number = 5;
console.log(isPrime(number));
