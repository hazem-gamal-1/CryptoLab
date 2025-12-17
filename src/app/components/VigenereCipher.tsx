import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowRight } from 'lucide-react';

export function VigenereCipher() {
  const [text, setText] = useState('');
  const [key, setKey] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [steps, setSteps] = useState<string[]>([]);
  const [result, setResult] = useState('');

  const process = () => {
    if (!text || !key) return;

    const newSteps: string[] = [];
    const cleanText = text.toUpperCase().replace(/[^A-Z]/g, '');
    const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');

    if (cleanKey.length === 0) {
      newSteps.push('ERROR: Key must contain at least one letter!');
      setSteps(newSteps);
      setResult('');
      return;
    }

    // Repeat key to match text length
    let repeatedKey = '';
    for (let i = 0; i < cleanText.length; i++) {
      repeatedKey += cleanKey[i % cleanKey.length];
    }

    newSteps.push(`${mode === 'encrypt' ? 'Encryption' : 'Decryption'} using Vigenère Cipher`);
    newSteps.push(`Key: "${cleanKey}"`);
    newSteps.push(`Text:         ${cleanText}`);
    newSteps.push(`Repeated Key: ${repeatedKey}`);
    newSteps.push('---');

    let output = '';

    for (let i = 0; i < cleanText.length; i++) {
      const textChar = cleanText[i];
      const keyChar = repeatedKey[i];
      
      const textValue = textChar.charCodeAt(0) - 65;
      const keyValue = keyChar.charCodeAt(0) - 65;
      
      let resultValue: number;
      if (mode === 'encrypt') {
        resultValue = (textValue + keyValue) % 26;
      } else {
        resultValue = (textValue - keyValue + 26) % 26;
      }
      
      const resultChar = String.fromCharCode(resultValue + 65);
      output += resultChar;
      
      const operation = mode === 'encrypt' ? '+' : '-';
      newSteps.push(
        `Position ${i + 1}: '${textChar}' (${textValue}) ${operation} '${keyChar}' (${keyValue}) = ${resultValue} → '${resultChar}'`
      );
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
          <CardTitle className="text-cyan-300">Vigenère Cipher Configuration</CardTitle>
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
              placeholder="Enter keyword (e.g., CRYPTO)"
              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              The key will be repeated to match the text length
            </p>
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