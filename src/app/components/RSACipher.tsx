import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function RSACipher() {
  const [text, setText] = useState('');
  const [p, setP] = useState(3);
  const [q, setQ] = useState(11);
  const [e, setE] = useState(3);
  const [steps, setSteps] = useState<string[]>([]);
  const [result, setResult] = useState('');
  const [publicKey, setPublicKey] = useState<{ n: number; e: number } | null>(null);
  const [privateKey, setPrivateKey] = useState<{ n: number; d: number } | null>(null);

  const isPrime = (n: number): boolean => {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false;
    }
    return true;
  };

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

  const egcd = (a: number, b: number): [number, number, number] => {
    if (b === 0) return [a, 1, 0];
    const [g, x1, y1] = egcd(b, a % b);
    return [g, y1, x1 - Math.floor(a / b) * y1];
  };

  const modInverse = (a: number, m: number): number => {
    const [g, x] = egcd(a, m);
    if (g !== 1) return -1;
    return ((x % m) + m) % m;
  };

  const modPow = (base: number, exp: number, mod: number): number => {
    let result = 1;
    base %= mod;
    while (exp > 0) {
      if (exp & 1) result = (result * base) % mod;
      exp >>= 1;
      base = (base * base) % mod;
    }
    return result;
  };

  const generateKeys = () => {
    const s: string[] = [];

    if (!isPrime(p) || !isPrime(q)) {
      setSteps(['ERROR: p and q must be prime']);
      return;
    }

    const n = p * q;
    const phi = (p - 1) * (q - 1);

    // IMPORTANT: readable A–Z mapping requires n ≤ 26
    if (n > 26) {
      setSteps([
        'ERROR: For readable A–Z output, n must be ≤ 26',
        `Current n = ${n}`,
        'Choose smaller primes (example: p=3, q=7 → n=21)'
      ]);
      return;
    }

    if (gcd(e, phi) !== 1) {
      setSteps([`ERROR: gcd(${e}, ${phi}) ≠ 1`]);
      return;
    }

    const d = modInverse(e, phi);

    s.push('RSA Key Generation');
    s.push(`p = ${p}, q = ${q}`);
    s.push(`n = ${n}`);
    s.push(`φ(n) = ${phi}`);
    s.push(`e = ${e}`);
    s.push(`d = ${d}`);

    setPublicKey({ n, e });
    setPrivateKey({ n, d });
    setSteps(s);
  };

  const encrypt = () => {
    if (!publicKey) return;

    const { n, e } = publicKey;
    let out = '';
    const s: string[] = ['RSA Encryption'];

    for (const ch of text.toUpperCase()) {
      if (ch < 'A' || ch > 'Z') continue;
      const m = ch.charCodeAt(0) - 65;
      const c = modPow(m, e, n);
      out += String.fromCharCode(c + 65);
      s.push(`${ch} → ${c}`);
    }

    setResult(out);
    setSteps(s);
  };

  const decrypt = () => {
    if (!privateKey) return;

    const { n, d } = privateKey;
    let out = '';
    const s: string[] = ['RSA Decryption'];

    for (const ch of text.toUpperCase()) {
      if (ch < 'A' || ch > 'Z') continue;
      const c = ch.charCodeAt(0) - 65;
      const m = modPow(c, d, n);
      out += String.fromCharCode(m + 65);
      s.push(`${ch} → ${m}`);
    }

    setResult(out);
    setSteps(s);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-900/50 backdrop-blur-sm border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-cyan-300">RSA Cipher Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-slate-300">p</Label>
            <Input
              type="number"
              value={p}
              onChange={(e) => setP(Number(e.target.value))}
              className="bg-slate-800/50 border-slate-700 text-white"
            />
          </div>

          <div>
            <Label className="text-slate-300">q</Label>
            <Input
              type="number"
              value={q}
              onChange={(e) => setQ(Number(e.target.value))}
              className="bg-slate-800/50 border-slate-700 text-white"
            />
          </div>

          <div>
            <Label className="text-slate-300">e</Label>
            <Input
              type="number"
              value={e}
              onChange={(e) => setE(Number(e.target.value))}
              className="bg-slate-800/50 border-slate-700 text-white"
            />
          </div>

          <Button onClick={generateKeys} className="w-full">
            Generate Keys
          </Button>

          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="HELLO"
            className="bg-slate-800/50 border-slate-700 text-white"
          />

          <div className="flex gap-2">
            <Button onClick={encrypt} className="flex-1">Encrypt</Button>
            <Button onClick={decrypt} className="flex-1">Decrypt</Button>
          </div>

          {result && (
            <p className="text-white font-mono break-all">{result}</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-purple-300">Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Badge className="mr-2">{i + 1}</Badge>
              <span className="text-slate-300 font-mono">{s}</span>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
