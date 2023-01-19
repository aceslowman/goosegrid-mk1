/* eslint-disable */

//https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

//https://math.stackexchange.com/questions/23503/create-unique-number-from-2-numbers
function pairing(a,b) {
  /* this should return a unique number that is dependent on the order of inputs */
  return 0.5 * (a + b) * (a + b + 1) + b
}

export { uuidv4, pairing };
