// Unicode NFC normalization. Use String.prototype.normalize if it exists.
// Otherwise, use a "polyfill" that only cares about common accented characters
// in Spanish.

module.exports = function normalize(str, form) {
  if (!str) {
    return '';
  }

  if (String.prototype.normalize) {
    return str.normalize(form);
  }

  if (form === 'NFC') {
    return (
      str
        // Replace vowels followed by the combining acute accent. (U+0301)
        .replace(/a\u0301/g, 'á')
        .replace(/e\u0301/g, 'é')
        .replace(/i\u0301/g, 'í')
        .replace(/o\u0301/g, 'ó')
        .replace(/u\u0301/g, 'ú')
        .replace(/A\u0301/g, 'Á')
        .replace(/E\u0301/g, 'É')
        .replace(/I\u0301/g, 'Í')
        .replace(/O\u0301/g, 'Ó')
        .replace(/U\u0301/g, 'Ú')
        // Replace n followed by the combining tilde. (U+0303)
        .replace(/n\u0303/g, 'ñ')
        .replace(/N\u0303/g, 'Ñ')
        // Replace u followed by the combining diaeresis. (U+0308)
        .replace(/u\u0308/g, 'ü')
        .replace(/U\u0308/g, 'Ü')
    );
  } else if (form === 'NFD') {
    return str
      .replace(/á/g, 'a\u0301')
      .replace(/é/g, 'e\u0301')
      .replace(/í/g, 'i\u0301')
      .replace(/ó/g, 'o\u0301')
      .replace(/ú/g, 'u\u0301')
      .replace(/Á/g, 'A\u0301')
      .replace(/É/g, 'E\u0301')
      .replace(/Í/g, 'I\u0301')
      .replace(/Ó/g, 'O\u0301')
      .replace(/Ú/g, 'U\u0301')
      .replace(/ñ/g, 'n\u0303')
      .replace(/Ñ/g, 'N\u0303')
      .replace(/ü/g, 'u\u0308')
      .replace(/Ü/g, 'U\u0308');
  }
};
