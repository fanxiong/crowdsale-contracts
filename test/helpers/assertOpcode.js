export const assertOpcode = error => {
  assert.isAbove(
    error.message.search('invalid opcode'),
    -1,
    'Invalid OPCODE error must be returned'
  );
};
