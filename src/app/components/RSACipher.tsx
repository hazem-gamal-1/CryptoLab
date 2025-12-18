import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowRight, RefreshCw } from 'lucide-react';

export function RSACipher() {
  const [text, setText] = useState('');
  const [p, setP] = useState(61);
  const [q, setQ] = useState(53);
  const [e, setE] = useState(17);
  const [steps, setSteps] = useState<string[]>([]);
  const [result, setResult] = useState('');
  const [publicKey, setPublicKey] = useState<{ n: number; e: number } | null>(null);
  const [privateKey, setPrivateKey] = useState<{ n: number; d: number } | null>(null);

  /* ================= RSA MATH ================= */

  const isPrime = (num: number): boolean => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  };

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

  const extendedGCD = (a: number, b: number): [number, number, number] => {
    if (b === 0) return [a, 1, 0];
    const [g, x1, y1] = extendedGCD(b, a % b);
    return [g, y1, x1 - Math.floor(a / b) * y1];
  };

  const modInverse = (a: number, m: number): number => {
    const [g, x] = extendedGCD(a, m);
    if (g !== 1) return -1;
    return ((x % m) + m) % m;
  };

  const modPow = (base: number, exp: number, mod: number): number => {
    let result = 1;
    base %= mod;
    while (exp > 0) {
      if (exp % 2 === 1) result = (result * base) % mod;
      exp = Math.floor(exp / 2);
      base = (base * base) % mod;
    }
    return result;
  };

  /* ========== LETTER MAPPING (READABLE OUTPUT) ========== */

  const charToNumber = (c: string) => c.charCodeAt(0) - 65; // A=0
  const numberToChar = (n: number) => String.fromCharCode((n % 26) + 65);

  /* ================= KEY GENERATION ================= */

  const generateKeys = () => {
    const s: string[] = [];

    if (!isPrime(p) || !isPrime(q)) {
      s.push('ERROR: p and q must be prime numbers');
      setSteps(s);
      return;
    }

    const n = p * q;
    const phi = (p - 1) * (q - 1);

    if (gcd(e, phi) !== 1) {
      s.push(`ERROR: gcd(${e}, ${phi}) ≠ 1`);
      setSteps(s);
      return;
    }

    const d = modInverse(e, phi);

    s.push('RSA Key Generation');
    s.push('---');
    s.push(`p = ${p}, q = ${q}`);
    s.push(`n = p × q = ${n}`);
    s.push(`φ(n) = ${phi}`);
    s.push(`Public exponent e = ${e}`);
    s.push(`Private exponent d = ${d}`);
    s.push('---');
    s.push(`Public Key: (n=${n}, e=${e})`);
    s.push(`Private Key: (n=${n}, d=${d})`);

    setPublicKey({ n, e });
    setPrivateKey({ n, d });
    setSteps(s);
  };

  /* ================= ENCRYPT ================= */

  const encrypt = () => {
    if (!text || !publicKey) return;

    const s: string[] = [];
    const { n, e } = publicKey;
    const clean = text.toUpperCase().replace(/[^A-Z]/g, '');

    s.push('RSA Encryption');
    s.push('Letter mapping: A=0 ... Z=25');
    s.push('Formula: C = M^e mod n');
    s.push('---');

    let cipher = '';

    for (const ch of clean) {
      const m = charToNumber(ch);
      const c = modPow(m, e, n);
      const out = numberToChar(c);
      cipher += out;
      s.push(`${ch} → ${m} → ${m}^${e} mod ${n} = ${c} → ${out}`);
    }

    s.push('---');
    s.push(`Encrypted text: ${cipher}`);

    setSteps(s);
    setResult(cipher);
  };

  /* ================= DECRYPT ================= */

  const decrypt = () => {
    if (!text || !privateKey) return;

    const s: string[] = [];
    const { n, d } = privateKey;
    const clean = text.toUpperCase().replace(/[^A-Z]/g, '');

    s.push('RSA Decryption');
    s.push('Letter mapping: A=0 ... Z=25');
    s.push('Formula: M = C^d mod n');
    s.push('---');

    let plain = '';

    for (const ch of clean) {
      const c = charToNumber(ch);
      const m = modPow(c, d, n);
      const out = numberToChar(m);
      plain += out;
      s.push(`${ch} → ${c} → ${c}^${d} mod ${n} = ${m} → ${out}`);
    }

    s.push('---');
    s.push(`Decrypted text: ${plain}`);

    setSteps(s);
    setResult(plain);
  };

  const generateRandomPrimes = () => {
    const primes = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
    let rp = primes[Math.floor(Math.random() * primes.length)];
    let rq = primes[Math.floor(Math.random() * primes.length)];
    while (rp === rq) rq = primes[Math.floor(Math.random() * primes.length)];
    setP(rp);
    setQ(rq);
  };

  /* ================= UI ================= */

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-900/50 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-cyan-300">RSA Cipher</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input type="number" value={p} onChange={e => setP(+e.target.value)} />
            <Input type="number" value={q} onChange={e => setQ(+e.target.value)} />
          </div>

          <Button onClick={generateRandomPrimes} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" /> Random Primes
          </Button>

          <Input type="number" value={e} onChange={e => setE(+e.target.value)} />

          <Button onClick={generateKeys} className="bg-green-600">Generate Keys</Button>

          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="TEXT (A–Z only)"
          />

          <div className="flex gap-2">
            <Button onClick={encrypt} className="flex-1">Encrypt</Button>
            <Button onClick={decrypt} className="flex-1">Decrypt</Button>
          </div>

          {result && (
            <div className="p-3 bg-slate-800 rounded">
              <Label>Result</Label>
              <p className="font-mono tracking-widest text-lg">{result}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-purple-300">Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {s === '---' ? (
                <div className="border-t border-slate-700 my-2" />
              ) : (
                <div className="flex gap-2">
                  <Badge>{i + 1}</Badge>
                  <p className="font-mono text-sm">{s}</p>
                </div>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
