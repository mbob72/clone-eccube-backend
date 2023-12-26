// https://medium.com/@dazcyril/generating-cryptographic-random-state-in-javascript-in-the-browser-c538b3daae50
export function generateAuthorizeUrlState() {
  const validChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let array = new Uint8Array(40);
  crypto.getRandomValues(array);
  array = array.map((v) => validChars.codePointAt(v % validChars.length)!);
  const randomState = String.fromCharCode.apply(
    null,
    array as unknown as number[],
  );
  return randomState;
}
