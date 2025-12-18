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

  /* ========== READABLE LETTER MAPPING ========== */

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
    s.push(`Step 1: p = ${p}, q = ${q}`);
    s.push(`Step 2: n = ${n}`);
    s.push(`Step 3: φ(n) = ${phi}`);
    s.push(`Step 4: e = ${e}`);
    s.push(`Step 5: d = ${d}`);
    s.push('---');
    s.push(`Public Key: (n=${n}, e=${e})`);
    s.push(`Private Key: (n=${n}, d=${d})`);

    setPublicKey({ n, e });
    setPrivateKey({ n, d });
    setSteps(s);
  };

  /* ================= ENCRYPT ================= */

  const encrypt = () => {
    if (!text || !publicKey) {
      setSteps(['Please generate keys first']);
      return;
    }

    const s: string[] = [];
    const { n, e } = publicKey;
    const clean = text.toUpperCase().replace(/[^A-Z]/g, '');

    s.push('RSA Encryption');
    s.push(`Public Key: (n=${n}, e=${e})`);
    s.push('Letter mapping: A=0 … Z=25');
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
    if (!text || !privateKey) {
      setSteps(['Please generate keys first']);
      return;
    }

    const s: string[] = [];
    const { n, d } = privateKey;
    const clean = text.toUpperCase().replace(/[^A-Z]/g, '');

    s.push('RSA Decryption');
    s.push(`Private Key: (n=${n}, d=${d})`);
    s.push('Letter mapping: A=0 … Z=25');
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

  /* ================= UI (UNCHANGED STYLE) ================= */

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-900/50 backdrop-blur-sm border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-cyan-300">RSA Cipher Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Prime p</Label>
              <Input type="number" value={p} onChange={e => setP(+e.target.value)} />
            </div>
            <div>
              <Label className="text-slate-300">Prime q</Label>
              <Input type="number" value={q} onChange={e => setQ(+e.target.value)} />
            </div>
          </div>

          <Button size="sm" variant="outline" onClick={generateRandomPrimes}>
            <RefreshCw className="w-3 h-3 mr-2" /> Generate Random Primes
          </Button>

          <div>
            <Label className="text-slate-300">Public Exponent e</Label>
            <Input type="number" value={e} onChange={e => setE(+e.target.value)} />
          </div>

          <Button onClick={generateKeys} className="w-full bg-gradient-to-r from-green-600 to-emerald-600">
            Generate Keys
          </Button>

          {publicKey && privateKey && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-300 font-mono text-sm">Public: (n={publicKey.n}, e={publicKey.e})</p>
              <p className="text-green-300 font-mono text-sm">Private: (n={privateKey.n}, d={privateKey.d})</p>
            </div>
          )}

          <div>
            <Label className="text-slate-300">Input Text</Label>
            <Input value={text} onChange={e => setText(e.target.value)} />
          </div>

          <div className="flex gap-2">
            <Button onClick={encrypt} className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600">
              Encrypt <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button onClick={decrypt} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
              Decrypt <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {result && (
            <div className="p-4 bg-slate-800/50 rounded-lg border border-cyan-500/30">
              <Label className="text-cyan-300">Result</Label>
              <p className="font-mono tracking-widest text-white text-lg">{result}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-purple-300">Step-by-Step Solution</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[600px] overflow-y-auto space-y-2">
          {steps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              {step === '---' ? (
                <div className="border-t border-slate-700 my-2" />
              ) : (
                <div className="flex gap-2">
                  <Badge variant="outline">{i + 1}</Badge>
                  <p className="font-mono text-sm text-slate-300 whitespace-pre-wrap">{step}</p>
                </div>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
