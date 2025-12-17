import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowRight } from 'lucide-react';

export function AffineCipher() {
  const [text, setText] = useState('');
  const [keyA, setKeyA] = useState(5);
  const [keyB, setKeyB] = useState(8);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [steps, setSteps] = useState<string[]>([]);
  const [result, setResult] = useState('');

  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const modInverse = (a: number, m: number): number => {
    a = ((a % m) + m) % m;
    for (let x = 1; x < m; x++) {
      if ((a * x) % m === 1) return x;
    }
    return 1;
  };

  const process = () => {
    if (!text) return;

    const newSteps: string[] = [];
    
    // Validate key A
    if (gcd(keyA, 26) !== 1) {
      newSteps.push(`ERROR: Key A (${keyA}) must be coprime with 26!`);
      newSteps.push(`gcd(${keyA}, 26) = ${gcd(keyA, 26)} ≠ 1`);
      newSteps.push('Valid values for A: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25');
      setSteps(newSteps);
      setResult('');
      return;
    }

    newSteps.push(`Key A: ${keyA}, Key B: ${keyB}`);
    newSteps.push(`Formula for encryption: E(x) = (${keyA}x + ${keyB}) mod 26`);
    
    if (mode === 'decrypt') {
      const aInv = modInverse(keyA, 26);
      newSteps.push(`Formula for decryption: D(y) = ${aInv}(y - ${keyB}) mod 26`);
      newSteps.push(`Modular inverse of ${keyA}: ${aInv}`);
    }
    
    newSteps.push('---');

    const cleanText = text.toUpperCase();
    let output = '';

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      
      if (!/[A-Z]/.test(char)) {
        output += char;
        newSteps.push(`Position ${i + 1}: '${char}' is not a letter, keep as is`);
        continue;
      }

      const x = char.charCodeAt(0) - 65;
      let y: number;

      if (mode === 'encrypt') {
        y = (keyA * x + keyB) % 26;
        const resultChar = String.fromCharCode(y + 65);
        output += resultChar;
        newSteps.push(`Position ${i + 1}: '${char}' (${x}) → (${keyA}×${x} + ${keyB}) mod 26 = ${y} → '${resultChar}'`);
      } else {
        const aInv = modInverse(keyA, 26);
        y = (aInv * (x - keyB + 26 * 26)) % 26;
        const resultChar = String.fromCharCode(y + 65);
        output += resultChar;
        newSteps.push(`Position ${i + 1}: '${char}' (${x}) → ${aInv}×(${x} - ${keyB}) mod 26 = ${y} → '${resultChar}'`);
      }
    }

    newSteps.push('---');
    newSteps.push(`Final result: ${output}`);

    setSteps(newSteps);
    setResult(output);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-900/50 backdrop-blur-sm border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-cyan-300">Affine Cipher Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-slate-300">Input Text</Label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to encrypt/decrypt"
              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Key A (must be coprime with 26)</Label>
              <Input
                type="number"
                value={keyA}
                onChange={(e) => setKeyA(parseInt(e.target.value) || 1)}
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">Key B</Label>
              <Input
                type="number"
                value={keyB}
                onChange={(e) => setKeyB(parseInt(e.target.value) || 0)}
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setMode('encrypt')}
              variant={mode === 'encrypt' ? 'default' : 'outline'}
              className={mode === 'encrypt' ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-slate-700 text-slate-300'}
            >
              Encrypt
            </Button>
            <Button
              onClick={() => setMode('decrypt')}
              variant={mode === 'decrypt' ? 'default' : 'outline'}
              className={mode === 'decrypt' ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-slate-700 text-slate-300'}
            >
              Decrypt
            </Button>
          </div>

          <Button onClick={process} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
            Process
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>

          {result && (
            <div className="p-4 bg-slate-800/50 rounded-lg border border-cyan-500/30">
              <Label className="text-cyan-300 mb-2 block">Result:</Label>
              <p className="text-white font-mono break-all">{result}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-purple-300">Step-by-Step Solution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {steps.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No steps yet. Configure and process to see the solution.</p>
            ) : (
              steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  {step === '---' ? (
                    <div className="border-t border-slate-700 my-2" />
                  ) : (
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5 border-purple-500/30 text-purple-300 shrink-0">
                        {index + 1}
                      </Badge>
                      <p className="text-slate-300 font-mono text-sm whitespace-pre-wrap">{step}</p>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}