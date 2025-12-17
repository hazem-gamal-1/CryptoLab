import { useState } from 'react';
import { Shield, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { CaesarCipher } from './components/CaesarCipher';
import { PlayfairCipher } from './components/PlayfairCipher';
import { RowTransposition } from './components/RowTransposition';
import { HillCipher } from './components/HillCipher';
import { AffineCipher } from './components/AffineCipher';
import { VernamCipher } from './components/VernamCipher';
import { VigenereCipher } from './components/VigenereCipher';
import { RailFenceCipher } from './components/RailFenceCipher';
import { RSACipher } from './components/RSACipher';

const algorithms = [
  { id: 'caesar', name: 'Caesar', component: CaesarCipher },
  { id: 'playfair', name: 'Playfair', component: PlayfairCipher },
  { id: 'rowtrans', name: 'Row Transposition', component: RowTransposition },
  { id: 'hill', name: 'Hill', component: HillCipher },
  { id: 'affine', name: 'Affine', component: AffineCipher },
  { id: 'vernam', name: 'Vernam', component: VernamCipher },
  { id: 'vigenere', name: 'Vigenère', component: VigenereCipher },
  { id: 'railfence', name: 'Rail Fence', component: RailFenceCipher },
  { id: 'rsa', name: 'RSA', component: RSACipher },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('caesar');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Animated background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Header */}
      <div className="relative z-10">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="container mx-auto px-4 py-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="relative">
              <Shield className="w-12 h-12 text-cyan-400" />
              <Lock className="w-6 h-6 text-cyan-300 absolute -bottom-1 -right-1" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                CryptoLab
              </h1>
              <p className="text-slate-400 text-sm">Advanced Cryptography Toolkit</p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 bg-slate-900/50 backdrop-blur-sm p-2 h-auto">
              {algorithms.map((algo) => (
                <TabsTrigger
                  key={algo.id}
                  value={algo.id}
                  className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 text-slate-400 hover:text-cyan-200 transition-all"
                >
                  {algo.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {algorithms.map((algo) => {
              const Component = algo.component;
              return (
                <TabsContent key={algo.id} value={algo.id} className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Component />
                  </motion.div>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
