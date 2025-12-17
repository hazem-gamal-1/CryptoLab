import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowRight } from 'lucide-react';

export function RailFenceCipher() {
  const [text, setText] = useState('');
  const [rails, setRails] = useState(3);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [steps, setSteps] = useState<string[]>([]);
  const [result, setResult] = useState('');
  const [fence, setFence] = useState<string[][]>([]);

  const encrypt = () => {
    if (!text || rails < 2) return;

    const newSteps: string[] = [];
    const cleanText = text.replace(/\s/g, '').toUpperCase();

    newSteps.push(`Encrypting with ${rails} rails`);
    newSteps.push(`Text: ${cleanText}`);
    newSteps.push('---');

    // Create fence
    const fence: string[][] = Array(rails).fill(null).map(() => []);
    let rail = 0;
    let direction = 1; // 1 for down, -1 for up

    newSteps.push('Building the rail fence pattern:');

    for (let i = 0; i < cleanText.length; i++) {
      fence[rail].push(cleanText[i]);
      
      const railVisual = Array(rails).fill('.').map((_, idx) => 
        idx === rail ? cleanText[i] : '.'
      ).join(' ');
      newSteps.push(`  Char ${i + 1} '${cleanText[i]}' → Rail ${rail + 1}: ${railVisual}`);

      if (rail === 0) {
        direction = 1;
      } else if (rail === rails - 1) {
        direction = -1;
      }
      rail += direction;
    }

    setFence(fence);

    newSteps.push('---');
    newSteps.push('Reading rails from top to bottom:');

    let output = '';
    fence.forEach((rail, index) => {
      const railText = rail.join('');
      output += railText;
      newSteps.push(`  Rail ${index + 1}: ${railText}`);
    });

    newSteps.push('---');
    newSteps.push(`Final encrypted text: ${output}`);

    setSteps(newSteps);
    setResult(output);
  };

  const decrypt = () => {
    if (!text || rails < 2) return;

    const newSteps: string[] = [];
    const cleanText = text.replace(/\s/g, '').toUpperCase();

    newSteps.push(`Decrypting with ${rails} rails`);
    newSteps.push(`Ciphertext: ${cleanText}`);
    newSteps.push('---');

    // Calculate positions pattern
    const pattern: number[] = [];
    let rail = 0;
    let direction = 1;

    for (let i = 0; i < cleanText.length; i++) {
      pattern.push(rail);
      if (rail === 0) {
        direction = 1;
      } else if (rail === rails - 1) {
        direction = -1;
      }
      rail += direction;
    }

    // Calculate rail lengths
    const railLengths = Array(rails).fill(0);
    pattern.forEach(r => railLengths[r]++);

    newSteps.push('Rail pattern and lengths:');
    railLengths.forEach((len, i) => {
      newSteps.push(`  Rail ${i + 1}: ${len} characters`);
    });
    newSteps.push('---');

    // Fill fence from ciphertext
    const fence: string[][] = Array(rails).fill(null).map(() => []);
    let textIndex = 0;

    for (let i = 0; i < rails; i++) {
      for (let j = 0; j < railLengths[i]; j++) {
        fence[i].push(cleanText[textIndex++]);
      }
      newSteps.push(`  Rail ${i + 1} filled: ${fence[i].join('')}`);
    }

    setFence(fence);

    newSteps.push('---');
    newSteps.push('Reading in zigzag pattern:');

    // Read in zigzag pattern
    const railIndices = Array(rails).fill(0);
    let output = '';

    pattern.forEach((railNum, i) => {
      const char = fence[railNum][railIndices[railNum]];
      railIndices[railNum]++;
      output += char;
      
      if (i % 5 === 0 || i === pattern.length - 1) {
        newSteps.push(`  Position ${i + 1}: '${char}' from rail ${railNum + 1}`);
      }
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
          <CardTitle className="text-cyan-300">Rail Fence Cipher Configuration</CardTitle>
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
            <Label className="text-slate-300">Number of Rails: {rails}</Label>
            <Input
              type="number"
              value={rails}
              onChange={(e) => setRails(parseInt(e.target.value) || 2)}
              min={2}
              max={10}
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

          {fence.length > 0 && (
            <div className="p-4 bg-slate-800/50 rounded-lg border border-cyan-500/30">
              <Label className="text-cyan-300 mb-3 block">Rail Fence Visualization:</Label>
              <div className="font-mono text-cyan-300 text-sm space-y-1">
                {fence.map((rail, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-purple-400 w-16">Rail {i + 1}:</span>
                    <span>{rail.join(' ')}</span>
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
                  transition={{ delay: index * 0.02 }}
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
