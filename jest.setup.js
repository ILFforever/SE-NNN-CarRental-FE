import '@testing-library/jest-dom/extend-expect'
const { TextEncoder, TextDecoder } = require("util");

Object.assign(global, { TextDecoder, TextEncoder });