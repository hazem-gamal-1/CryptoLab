import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowRight } from 'lucide-react';

export function PlayfairCipher() {
  const [text, setText] = useState('');
  const [key, setKey] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [steps, setSteps] = useState<string[]>([]);
  const [result, setResult] = useState('');
  const [matrix, setMatrix] = useState<string[][]>([]);

  const generateMatrix = (keyword: string): string[][] => {
    const cleanKey = keyword.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    const used = new Set<string>();
    const matrix: string[][] = [];
    let chars = '';

    // Add unique characters from key
    for (const char of cleanKey) {
      if (!used.has(char)) {
        used.add(char);
        chars += char;
      }
    }

    // Add remaining alphabet
    for (let i = 65; i <= 90; i++) {
      const char = String.fromCharCode(i);
      if (char !== 'J' && !used.has(char)) {
        chars += char;
      }
    }

    // Create 5x5 matrix
    for (let i = 0; i < 5; i++) {
      matrix.push(chars.slice(i * 5, i * 5 + 5).split(''));
    }

    return matrix;
  };

  const findPosition = (matrix: string[][], char: string): [number, number] => {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (matrix[i][j] === char) return [i, j];
      }
    }
    return [0, 0];
  };

  const preparePairs = (text: string): string[] => {
    const clean = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    const pairs: string[] = [];
    let i = 0;

    while (i < clean.length) {
      let first = clean[i];
      let second = i + 1 < clean.length ? clean[i + 1] : 'X';

      if (first === second) {
        second = 'X';
        i++;
      } else {
        i += 2;
      }

      pairs.push(first + second);
    }

    return pairs;
  };

  const processPlayfair = (pair: string, matrix: string[][], encrypt: boolean): { result: string, explanation: string } => {
    const [row1, col1] = findPosition(matrix, pair[0]);
    const [row2, col2] = findPosition(matrix, pair[1]);

    let newChar1 = '';
    let newChar2 = '';
    let explanation = '';

    if (row1 === row2) {
      // Same row
      const newCol1 = encrypt ? (col1 + 1) % 5 : (col1 + 4) % 5;
      const newCol2 = encrypt ? (col2 + 1) % 5 : (col2 + 4) % 5;
      newChar1 = matrix[row1][newCol1];
      newChar2 = matrix[row2][newCol2];
      explanation = `Same row [${row1}]: shift columns ${encrypt ? 'right' : 'left'}`;
    } else if (col1 === col2) {
      // Same column
      const newRow1 = encrypt ? (row1 + 1) % 5 : (row1 + 4) % 5;
      const newRow2 = encrypt ? (row2 + 1) % 5 : (row2 + 4) % 5;
      newChar1 = matrix[newRow1][col1];
      newChar2 = matrix[newRow2][col2];
      explanation = `Same column [${col1}]: shift rows ${encrypt ? 'down' : 'up'}`;
    } else {
      // Rectangle
      newChar1 = matrix[row1][col2];
      newChar2 = matrix[row2][col1];
      explanation = `Rectangle: swap columns [${pair[0]}(${row1},${col1}) → ${newChar1}, ${pair[1]}(${row2},${col2}) → ${newChar2}]`;
    }

    return { result: newChar1 + newChar2, explanation };
  };

  const process = () => {
    if (!text || !key) return;

    const newSteps: string[] = [];
    const mat = generateMatrix(key);
    setMatrix(mat);

    newSteps.push(`Key: "${key}"`);
    newSteps.push('Generated 5×5 Playfair Matrix:');
    mat.forEach((row, i) => {
      newSteps.push(`  ${row.join(' ')}`);
    });
    newSteps.push('---');

    const pairs = preparePairs(text);
    newSteps.push(`Prepared text into pairs: ${pairs.join(' ')}`);
    newSteps.push('---');

    let output = '';
    pairs.forEach((pair, index) => {
      const { result, explanation } = processPlayfair(pair, mat, mode === 'encrypt');
      output += result;
      newSteps.push(`Pair ${index + 1}: "${pair}" → "${result}" (${explanation})`);
    });

    newSteps.push('---');
    newSteps.push(`Final result: ${output}`);

    setSteps(newSteps);
    setResult(output);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-900/50 backdrop-blur-sm border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-cyan-300">Playfair Cipher Configuration</CardTitle>
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
            <Label className="text-slate-300">Key</Label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter keyword"
              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
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

          {matrix.length > 0 && (
            <div className="p-4 bg-slate-800/50 rounded-lg border border-cyan-500/30">
              <Label className="text-cyan-300 mb-3 block">Playfair Matrix:</Label>
              <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto">
                {matrix.flat().map((char, i) => (
                  <div key={i} className="aspect-square flex items-center justify-center bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-300 font-mono">
                    {char}
                  </div>
                ))}
              </div>
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
