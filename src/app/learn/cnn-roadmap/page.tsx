"use client";

import React, { useState } from 'react';
import { BookOpen, ChevronRight, ExternalLink, Code, BrainCircuit, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Type Definitions ---
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

interface Paper {
    title: string;
    authors: string;
    year: number;
    link: string;
    summary: string;
    contribution: string;
    architectureInfo: string;
    specialSauce: string;
}

interface PhaseInfo {
    id: number;
    title: string;
    timeEstimate: string;
    difficulty: Difficulty;
    description: React.ReactNode;
    papers?: Paper[];
    implementationTask: {
        title: string;
        details: React.ReactNode;
    };
}

// --- Curriculum Data ---
const ROADMAP_DATA: PhaseInfo[] = [
    {
        id: 0,
        title: "Prerequisites",
        timeEstimate: "1-2 Weeks",
        difficulty: 'Beginner',
        description: (
            <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>Before diving into convolutions, you need a solid grasp of the mathematical engine that drives deep learning.</p>
                <ul className="list-disc pl-5 space-y-2 marker:text-indigo-400">
                    <li><strong className="text-white">Linear Algebra</strong>: Vectors, matrices, tensors, and dot products. This is how data is stored and transformed.</li>
                    <li><strong className="text-white">Multivariable Calculus</strong>: Gradients and partial derivatives. Essential for understanding backpropagation and minimizing loss.</li>
                    <li><strong className="text-white">Probability Basics</strong>: Softmax distributions, cross-entropy loss, and understanding model confidence.</li>
                    <li><strong className="text-white">Standard Neural Networks (MLPs)</strong>: Forward passes, activation functions, and exactly how weights update.</li>
                </ul>
            </div>
        ),
        implementationTask: {
            title: "Mini Math Warmup",
            details: (
                <ul className="list-decimal pl-5 space-y-1 text-slate-300">
                    <li>Write a matrix multiplication function from scratch without loops (using NumPy).</li>
                    <li>Code the derivative of the ReLU and Sigmoid functions.</li>
                </ul>
            )
        }
    },
    {
        id: 1,
        title: "Understanding Convolution",
        timeEstimate: "1 Week",
        difficulty: 'Beginner',
        description: (
            <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>Learn the core operation that makes CNNs work. Unlike MLPs where every node connects to every other node (Dense), CNNs use <strong>Parameter Sharing</strong> and <strong>Local Receptive Fields</strong>.</p>

                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 font-mono text-xs sm:text-sm text-center">
                    Output(i, j) = Σ Σ Input(i+m, j+n) * Kernel(m, n)
                </div>

                <ul className="list-disc pl-5 space-y-2 marker:text-indigo-400">
                    <li><strong className="text-white">Parameter Sharing</strong>: A single filter (e.g., edge detector) is slid across the entire image. This drastically reduces the number of weights required.</li>
                    <li><strong className="text-white">Translation Invariance</strong>: An eye is recognized as an eye whether it&apos;s in the top-left or bottom-right of the image.</li>
                    <li><strong className="text-white">Hyperparameters</strong>: Master how Stride (step size) and Padding (zero borders) control the output spatial dimensions.</li>
                </ul>
            </div>
        ),
        implementationTask: {
            title: "The Numpy Convolution Challenge",
            details: "Implement a 2D convolution operation entirely from scratch in Python/NumPy. It must accept an image matrix, a filter matrix, a stride value, and a padding value, and return the correctly sized output feature map."
        }
    },
    {
        id: 2,
        title: "The First Breakthrough (LeNet-5)",
        timeEstimate: "1 Week",
        difficulty: 'Intermediate',
        description: (
            <div className="text-slate-300 leading-relaxed mb-4">
                The architecture that proved CNNs work for real tasks (reading zip codes on mail). This set the standard blueprint: <strong>Conv ➔ Pool ➔ Conv ➔ Pool ➔ Fully Connected</strong>.
            </div>
        ),
        papers: [
            {
                title: "Gradient-Based Learning Applied to Document Recognition",
                authors: "Yann LeCun, Leon Bottou, Yoshua Bengio, Patrick Haffner",
                year: 1998,
                link: "https://ieeexplore.ieee.org/document/726791", // Note: original isn't freely on arXiv, linking IEEE/canonical source
                summary: "This foundational paper introduced LeNet-5, demonstrating that a network trained with gradient descent via backpropagation could read handwritten checks with superhuman accuracy.",
                contribution: "Standardized the CNN architecture pattern. Proved that spatial topology matters and that hand-crafted feature extractors could be replaced by learned filters.",
                architectureInfo: "Very small by modern standards: 2 Conv layers (with Average Pooling), followed by 3 Fully Connected layers. Total parameters: ~60,000.",
                specialSauce: "It was one of the very first practical, deployed systems using deep learning, processing millions of checks in the US banking system."
            }
        ],
        implementationTask: {
            title: "Build LeNet-5 for MNIST",
            details: "Using PyTorch or TensorFlow, code the exact LeNet-5 architecture. Train it on the classic MNIST handwritten digit dataset. Target: >98% accuracy on the test set."
        }
    },
    {
        id: 3,
        title: "The Deep Learning Revolution (AlexNet)",
        timeEstimate: "1 Week",
        difficulty: 'Intermediate',
        description: (
            <div className="text-slate-300 leading-relaxed mb-4">
                The model that shocked the computer vision world by crushing the 2012 ImageNet competition. It proved that <em>deep</em> networks + massive datasets + GPU scaling was the path forward.
            </div>
        ),
        papers: [
            {
                title: "ImageNet Classification with Deep Convolutional Neural Networks",
                authors: "Alex Krizhevsky, Ilya Sutskever, Geoffrey E. Hinton",
                year: 2012,
                link: "https://proceedings.neurips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf",
                summary: "AlexNet trained a massive (for the time) CNN on 1.2 million high-resolution images. It achieved a top-5 error rate of 15.3%, outperforming the runner-up (using traditional ML) by over 10%.",
                contribution: "Popularized the ReLU activation function (solving slow training with tanh/sigmoid). Introduced Dropout to prevent overfitting on huge parameter counts.",
                architectureInfo: "5 Convolutional layers (with Max Pooling) + 3 Fully Connected layers. ~60 Million parameters.",
                specialSauce: "GPU parallelization. The network was split across two GTX 580 GPUs because one didn't have enough VRAM (3GB) to hold the model."
            }
        ],
        implementationTask: {
            title: "Recreate AlexNet (Scaled Down)",
            details: (
                <ul className="list-disc pl-5 space-y-1">
                    <li>Code the Architecture using modern frameworks.</li>
                    <li>Add Dropout layers and use ReLU activations.</li>
                    <li>Contrast its parameter count and architectural depth against your LeNet implementation.</li>
                </ul>
            )
        }
    },
    {
        id: 4,
        title: "Deeper Networks (VGG & ResNet)",
        timeEstimate: "2 Weeks",
        difficulty: 'Advanced',
        description: (
            <div className="text-slate-300 leading-relaxed mb-4">
                As researchers tried to add more layers to increase accuracy, they hit a wall: the <em>Vanishing Gradient</em> problem. These two seminal papers took different approaches to building incredibly deep networks.
            </div>
        ),
        papers: [
            {
                title: "Very Deep Convolutional Networks for Large-Scale Image Recognition",
                authors: "Karen Simonyan, Andrew Zisserman",
                year: 2014,
                link: "https://arxiv.org/abs/1409.1556",
                summary: "VGG investigated how network depth affects accuracy by strictly fixing all convolution sizes to 3x3 and simply stacking them deeper (up to 19 layers).",
                contribution: "Proved that stacking multiple small 3x3 filters has the same effective receptive field as one large filter (e.g., 7x7), but is more computationally efficient and introduces more non-linearities.",
                architectureInfo: "VGG-16 uses 13 Conv layers and 3 Dense layers. It is notoriously parameter-heavy (~138M params) due to massive dense layers at the end.",
                specialSauce: "Extreme simplicity and uniformity in design rules."
            },
            {
                title: "Deep Residual Learning for Image Recognition",
                authors: "Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun",
                year: 2015,
                link: "https://arxiv.org/abs/1512.03385",
                summary: "ResNet mathematically solved the vanishing gradient problem, allowing networks to scale to 152 layers (and eventually 1000+).",
                contribution: "Introduced the 'Skip Connection' or 'Residual Block'. Instead of learning mapping `H(x)`, it learns the residual `F(x) = H(x) - x`. If a layer is useless, it easily learns `F(x) = 0`, acting as an identity map.",
                architectureInfo: "ResNet-50 uses Bottleneck blocks (1x1, 3x3, 1x1 convs) to reduce computation while maintaining depth. Uses Global Average Pooling to drastically cut parameters.",
                specialSauce: "The gradients can flow directly backwards through the addition operator (+) in the skip connections without decaying."
            }
        ],
        implementationTask: {
            title: "Build a Residual Block",
            details: "Write a PyTorch `nn.Module` for a standard ResNet Bottleneck block. Verify that the output shape exactly matches the input shape so it can be safely added `Out = F(x) + x`."
        }
    },
    {
        id: 5,
        title: "Efficiency & Modern CNNs",
        timeEstimate: "2 Weeks",
        difficulty: 'Advanced',
        description: (
            <div className="text-slate-300 leading-relaxed mb-4">
                Once high accuracy was achieved, the focus shifted to running these models on mobile phones and edge devices. How do we reduce parameters and FLOPs without losing accuracy?
            </div>
        ),
        papers: [
            {
                title: "Going Deeper with Convolutions (Inception)",
                authors: "Christian Szegedy et al.",
                year: 2014,
                link: "https://arxiv.org/abs/1409.4842",
                summary: "Introduced the Inception module, which computes 1x1, 3x3, and 5x5 convolutions simultaneously and concatenates the results.",
                contribution: "Removed the need to choose a filter size manually. Heavily utilized 1x1 convolutions as 'bottlenecks' to reduce dimensionality (and compute) before expensive 3x3/5x5 operations.",
                architectureInfo: "GoogLeNet was 22 layers deep but had 12x *fewer* parameters than AlexNet.",
                specialSauce: "Network-in-Network concepts and 1x1 conv dimensionality reduction."
            },
            {
                title: "MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications",
                authors: "Andrew G. Howard et al.",
                year: 2017,
                link: "https://arxiv.org/abs/1704.04861",
                summary: "Designed specifically to have tiny parameter counts and low latency for mobile hardware.",
                contribution: "Replaced standard convolutions with Depthwise Separable Convolutions.",
                architectureInfo: "Breaks a standard convolution into two steps: 1) Depthwise (spatial filtering per channel) 2) Pointwise (1x1 conv combining channels).",
                specialSauce: "Reduces computational cost by roughly 8 to 9 times compared to standard convolutions."
            },
            {
                title: "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks",
                authors: "Mingxing Tan, Quoc V. Le",
                year: 2019,
                link: "https://arxiv.org/abs/1905.11946",
                summary: "Systematically studied how to scale up CNNs to get better accuracy without exploding parameter counts.",
                contribution: "Introduced 'Compound Scaling'—a formula to balance scaling of Width (channels), Depth (layers), and Resolution (image size) simultaneously using a constant ratio.",
                architectureInfo: "Base networks found via Neural Architecture Search (AutoML).",
                specialSauce: "Shattered state-of-the-art accuracy curves while being 8.4x smaller and 6.1x faster on inference than previous bests."
            }
        ],
        implementationTask: {
            title: "Implement Depthwise Separable Conv",
            details: "Create a PyTorch layer that executes a Depthwise Separable Convolution. Calculate (on paper) the theoretical math operations saved compared to a standard 3x3 convolution."
        }
    },
    {
        id: 6,
        title: "Beyond CNNs (Transformers taking over)",
        timeEstimate: "1 Week",
        difficulty: 'Advanced',
        description: (
            <div className="text-slate-300 leading-relaxed mb-4">
                CNNs ruled computer vision for a decade. But recently, architecture from Natural Language Processing (Transformers) invaded vision, challenging convolution as the supreme operator.
            </div>
        ),
        papers: [
            {
                title: "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale",
                authors: "Alexey Dosovitskiy et al.",
                year: 2020,
                link: "https://arxiv.org/abs/2010.11929",
                summary: "Proved that a pure Transformer architecture (no convolutions) could beat state-of-the-art CNNs on image classification when trained on massive data.",
                contribution: "Introduced the Vision Transformer (ViT). Treats image patches (e.g., 16x16 pixels) as &quot;tokens&quot; (like words in a sentence) and uses Self-Attention across them.",
                architectureInfo: "No local translation invariance baked in. It *learns* spatial relationships entirely from scratch through attention matrices.",
                specialSauce: "Lacks CNN &quot;inductive biases&quot; (prior knowledge about images), meaning it performs worse on small datasets but scales boundlessly better on huge amounts of data."
            }
        ],
        implementationTask: {
            title: "ViT Patch Embedder",
            details: "Write the first stage of a ViT model: take a 224x224 RGB image tensor and slice it into a sequence of 16x16 flattened patch embeddings using a Strided Convolution (the elegant way to do it)."
        }
    }
];

// --- Components ---

const DifficultyBadge = ({ level }: { level: Difficulty }) => {
    const colors = {
        'Beginner': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'Intermediate': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        'Advanced': 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    };
    return (
        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border whitespace-nowrap shrink-0 ${colors[level]}`}>
            {level}
        </span>
    );
};

const PaperCard = ({ paper }: { paper: Paper }) => {
    return (
        <div className="mt-6 glass-panel border border-slate-700/60 rounded-xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1 duration-300">
            {/* Header */}
            <div className="bg-slate-800/60 p-4 border-b border-slate-700/50 relative group">
                <a href={paper.link} target="_blank" rel="noreferrer" className="absolute top-4 right-4 text-slate-500 hover:text-indigo-400 transition-colors">
                    <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
                <div className="pr-8">
                    <h4 className="text-lg font-bold text-indigo-300 leading-tight mb-2">{paper.title}</h4>
                    <p className="text-xs text-slate-400 flex items-center">
                        <span className="font-semibold text-slate-300">{paper.year}</span>
                        <span className="mx-2">•</span>
                        {paper.authors}
                    </p>
                </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-sm">
                <div>
                    <strong className="text-slate-200 block mb-1">Executive Summary</strong>
                    <p className="text-slate-400">{paper.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/30">
                        <strong className="text-emerald-400 block mb-1 text-xs uppercase tracking-wider">Main Contribution</strong>
                        <p className="text-slate-300">{paper.contribution}</p>
                    </div>
                    <div className="bg-amber-950/20 p-3 rounded-lg border border-amber-900/30">
                        <strong className="text-amber-400 block mb-1 text-xs uppercase tracking-wider">The &quot;Special Sauce&quot;</strong>
                        <p className="text-slate-300">{paper.specialSauce}</p>
                    </div>
                </div>

                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50">
                    <strong className="text-indigo-400 block mb-1 flex items-center text-xs uppercase tracking-wider"><BrainCircuit className="w-3.5 h-3.5 mr-1" /> Architecture Note</strong>
                    <p className="text-slate-300">{paper.architectureInfo}</p>
                </div>
            </div>
        </div>
    );
};

const PhaseSection = ({ phase, isOpen, onToggle, last }: { phase: PhaseInfo, isOpen: boolean, onToggle: () => void, last: boolean }) => {
    return (
        <div className="relative pl-8 md:pl-16 py-4">

            {/* Timeline Line */}
            {!last && (
                <div className="absolute left-[15px] md:left-[31px] top-10 bottom-[-40px] w-0.5 bg-gradient-to-b from-indigo-500/50 to-slate-800" />
            )}

            {/* Timeline Node */}
            <div className="absolute left-0 md:left-4 top-5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-slate-950 z-10 relative transition-colors duration-500 ${isOpen ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-700'}`}>
                    <span className="text-white text-xs font-bold">{phase.id}</span>
                </div>
            </div>

            {/* Content Container */}
            <div className={`glass-panel rounded-2xl border transition-all duration-300 ${isOpen ? 'border-indigo-500/40 shadow-xl' : 'border-slate-800 hover:border-slate-600'}`}>

                {/* Header Toggle */}
                <button
                    onClick={onToggle}
                    className="w-full flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 text-left outline-none rounded-2xl focus-visible:ring-2 focus-visible:ring-indigo-500 gap-4"
                >
                    <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors flex-1 pr-0 md:pr-4">
                        PHASE {phase.id}: {phase.title}
                    </h3>
                    <div className="flex items-center flex-wrap gap-3 shrink-0 self-start md:self-auto mt-2 md:mt-0">
                        <DifficultyBadge level={phase.difficulty} />
                        <span className="text-xs font-medium text-slate-500 flex items-center bg-slate-900/50 px-2 py-1 rounded-md whitespace-nowrap">
                            {phase.timeEstimate}
                        </span>
                        <div className="hidden sm:block ml-2">
                            <ChevronRight className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-90 text-indigo-400' : ''}`} />
                        </div>
                    </div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="p-5 md:p-6 pt-0 border-t border-slate-800/50">
                                {/* Description */}
                                <div className="mb-6">
                                    {phase.description}
                                </div>

                                {/* Implementation Task */}
                                <div className="bg-indigo-950/20 rounded-xl p-5 border border-indigo-900/40 shadow-inner mb-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
                                    <h4 className="text-base font-bold text-indigo-300 flex items-center mb-3">
                                        <Code className="w-5 h-5 mr-2 text-indigo-400" />
                                        Implementation Challenge: {phase.implementationTask.title}
                                    </h4>
                                    <div className="text-sm text-slate-300">
                                        {phase.implementationTask.details}
                                    </div>
                                </div>

                                {/* Papers */}
                                {phase.papers && phase.papers.length > 0 && (
                                    <div className="space-y-6">
                                        <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center border-b border-slate-800 pb-2">
                                            <BookOpen className="w-4 h-4 mr-2 text-rose-400" />
                                            Required Reading
                                        </h4>
                                        <div>
                                            {phase.papers.map((paper, idx) => (
                                                <PaperCard key={idx} paper={paper} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};


// --- Main Page ---
export default function CNNRoadmap() {
    // Keep first phase open by default
    const [openPhaseId, setOpenPhaseId] = useState<number | null>(0);

    const togglePhase = (id: number) => {
        setOpenPhaseId(openPhaseId === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] text-slate-200 p-4 md:p-8 lg:p-12">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-12 text-center relative z-10">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-6">
                        <GraduationCap className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 tracking-tight mb-4">
                        Mastering CNNs
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        A structured, chronological roadmap to go from basic calculus to understanding state-of-the-art vision architectures.
                    </p>
                </div>

                {/* Timeline Roadmap */}
                <div className="relative">
                    {ROADMAP_DATA.map((phase, idx) => (
                        <PhaseSection
                            key={phase.id}
                            phase={phase}
                            isOpen={openPhaseId === phase.id}
                            onToggle={() => togglePhase(phase.id)}
                            last={idx === ROADMAP_DATA.length - 1}
                        />
                    ))}
                </div>

                {/* Footer/CTA */}
                <div className="mt-16 text-center glass-panel p-8 rounded-2xl border border-emerald-500/20 bg-emerald-950/10">
                    <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Roadmap Complete</h3>
                    <p className="text-slate-400 max-w-lg mx-auto mb-6">
                        Once you finish Phase 6, you will have the theoretical intuition, historical context, and coding chops of a legitimate Machine Learning Engineer in Computer Vision.
                    </p>
                    <a href="/architecture-playground" className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                        Go to Architecture Playground <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                </div>

            </div>
        </div>
    );
}
