export function generateCodes() {
    const randomNumber = Math.random();
    const random16Digits = Math.floor(randomNumber * 1e6);
    return random16Digits.toString();
};