import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowRight } from 'lucide-react';

export function RowTransposition() {
  const [text, setText] = useState('');
  const [key, setKey] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [steps, setSteps] = useState<string[]>([]);
  const [result, setResult] = useState('');
  const [grid, setGrid] = useState<string[][]>([]);

  const parseKeyOrder = (key: string): number[] => {
    return key.trim().split(/\s+/).map(n => parseInt(n)).filter(n => !isNaN(n));
  };

  const encrypt = () => {
    if (!text || !key) return;

    const newSteps: string[] = [];
    const cleanText = text.replace(/\s/g, '').toUpperCase();
    const keyOrder = parseKeyOrder(key);

    if (keyOrder.length === 0) {
      newSteps.push('ERROR: Invalid key format! Use space-separated numbers (e.g., "3 1 4 2")');
      setSteps(newSteps);
      return;
    }

    const numCols = keyOrder.length;
    const numRows = Math.ceil(cleanText.length / numCols);

    newSteps.push(`Key order: ${keyOrder.join(' ')}`);
    newSteps.push(`Text length: ${cleanText.length}, Columns: ${numCols}, Rows: ${numRows}`);
    newSteps.push('---');

    // Create grid
    const grid: string[][] = [];
    let textIndex = 0;

    for (let i = 0; i < numRows; i++) {
      const row: string[] = [];
      for (let j = 0; j < numCols; j++) {
        row.push(textIndex < cleanText.length ? cleanText[textIndex++] : 'X');
      }
      grid.push(row);
    }

    setGrid(grid);

    newSteps.push('Grid created:');
    newSteps.push(`  ${keyOrder.join(' ')}`);
    grid.forEach((row, i) => {
      newSteps.push(`  ${row.join(' ')}`);
    });
    newSteps.push('---');

    // Read columns in key order
    let output = '';
    const sortedIndices = keyOrder.map((_, i) => i).sort((a, b) => keyOrder[a] - keyOrder[b]);

    sortedIndices.forEach((colIndex) => {
      let column = '';
      for (let row = 0; row < numRows; row++) {
        column += grid[row][colIndex];
      }
      output += column;
      newSteps.push(`Column with order ${keyOrder[colIndex]} (index ${colIndex}): ${column}`);
    });

    newSteps.push('---');
    newSteps.push(`Final encrypted text: ${output}`);

    setSteps(newSteps);
    setResult(output);
  };

  const decrypt = () => {
    if (!text || !key) return;

    const newSteps: string[] = [];
    const cleanText = text.replace(/\s/g, '').toUpperCase();
    const keyOrder = parseKeyOrder(key);

    if (keyOrder.length === 0) {
      newSteps.push('ERROR: Invalid key format! Use space-separated numbers (e.g., "3 1 4 2")');
      setSteps(newSteps);
      return;
    }

    const numCols = keyOrder.length;
    const numRows = Math.ceil(cleanText.length / numCols);

    newSteps.push(`Key order: ${keyOrder.join(' ')}`);
    newSteps.push(`Text length: ${cleanText.length}, Columns: ${numCols}, Rows: ${numRows}`);
    newSteps.push('---');

    // Create empty grid
    const grid: string[][] = Array(numRows).fill(null).map(() => Array(numCols).fill(''));

    // Calculate positions pattern
    const pattern: number[] = [];
    for (let i = 0; i < cleanText.length; i++) {
      pattern.push(i % numCols);
    }

    // Calculate rail lengths
    const railLengths = Array(numCols).fill(0);
    pattern.forEach(r => railLengths[r]++);

    newSteps.push('Column lengths:');
    railLengths.forEach((len, i) => {
      newSteps.push(`  Column ${keyOrder[i]}: ${len} characters`);
    });
    newSteps.push('---');

    // Fill columns in key order
    const sortedIndices = keyOrder.map((_, i) => i).sort((a, b) => keyOrder[a] - keyOrder[b]);
    let textIndex = 0;

    sortedIndices.forEach((colIndex) => {
      let column = '';
      for (let row = 0; row < numRows; row++) {
        if (textIndex < cleanText.length) {
          grid[row][colIndex] = cleanText[textIndex];
          column += cleanText[textIndex];
          textIndex++;
        }
      }
      newSteps.push(`Fill column ${keyOrder[colIndex]} (index ${colIndex}): ${column}`);
    });

    setGrid(grid);

    newSteps.push('---');
    newSteps.push('Reconstructed grid:');
    newSteps.push(`  ${keyOrder.join(' ')}`);
    grid.forEach((row) => {
      newSteps.push(`  ${row.join(' ')}`);
    });
    newSteps.push('---');

    // Read row by row
    let output = '';
    grid.forEach((row, i) => {
      const rowText = row.join('');
      output += rowText;
      newSteps.push(`Row ${i + 1}: ${rowText}`);
    });

    newSteps.push('---');
    newSteps.push(`Final decrypted text: ${output}`);

    setSteps(newSteps);
    setResult(output);
  };

  const process = () => {
    if (mode === 'encrypt') {
      encrypt();
    } else {
      decrypt();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-900/50 backdrop-blur-sm border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-cyan-300">Row Transposition Configuration</CardTitle>
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
            <Label className="text-slate-300">Key (numeric order)</Label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g., 3 1 4 2"
              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
            <p className="text-xs text-slate-400 mt-1">Enter space-separated numbers representing column order</p>
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

          {grid.length > 0 && (
            <div className="p-4 bg-slate-800/50 rounded-lg border border-cyan-500/30 overflow-x-auto">
              <Label className="text-cyan-300 mb-3 block">Transposition Grid:</Label>
              <div className="font-mono text-cyan-300 text-sm">
                <div className="flex gap-2 mb-2">
                  {parseKeyOrder(key).map((num, i) => (
                    <div key={i} className="w-8 h-8 flex items-center justify-center bg-cyan-500/20 border border-cyan-500/40 rounded">
                      {num}
                    </div>
                  ))}
                </div>
                {grid.map((row, i) => (
                  <div key={i} className="flex gap-2 mb-1">
                    {row.map((cell, j) => (
                      <div key={j} className="w-8 h-8 flex items-center justify-center bg-slate-800/50 border border-slate-600 rounded">
                        {cell}
                      </div>
                    ))}
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
