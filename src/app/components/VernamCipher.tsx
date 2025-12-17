import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowRight } from 'lucide-react';

export function VernamCipher() {
  const [text, setText] = useState('');
  const [key, setKey] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [result, setResult] = useState('');

  const validateBinary = (str: string): boolean => {
    return /^[01\s]+$/.test(str);
  };

  const cleanBinary = (str: string): string => {
    return str.replace(/\s/g, '');
  };

  const process = () => {
    if (!text || !key) return;

    const newSteps: string[] = [];
    const cleanText = cleanBinary(text);
    const cleanKey = cleanBinary(key);

    if (!validateBinary(text)) {
      newSteps.push('ERROR: Input text must be binary (only 0s and 1s)!');
      setSteps(newSteps);
      setResult('');
      return;
    }

    if (!validateBinary(key)) {
      newSteps.push('ERROR: Key must be binary (only 0s and 1s)!');
      setSteps(newSteps);
      setResult('');
      return;
    }

    if (cleanKey.length < cleanText.length) {
      newSteps.push('ERROR: Key must be at least as long as the text!');
      newSteps.push(`Text length: ${cleanText.length}, Key length: ${cleanKey.length}`);
      setSteps(newSteps);
      setResult('');
      return;
    }

    newSteps.push('Vernam Cipher (One-Time Pad) - Binary XOR');
    newSteps.push(`Text: ${cleanText}`);
    newSteps.push(`Key:  ${cleanKey.slice(0, cleanText.length)}`);
    newSteps.push('Operation: XOR (⊕)');
    newSteps.push('---');
    newSteps.push('XOR Truth Table: 0⊕0=0, 0⊕1=1, 1⊕0=1, 1⊕1=0');
    newSteps.push('---');

    let output = '';

    for (let i = 0; i < cleanText.length; i++) {
      const textBit = cleanText[i];
      const keyBit = cleanKey[i];
      
      // XOR operation
      const resultBit = textBit === keyBit ? '0' : '1';
      output += resultBit;
      
      newSteps.push(`Position ${i + 1}: ${textBit} ⊕ ${keyBit} = ${resultBit}`);
    }

    newSteps.push('---');
    newSteps.push(`Result: ${output}`);
    newSteps.push('');
    newSteps.push('Note: To decrypt, XOR the ciphertext with the same key');

    setSteps(newSteps);
    setResult(output);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-900/50 backdrop-blur-sm border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-cyan-300">Vernam Cipher (Binary One-Time Pad)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-slate-300">Input Binary Text</Label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., 10110011"
              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 font-mono"
            />
            <p className="text-xs text-slate-400 mt-1">Enter binary digits (0s and 1s only)</p>
          </div>

          <div>
            <Label className="text-slate-300">Binary Key (same length as text)</Label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g., 11001010"
              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 font-mono"
            />
            <p className="text-xs text-slate-400 mt-1">Enter binary key (0s and 1s only)</p>
          </div>

          <Button onClick={process} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
            Process (XOR)
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>

          {result && (
            <div className="p-4 bg-slate-800/50 rounded-lg border border-cyan-500/30">
              <Label className="text-cyan-300 mb-2 block">Result:</Label>
              <p className="text-white font-mono break-all text-lg">{result}</p>
            </div>
          )}

          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-300">
              💡 XOR operation: same bits = 0, different bits = 1
            </p>
          </div>
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
                  ) : step === '' ? (
                    <div className="h-2" />
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
