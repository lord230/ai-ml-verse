import React from 'react';
import { ExplainerMode } from './BackpropVisualizer';
import { MathEngineState, WeightMap } from './useMathEngine';

interface Props {
    mode: ExplainerMode;
    currentStep: number;
    math: MathEngineState;
    learningRate: number;
    inputs: number[];
}

// Mathematical Fraction Component for accurate Calculus rendering
const Frac = ({ n, d }: { n: React.ReactNode, d: React.ReactNode }) => (
    <span className="inline-flex flex-col items-center justify-center align-middle mx-1 text-[0.95em]">
        <span className="border-b border-slate-400/60 pb-[2px] mb-[2px] leading-none px-1">{n}</span>
        <span className="leading-none pt-[1px] px-1">{d}</span>
    </span>
);

export default function StepExplorer({ mode, currentStep, math, learningRate, inputs }: Props) {
    const isAdvanced = mode === 'advanced';

    // Helper to render the 4-part math format
    const renderMathStep = (title: string, formula: React.ReactNode, substitute: React.ReactNode, compute: React.ReactNode[], finalResult: React.ReactNode, isActive: boolean) => {
        if (!isActive) return null;
        return (
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 mt-4 animate-fade-in font-mono text-sm shadow-xl flex-shrink-0">
                <div className="text-slate-400 font-bold mb-3 border-b border-slate-700/50 pb-2">{title}</div>

                {isAdvanced && formula && (
                    <div className="mb-3">
                        <span className="text-indigo-400 text-xs uppercase tracking-wider block mb-1">1️⃣ Formula</span>
                        <div className="text-slate-300 ml-2 flex flex-col gap-1">{formula}</div>
                    </div>
                )}

                <div className="mb-3">
                    <span className="text-blue-400 text-xs uppercase tracking-wider block mb-1">2️⃣ Substitute</span>
                    <div className="text-slate-300 ml-2 flex flex-col gap-1">{substitute}</div>
                </div>

                <div className="mb-3">
                    <span className="text-orange-400 text-xs uppercase tracking-wider block mb-1">3️⃣ Compute</span>
                    <div className="text-slate-300 ml-2 flex flex-col gap-1">
                        {compute.map((line, i) => <div key={i}>{line}</div>)}
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/50">
                    <span className="text-green-400 text-xs uppercase tracking-wider block mb-1">4️⃣ Final Result</span>
                    <div className="bg-green-900/30 text-green-300 px-3 py-2 rounded border border-green-500/30 font-bold ml-2 inline-block">
                        {finalResult}
                    </div>
                </div>
            </div>
        );
    };

    const renderExplanation = (text: string, isActive: boolean) => {
        if (!isActive) return null;
        return (
            <div className="bg-blue-900/20 border border-blue-500/30 text-blue-200 px-4 py-3 rounded-xl shadow-lg mb-4 text-sm mt-3 flex-shrink-0">
                <span className="font-bold text-lg block mb-1">💡 Concept:</span>
                <p>{text}</p>
            </div>
        );
    };

    const renderInterpretation = (text: React.ReactNode, isActive: boolean) => {
        if (!isActive) return null;
        return (
            <div className="bg-indigo-900/20 border border-indigo-500/30 text-indigo-200 px-4 py-3 rounded-xl shadow-lg mt-4 text-sm flex-shrink-0 animate-fade-in">
                <span className="font-bold text-lg block mb-1">🔍 Interpretation:</span>
                <div>{text}</div>
            </div>
        );
    };

    return (
        <div className="w-full h-full glass-panel rounded-2xl overflow-y-auto overflow-x-hidden p-6 relative border border-slate-700/50 flex flex-col gap-2">

            <h2 className="text-xl font-bold text-white mb-2 pb-2 border-b border-slate-800 flex-shrink-0">Step Explorer</h2>

            {/* Step 1: Forward Pass Hidden */}
            <div className={`transition-all duration-300 ${currentStep >= 1 ? 'opacity-100' : 'opacity-30 blur-sm'} flex-shrink-0`}>
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep === 1 ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.8)]' : 'bg-slate-800 text-slate-400'}`}>1</div>
                    <h3 className="text-lg font-bold text-slate-200">Forward Pass: Hidden Layer</h3>
                </div>

                {mode === 'eli10' && renderExplanation("The first hidden neurons collect all connected inputs, multiply them by connection strengths (weights), and squash the result using a Sigmoid curve to decide how active they should be.", currentStep === 1)}

                {renderMathStep(
                    "Neuron h₁",
                    <>
                        <span>z₁ = (x₁·w₁₁) + (x₂·w₂₁) + (x₃·w₃₁)</span>
                        <span>h₁ = σ(z₁)</span>
                    </>,
                    <span>z₁ = ({inputs[0].toFixed(2)} × {math.weights['i1-h1'].toFixed(2)}) + ({inputs[1].toFixed(2)} × {math.weights['i2-h1'].toFixed(2)}) + ({inputs[2].toFixed(2)} × {math.weights['i3-h1'].toFixed(2)})</span>,
                    [
                        <span key="1">z₁ = {(inputs[0] * math.weights['i1-h1']).toFixed(3)} + {(inputs[1] * math.weights['i2-h1']).toFixed(3)} + {(inputs[2] * math.weights['i3-h1']).toFixed(3)}</span>,
                        <span key="2">z₁ = {math.h1_z.toFixed(4)}</span>
                    ],
                    <span>h₁ = σ({math.h1_z.toFixed(4)}) = {math.h1_a.toFixed(4)}</span>,
                    currentStep === 1
                )}

                {renderMathStep(
                    "Neuron h₂",
                    <>
                        <span>z₂ = (x₁·w₁₂) + (x₂·w₂₂) + (x₃·w₃₂)</span>
                        <span>h₂ = σ(z₂)</span>
                    </>,
                    <span>z₂ = ({inputs[0].toFixed(2)} × {math.weights['i1-h2'].toFixed(2)}) + ({inputs[1].toFixed(2)} × {math.weights['i2-h2'].toFixed(2)}) + ({inputs[2].toFixed(2)} × {math.weights['i3-h2'].toFixed(2)})</span>,
                    [
                        <span key="1">z₂ = {(inputs[0] * math.weights['i1-h2']).toFixed(3)} + {(inputs[1] * math.weights['i2-h2']).toFixed(3)} + {(inputs[2] * math.weights['i3-h2']).toFixed(3)}</span>,
                        <span key="2">z₂ = {math.h2_z.toFixed(4)}</span>
                    ],
                    <span>h₂ = σ({math.h2_z.toFixed(4)}) = {math.h2_a.toFixed(4)}</span>,
                    currentStep === 1
                )}
            </div>

            {/* Step 2: Forward Pass Output */}
            <div className={`transition-all duration-300 mt-4 ${currentStep >= 2 ? 'opacity-100' : 'opacity-30 blur-sm'} flex-shrink-0`}>
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep === 2 ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.8)]' : 'bg-slate-800 text-slate-400'}`}>2</div>
                    <h3 className="text-lg font-bold text-slate-200">Forward Pass: Output Layer</h3>
                </div>

                {renderMathStep(
                    "Neuron Output",
                    <>
                        <span>z_out = (h₁·w_h₁) + (h₂·w_h₂)</span>
                        <span>ŷ = z_out (Linear)</span>
                    </>,
                    <span>z_out = ({math.h1_a.toFixed(4)} × {math.weights['h1-o1'].toFixed(2)}) + ({math.h2_a.toFixed(4)} × {math.weights['h2-o1'].toFixed(2)})</span>,
                    [
                        <span key="1">z_out = {(math.h1_a * math.weights['h1-o1']).toFixed(4)} + {(math.h2_a * math.weights['h2-o1']).toFixed(4)}</span>,
                        <span key="2">z_out = {math.o1_z.toFixed(4)}</span>
                    ],
                    <span>ŷ = {math.o1_a.toFixed(4)}</span>,
                    currentStep === 2
                )}
            </div>

            {/* Step 3: Loss */}
            <div className={`transition-all duration-300 mt-4 ${currentStep >= 3 ? 'opacity-100' : 'opacity-30 blur-sm'} flex-shrink-0`}>
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep === 3 ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'bg-slate-800 text-slate-400'}`}>3</div>
                    <h3 className="text-lg font-bold text-slate-200">Loss Calculation</h3>
                </div>

                {renderExplanation("The network compares its Guess against the True Target to see how wrong it was. We square the error for Mean Squared Error (MSE).", currentStep === 3)}

                {renderMathStep(
                    "Mean Squared Error",
                    <>
                        <span>Error = ŷ - Target</span>
                        <span>Loss = Error²</span>
                    </>,
                    <>
                        <span>Error = (ŷ) - (Target)</span>
                        <span>Error = ({math.o1_a.toFixed(4)}) - ({(math.o1_a - math.error).toFixed(2)})</span>
                    </>,
                    [
                        <span key="1">Error = {math.error > 0 ? '+' : ''}{(-math.error).toFixed(4)}</span>
                    ],
                    <span>Loss = ({-math.error.toFixed(4)})² = {math.loss.toFixed(6)}</span>,
                    currentStep === 3
                )}
            </div>

            {/* Step 4: Backprop Output Gradients */}
            <div className={`transition-all duration-300 mt-4 ${currentStep >= 4 ? 'opacity-100' : 'opacity-30 blur-sm'} flex-shrink-0`}>
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep === 4 ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.8)]' : 'bg-slate-800 text-slate-400'}`}>4</div>
                    <h3 className="text-lg font-bold text-slate-200">Backprop: Output Gradients</h3>
                </div>

                {renderExplanation("Backpropagation assigns 'blame'. It asks: How does changing this weight affect the Loss? We take the derivative of the Loss function.", currentStep === 4)}

                {renderMathStep(
                    "Gradient for w(h₁ → Out)",
                    <>
                        <span className="flex items-center"><Frac n="∂L" d="∂w" /> = <Frac n="∂L" d="∂ŷ" /> × <Frac n="∂ŷ" d="∂z" /> × <Frac n="∂z" d="∂w" /></span>
                        <span className="flex items-center"><Frac n="∂L" d="∂ŷ" /> = 2(ŷ - Target)</span>
                    </>,
                    <>
                        <span className="flex items-center"><Frac n="∂L" d="∂ŷ" /> = 2 * ({-math.error.toFixed(4)}) = {math.dL_dOut.toFixed(4)}</span>
                        <span className="flex items-center"><Frac n="∂L" d="∂w_h1_o" /> = {math.dL_dOut.toFixed(4)} × 1 × {math.h1_a.toFixed(4)}</span>
                    </>,
                    [
                        <span key="1" className="flex items-center"><Frac n="∂L" d="∂w_h1_o" /> = {math.dL_dOut.toFixed(4)} × {math.h1_a.toFixed(4)}</span>
                    ],
                    <span>∂ = {math.grad_h1_o1.toFixed(6)}</span>,
                    currentStep === 4
                )}

                {renderInterpretation(
                    <p>
                        The gradient is <strong className={math.grad_h1_o1 > 0 ? "text-red-400" : "text-green-400"}>{math.grad_h1_o1 > 0 ? "positive" : "negative"}</strong>.
                        This means increasing the weight will make the error <strong>{math.grad_h1_o1 > 0 ? "worse" : "better"}</strong>.
                        We need to <strong>{math.grad_h1_o1 > 0 ? "decrease" : "increase"}</strong> the weight.
                    </p>,
                    currentStep === 4
                )}
            </div>

            {/* Step 5: Backprop Hidden Gradients */}
            <div className={`transition-all duration-300 mt-4 ${currentStep >= 5 ? 'opacity-100' : 'opacity-30 blur-sm'} flex-shrink-0`}>
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep === 5 ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.8)]' : 'bg-slate-800 text-slate-400'}`}>5</div>
                    <h3 className="text-lg font-bold text-slate-200">Backprop: Hidden Gradients</h3>
                </div>

                {renderMathStep(
                    "Gradient for w(x₁ → h₁)",
                    <>
                        <span className="flex items-center"><Frac n="∂L" d="∂w" /> = (<Frac n="∂L" d="∂z_out" /> × w_h1_o) × σ'(z₁) × x₁</span>
                        <span>σ'(z) = a(1-a)</span>
                    </>,
                    <>
                        <span>σ'(z₁) = {math.h1_a.toFixed(4)} × (1 - {math.h1_a.toFixed(4)}) = {math.sig_deriv_h1.toFixed(4)}</span>
                        <span className="flex items-center"><Frac n="∂L" d="∂z₁" /> = {math.dL_dz_out.toFixed(4)} × {math.weights['h1-o1'].toFixed(2)} × {math.sig_deriv_h1.toFixed(4)} = {math.dL_dz_h1.toFixed(4)}</span>
                        <br />
                        <span className="flex items-center"><Frac n="∂L" d="∂w_i1_h1" /> = {math.dL_dz_h1.toFixed(4)} × {inputs[0].toFixed(2)}</span>
                    </>,
                    [
                        <span key="1" className="flex items-center"><Frac n="∂L" d="∂w_i1_h1" /> = {math.dL_dz_h1.toFixed(4)} × {inputs[0].toFixed(2)}</span>
                    ],
                    <span>∂ = {math.grad_i1_h1.toFixed(6)}</span>,
                    currentStep === 5
                )}
            </div>

            {/* Step 6: Weight Updates */}
            <div className={`transition-all duration-300 mt-4 ${currentStep >= 6 ? 'opacity-100' : 'opacity-30 blur-sm'} flex-shrink-0`}>
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep === 6 ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.8)]' : 'bg-slate-800 text-slate-400'}`}>6</div>
                    <h3 className="text-lg font-bold text-slate-200">Weight Updates</h3>
                </div>

                {renderExplanation("Now we fix the connections! We move the weight in the opposite direction of its gradient, scaled by the Learning Rate (η).", currentStep === 6)}

                {renderMathStep(
                    "Update w(h₁ → Out)",
                    <span className="flex items-center">w_new = w_old - (<span className="text-violet-300 px-1">η</span> × <Frac n="∂L" d="∂w" />)</span>,
                    <span>w_new = {math.weights['h1-o1'].toFixed(4)} - ({learningRate} × {math.grad_h1_o1.toFixed(4)})</span>,
                    [
                        <span key="1">w_new = {math.weights['h1-o1'].toFixed(4)} - {(learningRate * math.grad_h1_o1).toFixed(6)}</span>
                    ],
                    <span>w_final = {(math.weights['h1-o1'] - (learningRate * math.grad_h1_o1)).toFixed(6)}</span>,
                    currentStep === 6
                )}

                {renderInterpretation(
                    <p>
                        Since the gradient was {math.grad_h1_o1 > 0 ? "positive" : "negative"},
                        we <strong>{math.grad_h1_o1 > 0 ? "decreased" : "increased"}</strong> the weight slightly.
                    </p>,
                    currentStep === 6
                )}
            </div>

            {currentStep === 7 && (
                <div className="mt-8 text-center text-slate-400 animate-pulse pb-8">
                    Ready for Next Epoch...
                </div>
            )}
        </div>
    );
}
