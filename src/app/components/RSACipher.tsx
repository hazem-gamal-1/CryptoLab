import { useState } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';

export default function RSACipher() {
  const [text, setText] = useState('');
  const [p, setP] = useState(61);
  const [q, setQ] = useState(53);
  const [e, setE] = useState(17);
  const [steps, setSteps] = useState<string[]>([]);
  const [result, setResult] = useState('');
  const [publicKey, setPublicKey] = useState<{ n: number; e: number } | null>(null);
  const [privateKey, setPrivateKey] = useState<{ n: number; d: number } | null>(null);
  const [useLetters, setUseLetters] = useState(true);

  const isPrime = (num: number): boolean => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  };

  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

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
    base = base % mod;
    while (exp > 0) {
      if (exp % 2 === 1) {
        result = (result * base) % mod;
      }
      exp = Math.floor(exp / 2);
      base = (base * base) % mod;
    }
    return result;
  };

  const numberToLetters = (num: number): string => {
    let result = '';
    let n = num;
    if (n === 0) return 'A';
    
    while (n > 0) {
      result = String.fromCharCode(65 + (n % 26)) + result;
      n = Math.floor(n / 26);
    }
    return result;
  };

  const lettersToNumber = (letters: string): number => {
    let result = 0;
    for (let i = 0; i < letters.length; i++) {
      result = result * 26 + (letters.charCodeAt(i) - 65);
    }
    return result;
  };

  const generateKeys = () => {
    const newSteps: string[] = [];

    if (!isPrime(p)) {
      newSteps.push(`ERROR: p = ${p} is not a prime number!`);
      setSteps(newSteps);
      return;
    }
    if (!isPrime(q)) {
      newSteps.push(`ERROR: q = ${q} is not a prime number!`);
      setSteps(newSteps);
      return;
    }

    newSteps.push('RSA Key Generation');
    newSteps.push('---');
    newSteps.push(`Step 1: Select two prime numbers`);
    newSteps.push(`  p = ${p}`);
    newSteps.push(`  q = ${q}`);
    newSteps.push('---');

    const n = p * q;
    newSteps.push(`Step 2: Calculate n = p × q`);
    newSteps.push(`  n = ${p} × ${q} = ${n}`);
    newSteps.push('---');

    const phi = (p - 1) * (q - 1);
    newSteps.push(`Step 3: Calculate φ(n) = (p-1) × (q-1)`);
    newSteps.push(`  φ(n) = ${p - 1} × ${q - 1} = ${phi}`);
    newSteps.push('---');

    if (gcd(e, phi) !== 1) {
      newSteps.push(`ERROR: e = ${e} is not coprime with φ(n) = ${phi}!`);
      newSteps.push(`  gcd(${e}, ${phi}) = ${gcd(e, phi)} ≠ 1`);
      setSteps(newSteps);
      return;
    }

    newSteps.push(`Step 4: Select e (public exponent)`);
    newSteps.push(`  e = ${e}`);
    newSteps.push(`  Verify: gcd(e, φ(n)) = gcd(${e}, ${phi}) = ${gcd(e, phi)} ✓`);
    newSteps.push('---');

    const d = modInverse(e, phi);
    if (d === -1) {
      newSteps.push(`ERROR: Cannot find modular inverse of e!`);
      setSteps(newSteps);
      return;
    }

    newSteps.push(`Step 5: Calculate d (private exponent)`);
    newSteps.push(`  d ≡ e⁻¹ (mod φ(n))`);
    newSteps.push(`  d = ${d}`);
    newSteps.push(`  Verify: (e × d) mod φ(n) = (${e} × ${d}) mod ${phi} = ${(e * d) % phi} ✓`);
    newSteps.push('---');

    newSteps.push(`Public Key: (n=${n}, e=${e})`);
    newSteps.push(`Private Key: (n=${n}, d=${d})`);

    setPublicKey({ n, e });
    setPrivateKey({ n, d });
    setSteps(newSteps);
  };

  const encrypt = () => {
    if (!text || !publicKey) {
      const newSteps = ['Please generate keys first!'];
      setSteps(newSteps);
      return;
    }

    const newSteps: string[] = [];
    const { n, e } = publicKey;

    newSteps.push('RSA Encryption');
    newSteps.push(`Public Key: (n=${n}, e=${e})`);
    newSteps.push('---');

    const cleanText = text.toUpperCase().replace(/[^A-Z]/g, '');
    const encrypted: number[] = [];
    const encryptedLetters: string[] = [];

    for (let i = 0; i < cleanText.length; i++) {
      const m = cleanText.charCodeAt(i);
      if (m >= n) {
        newSteps.push(`ERROR: Character '${cleanText[i]}' (ASCII ${m}) is >= n (${n})`);
        newSteps.push(`Please use larger primes or stick to basic ASCII characters.`);
        setSteps(newSteps);
        return;
      }
    }

    newSteps.push('Converting characters to ciphertext:');
    newSteps.push('Formula: C = M^e mod n');
    newSteps.push('---');

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const m = char.charCodeAt(0);
      const c = modPow(m, e, n);
      encrypted.push(c);
      
      if (useLetters) {
        const letterCode = numberToLetters(c);
        encryptedLetters.push(letterCode);
        newSteps.push(`'${char}' (ASCII ${m}): ${m}^${e} mod ${n} = ${c} → ${letterCode}`);
      } else {
        newSteps.push(`'${char}' (ASCII ${m}): ${m}^${e} mod ${n} = ${c}`);
      }
    }

    newSteps.push('---');
    const encryptedText = useLetters ? encryptedLetters.join(' ') : encrypted.join(' ');
    newSteps.push(`Encrypted: ${encryptedText}`);

    setSteps(newSteps);
    setResult(encryptedText);
  };

  const decrypt = () => {
    if (!text || !privateKey) {
      const newSteps = ['Please generate keys first!'];
      setSteps(newSteps);
      return;
    }

    const newSteps: string[] = [];
    const { n, d } = privateKey;

    newSteps.push('RSA Decryption');
    newSteps.push(`Private Key: (n=${n}, d=${d})`);
    newSteps.push('---');

    try {
      let cipherNumbers: number[];
      
      const tokens = text.trim().split(/\s+/);
      if (useLetters && /^[A-Z]+$/.test(tokens[0])) {
        cipherNumbers = tokens.map(token => lettersToNumber(token));
        newSteps.push('Converting letter codes to numbers...');
        tokens.forEach((token, i) => {
          newSteps.push(`${token} → ${cipherNumbers[i]}`);
        });
        newSteps.push('---');
      } else {
        cipherNumbers = tokens.map(s => parseInt(s)).filter(n => !isNaN(n));
      }
      
      newSteps.push('Converting ciphertext to plaintext:');
      newSteps.push('Formula: M = C^d mod n');
      newSteps.push('---');

      let decrypted = '';

      for (let i = 0; i < cipherNumbers.length; i++) {
        const c = cipherNumbers[i];
        const m = modPow(c, d, n);
        const char = String.fromCharCode(m);
        decrypted += char;
        
        newSteps.push(`${c}^${d} mod ${n} = ${m} (ASCII) = '${char}'`);
      }

      newSteps.push('---');
      newSteps.push(`Decrypted text: ${decrypted}`);

      setSteps(newSteps);
      setResult(decrypted);
    } catch (error) {
      newSteps.push('ERROR: Invalid ciphertext format!');
      setSteps(newSteps);
      setResult('');
    }
  };

  const generateRandomPrimes = () => {
    const primes = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
    const randomP = primes[Math.floor(Math.random() * primes.length)];
    let randomQ = primes[Math.floor(Math.random() * primes.length)];
    while (randomQ === randomP) {
      randomQ = primes[Math.floor(Math.random() * primes.length)];
    }
    setP(randomP);
    setQ(randomQ);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
            RSA Cipher Educational Tool
          </h1>
          <p className="text-slate-400">Learn RSA encryption with step-by-step visualization</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg shadow-xl">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-cyan-300">RSA Cipher Configuration</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Prime p</label>
                  <input
                    type="number"
                    value={p}
                    onChange={(e) => setP(parseInt(e.target.value) || 2)}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Prime q</label>
                  <input
                    type="number"
                    value={q}
                    onChange={(e) => setQ(parseInt(e.target.value) || 2)}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <button
                onClick={generateRandomPrimes}
                className="w-full px-4 py-2 bg-slate-800/50 border border-cyan-500/30 text-cyan-300 rounded-lg hover:bg-cyan-500/10 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Generate Random Primes
              </button>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Public Exponent e</label>
                <input
                  type="number"
                  value={e}
                  onChange={(e) => setE(parseInt(e.target.value) || 3)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <p className="text-xs text-slate-400 mt-1">Common values: 3, 17, 65537</p>
              </div>

              <button
                onClick={generateKeys}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all"
              >
                Generate Keys
              </button>

              {publicKey && privateKey && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg space-y-1">
                  <p className="text-green-300 text-sm font-mono">
                    Public: (n={publicKey.n}, e={publicKey.e})
                  </p>
                  <p className="text-green-300 text-sm font-mono">
                    Private: (n={privateKey.n}, d={privateKey.d})
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-slate-800/30 rounded-lg border border-slate-700">
                <input
                  type="checkbox"
                  id="useLetters"
                  checked={useLetters}
                  onChange={(e) => setUseLetters(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500"
                />
                <label htmlFor="useLetters" className="text-slate-300 cursor-pointer text-sm">
                  Use letter encoding (A-Z) instead of numbers
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Input Text / Ciphertext</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={useLetters ? "Enter text or space-separated letter codes" : "Enter text or space-separated numbers"}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={encrypt}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  Encrypt
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={decrypt}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  Decrypt
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {result && (
                <div className="p-4 bg-slate-800/50 rounded-lg border border-cyan-500/30">
                  <label className="text-cyan-300 mb-2 block font-medium">Result:</label>
                  <p className="text-white font-mono break-all text-sm">{result}</p>
                </div>
              )}
            </div>
          </div>

          {/* Steps Panel */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-lg shadow-xl">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-purple-300">Step-by-Step Solution</h2>
            </div>
            <div className="p-6">
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {steps.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No steps yet. Generate keys or process to see the solution.</p>
                ) : (
                  steps.map((step, index) => (
                    <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 20}ms` }}>
                      {step === '---' ? (
                        <div className="border-t border-slate-700 my-2" />
                      ) : (
                        <div className="flex items-start gap-2">
                          <span className="px-2 py-0.5 mt-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded text-xs font-mono shrink-0">
                            {index + 1}
                          </span>
                          <p className="text-slate-300 font-mono text-sm whitespace-pre-wrap">{step}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
