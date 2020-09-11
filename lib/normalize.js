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

  /*
    \u0300 grave è
    \u0301 acute é
    \u0302 circumflex ê
    \u0303 tilde ñ
    \u0308 diaresis ï
    \u0327 cedilla ç
  */
  if (form === 'NFC') {
    return (
      str
        // Replace vowels followed by the combining acute accent. (U+0301)
        .replace(/a\u0300/g, 'à')
        .replace(/a\u0301/g, 'á')
        .replace(/a\u0302/g, 'â')
        .replace(/a\u0308/g, 'ä')
        .replace(/a\u0303/g, 'ã')
        .replace(/A\u0300/g, 'À')
        .replace(/A\u0301/g, 'Á')
        .replace(/A\u0302/g, 'Â')
        .replace(/A\u0303/g, 'Ã')
        .replace(/A\u0308/g, 'Ä')
        .replace(/a\u0327/g, 'ç')
        .replace(/C\u0327/g, 'Ç')
        .replace(/e\u0300/g, 'è')
        .replace(/e\u0301/g, 'é')
        .replace(/e\u0302/g, 'ê')
        .replace(/E\u0300/g, 'È')
        .replace(/E\u0301/g, 'É')
        .replace(/E\u0302/g, 'Ê')
        .replace(/i\u0301/g, 'í')
        .replace(/i\u0302/g, 'î')
        .replace(/i\u0308/g, 'ï')
        .replace(/I\u0301/g, 'Í')
        .replace(/I\u0302/g, 'Î')
        .replace(/I\u0308/g, 'Ï')
        .replace(/o\u0301/g, 'ó')
        .replace(/o\u0308/g, 'ö')
        .replace(/o\u0303/g, 'õ')
        .replace(/O\u0301/g, 'Ó')
        .replace(/O\u0308/g, 'Ö')
        .replace(/O\u0303/g, 'Õ')
        .replace(/u\u0301/g, 'ú')
        .replace(/u\u0308/g, 'ü')
        .replace(/U\u0301/g, 'Ú')
        .replace(/U\u0308/g, 'Ü')
        // Replace n followed by the combining tilde. (U+0303)
        .replace(/n\u0303/g, 'ñ')
        .replace(/N\u0303/g, 'Ñ')
    );
  } else if (form === 'NFD') {
    return str
      .replace(/à/g, 'a\u0300')
      .replace(/á/g, 'a\u0301')
      .replace(/â/g, 'a\u0302')
      .replace(/ä/g, 'a\u0308')
      .replace(/ã/g, 'a\u0303')
      .replace(/À/g, 'A\u0300')
      .replace(/Á/g, 'A\u0301')
      .replace(/Â/g, 'A\u0302')
      .replace(/Ä/g, 'A\u0308')
      .replace(/Ã/g, 'A\u0303')
      .replace(/ç/g, 'c\u0327')
      .replace(/Ç/g, 'C\u0327')
      .replace(/è/g, 'e\u0300')
      .replace(/é/g, 'e\u0301')
      .replace(/ê/g, 'e\u0302')
      .replace(/È/g, 'E\u0300')
      .replace(/É/g, 'E\u0301')
      .replace(/Ê/g, 'E\u0302')
      .replace(/í/g, 'i\u0301')
      .replace(/î/g, 'i\u0302')
      .replace(/ï/g, 'i\u0308')
      .replace(/Í/g, 'I\u0301')
      .replace(/Î/g, 'I\u0302')
      .replace(/Ï/g, 'I\u0308')
      .replace(/ó/g, 'o\u0301')
      .replace(/ö/g, 'o\u0308')
      .replace(/õ/g, 'o\u0303')
      .replace(/Ó/g, 'O\u0301')
      .replace(/Ö/g, 'O\u0308')
      .replace(/Õ/g, 'O\u0303')
      .replace(/ú/g, 'u\u0301')
      .replace(/ü/g, 'u\u0308')
      .replace(/Ú/g, 'U\u0301')
      .replace(/Ü/g, 'U\u0308')
      .replace(/ñ/g, 'n\u0303')
      .replace(/Ñ/g, 'N\u0303');
  }
};
