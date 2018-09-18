class Rubric {
  constructor() {
    this.rules = [];
    this.finalMap = null;
  }

  // doesntMatter(rule) {}

  // matters(rule) {
  //   this.rules.push(rule);
  // }

  match(s1, s2) {
    let isMatch = s1 === s2;
    return { isMatch: isMatch };
  }

  rules() {
    return this.rules;
  }
}

const instance = new Rubric();
instance.Rubric = Rubric;

module.exports = instance;
