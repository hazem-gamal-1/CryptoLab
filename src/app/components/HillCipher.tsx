import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowRight } from 'lucide-react';

export function HillCipher() {
  const [text, setText] = useState('');
  const [m00, setM00] = useState(6);
  const [m01, setM01] = useState(24);
  const [m10, setM10] = useState(1);
  const [m11, setM11] = useState(13);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [steps, setSteps] = useState<string[]>([]);
  const [result, setResult] = useState('');

  const modInverse = (a: number, m: number): number => {
    a = ((a % m) + m) % m;
    for (let x = 1; x < m; x++) {
      if ((a * x) % m === 1) return x;
    }
    return 1;
  };

  const determinant2x2 = (matrix: number[][]): number => {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  };

  const inverse2x2 = (matrix: number[][]): number[][] | null => {
    const det = determinant2x2(matrix);
    const detMod = ((det % 26) + 26) % 26;
    
    if (detMod === 0) return null;
    
    const detInv = modInverse(detMod, 26);
    
    return [
      [(matrix[1][1] * detInv) % 26, (-matrix[0][1] * detInv + 26 * 26) % 26],
      [(-matrix[1][0] * detInv + 26 * 26) % 26, (matrix[0][0] * detInv) % 26]
    ];
  };

  const multiplyMatrices = (a: number[][], b: number[]): number[] => {
    return [
      (a[0][0] * b[0] + a[0][1] * b[1]) % 26,
      (a[1][0] * b[0] + a[1][1] * b[1]) % 26
    ];
  };

  const process = () => {
    if (!text) return;

    const newSteps: string[] = [];
    const cleanText = text.toUpperCase().replace(/[^A-Z]/g, '');
    
    // Pad text to even length
    const paddedText = cleanText.length % 2 === 0 ? cleanText : cleanText + 'X';
    
    const keyMatrix = [[m00, m01], [m10, m11]];
    
    newSteps.push('Key Matrix (2×2):');
    newSteps.push(`  [${keyMatrix[0][0]}, ${keyMatrix[0][1]}]`);
    newSteps.push(`  [${keyMatrix[1][0]}, ${keyMatrix[1][1]}]`);
    newSteps.push('---');

    let workingMatrix = keyMatrix;

    if (mode === 'decrypt') {
      const invMatrix = inverse2x2(keyMatrix);
      if (!invMatrix) {
        newSteps.push('ERROR: Key matrix is not invertible!');
        newSteps.push(`Determinant mod 26 = ${((determinant2x2(keyMatrix) % 26) + 26) % 26}`);
        setSteps(newSteps);
        setResult('');
        return;
      }
      workingMatrix = invMatrix;
      newSteps.push('Inverse Key Matrix (for decryption):');
      newSteps.push(`  [${invMatrix[0][0]}, ${invMatrix[0][1]}]`);
      newSteps.push(`  [${invMatrix[1][0]}, ${invMatrix[1][1]}]`);
      newSteps.push('---');
    }

    newSteps.push(`Input text: ${paddedText}`);
    newSteps.push('Processing in pairs:');
    newSteps.push('---');

    let output = '';

    for (let i = 0; i < paddedText.length; i += 2) {
      const pair = paddedText.slice(i, i + 2);
      const vector = [pair.charCodeAt(0) - 65, pair.charCodeAt(1) - 65];
      
      newSteps.push(`Pair "${pair}" = [${vector[0]}, ${vector[1]}]`);
      
      const result = multiplyMatrices(workingMatrix, vector);
      const resultChars = String.fromCharCode(result[0] + 65) + String.fromCharCode(result[1] + 65);
      
      newSteps.push(`  [${workingMatrix[0][0]}, ${workingMatrix[0][1]}]   [${vector[0]}]   [${result[0]}]   "${resultChars}"`);
      newSteps.push(`  [${workingMatrix[1][0]}, ${workingMatrix[1][1]}] × [${vector[1]}] = [${result[1]}] = `);
      
      output += resultChars;
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
          <CardTitle className="text-cyan-300">Hill Cipher Configuration</CardTitle>
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

          <div>
            <Label className="text-slate-300 mb-3 block">Key Matrix (2×2)</Label>
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <span className="text-slate-400 text-2xl">[</span>
                <Input
                  type="number"
                  value={m00}
                  onChange={(e) => setM00(parseInt(e.target.value) || 0)}
                  className="bg-slate-800/50 border-slate-700 text-white w-20 text-center"
                />
                <Input
                  type="number"
                  value={m01}
                  onChange={(e) => setM01(parseInt(e.target.value) || 0)}
                  className="bg-slate-800/50 border-slate-700 text-white w-20 text-center"
                />
                <span className="text-slate-400 text-2xl">]</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-slate-400 text-2xl">[</span>
                <Input
                  type="number"
                  value={m10}
                  onChange={(e) => setM10(parseInt(e.target.value) || 0)}
                  className="bg-slate-800/50 border-slate-700 text-white w-20 text-center"
                />
                <Input
                  type="number"
                  value={m11}
                  onChange={(e) => setM11(parseInt(e.target.value) || 0)}
                  className="bg-slate-800/50 border-slate-700 text-white w-20 text-center"
                />
                <span className="text-slate-400 text-2xl">]</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Enter numbers for the 2×2 matrix</p>
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
