import { useState } from 'react';
setSteps(s);
};


const decrypt = () => {
if (!privateKey) return;


const { n, d } = privateKey;
let out = '';
const s: string[] = ['RSA Decryption'];


for (const ch of text.toUpperCase()) {
if (ch < 'A' || ch > 'Z') continue;
const c = ch.charCodeAt(0) - 65;
const m = modPow(c, d, n);
out += String.fromCharCode(m + 65);
s.push(`${ch} → ${m}`);
}


setResult(out);
setSteps(s);
};


return (
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
<Card className="bg-slate-900/50 backdrop-blur-sm border-cyan-500/20">
<CardHeader>
<CardTitle className="text-cyan-300">RSA Cipher Configuration</CardTitle>
</CardHeader>
<CardContent className="space-y-4">
<Label className="text-slate-300">p</Label>
<Input value={p} onChange={(e) => setP(Number(e.target.value))}
className="bg-slate-800/50 border-slate-700 text-white" />


<Label className="text-slate-300">q</Label>
<Input value={q} onChange={(e) => setQ(Number(e.target.value))}
className="bg-slate-800/50 border-slate-700 text-white" />


<Label className="text-slate-300">e</Label>
<Input value={e} onChange={(e) => setE(Number(e.target.value))}
className="bg-slate-800/50 border-slate-700 text-white" />


<Button onClick={generateKeys} className="w-full">Generate Keys</Button>


<Input
value={text}
onChange={(e) => setText(e.target.value)}
placeholder="HELLO"
className="bg-slate-800/50 border-slate-700 text-white"
/>


<div className="flex gap-2">
<Button onClick={encrypt} className="flex-1">Encrypt</Button>
<Button onClick={decrypt} className="flex-1">Decrypt</Button>
</div>


{result && <p className="text-white font-mono">{result}</p>}
</CardContent>
</Card>


<Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/20">
<CardHeader>
<CardTitle className="text-purple-300">Steps</CardTitle>
</CardHeader>
<CardContent className="space-y-2">
{steps.map((s, i) => (
<motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
<Badge className="mr-2">{i + 1}</Badge>
<span className="text-slate-300 font-mono">{s}</span>
</motion.div>
))}
</CardContent>
</Card>
</div>
);
}
