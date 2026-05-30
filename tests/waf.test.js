const { scanHeuristics } = require('../waf');

describe('WAF Heuristic Engine', () => {
  test('mendeteksi XSS payload', () => {
    const result = scanHeuristics('<script>alert("xss")</script>');
    expect(result.isBlocked).toBe(true);
    expect(result.type).toBe('Stored XSS');
  });

  test('mendeteksi muatan XSS berturut-turut (RegExp stateful check)', () => {
    const payload = '<script>alert("xss")</script>';
    const result1 = scanHeuristics(payload);
    expect(result1.isBlocked).toBe(true);
    expect(result1.type).toBe('Stored XSS');

    const result2 = scanHeuristics(payload);
    expect(result2.isBlocked).toBe(true);
    expect(result2.type).toBe('Stored XSS');
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
