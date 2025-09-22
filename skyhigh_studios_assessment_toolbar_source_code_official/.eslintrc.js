//module to ignore SimVar and SetStoredData variable when compiling to soflysimrate.js and soflysimrate.css
module.exports = {
  globals: {
    SimVar: "readonly",
    SetStoredData: "readonly",
    GetStoredData: "readonly",
  },
};
