import '@testing-library/jest-dom/'
const { TextEncoder, TextDecoder } = require("util");

Object.assign(global, { TextDecoder, TextEncoder });