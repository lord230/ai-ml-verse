const fs = require('fs');

let code = fs.readFileSync('src/app/architecture-playground/page.tsx', 'utf8');
const modDraft = fs.readFileSync('src/components/visuals/MLPModuleDraft.tsx', 'utf8');
const canDraft = fs.readFileSync('src/components/visuals/MLPCanvasDraft.tsx', 'utf8');

// Replace Types
if (!code.includes('ActivationType =')) {
    code = code.replace(/type Precision = 'FP32' \| 'FP16' \| 'BF16' \| 'FP8';/, 
        "type Precision = 'FP32' | 'FP16' | 'BF16' | 'FP8';\ntype ActivationType = 'ReLU' | 'Sigmoid' | 'Tanh' | 'GELU' | 'Linear';\ntype WeightInitType = 'Random' | 'Xavier' | 'He' | 'Zeros';"
    );
}

// Replace MLP Module
const mlpModuleRegex = /\/\/ -+\r?\n\/\/ MLP MODULE[ \t]*\r?\n\/\/ -+[\s\S]*?(?=\r?\n\/\/ -+\r?\n\/\/ CNN MODULE)/;
code = code.replace(mlpModuleRegex, modDraft.trim());

// Replace MLP Canvas
const mlpCanvasRegex = /\/\/ -+\r?\n\/\/ VISUALIZATION LOGIC: MLP Canvas[ \t]*\r?\n\/\/ -+[\s\S]*?(?=\r?\n\/\/ -+\r?\n\/\/ VISUALIZATION LOGIC: CNN Canvas)/;
// Extract just the function from canDraft
const canFuncStart = canDraft.indexOf('function MLPCanvas(');
const canvasCode = '// -------------------------------------------------------------\n// VISUALIZATION LOGIC: MLP Canvas \n// -------------------------------------------------------------\n' + canDraft.substring(canFuncStart);
code = code.replace(mlpCanvasRegex, canvasCode.trim());

fs.writeFileSync('src/app/architecture-playground/page.tsx', code);
console.log('Replaced successfully');
