function reverseHebrew(text) {
  if (!text) return text;
  
  // 1. Reverse the entire string
  let reversed = text.split('').reverse().join('');
  
  // 2. Swap mirrored characters (parentheses, brackets, etc.)
  const map = {
    '(': ')', ')': '(',
    '[': ']', ']': '[',
    '{': '}', '}': '{',
    '<': '>', '>': '<'
  };
  reversed = reversed.replace(/[()[\]{}<>]/g, c => map[c]);
  
  // 3. Find LTR blocks (English/Numbers + internal punctuation) and reverse them back
  const ltrRegex = /[a-zA-Z0-9]+(?:[\s.,\-\/]+[a-zA-Z0-9]+)*/g;
  reversed = reversed.replace(ltrRegex, match => match.split('').reverse().join(''));
  
  return reversed;
}

console.log("1:", reverseHebrew("סיכום הזמנה / הצעת מחיר (להפקת חשבונית)"));
console.log("2:", reverseHebrew("סה\"כ לתשלום: ₪ 123.45"));
console.log("3:", reverseHebrew("מארז Libero Wholesale 123 חדש"));
console.log("4:", reverseHebrew("₪ 1074.00"));
console.log("5:", reverseHebrew("1074.00 ₪"));
console.log("6:", reverseHebrew("Mandarino Malandrino"));
console.log("7:", reverseHebrew("הנחת רשם: Mandarino Malandrino"));
