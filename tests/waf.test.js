const { scanHeuristics } = require('../waf');

describe('WAF Heuristic Engine', () => {
  test('mendeteksi XSS payload', () => {
    const result = scanHeuristics('<script>alert("xss")</script>');
    expect(result.isBlocked).toBe(true);
    expect(result.type).toBe('Stored XSS');
  });

  test('mendeteksi SQL Injection', () => {
    const result = scanHeuristics("' OR '1'='1");
    expect(result.isBlocked).toBe(true);
    expect(result.type).toBe('SQL Injection');
  });

  test('meloloskan ulasan bersih', () => {
    const result = scanHeuristics('Tempatnya sangat bagus dan bersih!');
    expect(result.isBlocked).toBe(false);
    expect(result.type).toBe('Clean Traffic');
  });
});
