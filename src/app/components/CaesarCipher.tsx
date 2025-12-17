import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowRight } from 'lucide-react';

export function CaesarCipher() {
  const [text, setText] = useState('');
  const [shift, setShift] = useState(3);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [steps, setSteps] = useState<string[]>([]);
  const [result, setResult] = useState('');

  const caesarShift = (char: string, shiftAmount: number): { original: string, shifted: string, step: string } => {
    if (!/[a-zA-Z]/.test(char)) {
      return { original: char, shifted: char, step: `'${char}' is not a letter, keep as is` };
    }

    const isUpper = char === char.toUpperCase();
    const base = isUpper ? 65 : 97;
    const charCode = char.charCodeAt(0);
    const position = charCode - base;
    const newPosition = (position + shiftAmount + 26) % 26;
    const newChar = String.fromCharCode(base + newPosition);

    return {
      original: char,
      shifted: newChar,
      step: `'${char}' (pos ${position}) + ${shiftAmount} = '${newChar}' (pos ${newPosition})`
    };
  };

  const process = () => {
    if (!text) return;

    const shiftAmount = mode === 'encrypt' ? shift : -shift;
    const newSteps: string[] = [];
    let output = '';

    newSteps.push(`Starting ${mode === 'encrypt' ? 'encryption' : 'decryption'} with shift ${shift}`);
    newSteps.push(`Shift direction: ${shiftAmount > 0 ? 'forward' : 'backward'} by ${Math.abs(shiftAmount)} positions`);
    newSteps.push('---');

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const result = caesarShift(char, shiftAmount);
      output += result.shifted;
      newSteps.push(`Position ${i + 1}: ${result.step}`);
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
          <CardTitle className="text-cyan-300">Caesar Cipher Configuration</CardTitle>
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
            <Label className="text-slate-300">Shift Amount: {shift}</Label>
            <Input
              type="number"
              value={shift}
              onChange={(e) => setShift(parseInt(e.target.value) || 0)}
              min={0}
              max={25}
              className="bg-slate-800/50 border-slate-700 text-white"
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
                  transition={{ delay: index * 0.05 }}
                >
                  {step === '---' ? (
                    <div className="border-t border-slate-700 my-2" />
                  ) : (
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5 border-purple-500/30 text-purple-300 shrink-0">
                        {index + 1}
                      </Badge>
                      <p className="text-slate-300 font-mono text-sm">{step}</p>
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
